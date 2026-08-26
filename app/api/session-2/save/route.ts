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
import { validateSessionTwoPayload } from "@/lib/payloadValidation";
import {
  getRelativeResultsAreaDirectory,
  getResultsAreaDirectory,
} from "@/lib/dataPaths";
import {
  writeCodebookWorkbook,
  writeSessionAnalysisWorkbook,
} from "@/lib/resultWorkbooks";

export const runtime = "nodejs";

type ParticipantRow = Record<string, string | number>;
type LongRow = Record<string, string | number>;
type SealReadingRow = Record<string, string | number>;
type TrackingRow = Record<string, string | number>;

type ResultsStore = {
  participantRows: ParticipantRow[];
  longRows: LongRow[];
  sealReadingRows: SealReadingRow[];
  rankingSealClickRows: SealReadingRow[];
  decisionAttemptRows: TrackingRow[];
  rankingSealInteractionRows: TrackingRow[];
  sealReadingInteractionRows: TrackingRow[];
  readingScreenVisitRows: TrackingRow[];
  preselectionReorderRows: TrackingRow[];
  finalConfirmationRows: TrackingRow[];
  rankingRevisionRows: TrackingRow[];
  revisionReorderRows: TrackingRow[];
  processedSubmissionIds?: string[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateSessionTwoPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "validation_failed", message: validation.error },
        { status: 400 }
      );
    }

    const participantRow: ParticipantRow = body.participantRow;
    const longRows: LongRow[] = body.longRows;
    const sealReadingRows: SealReadingRow[] = body.sealReadingRows;
    const rankingSealClickRows: SealReadingRow[] = body.rankingSealClickRows || [];
    const decisionAttemptRows: TrackingRow[] = body.decisionAttemptRows || [];
    const rankingSealInteractionRows: TrackingRow[] =
      body.rankingSealInteractionRows || [];
    const sealReadingInteractionRows: TrackingRow[] =
      body.sealReadingInteractionRows || [];
    const readingScreenVisitRows: TrackingRow[] =
      body.readingScreenVisitRows || [];
    const preselectionReorderRows: TrackingRow[] =
      body.preselectionReorderRows || [];
    const finalConfirmationRows: TrackingRow[] =
      body.finalConfirmationRows || [];
    const rankingRevisionRows: TrackingRow[] =
      body.rankingRevisionRows || [];
    const revisionReorderRows: TrackingRow[] =
      body.revisionReorderRows || [];
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

    if (!sealReadingRows || !Array.isArray(sealReadingRows)) {
      return NextResponse.json(
        { error: "No seal-reading rows received." },
        { status: 400 }
      );
    }

    const location = String(participantRow.location);
    const dataDir = getResultsAreaDirectory(
      location,
      "session-2",
      "technical"
    );
    const analysisDir = getResultsAreaDirectory(
      location,
      "session-2",
      "analysis"
    );
    const relativeDataDir = getRelativeResultsAreaDirectory(
      location,
      "session-2",
      "technical"
    );
    const relativeAnalysisDir = getRelativeResultsAreaDirectory(
      location,
      "session-2",
      "analysis"
    );
    const jsonPath = path.join(dataDir, "session-2-results.json");
    const excelPath = path.join(dataDir, "session-2-results.xlsx");

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
        sealReadingRows: [],
        rankingSealClickRows: [],
        decisionAttemptRows: [],
        rankingSealInteractionRows: [],
        sealReadingInteractionRows: [],
        readingScreenVisitRows: [],
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
            sealReadingRows: parsed.sealReadingRows || [],
            rankingSealClickRows: parsed.rankingSealClickRows || [],
            decisionAttemptRows: parsed.decisionAttemptRows || [],
            rankingSealInteractionRows:
              parsed.rankingSealInteractionRows || [],
            sealReadingInteractionRows:
              parsed.sealReadingInteractionRows || [],
            readingScreenVisitRows: parsed.readingScreenVisitRows || [],
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
        store.sealReadingRows.push(...sealReadingRows);
        store.rankingSealClickRows.push(...rankingSealClickRows);
        store.decisionAttemptRows.push(...decisionAttemptRows);
        store.rankingSealInteractionRows.push(...rankingSealInteractionRows);
        store.sealReadingInteractionRows.push(...sealReadingInteractionRows);
        store.readingScreenVisitRows.push(...readingScreenVisitRows);
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
      const sealReadingWorksheet = XLSX.utils.json_to_sheet(store.sealReadingRows);
      const rankingClickWorksheet = XLSX.utils.json_to_sheet(store.rankingSealClickRows.length ? store.rankingSealClickRows : [{ note: "No ranking seal clicks recorded" }]);
      const decisionAttemptWorksheet = XLSX.utils.json_to_sheet(store.decisionAttemptRows);
      const rankingSealInteractionWorksheet = XLSX.utils.json_to_sheet(store.rankingSealInteractionRows);
      const sealReadingInteractionWorksheet = XLSX.utils.json_to_sheet(store.sealReadingInteractionRows);
      const readingScreenVisitWorksheet = XLSX.utils.json_to_sheet(store.readingScreenVisitRows);
      const preselectionReorderWorksheet = XLSX.utils.json_to_sheet(store.preselectionReorderRows);
      const finalConfirmationWorksheet = XLSX.utils.json_to_sheet(store.finalConfirmationRows);
      const rankingRevisionWorksheet = XLSX.utils.json_to_sheet(store.rankingRevisionRows);
      const revisionReorderWorksheet = XLSX.utils.json_to_sheet(store.revisionReorderRows);

      XLSX.utils.book_append_sheet(workbook, participantWorksheet, "Participant Data");
      XLSX.utils.book_append_sheet(workbook, longWorksheet, "Long Format");
      XLSX.utils.book_append_sheet(workbook, sealReadingWorksheet, "Seal Readings");
      XLSX.utils.book_append_sheet(workbook, rankingClickWorksheet, "Ranking Seal Clicks");
      XLSX.utils.book_append_sheet(workbook, decisionAttemptWorksheet, "Decision Attempts");
      XLSX.utils.book_append_sheet(workbook, rankingSealInteractionWorksheet, "Ranking Seal Interactions");
      XLSX.utils.book_append_sheet(workbook, sealReadingInteractionWorksheet, "Seal Reading Interactions");
      XLSX.utils.book_append_sheet(workbook, readingScreenVisitWorksheet, "Reading Screen Visits");
      XLSX.utils.book_append_sheet(workbook, preselectionReorderWorksheet, "Preselection Reorders");
      XLSX.utils.book_append_sheet(workbook, finalConfirmationWorksheet, "Final Confirmations");
      XLSX.utils.book_append_sheet(workbook, rankingRevisionWorksheet, "Ranking Revisions");
      XLSX.utils.book_append_sheet(workbook, revisionReorderWorksheet, "Revision Reorders");

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      writeFileAtomicSync(excelPath, excelBuffer);

      await writeCsvAndSqliteExports(dataDir, "session-2-results", [
        { name: "participantRows", rows: store.participantRows },
        { name: "longRows", rows: store.longRows },
        { name: "sealReadingRows", rows: store.sealReadingRows },
        {
          name: "rankingSealClickRows",
          rows: store.rankingSealClickRows.length
            ? store.rankingSealClickRows
            : [{ note: "No ranking seal clicks recorded" }],
        },
        { name: "decisionAttemptRows", rows: store.decisionAttemptRows },
        {
          name: "rankingSealInteractionRows",
          rows: store.rankingSealInteractionRows,
        },
        {
          name: "sealReadingInteractionRows",
          rows: store.sealReadingInteractionRows,
        },
        {
          name: "readingScreenVisitRows",
          rows: store.readingScreenVisitRows,
        },
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
        2
      );
      writeCodebookWorkbook(dataDir, store.longRows);

      return {
        participantRowsCount: store.participantRows.length,
        longRowsCount: store.longRows.length,
        sealReadingRowsCount: store.sealReadingRows.length,
        decisionAttemptRowsCount: store.decisionAttemptRows.length,
        rankingSealInteractionRowsCount:
          store.rankingSealInteractionRows.length,
        sealReadingInteractionRowsCount:
          store.sealReadingInteractionRows.length,
        readingScreenVisitRowsCount: store.readingScreenVisitRows.length,
        preselectionReorderRowsCount: store.preselectionReorderRows.length,
        finalConfirmationRowsCount: store.finalConfirmationRows.length,
        rankingRevisionRowsCount: store.rankingRevisionRows.length,
        revisionReorderRowsCount: store.revisionReorderRows.length,
        duplicate,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Session 2 participant saved.",
      participantRows: result.participantRowsCount,
      longRows: result.longRowsCount,
      sealReadingRows: result.sealReadingRowsCount,
      decisionAttemptRows: result.decisionAttemptRowsCount,
      rankingSealInteractionRows: result.rankingSealInteractionRowsCount,
      sealReadingInteractionRows: result.sealReadingInteractionRowsCount,
      readingScreenVisitRows: result.readingScreenVisitRowsCount,
      preselectionReorderRows: result.preselectionReorderRowsCount,
      finalConfirmationRows: result.finalConfirmationRowsCount,
      rankingRevisionRows: result.rankingRevisionRowsCount,
      revisionReorderRows: result.revisionReorderRowsCount,
      duplicate: result.duplicate,
      excelPath: `${relativeAnalysisDir}/session-2-analysis.xlsx`,
      technicalExcelPath: `${relativeDataDir}/session-2-results.xlsx`,
      codebookPath: `${relativeDataDir}/codebook.xlsx`,
      jsonPath: `${relativeDataDir}/session-2-results.json`,
      csvPaths: [
        `${relativeDataDir}/session-2-results-participant-rows.csv`,
        `${relativeDataDir}/session-2-results-long-rows.csv`,
        `${relativeDataDir}/session-2-results-seal-reading-rows.csv`,
        `${relativeDataDir}/session-2-results-ranking-seal-click-rows.csv`,
        `${relativeDataDir}/session-2-results-decision-attempt-rows.csv`,
        `${relativeDataDir}/session-2-results-ranking-seal-interaction-rows.csv`,
        `${relativeDataDir}/session-2-results-seal-reading-interaction-rows.csv`,
        `${relativeDataDir}/session-2-results-reading-screen-visit-rows.csv`,
        `${relativeDataDir}/session-2-results-preselection-reorder-rows.csv`,
        `${relativeDataDir}/session-2-results-final-confirmation-rows.csv`,
        `${relativeDataDir}/session-2-results-ranking-revision-rows.csv`,
        `${relativeDataDir}/session-2-results-revision-reorder-rows.csv`,
      ],
      sqlitePath: `${relativeDataDir}/session-2-results.sqlite`,
    });
  } catch (error) {
    console.error("Failed to save Session 2 data:", error);

    return NextResponse.json(
      {
        error: "Failed to save Session 2 data.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
