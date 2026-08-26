import * as XLSX from "xlsx";
import path from "node:path";
import { writeFileAtomicSync } from "@/lib/atomicFile";
import {
  createAnalysisLongRows,
  createAnalysisParticipantRows,
  createCodebookRows,
  createFullSurveyAnalysisRows,
  type ResultRow,
} from "@/lib/analysisRows";

function writeWorkbook(
  filePath: string,
  sheets: Array<{ name: string; rows: ResultRow[] }>
) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(sheet.rows),
      sheet.name
    );
  }

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  writeFileAtomicSync(filePath, buffer);
}

export function writeSessionAnalysisWorkbook(
  analysisDirectory: string,
  participantRows: ResultRow[],
  longRows: ResultRow[],
  sessionNumber: number
) {
  writeWorkbook(
    path.join(analysisDirectory, `session-${sessionNumber}-analysis.xlsx`),
    [
      {
        name: "Participant Data",
        rows: createAnalysisParticipantRows(
          participantRows,
          longRows,
          sessionNumber
        ),
      },
      {
        name: "Long Format",
        rows: createAnalysisLongRows(longRows),
      },
    ]
  );
}

export function writeCodebookWorkbook(
  technicalDirectory: string,
  longRows: ResultRow[]
) {
  writeWorkbook(path.join(technicalDirectory, "codebook.xlsx"), [
    { name: "Codebook", rows: createCodebookRows(longRows) },
  ]);
}

export function writeFullSurveyAnalysisWorkbook(
  analysisDirectory: string,
  participantRows: ResultRow[]
) {
  writeWorkbook(path.join(analysisDirectory, "full-survey-analysis.xlsx"), [
    {
      name: "Full Survey Data",
      rows: createFullSurveyAnalysisRows(participantRows),
    },
  ]);
}
