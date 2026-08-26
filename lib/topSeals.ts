export type SealRankingRow = {
  participant_id?: string;
  location?: string;
  seal_id?: string;
  selected_rank?: number | string;
};

export const SESSION_1_WEIGHT = 0.33;
export const SESSION_2_WEIGHT = 0.67;
export const FALLBACK_TOP_SEALS = ["red-1", "red-2", "green-1"];

function addWeightedScores(
  rows: SealRankingRow[],
  sessionWeight: number,
  weightedScores: Map<string, number>,
  options: {
    participantId?: string;
    sessionTwoScores?: Map<string, number>;
  } = {}
) {
  for (const row of rows) {
    if (
      options.participantId &&
      row.participant_id !== options.participantId
    ) {
      continue;
    }

    const sealId = row.seal_id;

    if (!sealId) {
      continue;
    }

    const selectedRank = Number(row.selected_rank ?? 99);

    // Rank 1 = 5 points, rank 2 = 4, ... rank 5 = 1.
    const rankScore = Math.max(0, 6 - selectedRank);
    const weightedScore = rankScore * sessionWeight;

    weightedScores.set(
      sealId,
      (weightedScores.get(sealId) ?? 0) + weightedScore
    );

    if (options.sessionTwoScores) {
      options.sessionTwoScores.set(
        sealId,
        (options.sessionTwoScores.get(sealId) ?? 0) + rankScore
      );
    }
  }
}

export function calculateTopSeals(
  sessionOneRows: SealRankingRow[],
  sessionTwoRows: SealRankingRow[],
  participantId?: string
) {
  const weightedScores = new Map<string, number>();
  const sessionTwoScores = new Map<string, number>();

  addWeightedScores(sessionOneRows, SESSION_1_WEIGHT, weightedScores, {
    participantId,
  });
  addWeightedScores(sessionTwoRows, SESSION_2_WEIGHT, weightedScores, {
    participantId,
    sessionTwoScores,
  });

  const sortedScores = Array.from(weightedScores.entries()).sort((a, b) => {
    const weightedDifference = b[1] - a[1];

    if (weightedDifference !== 0) {
      return weightedDifference;
    }

    const sessionTwoDifference =
      (sessionTwoScores.get(b[0]) ?? 0) -
      (sessionTwoScores.get(a[0]) ?? 0);

    if (sessionTwoDifference !== 0) {
      return sessionTwoDifference;
    }

    return a[0].localeCompare(b[0]);
  });

  const selectedSealIds = sortedScores
    .map(([sealId]) => sealId)
    .slice(0, 3);
  const missingFallbacks = FALLBACK_TOP_SEALS.filter(
    (sealId) => !selectedSealIds.includes(sealId)
  );

  return {
    topSealIds: [...selectedSealIds, ...missingFallbacks].slice(0, 3),
    weightedScores: Object.fromEntries(sortedScores),
  };
}

export function calculateParticipantTopSeals(
  sessionOneRows: SealRankingRow[],
  sessionTwoRows: SealRankingRow[],
  participantId: string,
  location: string
) {
  const belongsToCurrentParticipant = (row: SealRankingRow) =>
    row.participant_id === participantId && row.location === location;
  const participantSessionOneRows = sessionOneRows.filter(
    belongsToCurrentParticipant
  );
  const participantSessionTwoRows = sessionTwoRows.filter(
    belongsToCurrentParticipant
  );

  if (
    participantSessionOneRows.length === 0 &&
    participantSessionTwoRows.length === 0
  ) {
    return null;
  }

  return calculateTopSeals(
    participantSessionOneRows,
    participantSessionTwoRows,
    participantId
  );
}
