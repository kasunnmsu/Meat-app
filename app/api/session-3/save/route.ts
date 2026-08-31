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
import { validateSessionThreePayload } from "@/lib/payloadValidation";
import {
  getRelativeResultsAreaDirectory,
  getResultsAreaDirectory,
} from "@/lib/dataPaths";
import {
  writeCodebookWorkbook,
  writeSessionAnalysisWorkbook,
} from "@/lib/resultWorkbooks";
import { saveStudySubmission, SubmissionKind } from "@/lib/studyDatabase";

export const runtime = "nodejs";

type ParticipantRow = Record<string, string | number>;
type LongRow = Record<string, string | number>;
type TrackingRow = Record<string, string | number>;

type ResultsStore = {
  participantRows: ParticipantRow[];
  longRows: LongRow[];
  decisionAttemptRows: TrackingRow[];
  sealInteractionRows: TrackingRow[];
  preselectionReorderRows: TrackingRow[];
  finalConfirmationRows: TrackingRow[];
  rankingRevisionRows: TrackingRow[];
  revisionReorderRows: TrackingRow[];
  processedSubmissionIds?: string[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateSessionThreePayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "validation_failed", message: validation.error },
        { status: 400 }
      );
    }

    const participantRow: ParticipantRow = body.participantRow;
    const longRows: LongRow[] = body.longRows;
    const decisionAttemptRows: TrackingRow[] = Array.isArray(
      body.decisionAttemptRows
    )
      ? body.decisionAttemptRows
      : [];
    const sealInteractionRows: TrackingRow[] = Array.isArray(
      body.sealInteractionRows
    )
      ? body.sealInteractionRows
      : [];
    const preselectionReorderRows: TrackingRow[] = Array.isArray(
      body.preselectionReorderRows
    )
      ? body.preselectionReorderRows
      : [];
    const finalConfirmationRows: TrackingRow[] = Array.isArray(
      body.finalConfirmationRows
    )
      ? body.finalConfirmationRows
      : [];
    const rankingRevisionRows: TrackingRow[] = Array.isArray(
      body.rankingRevisionRows
    )
      ? body.rankingRevisionRows
      : [];
    const revisionReorderRows: TrackingRow[] = Array.isArray(
      body.revisionReorderRows
    )
      ? body.revisionReorderRows
      : [];
    const submissionId = normalizeSubmissionId(body.submissionId);

    if (!participantRow) {
      return NextResponse.json(
        { error: "No participant row received." },
        { status: 400 }
      );
    }

    if (!longRows || !Array.isArray(longRows) || longRows.length === 0) {
      return NextResponse.json(
        { error: "No long-format rows received." },
        { status: 400 }
      );
    }

    const location = String(participantRow.location);

    const databaseResult = await saveStudySubmission({
      submissionId,
      participantId: String(participantRow.participant_id),
      location,
      kind: SubmissionKind.SESSION_3,
      sessionNumber: 3,
      payload: body as Record<string, unknown>,
    });

    if (databaseResult.enabled) {
      return NextResponse.json({
        success: true,
        message: "Session 3 participant saved to PostgreSQL.",
        storage: "postgresql",
        duplicate: databaseResult.duplicate,
        participantRows: databaseResult.duplicate ? 0 : 1,
        longRows: databaseResult.duplicate ? 0 : longRows.length,
        databaseRows: databaseResult.savedRows,
      });
    }

    const dataDir = getResultsAreaDirectory(
      location,
      "session-3",
      "technical"
    );
    const analysisDir = getResultsAreaDirectory(
      location,
      "session-3",
      "analysis"
    );
    const relativeDataDir = getRelativeResultsAreaDirectory(
      location,
      "session-3",
      "technical"
    );
    const relativeAnalysisDir = getRelativeResultsAreaDirectory(
      location,
      "session-3",
      "analysis"
    );
    const jsonPath = path.join(dataDir, "session-3-results.json");
    const excelPath = path.join(dataDir, "session-3-results.xlsx");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    const result = await withFileLock(jsonPath, async () => {
      let store: ResultsStore = {
        participantRows: [],
        longRows: [],
        decisionAttemptRows: [],
        sealInteractionRows: [],
        preselectionReorderRows: [],
        finalConfirmationRows: [],
        rankingRevisionRows: [],
        revisionReorderRows: [],
      };

      if (fs.existsSync(jsonPath)) {
        const rawJson = fs.readFileSync(jsonPath, "utf8");

        if (rawJson.trim()) {
          const parsed = JSON.parse(rawJson);
          store = {
            participantRows: parsed.participantRows || [],
            longRows: parsed.longRows || [],
            decisionAttemptRows: parsed.decisionAttemptRows || [],
            sealInteractionRows: parsed.sealInteractionRows || [],
            preselectionReorderRows:
              parsed.preselectionReorderRows || [],
            finalConfirmationRows: parsed.finalConfirmationRows || [],
            rankingRevisionRows: parsed.rankingRevisionRows || [],
            revisionReorderRows: parsed.revisionReorderRows || [],
            processedSubmissionIds: Array.isArray(
              parsed.processedSubmissionIds
            )
              ? parsed.processedSubmissionIds
              : [],
          };
        }
      }

      const duplicate = hasProcessedSubmission(store, submissionId);

      if (!duplicate) {
        store.participantRows.push(participantRow);
        store.longRows.push(...longRows);
        store.decisionAttemptRows.push(...decisionAttemptRows);
        store.sealInteractionRows.push(...sealInteractionRows);
        store.preselectionReorderRows.push(...preselectionReorderRows);
        store.finalConfirmationRows.push(...finalConfirmationRows);
        store.rankingRevisionRows.push(...rankingRevisionRows);
        store.revisionReorderRows.push(...revisionReorderRows);
        rememberSubmission(store, submissionId);

        writeFileAtomicSync(jsonPath, JSON.stringify(store, null, 2), "utf8");
      }

      const workbook = XLSX.utils.book_new();

      const participantWorksheet = XLSX.utils.json_to_sheet(store.participantRows);
      const longWorksheet = XLSX.utils.json_to_sheet(store.longRows);
      const decisionAttemptWorksheet = XLSX.utils.json_to_sheet(
        store.decisionAttemptRows
      );
      const sealInteractionWorksheet = XLSX.utils.json_to_sheet(
        store.sealInteractionRows
      );
      const preselectionReorderWorksheet = XLSX.utils.json_to_sheet(
        store.preselectionReorderRows
      );
      const finalConfirmationWorksheet = XLSX.utils.json_to_sheet(
        store.finalConfirmationRows
      );
      const rankingRevisionWorksheet = XLSX.utils.json_to_sheet(
        store.rankingRevisionRows
      );
      const revisionReorderWorksheet = XLSX.utils.json_to_sheet(
        store.revisionReorderRows
      );

      XLSX.utils.book_append_sheet(
        workbook,
        participantWorksheet,
        "Participant Data"
      );

      XLSX.utils.book_append_sheet(workbook, longWorksheet, "Long Format");
      XLSX.utils.book_append_sheet(
        workbook,
        decisionAttemptWorksheet,
        "Decision Attempts"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        sealInteractionWorksheet,
        "Seal Interactions"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        preselectionReorderWorksheet,
        "Preselection Reorders"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        finalConfirmationWorksheet,
        "Final Confirmations"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        rankingRevisionWorksheet,
        "Ranking Revisions"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        revisionReorderWorksheet,
        "Revision Reorders"
      );

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      writeFileAtomicSync(excelPath, excelBuffer);

      await writeCsvAndSqliteExports(dataDir, "session-3-results", [
        { name: "participantRows", rows: store.participantRows },
        { name: "longRows", rows: store.longRows },
        { name: "decisionAttemptRows", rows: store.decisionAttemptRows },
        { name: "sealInteractionRows", rows: store.sealInteractionRows },
        {
          name: "preselectionReorderRows",
          rows: store.preselectionReorderRows,
        },
        {
          name: "finalConfirmationRows",
          rows: store.finalConfirmationRows,
        },
        { name: "rankingRevisionRows", rows: store.rankingRevisionRows },
        { name: "revisionReorderRows", rows: store.revisionReorderRows },
      ]);
      writeSessionAnalysisWorkbook(
        analysisDir,
        store.participantRows,
        store.longRows,
        3
      );
      writeCodebookWorkbook(dataDir, store.longRows);

      return {
        participantRowsCount: store.participantRows.length,
        longRowsCount: store.longRows.length,
        decisionAttemptRowsCount: store.decisionAttemptRows.length,
        sealInteractionRowsCount: store.sealInteractionRows.length,
        preselectionReorderRowsCount:
          store.preselectionReorderRows.length,
        finalConfirmationRowsCount: store.finalConfirmationRows.length,
        rankingRevisionRowsCount: store.rankingRevisionRows.length,
        revisionReorderRowsCount: store.revisionReorderRows.length,
        duplicate,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Session 3 participant saved.",
      participantRows: result.participantRowsCount,
      longRows: result.longRowsCount,
      decisionAttemptRows: result.decisionAttemptRowsCount,
      sealInteractionRows: result.sealInteractionRowsCount,
      preselectionReorderRows: result.preselectionReorderRowsCount,
      finalConfirmationRows: result.finalConfirmationRowsCount,
      rankingRevisionRows: result.rankingRevisionRowsCount,
      revisionReorderRows: result.revisionReorderRowsCount,
      duplicate: result.duplicate,
      excelPath: `${relativeAnalysisDir}/session-3-analysis.xlsx`,
      technicalExcelPath: `${relativeDataDir}/session-3-results.xlsx`,
      codebookPath: `${relativeDataDir}/codebook.xlsx`,
      jsonPath: `${relativeDataDir}/session-3-results.json`,
      csvPaths: [
        `${relativeDataDir}/session-3-results-participant-rows.csv`,
        `${relativeDataDir}/session-3-results-long-rows.csv`,
        `${relativeDataDir}/session-3-results-decision-attempt-rows.csv`,
        `${relativeDataDir}/session-3-results-seal-interaction-rows.csv`,
        `${relativeDataDir}/session-3-results-preselection-reorder-rows.csv`,
        `${relativeDataDir}/session-3-results-final-confirmation-rows.csv`,
        `${relativeDataDir}/session-3-results-ranking-revision-rows.csv`,
        `${relativeDataDir}/session-3-results-revision-reorder-rows.csv`,
      ],
      sqlitePath: `${relativeDataDir}/session-3-results.sqlite`,
    });
  } catch (error) {
    console.error("Failed to save Session 3 data:", error);

    return NextResponse.json(
      {
        error: "Failed to save Session 3 data.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
