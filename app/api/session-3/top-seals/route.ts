import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import {
  calculateTopSeals,
  SESSION_1_WEIGHT,
  SESSION_2_WEIGHT,
  type SealRankingRow,
} from "@/lib/topSeals";
import {
  getLegacyResultPath,
  getResultsDirectory,
  getResultsAreaDirectory,
  isResultLocation,
  RESULT_LOCATIONS,
  type ResultCategory,
} from "@/lib/dataPaths";
import { getLatestRankingRows } from "@/lib/studyDatabase";

export const runtime = "nodejs";

type ResultsFile = {
  participantRows?: Record<string, unknown>[];
  longRows?: SealRankingRow[];
};

async function readResultsFile(
  category: ResultCategory,
  filename: string,
  participantId: string,
  location?: string
): Promise<ResultsFile> {
  const locations = location ? [location] : [...RESULT_LOCATIONS];
  const filePaths = [
    ...locations.map((item) =>
      path.join(getResultsAreaDirectory(item, category, "technical"), filename)
    ),
    ...locations.map((item) =>
      path.join(getResultsDirectory(item, category), filename)
    ),
    getLegacyResultPath(filename),
  ];

  for (const filePath of filePaths) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      const longRows = Array.isArray(parsed.longRows)
        ? parsed.longRows.filter(
            (row: SealRankingRow) => row.participant_id === participantId
          )
        : [];

      if (longRows.length === 0) {
        continue;
      }

      return {
        participantRows: Array.isArray(parsed.participantRows)
          ? parsed.participantRows.filter(
              (row: Record<string, unknown>) =>
                row.participant_id === participantId
            )
          : [],
        longRows,
      };
    } catch {
      // Try the next location or the legacy flat data file.
    }
  }

  return {
    participantRows: [],
    longRows: [],
  };
}

export async function GET(request: NextRequest) {
  const participantId =
    request.nextUrl.searchParams.get("participantId")?.trim();
  const location = request.nextUrl.searchParams.get("location")?.trim();

  if (!participantId) {
    return NextResponse.json(
      {
        error: "participantId is required",
      },
      {
        status: 400,
      }
    );
  }

  if (location && !isResultLocation(location)) {
    return NextResponse.json(
      {
        error: "location is invalid",
      },
      {
        status: 400,
      }
    );
  }

  const [databaseSessionOneRows, databaseSessionTwoRows] = await Promise.all([
    getLatestRankingRows(participantId, 1, location),
    getLatestRankingRows(participantId, 2, location),
  ]);

  const [sessionOneResults, sessionTwoResults] = await Promise.all([
    databaseSessionOneRows.length > 0
      ? Promise.resolve({ longRows: databaseSessionOneRows as SealRankingRow[] })
      : readResultsFile(
          "session-1",
          "session-1-results.json",
          participantId,
          location
        ),
    databaseSessionTwoRows.length > 0
      ? Promise.resolve({ longRows: databaseSessionTwoRows as SealRankingRow[] })
      : readResultsFile(
          "session-2",
          "session-2-results.json",
          participantId,
          location
        ),
  ]);

  const { topSealIds, weightedScores } = calculateTopSeals(
    sessionOneResults.longRows ?? [],
    sessionTwoResults.longRows ?? [],
    participantId
  );

  return NextResponse.json({
    participantId,
    hasParticipantData:
      (sessionOneResults.longRows?.length ?? 0) > 0 ||
      (sessionTwoResults.longRows?.length ?? 0) > 0,
    topSealIds,
    weights: {
      session1: SESSION_1_WEIGHT,
      session2: SESSION_2_WEIGHT,
      total: SESSION_1_WEIGHT + SESSION_2_WEIGHT,
    },
    weightedScores,
  });
}
