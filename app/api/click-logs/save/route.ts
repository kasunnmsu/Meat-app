import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "node:fs/promises";
import path from "node:path";
import { writeCsvAndSqliteExports } from "@/lib/dataExports";
import { withFileLock } from "@/lib/fileLock";
import { writeFileAtomic } from "@/lib/atomicFile";
import {
  hasProcessedSubmission,
  normalizeSubmissionId,
  rememberSubmission,
} from "@/lib/submissionId";
import { validateClickLogsPayload } from "@/lib/payloadValidation";
import {
  getRelativeResultsDirectory,
  getResultsDirectory,
} from "@/lib/dataPaths";
import { saveStudySubmission, SubmissionKind } from "@/lib/studyDatabase";

export const runtime = "nodejs";

type ClickLogRow = Record<string, unknown>;

type ClickLogFile = {
  clickRows: ClickLogRow[];
  processedSubmissionIds?: string[];
};

async function ensureDataDir(dataDir: string) {
  await fs.mkdir(dataDir, {
    recursive: true,
  });
}

async function readExistingClickLogs(filePath: string): Promise<ClickLogFile> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      clickRows: Array.isArray(parsed.clickRows)
        ? parsed.clickRows
        : [],
      processedSubmissionIds: Array.isArray(parsed.processedSubmissionIds)
        ? parsed.processedSubmissionIds
        : [],
    };
  } catch {
    return {
      clickRows: [],
    };
  }
}

async function saveLocationClickLogs(
  location: string,
  incomingRows: ClickLogRow[],
  submissionId: string
) {
  const dataDir = getResultsDirectory(location, "click-logs");
  const relativeDataDir = getRelativeResultsDirectory(location, "click-logs");
  const filePath = path.join(dataDir, "click-logs-results.json");
  const excelPath = path.join(dataDir, "click-logs-results.xlsx");

  await ensureDataDir(dataDir);

  return withFileLock(filePath, async () => {
    const existing = await readExistingClickLogs(filePath);
    const duplicate = hasProcessedSubmission(existing, submissionId);
    const savedAt = new Date().toISOString();

    const rowsToSave = duplicate
      ? []
      : incomingRows.map((row) => ({
          ...row,
          saved_at: savedAt,
        }));

    const nextFile: ClickLogFile = {
      clickRows: [...existing.clickRows, ...rowsToSave],
      processedSubmissionIds: existing.processedSubmissionIds ?? [],
    };

    if (!duplicate) {
      rememberSubmission(nextFile, submissionId);
      await writeFileAtomic(filePath, JSON.stringify(nextFile, null, 2));
    }

    const exportWarnings: string[] = [];

    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(
        nextFile.clickRows.length
          ? nextFile.clickRows
          : [{ note: "No click logs recorded" }]
      );

      XLSX.utils.book_append_sheet(workbook, worksheet, "Click Logs");

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      await writeFileAtomic(excelPath, excelBuffer);
    } catch (error) {
      console.error("Click log Excel export failed:", error);
      exportWarnings.push("Excel export failed. JSON was saved.");
    }

    try {
      await writeCsvAndSqliteExports(dataDir, "click-logs-results", [
        { name: "clickRows", rows: nextFile.clickRows },
      ]);
    } catch (error) {
      console.error("Click log CSV/SQLite export failed:", error);
      exportWarnings.push("CSV/SQLite export failed. JSON was saved.");
    }

    return {
      location,
      relativeDataDir,
      duplicate,
      savedRows: rowsToSave.length,
      totalRows: nextFile.clickRows.length,
      exportWarnings,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateClickLogsPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "validation_failed", message: validation.error },
        { status: 400 }
      );
    }

    const incomingRows = Array.isArray(body.clickRows)
      ? body.clickRows
      : [];
    const submissionId = normalizeSubmissionId(body.submissionId);

    if (incomingRows.length === 0) {
      return NextResponse.json({
        success: true,
        savedRows: 0,
      });
    }

    const rowsByLocation = new Map<string, ClickLogRow[]>();

    for (const row of incomingRows) {
      const location = String(row.location);
      rowsByLocation.set(location, [
        ...(rowsByLocation.get(location) ?? []),
        row,
      ]);
    }

    const databaseResults = await Promise.all(
      Array.from(rowsByLocation.entries()).flatMap(([location, rows]) => {
        const rowsByParticipant = new Map<string, ClickLogRow[]>();

        for (const row of rows) {
          const participantId = String(row.participant_id);
          rowsByParticipant.set(participantId, [
            ...(rowsByParticipant.get(participantId) ?? []),
            row,
          ]);
        }

        return Array.from(rowsByParticipant.entries()).map(
          ([participantId, participantRows]) =>
            saveStudySubmission({
              submissionId,
              participantId,
              location,
              kind: SubmissionKind.CLICK_LOGS,
              payload: {
                submissionId,
                clickRows: participantRows,
              },
            })
        );
      })
    );

    if (
      databaseResults.length > 0 &&
      databaseResults.every((result) => result.enabled)
    ) {
      return NextResponse.json({
        success: true,
        storage: "postgresql",
        duplicate: databaseResults.every((result) => result.duplicate),
        savedRows: databaseResults.reduce(
          (total, result) => total + result.savedRows,
          0
        ),
        totalRows: incomingRows.length,
      });
    }

    const results = await Promise.all(
      Array.from(rowsByLocation.entries()).map(([location, rows]) =>
        saveLocationClickLogs(location, rows, submissionId)
      )
    );
    const primaryResult = results[0];
    const exportWarnings = results.flatMap((result) => result.exportWarnings);

    return NextResponse.json({
      success: true,
      duplicate: results.every((result) => result.duplicate),
      savedRows: results.reduce((total, result) => total + result.savedRows, 0),
      totalRows: results.reduce((total, result) => total + result.totalRows, 0),
      exportWarnings,
      excelPath: `${primaryResult.relativeDataDir}/click-logs-results.xlsx`,
      jsonPath: `${primaryResult.relativeDataDir}/click-logs-results.json`,
      csvPath: `${primaryResult.relativeDataDir}/click-logs-results.csv`,
      sqlitePath: `${primaryResult.relativeDataDir}/click-logs-results.sqlite`,
    });
  } catch (error) {
    console.error("Click log save failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Click log save failed",
      },
      {
        status: 500,
      }
    );
  }
}
