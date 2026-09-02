import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import XLSX from "xlsx";

import { buildOrganizedWorkbook } from "./organize-query-export.mjs";

const OUTPUT_FILE_NAME = "RESULTADOS_ORGANIZADOS.xlsx";

function parseArguments(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--folder") options.folder = argv[++index];
    else throw new Error(`Opcao desconhecida: ${argument}`);
  }

  if (!options.folder) throw new Error("Informe a pasta com --folder.");
  return options;
}

function newestRawWorkbook(folderPath) {
  const candidates = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => path.extname(name).toLowerCase() === ".xlsx")
    .filter((name) => name.toLowerCase() !== OUTPUT_FILE_NAME.toLowerCase())
    .filter((name) => !name.toLowerCase().endsWith("-organized.xlsx"))
    .map((name) => {
      const filePath = path.join(folderPath, name);
      return { filePath, modifiedAt: fs.statSync(filePath).mtimeMs };
    })
    .sort((first, second) => second.modifiedAt - first.modifiedAt);

  if (candidates.length === 0) {
    throw new Error(
      `Nao encontrei um Excel cru na pasta ${folderPath}. Baixe o arquivo do banco e salve nessa pasta.`,
    );
  }

  return candidates[0].filePath;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const folderPath = path.resolve(options.folder);
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    throw new Error(`Pasta nao encontrada: ${folderPath}`);
  }

  const inputPath = newestRawWorkbook(folderPath);
  const sourceWorkbook = XLSX.readFile(inputPath, { cellDates: true });
  const sourceSheet = sourceWorkbook.Sheets[sourceWorkbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sourceSheet, {
    defval: null,
    raw: true,
  });
  if (rows.length === 0) throw new Error("O Excel cru nao possui dados.");

  const outputPath = path.join(folderPath, OUTPUT_FILE_NAME);
  const workbook = buildOrganizedWorkbook(rows);
  XLSX.writeFile(workbook, outputPath, {
    bookType: "xlsx",
    compression: true,
    cellDates: true,
  });

  console.log(`Arquivo cru utilizado: ${inputPath}`);
  console.log(`Excel organizado criado: ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
}
