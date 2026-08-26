import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { writeCsvAndSqliteExports } from "@/lib/dataExports";
import { withFileLock } from "@/lib/fileLock";
import { writeFileAtomicSync } from "@/lib/atomicFile";
import {
  hasProcessedSubmission,
  normalizeSubmissionId,
  rememberSubmission,
} from "@/lib/submissionId";
import { validateFullSurveyPayload } from "@/lib/payloadValidation";
import {
  getLegacyResultPath,
  getRelativeResultsAreaDirectory,
  getResultsDirectory,
  getResultsAreaDirectory,
  type ResultCategory,
} from "@/lib/dataPaths";
import { writeFullSurveyAnalysisWorkbook } from "@/lib/resultWorkbooks";
import { createFullSurveyTimingFields } from "@/lib/fullSurveyTiming";
import { DATA_SCHEMA_VERSION } from "@/lib/sessionPayloads";

export const runtime = "nodejs";

type AnyRow = Record<string, string | number>;

type ResultsStore = {
  participantRows: AnyRow[];
  processedSubmissionIds?: string[];
};

type SessionStore = {
  participantRows?: AnyRow[];
  longRows?: AnyRow[];
  sealReadingRows?: AnyRow[];
};

function readJsonStore(filePath: string): SessionStore {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");

    if (!raw.trim()) {
      return {};
    }

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getStorePaths(
  location: string,
  category: ResultCategory,
  fileName: string
) {
  return [
    path.join(getResultsAreaDirectory(location, category, "technical"), fileName),
    path.join(getResultsDirectory(location, category), fileName),
    getLegacyResultPath(fileName),
  ];
}

function findParticipantRow(
  location: string,
  category: ResultCategory,
  fileName: string,
  participantId: string
) {
  for (const filePath of getStorePaths(location, category, fileName)) {
    const store = readJsonStore(filePath);
    const rows = Array.isArray(store.participantRows)
      ? store.participantRows
      : [];
    const participantRow = rows
      .filter((row) => row.participant_id === participantId)
      .at(-1);

    if (participantRow) {
      return participantRow;
    }
  }

  return undefined;
}

function findParticipantLongRows(
  location: string,
  category: ResultCategory,
  fileName: string,
  participantId: string
) {
  for (const filePath of getStorePaths(location, category, fileName)) {
    const store = readJsonStore(filePath);
    const rows = Array.isArray(store.longRows) ? store.longRows : [];
    const participantRows = rows.filter(
      (row) => row.participant_id === participantId
    );

    if (participantRows.length > 0) {
      return participantRows;
    }
  }

  return [];
}

function findSealReadingRows(location: string, participantId: string) {
  for (const filePath of getStorePaths(
    location,
    "session-2",
    "session-2-results.json"
  )) {
    const store = readJsonStore(filePath);
    const rows = Array.isArray(store.sealReadingRows)
      ? store.sealReadingRows
      : [];
    const participantRows = rows.filter(
      (row) => row.participant_id === participantId
    );

    if (participantRows.length > 0) {
      return participantRows;
    }
  }

  return [];
}

function prefixRow(prefix: string, row?: AnyRow) {
  const output: AnyRow = {};

  if (!row) {
    return output;
  }

  for (const [key, value] of Object.entries(row)) {
    if (
      key === "participant_id" ||
      key === "location" ||
      key === "gender" ||
      key === "age_group" ||
      key === "education_level" ||
      key === "income_group"
    ) {
      continue;
    }

    output[`${prefix}_${key}`] = value;
  }

  return output;
}

function createChoiceFields(
  prefix: "s1" | "s2" | "s3",
  rows: AnyRow[],
  participantRow?: AnyRow
) {
  const output: AnyRow = {};
  const sealNames = new Map(
    rows.map((row) => [
      String(row.seal_id || ""),
      String(row.subtitle || row.title || row.seal_id || ""),
    ])
  );

  for (const row of rows) {
    const choice = String(row.subtitle || row.title || row.seal_id || "");
    const rank = Number(row.selected_rank);

    if (!Number.isInteger(rank)) {
      continue;
    }

    if (prefix === "s3") {
      const screen = Number(row.presentation_screen_number);

      if (Number.isInteger(screen)) {
        output[`${prefix}_screen_${screen}_rank_${rank}_choice`] = choice;
      }
    } else {
      output[`${prefix}_rank_${rank}_choice`] = choice;
    }
  }

  if (prefix === "s3" && participantRow) {
    for (const position of [1, 2, 3]) {
      const sealId = String(participantRow[`top_seal_${position}`] || "");
      output[`s3_top_choice_${position}`] = sealNames.get(sealId) || sealId;
    }
  }

  return output;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateFullSurveyPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "validation_failed", message: validation.error },
        { status: 400 }
      );
    }

    const participantId = body.participantId;
    const location = body.location;
    const demographics = body.demographics || {};
    const submissionId = normalizeSubmissionId(body.submissionId);

    if (!participantId) {
      return NextResponse.json(
        { error: "participantId is required." },
        { status: 400 }
      );
    }

    const dataDir = getResultsAreaDirectory(
      location,
      "full-survey",
      "technical"
    );
    const analysisDir = getResultsAreaDirectory(
      location,
      "full-survey",
      "analysis"
    );
    const relativeDataDir = getRelativeResultsAreaDirectory(
      location,
      "full-survey",
      "technical"
    );
    const relativeAnalysisDir = getRelativeResultsAreaDirectory(
      location,
      "full-survey",
      "analysis"
    );
    const jsonPath = path.join(dataDir, "full-survey-results.json");
    const excelPath = path.join(dataDir, "full-survey-results.xlsx");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    const session1Row = findParticipantRow(
      location,
      "session-1",
      "session-1-results.json",
      participantId
    );

    const session2Row = findParticipantRow(
      location,
      "session-2",
      "session-2-results.json",
      participantId
    );

    const session3Row = findParticipantRow(
      location,
      "session-3",
      "session-3-results.json",
      participantId
    );

    const session1LongRows = findParticipantLongRows(
      location,
      "session-1",
      "session-1-results.json",
      participantId
    );
    const session2LongRows = findParticipantLongRows(
      location,
      "session-2",
      "session-2-results.json",
      participantId
    );
    const session3LongRows = findParticipantLongRows(
      location,
      "session-3",
      "session-3-results.json",
      participantId
    );

    const sealReadingRows = findSealReadingRows(location, participantId);

    const fullSurveySavedAt = new Date().toISOString();
    const fullSurveyTiming = createFullSurveyTimingFields(
      body.surveyStartedAt ||
        session1Row?.collection_started_at ||
        session1Row?.session_1_started_at,
      body.surveyCompletedAt || session3Row?.timestamp || fullSurveySavedAt
    );

    const combinedRow: AnyRow = {
      participant_id: participantId,
      location: location || session3Row?.location || session2Row?.location || session1Row?.location || "",
      data_schema_version: DATA_SCHEMA_VERSION,

      gender: demographics.gender || session3Row?.gender || "",
      age_group: demographics.ageGroup || session3Row?.age_group || "",
      education_level:
        demographics.educationLevel || session3Row?.education_level || "",
      income_group: demographics.incomeGroup || session3Row?.income_group || "",

      session_1_completed: session1Row ? "Yes" : "No",
      session_2_completed: session2Row ? "Yes" : "No",
      session_3_completed: session3Row ? "Yes" : "No",

      session_2_seals_read_count: sealReadingRows.length,

      ...prefixRow("s1", session1Row),
      ...prefixRow("s2", session2Row),
      ...prefixRow("s3", session3Row),
      ...createChoiceFields("s1", session1LongRows),
      ...createChoiceFields("s2", session2LongRows),
      ...createChoiceFields("s3", session3LongRows, session3Row),

      ...fullSurveyTiming,
      full_survey_saved_at: fullSurveySavedAt,
    };

    const result = await withFileLock(jsonPath, async () => {
      let store: ResultsStore = {
        participantRows: [],
      };

      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, "utf8");

        if (raw.trim()) {
          store = JSON.parse(raw);
        }
      }

      const duplicate = hasProcessedSubmission(store, submissionId);

      /*
        One row per participant.
        If this participant already exists, replace that participant's combined row.
        If not, append a new participant row.
      */
      if (!duplicate) {
        const existingIndex = store.participantRows.findIndex(
          (row) => row.participant_id === participantId
        );

        if (existingIndex >= 0) {
          store.participantRows[existingIndex] = combinedRow;
        } else {
          store.participantRows.push(combinedRow);
        }

        rememberSubmission(store, submissionId);

        writeFileAtomicSync(jsonPath, JSON.stringify(store, null, 2), "utf8");
      }

      const workbook = XLSX.utils.book_new();

      const participantWorksheet = XLSX.utils.json_to_sheet(
        store.participantRows
      );

      XLSX.utils.book_append_sheet(
        workbook,
        participantWorksheet,
        "Full Survey Data"
      );

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      writeFileAtomicSync(excelPath, excelBuffer);

      await writeCsvAndSqliteExports(dataDir, "full-survey-results", [
        { name: "participantRows", rows: store.participantRows },
      ]);
      writeFullSurveyAnalysisWorkbook(analysisDir, store.participantRows);

      return {
        participantRowsCount: store.participantRows.length,
        duplicate,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Full survey combined file saved.",
      participantRows: result.participantRowsCount,
      duplicate: result.duplicate,
      excelPath: `${relativeAnalysisDir}/full-survey-analysis.xlsx`,
      technicalExcelPath: `${relativeDataDir}/full-survey-results.xlsx`,
      jsonPath: `${relativeDataDir}/full-survey-results.json`,
      csvPath: `${relativeDataDir}/full-survey-results.csv`,
      sqlitePath: `${relativeDataDir}/full-survey-results.sqlite`,
    });
  } catch (error) {
    console.error("Failed to save full survey file:", error);

    return NextResponse.json(
      {
        error: "Failed to save full survey file.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
