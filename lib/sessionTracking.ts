export type DecisionAttemptRecord = {
  decisionNumber: number;
  optionId: string;
  sealId: string;
  choiceName: string;
  selectedAt: string;
  resolvedAt: string;
  response: "Yes" | "No";
  productSelectionTimeMs: number;
  confirmationTimeMs: number;
};

export type SealInteractionRecord = {
  optionId: string;
  sealId: string;
  sealName: string;
  openedAt: string;
  closedAt: string;
  durationMs: number;
};

export type RankingSnapshotItem = {
  optionId: string;
  sealId: string;
  choiceName: string;
};

export type PreselectionReorderRecord = {
  optionId: string;
  sealId: string;
  choiceName: string;
  fromRank: number;
  toRank: number;
  movedAt: string;
  timeSincePreselectionStartedMs: number;
};

export type FinalConfirmationAttemptRecord = {
  ranking: RankingSnapshotItem[];
  startedAt: string;
  respondedAt: string;
  durationMs: number;
  response: "Yes" | "No";
};

export type RankingRevisionRecord = {
  startedAt: string;
  completedAt: string;
  totalTimeMs: number;
  initialRanking: RankingSnapshotItem[];
  finalRanking: RankingSnapshotItem[];
  reorders: PreselectionReorderRecord[];
};

export type SealReadingInteractionRecord = {
  sealId: string;
  sealName: string;
  openedAt: string;
  closedAt: string;
  durationMs: number;
  firstOpen: boolean;
  firstOpenOrder?: number;
};

export type ReadingScreenVisitRecord = {
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

export type BetweenScreenVisitRecord = {
  fromScreen: number;
  toScreen: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

export type RankingTrackingData = {
  rankingStartedAt: string;
  rankingCompletedAt?: string;
  firstMomentCompletedAt: string;
  decisionAttempts: DecisionAttemptRecord[];
  sealInteractions: SealInteractionRecord[];
  preselectionStartedAt?: string;
  preselectionCompletedAt?: string;
  preselectionTotalTimeMs?: number;
  preselectionInitialRanking?: RankingSnapshotItem[];
  preselectionFinalRanking?: RankingSnapshotItem[];
  preselectionReorders?: PreselectionReorderRecord[];
  finalConfirmationAttempts?: FinalConfirmationAttemptRecord[];
  rankingRevisions?: RankingRevisionRecord[];
};

export function formatElapsedTime(milliseconds: number) {
  const totalMilliseconds = Math.max(0, Math.round(milliseconds));
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const millisecondsPart = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millisecondsPart).padStart(3, "0")}`;
}
