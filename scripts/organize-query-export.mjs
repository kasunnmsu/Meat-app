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
  "collection_total_time",
  "collection_total_time_ms",
];

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

  XLSX.utils.book_append_sheet(workbook, worksheet, name);
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
    "session_total_time",
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
  const [startedAt, completedAt, totalTime, totalTimeMs] =
    stageTimingSourceColumns(sessionNumber);

  return rows.map((row) => ({
    ...row,
    participant_id: row.participante,
    study_location: row.local_estudo,
    session_started_at: row[startedAt],
    session_completed_at: row[completedAt],
    session_total_time: row[totalTime],
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
      [`${sourcePrefix}ranking_flow_total_time`, `round_${round}_total_time`],
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
    "session_total_time",
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
      output[`round_${round}_total_time`] =
        row[`${sourcePrefix}ranking_flow_total_time`];
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
    collection_total_time: row.full_survey_total_time,
    collection_total_time_ms: row.full_survey_total_time_ms,
  }));
}

function defaultOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}-organized.xlsx`);
}

export function buildOrganizedWorkbook(rows, createdDate = new Date()) {
  if (rows.length === 0) {
    throw new Error("Nao existem linhas de resultados para criar o Excel.");
  }

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
