import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import XLSX from "xlsx";

const OUTPUT_ID_COLUMNS = ["participant_id", "study_location"];
const SOCIODEMOGRAPHIC_COLUMNS = [
  ...OUTPUT_ID_COLUMNS,
  "gender",
  "age_group",
  "education_level",
  "income_group",
  "collection_started_at",
  "collection_completed_at",
  "collection_total_time_ms",
];

// Conversoes para facilitar calculos no Excel.
const SEAL_IDS = ["red-1", "red-2", "green-1", "green-2", "green-3"];
const SEAL_NUMBERS = { "red-1": 1, "red-2": 2, "green-1": 3, "green-2": 4, "green-3": 5 };
const DEMOGRAPHIC_CODES = {
  gender: { female: 1, male: 2, prefer_not_to_say: 3 },
  age_group: { age_18_24: 1, age_25_34: 2, age_35_44: 3, age_45_59: 4, age_60_plus: 5 },
  education_level: {
    less_than_high_school: 1,
    high_school_or_ged: 2,
    some_college_or_associate: 3,
    bachelor: 4,
    graduate: 5,
  },
  income_group: { income_1: 1, income_2: 2, income_3: 3, income_4: 4, income_5: 5 },
};
const YES_NO_COLUMNS = [
  /_preselection_rank_changed$/,
  /_ranking_revision_[0-9]+_rank_changed$/,
  /_changed_preference_before_confirming$/,
  /_final_confirmation_[0-9]+_response$/,
  /^s2_agreed_to_descriptions$/,
  /^s2_all_seals_read$/,
  /^s1_tcle_accepted$/,
];
const SEAL_NUMBER_COLUMNS = [
  /_rank_[0-9]+_seal_id$/,
  /_decision_[0-9]+_choice$/,
  /^s3_top_seal_[0-9]+$/,
];
const CONDITION_COLUMN = /^s3_screen_[0-9]+_condition_id$/;
const CONDITION_NUMBERS = { "3.1": 1, "3.2": 2, "3.3": 3 };
const DATE_COLUMN = /_at$/;
const EXCEL_DATE_FORMAT = "dd/mm/yyyy hh:mm:ss";
// Brasilia nao tem horario de verao desde 2019: UTC-3 fixo.
const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const EXCEL_UNIX_EPOCH_DAYS = 25_569;
const MS_PER_DAY = 86_400_000;

function printHelp() {
  console.log(`
Organiza o Excel baixado da view resultados_completos_app.

Uso:
  npm run results:organize -- --input <arquivo.xlsx> [--output <arquivo.xlsx>] [--overwrite]
`);
}

function parseArguments(argv) {
  const options = { overwrite: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--input") options.input = argv[++index];
    else if (argument === "--output") options.output = argv[++index];
    else if (argument === "--overwrite") options.overwrite = true;
    else if (argument === "--help") options.help = true;
    else throw new Error(`Opcao desconhecida: ${argument}`);
  }

  return options;
}

function columnWidth(column, rows) {
  const longestValue = rows.reduce(
    (longest, row) => Math.max(longest, String(row[column] ?? "").length),
    column.length,
  );
  return { wch: Math.min(Math.max(longestValue + 2, 12), 42) };
}

function appendSheet(workbook, name, rows, columns) {
  const normalizedRows = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column, row[column] ?? null])),
  );
  const worksheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: columns,
    cellDates: true,
  });

  const lastColumn = XLSX.utils.encode_col(Math.max(columns.length - 1, 0));
  worksheet["!autofilter"] = { ref: `A1:${lastColumn}${rows.length + 1}` };
  worksheet["!freeze"] = {
    xSplit: 2,
    ySplit: 1,
    topLeftCell: "C2",
    activePane: "bottomRight",
  };
  worksheet["!cols"] = columns.map((column) => columnWidth(column, rows));

  columns.forEach((column, columnIndex) => {
    if (!DATE_COLUMN.test(column)) return;
    for (let rowIndex = 1; rowIndex <= rows.length; rowIndex += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
      if (cell?.t === "n") cell.z = EXCEL_DATE_FORMAT;
    }
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

function toBrasiliaExcelDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const utcMs = Date.parse(value);
  if (!Number.isFinite(utcMs)) return value;
  return (utcMs - BRASILIA_OFFSET_MS) / MS_PER_DAY + EXCEL_UNIX_EPOCH_DAYS;
}

function convertValue(column, value) {
  if (value === null || value === undefined || value === "") return value;
  const text = String(value).trim();

  if (DEMOGRAPHIC_CODES[column]) return DEMOGRAPHIC_CODES[column][text] ?? value;
  if (YES_NO_COLUMNS.some((pattern) => pattern.test(column))) {
    if (text === "Yes") return 1;
    if (text === "No") return 0;
    return value;
  }
  if (SEAL_NUMBER_COLUMNS.some((pattern) => pattern.test(column))) {
    return SEAL_NUMBERS[text] ?? value;
  }
  if (CONDITION_COLUMN.test(column)) return CONDITION_NUMBERS[text] ?? value;
  if (DATE_COLUMN.test(column)) return toBrasiliaExcelDate(value);
  return value;
}

function sealPositions(prefix, positionsBySeal) {
  return Object.fromEntries(
    SEAL_IDS.map((sealId) => [
      `${prefix}_${sealId.replace("-", "_")}`,
      positionsBySeal[sealId] ?? null,
    ]),
  );
}

function positionsFromList(value) {
  const positionsBySeal = {};
  if (typeof value !== "string") return positionsBySeal;
  value
    .split(" > ")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((sealId, index) => {
      positionsBySeal[sealId] = index + 1;
    });
  return positionsBySeal;
}

// Novas colunas com a posicao de cada selo, inseridas logo apos a coluna de origem.
function derivedSealColumns(column, row) {
  const rankMatch = column.match(/^(s[12]|s3_screen_[0-9]+)_final_confirmed_rank$/);
  if (rankMatch) {
    const prefix = rankMatch[1];
    const positionsBySeal = {};
    for (let rank = 1; rank <= 5; rank += 1) {
      const sealId = row[`${prefix}_rank_${rank}_seal_id`];
      if (sealId) positionsBySeal[String(sealId).trim()] = rank;
    }
    return sealPositions(`${prefix}_rank`, positionsBySeal);
  }

  const displayMatch = column.match(/^(s[12]|s3_screen_[0-9]+)_initial_display_order$/);
  if (displayMatch) {
    return sealPositions(`${displayMatch[1]}_display`, positionsFromList(row[column]));
  }
  if (column === "s2_seal_reading_initial_display_order") {
    return sealPositions("s2_reading_display", positionsFromList(row[column]));
  }
  if (column === "s2_seal_reading_first_open_order") {
    return sealPositions("s2_first_open", positionsFromList(row[column]));
  }
  return null;
}

export function prepareRowsForAnalysis(rows) {
  return rows.map((row) => {
    const output = {};
    for (const [column, value] of Object.entries(row)) {
      output[column] = convertValue(column, value);
      const derived = derivedSealColumns(column, row);
      if (derived) Object.assign(output, derived);
    }
    return output;
  });
}

function stageTimingSourceColumns(sessionNumber) {
  const prefix = `s${sessionNumber}_session_${sessionNumber}`;
  return [
    `${prefix}_started_at`,
    `${prefix}_completed_at`,
    `${prefix}_total_time`,
    `${prefix}_total_time_ms`,
  ];
}

function stageColumns(allColumns, sessionNumber) {
  const prefix = `s${sessionNumber}_`;
  const timingSourceColumns = new Set(stageTimingSourceColumns(sessionNumber));
  return [
    ...OUTPUT_ID_COLUMNS,
    "session_started_at",
    "session_completed_at",
    "session_total_time_ms",
    ...allColumns.filter(
      (column) =>
        column.startsWith(prefix) &&
        !timingSourceColumns.has(column) &&
        !(sessionNumber === 1 && column === "s1_collection_started_at") &&
        !column.endsWith("_title") &&
        !column.endsWith("_subtitle"),
    ),
  ];
}

function stageRows(rows, sessionNumber) {
  const [startedAt, completedAt, , totalTimeMs] =
    stageTimingSourceColumns(sessionNumber);

  return rows.map((row) => ({
    ...row,
    participant_id: row.participante,
    study_location: row.local_estudo,
    session_started_at: row[startedAt],
    session_completed_at: row[completedAt],
    session_total_time_ms: row[totalTimeMs],
  }));
}

function stageThreeColumns(allColumns) {
  const timingSourceColumns = new Set(stageTimingSourceColumns(3));
  const generalColumns = allColumns
    .filter(
      (column) =>
        column.startsWith("s3_") &&
        !/^s3_screen_[123]_/.test(column) &&
        column !== "s3_screen_condition_order" &&
        !timingSourceColumns.has(column) &&
        !column.endsWith("_title") &&
        !column.endsWith("_subtitle"),
    )
    .map(stageThreeSummaryColumn);
  const roundColumns = [];

  for (const round of [1, 2, 3]) {
    const sourcePrefix = `s3_screen_${round}_`;
    const sourceColumns = allColumns.filter(
      (column) =>
        column.startsWith(sourcePrefix) &&
        !column.endsWith("_title") &&
        !column.endsWith("_subtitle"),
    );
    const conditionColumn = `${sourcePrefix}condition_id`;
    const roundTimingColumns = [
      [`${sourcePrefix}ranking_started_at`, `round_${round}_started_at`],
      [`${sourcePrefix}ranking_flow_completed_at`, `round_${round}_completed_at`],
      [`${sourcePrefix}ranking_flow_total_time_ms`, `round_${round}_total_time_ms`],
    ];
    const roundTimingSourceColumns = new Set(
      roundTimingColumns.map(([sourceColumn]) => sourceColumn),
    );

    roundColumns.push(
      `round_${round}_condition_id`,
      ...roundTimingColumns.map(([, outputColumn]) => outputColumn),
      ...sourceColumns
        .filter(
          (column) =>
            column !== conditionColumn &&
            !roundTimingSourceColumns.has(column),
        )
        .map((column) =>
          column.replace(sourcePrefix, `round_${round}_`),
        ),
    );
  }

  return [
    ...OUTPUT_ID_COLUMNS,
    "session_started_at",
    "session_completed_at",
    "session_total_time_ms",
    ...roundColumns,
    ...generalColumns,
  ];
}

function stageThreeSummaryColumn(column) {
  if (
    /^s3_all_screens_preselection_and_final_confirmation_tot_[a-z0-9]+$/.test(
      column,
    )
  ) {
    return "all_rounds_preselection_and_final_confirmation_total_time_ms";
  }
  if (column.startsWith("s3_all_screens_")) {
    return column.replace("s3_all_screens_", "all_rounds_");
  }
  if (column.startsWith("s3_between_screen_1_and_2_")) {
    return column.replace("s3_between_screen_1_and_2_", "between_round_1_and_2_");
  }
  if (column.startsWith("s3_between_screen_2_and_3_")) {
    return column.replace("s3_between_screen_2_and_3_", "between_round_2_and_3_");
  }
  if (column.startsWith("s3_between_screens_")) {
    return column.replace("s3_between_screens_", "between_rounds_");
  }
  return column.replace(/^s3_/, "session_3_summary_");
}

function stageThreeRows(rows) {
  return stageRows(rows, 3).map((row) => {
    const output = { ...row };

    for (const [column, value] of Object.entries(row)) {
      const match = column.match(/^s3_screen_([123])_(.+)$/);
      if (match) output[`round_${match[1]}_${match[2]}`] = value;
      else if (
        column.startsWith("s3_") &&
        column !== "s3_screen_condition_order" &&
        !column.endsWith("_title") &&
        !column.endsWith("_subtitle")
      ) {
        output[stageThreeSummaryColumn(column)] = value;
      }
    }

    for (const round of [1, 2, 3]) {
      const sourcePrefix = `s3_screen_${round}_`;
      output[`round_${round}_started_at`] =
        row[`${sourcePrefix}ranking_started_at`];
      output[`round_${round}_completed_at`] =
        row[`${sourcePrefix}ranking_flow_completed_at`];
      output[`round_${round}_total_time_ms`] =
        row[`${sourcePrefix}ranking_flow_total_time_ms`];
    }

    return output;
  });
}

function sociodemographicRows(rows) {
  return rows.map((row) => ({
    participant_id: row.participante,
    study_location: row.local_estudo,
    gender: row.gender,
    age_group: row.age_group,
    education_level: row.education_level,
    income_group: row.income_group,
    collection_started_at: row.full_survey_started_at ?? row.s1_collection_started_at,
    collection_completed_at: row.full_survey_completed_at ?? row.s3_timestamp,
    collection_total_time_ms: row.full_survey_total_time_ms,
  }));
}

function defaultOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}-organized.xlsx`);
}

export function buildOrganizedWorkbook(sourceRows, createdDate = new Date()) {
  if (sourceRows.length === 0) {
    throw new Error("Nao existem linhas de resultados para criar o Excel.");
  }

  const rows = prepareRowsForAnalysis(sourceRows);
  const allColumns = orderedUniqueColumns(rows);
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Study results organized by session",
    Subject: "Study results separated into four worksheets",
    Author: "Meat App",
    CreatedDate: new Date(createdDate),
  };

  appendSheet(
    workbook,
    "Demographics_Time",
    sociodemographicRows(rows),
    SOCIODEMOGRAPHIC_COLUMNS,
  );
  appendSheet(
    workbook,
    "Session_1",
    stageRows(rows, 1),
    stageColumns(allColumns, 1),
  );
  appendSheet(
    workbook,
    "Session_2",
    stageRows(rows, 2),
    stageColumns(allColumns, 2),
  );
  appendSheet(
    workbook,
    "Session_3",
    stageThreeRows(rows),
    stageThreeColumns(allColumns),
  );

  return workbook;
}

function orderedUniqueColumns(rows) {
  const columns = [];
  const found = new Set();

  for (const row of rows) {
    for (const column of Object.keys(row)) {
      if (!found.has(column)) {
        found.add(column);
        columns.push(column);
      }
    }
  }

  return columns;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (!options.input) throw new Error("Informe o arquivo com --input.");

  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output || defaultOutputPath(inputPath));
  if (!fs.existsSync(inputPath)) throw new Error(`Arquivo nao encontrado: ${inputPath}`);
  if (inputPath === outputPath) throw new Error("O arquivo de saida deve ser diferente do arquivo original.");
  if (fs.existsSync(outputPath) && !options.overwrite) {
    throw new Error(`O arquivo ja existe: ${outputPath}. Use --overwrite para substitui-lo.`);
  }

  const sourceWorkbook = XLSX.readFile(inputPath, { cellDates: true });
  const sourceSheet = sourceWorkbook.Sheets[sourceWorkbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sourceSheet, { defval: null, raw: true });
  if (rows.length === 0) throw new Error("O Excel nao possui linhas de resultados.");

  const workbook = buildOrganizedWorkbook(rows);

  XLSX.writeFile(workbook, outputPath, {
    bookType: "xlsx",
    compression: true,
    cellDates: true,
  });

  console.log(`Excel organizado criado: ${outputPath}`);
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (executedDirectly) {
  try {
    main();
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  }
}
