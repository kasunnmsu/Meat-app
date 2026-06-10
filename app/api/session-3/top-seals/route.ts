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

function calculateTopThreeSeals(sessionOneRows: LongRow[], sessionTwoRows: LongRow[], participantId: string) {
  const s1Rows = sessionOneRows.filter(
    (row) => row.participant_id === participantId && row.seal_id
  );
  const s2Rows = sessionTwoRows.filter(
    (row) => row.participant_id === participantId && row.seal_id
  );

  if (s1Rows.length === 0 && s2Rows.length === 0) {
    return fallbackTopSeals;
  }

  const totalScores = new Map<string, number>();
  const session2Scores = new Map<string, number>();

  for (const row of s1Rows) {
    const sealId = String(row.seal_id);
    const score = Math.max(0, 6 - Number(row.selected_rank || 99));
    totalScores.set(sealId, (totalScores.get(sealId) || 0) + score);
  }

  for (const row of s2Rows) {
    const sealId = String(row.seal_id);
    const score = Math.max(0, 6 - Number(row.selected_rank || 99));
    totalScores.set(sealId, (totalScores.get(sealId) || 0) + score);
    session2Scores.set(sealId, (session2Scores.get(sealId) || 0) + score);
  }

  const topSealIds = Array.from(totalScores.entries())
    .sort((a, b) => {
      const diff = b[1] - a[1];
      if (diff !== 0) return diff;
      return (session2Scores.get(b[0]) || 0) - (session2Scores.get(a[0]) || 0);
    })
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

  const topSealIds = calculateTopThreeSeals(sessionOneRows, sessionTwoRows, participantId);

  return NextResponse.json({
    participantId,
    topSealIds,
    source: "data/session-1-results.json and data/session-2-results.json",
    rowsFoundForParticipant: [...sessionOneRows, ...sessionTwoRows].filter(
      (row) => row.participant_id === participantId
    ).length,
  });
}
