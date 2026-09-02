import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import pg from "pg";
import XLSX from "xlsx";

const { Client } = pg;

const DEFAULT_BATCH_SIZE = 500;
const EXCEL_MAX_DATA_ROWS = 900_000;
const EXCEL_SAFE_CELL_LENGTH = 30_000;
const VALID_LOCATIONS = new Set(["PUCPR", "UFBA", "NMSU"]);

const CORE_COLUMNS = [
  "meta_participante",
  "meta_local_estudo",
  "meta_protocolo_envio",
  "meta_envio_criado_em",
  "meta_resposta_salva_em",
];

const SUMMARY_COLUMNS = [
  ...CORE_COLUMNS,
  "gender",
  "age_group",
  "income_group",
  "education_level",
  "session_1_completed",
  "session_2_completed",
  "session_3_completed",
  "full_survey_started_at",
  "full_survey_completed_at",
  "full_survey_total_time",
  "full_survey_total_time_ms",
  "full_survey_saved_at",
];

function printHelp() {
  console.log(`
Exporta os resultados do estudo do PostgreSQL para um Excel organizado.

Uso:
  npm run results:export -- [opcoes]

Opcoes:
  --output <arquivo.xlsx>  Caminho do Excel de saida
  --location <local>       PUCPR, UFBA ou NMSU
  --from <AAAA-MM-DD>      Inicio do periodo, inclusive
  --to <AAAA-MM-DD>        Fim do periodo, inclusive
  --batch-size <numero>    Registros por lote (padrao: ${DEFAULT_BATCH_SIZE})
  --include-details        Inclui interacoes e linhas tecnicas por dataset
  --skip-formatting        Nao aplica a formatacao visual pelo Microsoft Excel
  --overwrite              Permite substituir o arquivo de saida
  --help                   Exibe esta ajuda

Seguranca:
  A conexao e lida somente da variavel DATABASE_URL. A senha nao e exibida.
`);
}

function parseArguments(argv) {
  const options = {
    batchSize: DEFAULT_BATCH_SIZE,
    includeDetails: false,
    overwrite: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help") options.help = true;
    else if (argument === "--include-details") options.includeDetails = true;
    else if (argument === "--skip-formatting") options.skipFormatting = true;
    else if (argument === "--overwrite") options.overwrite = true;
    else if (argument === "--output") options.output = argv[++index];
    else if (argument === "--location") options.location = argv[++index]?.toUpperCase();
    else if (argument === "--from") options.from = argv[++index];
    else if (argument === "--to") options.to = argv[++index];
    else if (argument === "--batch-size") options.batchSize = Number(argv[++index]);
    else throw new Error(`Opcao desconhecida: ${argument}`);
  }

  if (options.location && !VALID_LOCATIONS.has(options.location)) {
    throw new Error("--location deve ser PUCPR, UFBA ou NMSU.");
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize < 50 || options.batchSize > 5_000) {
    throw new Error("--batch-size deve ser um numero inteiro entre 50 e 5000.");
  }

  for (const [name, value] of [["--from", options.from], ["--to", options.to]]) {
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`${name} deve usar o formato AAAA-MM-DD.`);
    }
  }

  return options;
}

function defaultOutputPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve("exports", `resultados-estudo-${timestamp}.xlsx`);
}

function normalizeOutputPath(requestedPath) {
  const outputPath = path.resolve(requestedPath || defaultOutputPath());
  if (path.extname(outputPath).toLowerCase() !== ".xlsx") {
    throw new Error("O arquivo de saida deve terminar em .xlsx.");
  }
  return outputPath;
}

function addDateFilters(clauses, parameters, options, columnName) {
  if (options.from) {
    parameters.push(`${options.from} 00:00:00`);
    clauses.push(`${columnName} >= $${parameters.length}::timestamp`);
  }

  if (options.to) {
    const endExclusive = new Date(`${options.to}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    parameters.push(endExclusive.toISOString().slice(0, 19).replace("T", " "));
    clauses.push(`${columnName} < $${parameters.length}::timestamp`);
  }
}

function buildCompleteSurveyQuery(lastId, options) {
  const parameters = [lastId];
  const clauses = [
    "r.id > $1::bigint",
    "r.kind = 'FULL_SURVEY'",
    "r.dataset = 'participantRows'",
  ];

  if (options.location) {
    parameters.push(options.location);
    clauses.push(`r.location = $${parameters.length}::\"StudyLocation\"`);
  }

  addDateFilters(clauses, parameters, options, 'r."savedAt"');
  parameters.push(options.batchSize);

  return {
    text: `
      SELECT
        r.id::text AS "rowId",
        r."participantId",
        r.location::text AS location,
        r.data,
        r."savedAt",
        s."submissionId",
        s."createdAt" AS "submissionCreatedAt"
      FROM "StudyDataRow" AS r
      INNER JOIN "StudySubmission" AS s
        ON s.id = r."submissionDbId"
      WHERE ${clauses.join("\n        AND ")}
      ORDER BY r.id
      LIMIT $${parameters.length}
    `,
    values: parameters,
  };
}

function buildDetailQuery(lastId, options) {
  const parameters = [lastId];
  const clauses = [
    "r.id > $1::bigint",
    "NOT (r.kind = 'FULL_SURVEY' AND r.dataset = 'participantRows')",
  ];

  if (options.location) {
    parameters.push(options.location);
    clauses.push(`r.location = $${parameters.length}::\"StudyLocation\"`);
  }

  addDateFilters(clauses, parameters, options, 'r."savedAt"');
  parameters.push(options.batchSize);

  return {
    text: `
      SELECT
        r.id::text AS "rowId",
        r."participantId",
        r.location::text AS location,
        r.kind::text AS kind,
        r."sessionNumber",
        r.dataset,
        r."rowIndex",
        r.data,
        r."savedAt",
        s."submissionId",
        s."createdAt" AS "submissionCreatedAt"
      FROM "StudyDataRow" AS r
      INNER JOIN "StudySubmission" AS s
        ON s.id = r."submissionDbId"
      WHERE ${clauses.join("\n        AND ")}
      ORDER BY r.id
      LIMIT $${parameters.length}
    `,
    values: parameters,
  };
}

function ensureObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function scalarValue(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  return JSON.stringify(value);
}

function assignSafeCell(target, key, value) {
  const normalized = scalarValue(value);

  if (typeof normalized !== "string" || normalized.length <= EXCEL_SAFE_CELL_LENGTH) {
    target[key] = normalized;
    return;
  }

  const totalParts = Math.ceil(normalized.length / EXCEL_SAFE_CELL_LENGTH);
  for (let part = 0; part < totalParts; part += 1) {
    target[`${key}__parte_${part + 1}`] = normalized.slice(
      part * EXCEL_SAFE_CELL_LENGTH,
      (part + 1) * EXCEL_SAFE_CELL_LENGTH,
    );
  }
}

function flattenRecord(source, base = {}) {
  const result = { ...base };
  for (const [key, value] of Object.entries(ensureObject(source))) {
    assignSafeCell(result, key, value);
  }
  return result;
}

function sanitizeRowCells(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    assignSafeCell(result, key, value);
  }
  return result;
}

function completeSurveyRow(databaseRow) {
  return flattenRecord(databaseRow.data, {
    meta_participante: databaseRow.participantId,
    meta_local_estudo: databaseRow.location,
    meta_protocolo_envio: databaseRow.submissionId,
    meta_envio_criado_em: databaseRow.submissionCreatedAt,
    meta_resposta_salva_em: databaseRow.savedAt,
  });
}

function detailRow(databaseRow) {
  return flattenRecord(databaseRow.data, {
    meta_id_linha_banco: databaseRow.rowId,
    meta_participante: databaseRow.participantId,
    meta_local_estudo: databaseRow.location,
    meta_tipo_envio: databaseRow.kind,
    meta_etapa: databaseRow.sessionNumber,
    meta_conjunto_dados: databaseRow.dataset,
    meta_numero_linha: databaseRow.rowIndex,
    meta_protocolo_envio: databaseRow.submissionId,
    meta_envio_criado_em: databaseRow.submissionCreatedAt,
    meta_resposta_salva_em: databaseRow.savedAt,
  });
}

async function readInBatches(client, queryBuilder, options, onBatch) {
  let lastId = "0";
  let total = 0;

  while (true) {
    const query = queryBuilder(lastId, options);
    const result = await client.query(query);
    if (result.rows.length === 0) break;

    await onBatch(result.rows);
    total += result.rows.length;
    lastId = result.rows.at(-1).rowId;
    process.stdout.write(`\rRegistros lidos: ${total.toLocaleString("pt-BR")}`);
  }

  if (total > 0) process.stdout.write("\n");
  return total;
}

function orderedColumns(rows, preferred = []) {
  const found = new Set();
  const columns = [];

  for (const key of preferred) {
    if (rows.some((row) => Object.hasOwn(row, key))) {
      found.add(key);
      columns.push(key);
    }
  }

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!found.has(key)) {
        found.add(key);
        columns.push(key);
      }
    }
  }

  return columns;
}

function selectColumns(rows, predicate, preferred = CORE_COLUMNS) {
  const allColumns = orderedColumns(rows, preferred);
  const selectedColumns = allColumns.filter(
    (column) => preferred.includes(column) || predicate(column),
  );

  return rows.map((row) =>
    Object.fromEntries(selectedColumns.map((column) => [column, row[column] ?? null])),
  );
}

function friendlyLabel(column) {
  const known = {
    meta_participante: "Identificador do participante",
    meta_local_estudo: "Local do estudo",
    meta_protocolo_envio: "Protocolo único do envio",
    meta_envio_criado_em: "Data e hora do envio",
    meta_resposta_salva_em: "Data e hora de gravação da resposta",
    gender: "Gênero",
    age_group: "Faixa etária",
    income_group: "Faixa de renda",
    education_level: "Escolaridade",
    session_1_completed: "Etapa 1 concluída",
    session_2_completed: "Etapa 2 concluída",
    session_3_completed: "Etapa 3 concluída",
    full_survey_total_time: "Tempo total da pesquisa",
  };

  return known[column] || column.replaceAll("_", " ");
}

function columnWidth(column, rows) {
  const samples = rows.slice(0, 200).map((row) => row[column]);
  const longest = Math.max(
    column.length,
    ...samples.map((value) => String(value ?? "").length),
  );

  if (column.startsWith("meta_")) return { wch: Math.min(Math.max(longest + 2, 16), 32) };
  return { wch: Math.min(Math.max(longest + 2, 12), 28) };
}

function styleHeaderRow(worksheet, columns) {
  for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
    const address = XLSX.utils.encode_cell({ row: 0, col: columnIndex });
    const cell = worksheet[address];
    if (!cell) continue;

    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { patternType: "solid", fgColor: { rgb: "1F4E78" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        bottom: { style: "thin", color: { rgb: "B4C6E7" } },
      },
    };
  }
}

function addWorksheet(workbook, requestedName, rows, preferredColumns = []) {
  if (rows.length === 0) return [];

  const createdNames = [];
  const totalParts = Math.ceil(rows.length / EXCEL_MAX_DATA_ROWS);

  for (let part = 0; part < totalParts; part += 1) {
    const chunk = rows.slice(part * EXCEL_MAX_DATA_ROWS, (part + 1) * EXCEL_MAX_DATA_ROWS);
    const columns = orderedColumns(chunk, preferredColumns);
    const sheetName = (totalParts === 1 ? requestedName : `${requestedName}_${part + 1}`).slice(0, 31);
    const worksheet = XLSX.utils.json_to_sheet(chunk, { header: columns, cellDates: true });

    styleHeaderRow(worksheet, columns);
    worksheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(columns.length - 1)}${chunk.length + 1}` };
    worksheet["!cols"] = columns.map((column) => columnWidth(column, chunk));
    worksheet["!freeze"] = { xSplit: 2, ySplit: 1, topLeftCell: "C2", activePane: "bottomRight" };

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    createdNames.push(sheetName);
  }

  return createdNames;
}

function buildReadmeRows(metadata) {
  return [
    { item: "Arquivo", valor: "Exportação organizada das respostas do estudo" },
    { item: "Gerado em", valor: metadata.generatedAt },
    { item: "Local filtrado", valor: metadata.location || "Todos" },
    { item: "Período inicial", valor: metadata.from || "Sem limite" },
    { item: "Período final", valor: metadata.to || "Sem limite" },
    { item: "Pesquisas completas", valor: metadata.completeCount },
    { item: "Linhas detalhadas", valor: metadata.detailCount },
    { item: "Todos_os_Dados", valor: "Uma linha para cada pesquisa completa, com todas as variáveis consolidadas." },
    { item: "Resumo", valor: "Identificação, dados demográficos, conclusão das etapas e tempo total." },
    { item: "Etapa_1 / 2 / 3", valor: "Variáveis consolidadas de cada etapa." },
    { item: "Detalhes_*", valor: "Opcional: eventos e linhas técnicas, separados por conjunto de dados." },
    { item: "Dados no PostgreSQL", valor: "O script somente lê o banco; nenhum registro é alterado." },
  ];
}

function formatWorkbookWithExcel(outputPath) {
  if (process.platform !== "win32") return;

  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const formatterPath = path.join(scriptDirectory, "format-exported-workbook.ps1");
  if (!fs.existsSync(formatterPath)) return;

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      formatterPath,
      "-WorkbookPath",
      outputPath,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.warn("Aviso: o Excel foi criado, mas a formatacao visual automatica nao foi aplicada.");
  }
}

function buildDictionaryRows(sheetRows) {
  const result = [];

  for (const [sheetName, rows] of Object.entries(sheetRows)) {
    if (rows.length === 0) continue;
    for (const column of orderedColumns(rows)) {
      result.push({
        aba: sheetName,
        coluna: column,
        nome_amigavel: friendlyLabel(column),
      });
    }
  }

  return result;
}

export function buildWorkbook(completeRows, detailRowsByDataset, metadata) {
  const safeCompleteRows = completeRows.map(sanitizeRowCells);
  const safeDetailRowsByDataset = new Map(
    [...detailRowsByDataset.entries()].map(([dataset, rows]) => [
      dataset,
      rows.map(sanitizeRowCells),
    ]),
  );
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Resultados organizados do estudo",
    Subject: "Exportação do Azure PostgreSQL",
    Author: "Meat App",
    CreatedDate: new Date(metadata.generatedAt),
  };

  const summaryRows = selectColumns(
    safeCompleteRows,
    (column) => SUMMARY_COLUMNS.includes(column),
    SUMMARY_COLUMNS,
  );
  const stage1Rows = selectColumns(
    safeCompleteRows,
    (column) => column.startsWith("s1_") || column.startsWith("session_1_"),
  );
  const stage2Rows = selectColumns(
    safeCompleteRows,
    (column) => column.startsWith("s2_") || column.startsWith("session_2_"),
  );
  const stage3Rows = selectColumns(
    safeCompleteRows,
    (column) => column.startsWith("s3_") || column.startsWith("session_3_"),
  );

  const sheetRows = {
    Resumo: summaryRows,
    Etapa_1: stage1Rows,
    Etapa_2: stage2Rows,
    Etapa_3: stage3Rows,
    Todos_os_Dados: safeCompleteRows,
  };

  const readme = XLSX.utils.json_to_sheet(buildReadmeRows(metadata));
  styleHeaderRow(readme, ["item", "valor"]);
  readme["!cols"] = [{ wch: 24 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, readme, "Leia_me");

  addWorksheet(workbook, "Resumo", summaryRows, SUMMARY_COLUMNS);
  addWorksheet(workbook, "Etapa_1", stage1Rows, CORE_COLUMNS);
  addWorksheet(workbook, "Etapa_2", stage2Rows, CORE_COLUMNS);
  addWorksheet(workbook, "Etapa_3", stage3Rows, CORE_COLUMNS);
  addWorksheet(workbook, "Todos_os_Dados", safeCompleteRows, CORE_COLUMNS);

  for (const [dataset, rows] of [...safeDetailRowsByDataset.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const cleanName = `Detalhes_${dataset}`.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 31);
    addWorksheet(workbook, cleanName, rows, [
      "meta_id_linha_banco",
      ...CORE_COLUMNS,
      "meta_tipo_envio",
      "meta_etapa",
      "meta_conjunto_dados",
      "meta_numero_linha",
    ]);
    sheetRows[cleanName] = rows;
  }

  const dictionaryRows = buildDictionaryRows(sheetRows);
  addWorksheet(workbook, "Dicionario", dictionaryRows, ["aba", "coluna", "nome_amigavel"]);

  return workbook;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("A variavel DATABASE_URL nao esta configurada neste terminal.");
  }

  const outputPath = normalizeOutputPath(options.output);
  if (fs.existsSync(outputPath) && !options.overwrite) {
    throw new Error(`O arquivo ja existe: ${outputPath}. Use --overwrite para substitui-lo.`);
  }

  const completeRows = [];
  const detailRowsByDataset = new Map();
  const client = new Client({ connectionString });

  try {
    console.log("Conectando ao PostgreSQL...");
    await client.connect();

    console.log("Lendo pesquisas completas em lotes...");
    const completeCount = await readInBatches(
      client,
      buildCompleteSurveyQuery,
      options,
      async (rows) => completeRows.push(...rows.map(completeSurveyRow)),
    );

    let detailCount = 0;
    if (options.includeDetails) {
      console.log("Lendo detalhes em lotes...");
      detailCount = await readInBatches(client, buildDetailQuery, options, async (rows) => {
        for (const row of rows) {
          const dataset = row.dataset || "sem_dataset";
          if (!detailRowsByDataset.has(dataset)) detailRowsByDataset.set(dataset, []);
          detailRowsByDataset.get(dataset).push(detailRow(row));
        }
      });
    }

    const metadata = {
      generatedAt: new Date().toISOString(),
      location: options.location,
      from: options.from,
      to: options.to,
      completeCount,
      detailCount,
    };

    console.log("Montando o Excel...");
    const workbook = buildWorkbook(completeRows, detailRowsByDataset, metadata);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const temporaryPath = `${outputPath}.tmp`;
    XLSX.writeFile(workbook, temporaryPath, {
      bookType: "xlsx",
      compression: true,
      cellDates: true,
      cellStyles: true,
    });
    fs.renameSync(temporaryPath, outputPath);

    if (!options.skipFormatting) {
      console.log("Aplicando a formatacao visual...");
      formatWorkbookWithExcel(outputPath);
    }

    console.log(`Excel criado: ${outputPath}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (executedDirectly) {
  main().catch((error) => {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  });
}
