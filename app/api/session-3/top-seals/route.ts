import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type LongRow = {
  participant_id?: string;
  selected_rank?: number | string;
  seal_id?: string;
};

type ResultsStore = {
  participantRows?: Record<string, string | number>[];
  longRows?: LongRow[];
};

const fallbackTopSeals = ["red-1", "red-2", "green-1"];

function readLongRows(fileName: string): LongRow[] {
  const filePath = path.join(process.cwd(), "data", fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");

    if (!raw.trim()) {
      return [];
    }

    const store: ResultsStore = JSON.parse(raw);

    return Array.isArray(store.longRows) ? store.longRows : [];
  } catch {
    return [];
  }
}

function calculateTopThreeSeals(rows: LongRow[], participantId: string) {
  const participantRows = rows.filter(
    (row) => row.participant_id === participantId && row.seal_id
  );

  if (participantRows.length === 0) {
    return fallbackTopSeals;
  }

  const scores = new Map<string, number>();

  for (const row of participantRows) {
    const sealId = String(row.seal_id);
    const rank = Number(row.selected_rank || 99);

    /*
      Rank 1 = 5 points
      Rank 2 = 4 points
      Rank 3 = 3 points
      Rank 4 = 2 points
      Rank 5 = 1 point
    */
    const score = Math.max(0, 6 - rank);

    scores.set(sealId, (scores.get(sealId) || 0) + score);
  }

  const topSealIds = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([sealId]) => sealId)
    .slice(0, 3);

  if (topSealIds.length >= 3) {
    return topSealIds;
  }

  const missingFallbacks = fallbackTopSeals.filter(
    (sealId) => !topSealIds.includes(sealId)
  );

  return [...topSealIds, ...missingFallbacks].slice(0, 3);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("participantId");

  if (!participantId) {
    return NextResponse.json(
      { error: "participantId is required." },
      { status: 400 }
    );
  }

  const sessionOneRows = readLongRows("session-1-results.json");
  const sessionTwoRows = readLongRows("session-2-results.json");

  const combinedRows = [...sessionOneRows, ...sessionTwoRows];

  const topSealIds = calculateTopThreeSeals(combinedRows, participantId);

  return NextResponse.json({
    participantId,
    topSealIds,
    source: "data/session-1-results.json and data/session-2-results.json",
    rowsFoundForParticipant: combinedRows.filter(
      (row) => row.participant_id === participantId
    ).length,
  });
}
