export const DATA_SCHEMA_VERSION = "2.1";
export type SessionExportValue = string | number;
export type SessionExportRow = Record<string, SessionExportValue>;

export type RankingExportOption = {
  id: string;
  cutId?: string;
  sealId?: string;
  title: string;
  subtitle?: string;
  cutImageUrl?: string;
  sealImageUrl?: string;
  sealColor?: string;
  screenStartedAt?: string;
  optionSelectedAt?: string;
  purchaseConfirmedAt?: string;
  timeSpentBeforeChoiceMs?: number;
  timeSpentBeforeChoiceSeconds?: number;
  timeTakenToConfirmMs?: number;
  timeTakenToConfirmSeconds?: number;
  changedPreferenceBeforeConfirming?: string;
  initialSelectedOptionId?: string;
  finalConfirmedOptionId?: string;
  decisionSequence?: number;
  productSelectionTimeMs?: number;
  confirmationTimeMs?: number;
  decisionTimeMs?: number;
  confirmationAttempts?: number;
  rejectedConfirmations?: number;
  rejectedProducts?: string;
};

type DecisionAttemptRecord = {
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

type SealInteractionRecord = {
  optionId: string;
  sealId: string;
  sealName: string;
  openedAt: string;
  closedAt: string;
  durationMs: number;
};

type SealReadingInteractionRecord = {
  sealId: string;
  sealName: string;
  openedAt: string;
  closedAt: string;
  durationMs: number;
  firstOpen: boolean;
  firstOpenOrder?: number;
};

type ReadingScreenVisitRecord = {
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

type BetweenScreenVisitRecord = {
  fromScreen: number;
  toScreen: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

type RankingSnapshotItem = {
  optionId: string;
  sealId: string;
  choiceName: string;
};

type PreselectionReorderRecord = {
  optionId: string;
  sealId: string;
  choiceName: string;
  fromRank: number;
  toRank: number;
  movedAt: string;
  timeSincePreselectionStartedMs: number;
};

type FinalConfirmationAttemptRecord = {
  ranking: RankingSnapshotItem[];
  startedAt: string;
  respondedAt: string;
  durationMs: number;
  response: "Yes" | "No";
};

type RankingRevisionRecord = {
  startedAt: string;
  completedAt: string;
  totalTimeMs: number;
  initialRanking: RankingSnapshotItem[];
  finalRanking: RankingSnapshotItem[];
  reorders: PreselectionReorderRecord[];
};

type SessionOneTracking = {
  rankingStartedAt: string;
  firstMomentCompletedAt: string;
  sessionCompletedAt: string;
  collectionStartedAt: string;
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

type SessionTwoTracking = Omit<SessionOneTracking, "collectionStartedAt"> & {
  collectionStartedAt?: string;
};

type SessionThreeRankingTracking = Omit<
  SessionOneTracking,
  "collectionStartedAt" | "sessionCompletedAt"
> & {
  rankingCompletedAt?: string;
};

export type SessionDemographics = {
  gender: string;
  ageGroup: string;
  educationLevel: string;
  incomeGroup: string;
};

type CommonPayloadInput = {
  participantId: string;
  participantLocation: string;
  randomizationSeed: string;
  ranking: RankingExportOption[];
  initialDisplayOrder?: RankingExportOption[];
  demographics: SessionDemographics;
  timestamp: string;
};

const ENGLISH_SEAL_NAME_BY_ID: Record<string, string> = {
  "red-1": "Angus",
  "red-2": "Animal welfare",
  "green-1": "Common",
  "green-2": "Cultivated",
  "green-3": "Organic",
};

const ENGLISH_CHOICE_NAME_BY_LABEL: Record<string, string> = {
  angus: "Angus",
  "bem-estar animal": "Animal welfare",
  "animal welfare": "Animal welfare",
  tradicional: "Common",
  comum: "Common",
  common: "Common",
  cultivada: "Cultivated",
  cultivated: "Cultivated",
  organica: "Organic",
  organic: "Organic",
};

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getEnglishSealName(sealId: string | undefined, fallback: string) {
  return (sealId && ENGLISH_SEAL_NAME_BY_ID[sealId]) ||
    ENGLISH_CHOICE_NAME_BY_LABEL[normalizeLabel(fallback)] ||
    fallback;
}

function translateRejectedProducts(value: string | undefined) {
  if (!value) return "";
  return value
    .split(",")
    .map((label) => getEnglishSealName(undefined, label))
    .join(", ");
}

function getEnglishRankingLabel(items: RankingSnapshotItem[] | undefined) {
  return (items ?? [])
    .map((item) => getEnglishSealName(item.sealId, item.choiceName))
    .join(" > ");
}

function countChangedProducts(
  initialRanking: RankingSnapshotItem[],
  finalRanking: RankingSnapshotItem[]
) {
  return finalRanking.filter(
    (item, index) => item.optionId !== initialRanking[index]?.optionId
  ).length;
}

function createEnglishSessionOneRanking(
  ranking: RankingExportOption[],
  location: string
) {
  const cutTitle = location === "NMSU" ? "Beef steak" : "Beef top sirloin";
  return ranking.map((option) => ({
    ...option,
    title: cutTitle,
    subtitle: getEnglishSealName(
      option.sealId,
      option.subtitle || option.title
    ),
    rejectedProducts: translateRejectedProducts(option.rejectedProducts),
  }));
}

function getEnglishOptionOrder(
  options: RankingExportOption[] | undefined,
  location: string
) {
  return createEnglishSessionOneRanking(options ?? [], location)
    .map((option) => option.subtitle || option.title)
    .join(" > ");
}

function createTimingFields(option: RankingExportOption) {
  return {
    screen_started_at: option.screenStartedAt ?? "",
    option_selected_at: option.optionSelectedAt ?? "",
    purchase_confirmed_at: option.purchaseConfirmedAt ?? "",
    time_spent_before_choice_ms: option.timeSpentBeforeChoiceMs ?? "",
    time_spent_before_choice_seconds:
      option.timeSpentBeforeChoiceSeconds ?? "",
    time_taken_to_confirm_ms: option.timeTakenToConfirmMs ?? "",
    time_taken_to_confirm_seconds:
      option.timeTakenToConfirmSeconds ?? "",
    changed_preference_before_confirming:
      option.changedPreferenceBeforeConfirming ?? "",
    initial_selected_option_id: option.initialSelectedOptionId ?? "",
    final_confirmed_option_id: option.finalConfirmedOptionId ?? "",
  };
}

function createSessionOneTimingFields(option: RankingExportOption) {
  return {
    ...createTimingFields(option),
    decision_sequence: option.decisionSequence ?? "",
    product_selection_time_ms: option.productSelectionTimeMs ?? "",
    confirmation_time_ms: option.confirmationTimeMs ?? "",
    total_decision_time_ms: option.decisionTimeMs ?? "",
    product_selection_time: formatElapsedTime(
      option.productSelectionTimeMs ?? 0
    ),
    confirmation_time: formatElapsedTime(option.confirmationTimeMs ?? 0),
    total_decision_time: formatElapsedTime(option.decisionTimeMs ?? 0),
    confirmation_attempts: option.confirmationAttempts ?? "",
    rejected_confirmations: option.rejectedConfirmations ?? "",
    rejected_products: option.rejectedProducts ?? "",
  };
}

function formatElapsedTime(milliseconds: number) {
  const totalMilliseconds = Math.max(0, Math.round(milliseconds));
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const millisecondsPart = totalMilliseconds % 1000;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millisecondsPart).padStart(3, "0")}`;
}

function toFieldToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function addSessionOneTrackingFields(
  participantRow: SessionExportRow,
  ranking: RankingExportOption[],
  tracking?: SessionOneTracking
) {
  if (!tracking) return;

  const chronologicalRanking = [...ranking].sort(
    (a, b) => (a.decisionSequence ?? 99) - (b.decisionSequence ?? 99)
  );
  const firstMomentTotalMs = chronologicalRanking.reduce(
    (total, option) => total + (option.decisionTimeMs ?? 0),
    0
  );
  const sessionStarted = Date.parse(tracking.rankingStartedAt);
  const sessionCompleted = Date.parse(tracking.sessionCompletedAt);
  const sessionTotalMs =
    Number.isFinite(sessionStarted) && Number.isFinite(sessionCompleted)
      ? Math.max(0, sessionCompleted - sessionStarted)
      : 0;

  participantRow.collection_started_at = tracking.collectionStartedAt;
  participantRow.session_1_started_at = tracking.rankingStartedAt;
  participantRow.first_moment_completed_at = tracking.firstMomentCompletedAt;
  participantRow.session_1_completed_at = tracking.sessionCompletedAt;
  participantRow.session_1_total_time_ms = sessionTotalMs;
  participantRow.session_1_total_time = formatElapsedTime(sessionTotalMs);
  participantRow.first_moment_total_decision_time_ms = firstMomentTotalMs;
  participantRow.first_moment_total_decision_time =
    formatElapsedTime(firstMomentTotalMs);

  if (
    tracking.preselectionStartedAt &&
    tracking.preselectionCompletedAt &&
    tracking.preselectionInitialRanking &&
    tracking.preselectionFinalRanking
  ) {
    const initialRanking = tracking.preselectionInitialRanking;
    const finalRanking = tracking.preselectionFinalRanking;
    const changedProductsCount = countChangedProducts(
      initialRanking,
      finalRanking
    );
    const preselectionReorders = tracking.preselectionReorders ?? [];
    const distinctProductsMoved = new Set(
      preselectionReorders.map((reorder) => reorder.optionId)
    ).size;
    const firstReorderTimeMs =
      preselectionReorders[0]?.timeSincePreselectionStartedMs;
    const preselectionTotalTimeMs = tracking.preselectionTotalTimeMs ?? 0;

    participantRow.preselection_started_at = tracking.preselectionStartedAt;
    participantRow.preselection_completed_at =
      tracking.preselectionCompletedAt;
    participantRow.preselection_initial_rank =
      getEnglishRankingLabel(initialRanking);
    participantRow.preselection_final_rank =
      getEnglishRankingLabel(finalRanking);
    participantRow.preselection_rank_changed =
      changedProductsCount > 0 ? "Yes" : "No";
    participantRow.preselection_reorder_count = preselectionReorders.length;
    participantRow.preselection_changed_products_count =
      changedProductsCount;
    participantRow.preselection_distinct_products_moved =
      distinctProductsMoved;
    participantRow.preselection_time_to_first_reorder_ms =
      firstReorderTimeMs ?? "";
    participantRow.preselection_time_to_first_reorder =
      firstReorderTimeMs === undefined
        ? ""
        : formatElapsedTime(firstReorderTimeMs);
    participantRow.preselection_total_time_ms = preselectionTotalTimeMs;
    participantRow.preselection_total_time = formatElapsedTime(
      preselectionTotalTimeMs
    );
  }

  const finalConfirmationAttempts =
    tracking.finalConfirmationAttempts ?? [];
  const rankingRevisions = tracking.rankingRevisions ?? [];
  participantRow.ranking_reorder_count_total =
    (tracking.preselectionReorders?.length ?? 0) +
    rankingRevisions.reduce(
      (total, revision) => total + revision.reorders.length,
      0
    );
  let revisionIndex = 0;

  finalConfirmationAttempts.forEach((attempt, attemptIndex) => {
    const confirmationNumber = attemptIndex + 1;
    const confirmationPrefix = `final_confirmation_${confirmationNumber}`;
    participantRow[`${confirmationPrefix}_time_ms`] = attempt.durationMs;
    participantRow[`${confirmationPrefix}_time`] =
      formatElapsedTime(attempt.durationMs);
    participantRow[`${confirmationPrefix}_response`] = attempt.response;

    if (attempt.response !== "No") return;

    const revision = rankingRevisions[revisionIndex];
    revisionIndex += 1;
    if (!revision) return;

    const revisionPrefix = `ranking_revision_${revisionIndex}`;
    const changedProductsCount = countChangedProducts(
      revision.initialRanking,
      revision.finalRanking
    );
    const distinctProductsMoved = new Set(
      revision.reorders.map((reorder) => reorder.optionId)
    ).size;
    const firstReorderTimeMs =
      revision.reorders[0]?.timeSincePreselectionStartedMs;

    participantRow[`${revisionPrefix}_initial_rank`] =
      getEnglishRankingLabel(revision.initialRanking);
    participantRow[`${revisionPrefix}_final_rank`] =
      getEnglishRankingLabel(revision.finalRanking);
    participantRow[`${revisionPrefix}_rank_changed`] =
      changedProductsCount > 0 ? "Yes" : "No";
    participantRow[`${revisionPrefix}_reorder_count`] =
      revision.reorders.length;
    participantRow[`${revisionPrefix}_changed_products_count`] =
      changedProductsCount;
    participantRow[`${revisionPrefix}_distinct_products_moved`] =
      distinctProductsMoved;
    participantRow[`${revisionPrefix}_time_to_first_reorder_ms`] =
      firstReorderTimeMs ?? "";
    participantRow[`${revisionPrefix}_time_to_first_reorder`] =
      firstReorderTimeMs === undefined
        ? ""
        : formatElapsedTime(firstReorderTimeMs);
    participantRow[`${revisionPrefix}_total_time_ms`] =
      revision.totalTimeMs;
    participantRow[`${revisionPrefix}_total_time`] =
      formatElapsedTime(revision.totalTimeMs);
  });

  if (finalConfirmationAttempts.length > 0) {
    const preselectionTotalTimeMs = tracking.preselectionTotalTimeMs ?? 0;
    const rankingRevisionsTotalTimeMs = rankingRevisions.reduce(
      (total, revision) => total + revision.totalTimeMs,
      0
    );
    const finalConfirmationsTotalTimeMs = finalConfirmationAttempts.reduce(
      (total, attempt) => total + attempt.durationMs,
      0
    );
    const reviewScreensTotalTimeMs =
      preselectionTotalTimeMs + rankingRevisionsTotalTimeMs;
    const combinedTotalTimeMs =
      reviewScreensTotalTimeMs + finalConfirmationsTotalTimeMs;
    const revisionWithoutChangeCount = rankingRevisions.filter(
      (revision) =>
        countChangedProducts(
          revision.initialRanking,
          revision.finalRanking
        ) === 0
    ).length;
    const finalConfirmedRanking = [...finalConfirmationAttempts]
      .reverse()
      .find((attempt) => attempt.response === "Yes")?.ranking;

    participantRow.final_confirmation_attempts =
      finalConfirmationAttempts.length;
    participantRow.final_confirmation_rejections =
      finalConfirmationAttempts.filter((attempt) => attempt.response === "No")
        .length;
    participantRow.ranking_revision_count = rankingRevisions.length;
    participantRow.revision_without_change_count =
      revisionWithoutChangeCount;
    participantRow.ranking_revisions_total_time_ms =
      rankingRevisionsTotalTimeMs;
    participantRow.ranking_revisions_total_time = formatElapsedTime(
      rankingRevisionsTotalTimeMs
    );
    participantRow.preselection_and_revisions_total_time_ms =
      reviewScreensTotalTimeMs;
    participantRow.preselection_and_revisions_total_time = formatElapsedTime(
      reviewScreensTotalTimeMs
    );
    participantRow.final_confirmations_total_time_ms =
      finalConfirmationsTotalTimeMs;
    participantRow.final_confirmations_total_time = formatElapsedTime(
      finalConfirmationsTotalTimeMs
    );
    participantRow.preselection_and_final_confirmation_total_time_ms =
      combinedTotalTimeMs;
    participantRow.preselection_and_final_confirmation_total_time =
      formatElapsedTime(combinedTotalTimeMs);
    participantRow.final_confirmed_rank =
      getEnglishRankingLabel(finalConfirmedRanking);
  }

  for (const option of chronologicalRanking) {
    const decision = option.decisionSequence;
    if (!decision) continue;
    const prefix = `decision_${decision}`;
    participantRow[`${prefix}_choice`] = option.subtitle || option.title;
    participantRow[`${prefix}_product_selection_time_ms`] =
      option.productSelectionTimeMs ?? 0;
    participantRow[`${prefix}_product_selection_time`] = formatElapsedTime(
      option.productSelectionTimeMs ?? 0
    );
    participantRow[`${prefix}_confirmation_time_ms`] =
      option.confirmationTimeMs ?? 0;
    participantRow[`${prefix}_confirmation_time`] = formatElapsedTime(
      option.confirmationTimeMs ?? 0
    );
    participantRow[`${prefix}_total_decision_time_ms`] =
      option.decisionTimeMs ?? 0;
    participantRow[`${prefix}_total_decision_time`] = formatElapsedTime(
      option.decisionTimeMs ?? 0
    );
    participantRow[`${prefix}_confirmation_attempts`] =
      option.confirmationAttempts ?? 0;
    participantRow[`${prefix}_rejected_confirmations`] =
      option.rejectedConfirmations ?? 0;
    participantRow[`${prefix}_rejected_products`] =
      option.rejectedProducts ?? "";
  }

  for (const option of ranking) {
    const choiceName = option.subtitle || option.title;
    const token = toFieldToken(choiceName);
    const rejectedCount = tracking.decisionAttempts.filter(
      (attempt) =>
        attempt.optionId === option.id && attempt.response === "No"
    ).length;
    const sealInteractions = tracking.sealInteractions.filter(
      (interaction) => interaction.sealId === option.sealId
    );
    const totalOpenTimeMs = sealInteractions.reduce(
      (total, interaction) => total + interaction.durationMs,
      0
    );
    const averageOpenTimeMs = sealInteractions.length
      ? Math.round(totalOpenTimeMs / sealInteractions.length)
      : 0;

    participantRow[`choice_${token}_rejections`] = rejectedCount;
    participantRow[`seal_${token}_interactions`] = sealInteractions.length;
    participantRow[`seal_${token}_total_open_time_ms`] = totalOpenTimeMs;
    participantRow[`seal_${token}_total_open_time`] =
      formatElapsedTime(totalOpenTimeMs);
    participantRow[`seal_${token}_average_open_time_ms`] = averageOpenTimeMs;
    participantRow[`seal_${token}_average_open_time`] =
      formatElapsedTime(averageOpenTimeMs);
  }
}

function addSessionTwoTrackingFields(
  participantRow: SessionExportRow,
  ranking: RankingExportOption[],
  tracking: SessionTwoTracking | undefined,
  rankingSealInteractions: SealInteractionRecord[]
) {
  if (!tracking) return;

  const sharedFields: SessionExportRow = {};
  addSessionOneTrackingFields(sharedFields, ranking, {
    ...tracking,
    collectionStartedAt: tracking.collectionStartedAt ?? "",
  });

  const excludedFields = new Set([
    "collection_started_at",
    "session_1_started_at",
    "first_moment_completed_at",
    "session_1_completed_at",
    "session_1_total_time_ms",
    "session_1_total_time",
    "first_moment_total_decision_time_ms",
    "first_moment_total_decision_time",
  ]);

  for (const [field, value] of Object.entries(sharedFields)) {
    if (!excludedFields.has(field) && !field.startsWith("seal_")) {
      participantRow[field] = value;
    }
  }

  const chronologicalRanking = [...ranking].sort(
    (a, b) => (a.decisionSequence ?? 99) - (b.decisionSequence ?? 99)
  );
  const choicesTotalMs = chronologicalRanking.reduce(
    (total, option) => total + (option.decisionTimeMs ?? 0),
    0
  );
  const finalConfirmationCompletedAt = [...(
    tracking.finalConfirmationAttempts ?? []
  )]
    .reverse()
    .find((attempt) => attempt.response === "Yes")?.respondedAt;
  const rankingStarted = Date.parse(tracking.rankingStartedAt);
  const rankingCompleted = Date.parse(
    finalConfirmationCompletedAt ?? tracking.sessionCompletedAt
  );
  const rankingFlowTotalMs =
    Number.isFinite(rankingStarted) && Number.isFinite(rankingCompleted)
      ? Math.max(0, rankingCompleted - rankingStarted)
      : 0;

  participantRow.ranking_flow_started_at = tracking.rankingStartedAt;
  participantRow.ranking_flow_completed_at =
    finalConfirmationCompletedAt ?? tracking.sessionCompletedAt;
  participantRow.ranking_choices_total_decision_time_ms = choicesTotalMs;
  participantRow.ranking_choices_total_decision_time =
    formatElapsedTime(choicesTotalMs);
  participantRow.post_reading_ranking_flow_total_time_ms =
    rankingFlowTotalMs;
  participantRow.post_reading_ranking_flow_total_time =
    formatElapsedTime(rankingFlowTotalMs);

  for (const option of ranking) {
    const choiceName = option.subtitle || option.title;
    const token = toFieldToken(choiceName);
    const interactions = rankingSealInteractions.filter(
      (interaction) => interaction.sealId === option.sealId
    );
    const totalOpenTimeMs = interactions.reduce(
      (total, interaction) => total + interaction.durationMs,
      0
    );
    const averageOpenTimeMs = interactions.length
      ? Math.round(totalOpenTimeMs / interactions.length)
      : 0;

    participantRow[`ranking_seal_${token}_interactions`] =
      interactions.length;
    participantRow[`ranking_seal_${token}_total_open_time_ms`] =
      totalOpenTimeMs;
    participantRow[`ranking_seal_${token}_total_open_time`] =
      formatElapsedTime(totalOpenTimeMs);
    participantRow[`ranking_seal_${token}_average_open_time_ms`] =
      averageOpenTimeMs;
    participantRow[`ranking_seal_${token}_average_open_time`] =
      formatElapsedTime(averageOpenTimeMs);
  }
}

function addSessionTwoReadingFields(
  participantRow: SessionExportRow,
  interactions: SealReadingInteractionRecord[],
  visits: ReadingScreenVisitRecord[],
  readingStartedAt: string | undefined,
  allSealsFirstReadAt: string | undefined,
  sessionCompletedAt: string | undefined
) {
  if (!readingStartedAt) return;

  const readingScreenTotalTimeMs = visits.reduce(
    (total, visit) => total + visit.durationMs,
    0
  );
  const firstInteraction = interactions[0];
  const readingStartTime = Date.parse(readingStartedAt);
  const firstOpenTime = Date.parse(firstInteraction?.openedAt ?? "");
  const allReadTime = Date.parse(allSealsFirstReadAt ?? "");
  const sessionCompletedTime = Date.parse(sessionCompletedAt ?? "");
  const timeToFirstSealOpenMs =
    Number.isFinite(readingStartTime) && Number.isFinite(firstOpenTime)
      ? Math.max(0, firstOpenTime - readingStartTime)
      : undefined;
  const timeUntilAllSealsReadMs =
    Number.isFinite(readingStartTime) && Number.isFinite(allReadTime)
      ? Math.max(0, allReadTime - readingStartTime)
      : undefined;
  const sessionTotalTimeMs =
    Number.isFinite(readingStartTime) && Number.isFinite(sessionCompletedTime)
      ? Math.max(0, sessionCompletedTime - readingStartTime)
      : undefined;
  const firstOpenOrder = interactions
    .filter(
      (interaction) =>
        interaction.firstOpen && interaction.firstOpenOrder !== undefined
    )
    .sort(
      (a, b) =>
        (a.firstOpenOrder ?? 99) - (b.firstOpenOrder ?? 99)
    );

  participantRow.seal_reading_started_at = readingStartedAt;
  participantRow.seal_reading_screen_visits = visits.length;
  participantRow.seal_reading_first_open_order = firstOpenOrder
    .map((interaction) =>
      getEnglishSealName(interaction.sealId, interaction.sealName)
    )
    .join(" > ");
  participantRow.seal_reading_time_to_first_open_ms =
    timeToFirstSealOpenMs ?? "";
  participantRow.seal_reading_time_to_first_open =
    timeToFirstSealOpenMs === undefined
      ? ""
      : formatElapsedTime(timeToFirstSealOpenMs);
  participantRow.seal_reading_time_until_all_read_ms =
    timeUntilAllSealsReadMs ?? "";
  participantRow.seal_reading_time_until_all_read =
    timeUntilAllSealsReadMs === undefined
      ? ""
      : formatElapsedTime(timeUntilAllSealsReadMs);
  participantRow.seal_reading_reopening_count = interactions.filter(
    (interaction) => !interaction.firstOpen
  ).length;

  for (const sealId of Object.keys(ENGLISH_SEAL_NAME_BY_ID)) {
    const sealName = getEnglishSealName(sealId, sealId);
    const token = toFieldToken(sealName);
    const sealInteractions = interactions.filter(
      (interaction) => interaction.sealId === sealId
    );
    const totalOpenTimeMs = sealInteractions.reduce(
      (total, interaction) => total + interaction.durationMs,
      0
    );
    const averageOpenTimeMs = sealInteractions.length
      ? Math.round(totalOpenTimeMs / sealInteractions.length)
      : 0;

    participantRow[`seal_reading_${token}_interactions`] =
      sealInteractions.length;
    participantRow[`seal_reading_${token}_reopenings`] =
      sealInteractions.filter((interaction) => !interaction.firstOpen).length;
    participantRow[`seal_reading_${token}_total_open_time_ms`] =
      totalOpenTimeMs;
    participantRow[`seal_reading_${token}_total_open_time`] =
      formatElapsedTime(totalOpenTimeMs);
    participantRow[`seal_reading_${token}_average_open_time_ms`] =
      averageOpenTimeMs;
    participantRow[`seal_reading_${token}_average_open_time`] =
      formatElapsedTime(averageOpenTimeMs);
  }

  participantRow.seal_reading_screen_total_time_ms =
    readingScreenTotalTimeMs;
  participantRow.seal_reading_screen_total_time = formatElapsedTime(
    readingScreenTotalTimeMs
  );
  participantRow.session_2_started_at = readingStartedAt;
  participantRow.session_2_completed_at = sessionCompletedAt ?? "";
  participantRow.session_2_total_time_ms = sessionTotalTimeMs ?? "";
  participantRow.session_2_total_time =
    sessionTotalTimeMs === undefined
      ? ""
      : formatElapsedTime(sessionTotalTimeMs);
}

export function addRankingTimingFields(
  participantRow: SessionExportRow,
  ranking: RankingExportOption[]
) {
  ranking.forEach((option, index) => {
    const prefix = `rank_${index + 1}`;

    participantRow[`${prefix}_screen_started_at`] =
      option.screenStartedAt ?? "";
    participantRow[`${prefix}_option_selected_at`] =
      option.optionSelectedAt ?? "";
    participantRow[`${prefix}_purchase_confirmed_at`] =
      option.purchaseConfirmedAt ?? "";
    participantRow[`${prefix}_time_spent_before_choice_ms`] =
      option.timeSpentBeforeChoiceMs ?? "";
    participantRow[`${prefix}_time_spent_before_choice_seconds`] =
      option.timeSpentBeforeChoiceSeconds ?? "";
    participantRow[`${prefix}_time_taken_to_confirm_ms`] =
      option.timeTakenToConfirmMs ?? "";
    participantRow[`${prefix}_time_taken_to_confirm_seconds`] =
      option.timeTakenToConfirmSeconds ?? "";
    participantRow[`${prefix}_changed_preference_before_confirming`] =
      option.changedPreferenceBeforeConfirming ?? "";
    participantRow[`${prefix}_initial_selected_option_id`] =
      option.initialSelectedOptionId ?? "";
    participantRow[`${prefix}_final_confirmed_option_id`] =
      option.finalConfirmedOptionId ?? "";
  });
}

function addRankingSummaryFields(
  participantRow: SessionExportRow,
  ranking: RankingExportOption[]
) {
  ranking.forEach((option, index) => {
    const prefix = `rank_${index + 1}`;
    participantRow[`${prefix}_option_id`] = option.id;
    participantRow[`${prefix}_cut_id`] = option.cutId || "";
    participantRow[`${prefix}_seal_id`] = option.sealId || "";
    participantRow[`${prefix}_title`] = option.title;
  });
}

export function createSessionOnePayload(
  input: CommonPayloadInput & {
    includeLongRowTimingFields: boolean;
    rankingSealClicks?: Record<string, number>;
    tracking?: SessionOneTracking;
  }
) {
  const method = "Choice experiment / Best-Worst Scaling ranking";
  const { demographics, ranking } = input;
  const exportRanking = createEnglishSessionOneRanking(
    ranking,
    input.participantLocation
  );

  const longRows = exportRanking.map((option, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 1,
    method,
    randomization_seed: input.randomizationSeed,
    selected_rank: index + 1,
    option_id: option.id,
    cut_id: option.cutId || "",
    seal_id: option.sealId || "",
    title: option.title,
    subtitle: option.subtitle || "",
    cut_image_url: option.cutImageUrl || "",
    seal_image_url: option.sealImageUrl || "",
    seal_color: option.sealColor || "",
    ...(input.includeLongRowTimingFields
      ? createSessionOneTimingFields(option)
      : {}),
    gender: demographics.gender,
    age_group: demographics.ageGroup,
    education_level: demographics.educationLevel,
    income_group: demographics.incomeGroup,
    timestamp: input.timestamp,
  }));

  const participantRow: SessionExportRow = {
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 1,
    data_schema_version: DATA_SCHEMA_VERSION,
    method,
    randomization_seed: input.randomizationSeed,
    initial_display_order: getEnglishOptionOrder(
      input.initialDisplayOrder,
      input.participantLocation
    ),
    gender: demographics.gender,
    age_group: demographics.ageGroup,
    education_level: demographics.educationLevel,
    income_group: demographics.incomeGroup,
  };

  addRankingSummaryFields(participantRow, exportRanking);
  for (const option of exportRanking) {
    const choiceName = option.subtitle || option.title;
    const token = toFieldToken(choiceName);
    participantRow[`ranking_seal_${token}_clicks`] =
      input.rankingSealClicks?.[option.sealId || ""] ?? 0;
  }
  participantRow.timestamp = input.timestamp;
  addRankingTimingFields(participantRow, ranking);
  addSessionOneTrackingFields(participantRow, exportRanking, input.tracking);

  const decisionAttemptRows = (input.tracking?.decisionAttempts ?? []).map(
    (attempt, index) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 1,
      attempt_number: index + 1,
      decision_number: attempt.decisionNumber,
      option_id: attempt.optionId,
      seal_id: attempt.sealId,
      choice_name: getEnglishSealName(attempt.sealId, attempt.choiceName),
      selected_at: attempt.selectedAt,
      resolved_at: attempt.resolvedAt,
      response: attempt.response,
      product_selection_time_ms: attempt.productSelectionTimeMs,
      confirmation_time_ms: attempt.confirmationTimeMs,
      timestamp: input.timestamp,
    })
  );
  const sealInteractionRows = (input.tracking?.sealInteractions ?? []).map(
    (interaction, index) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 1,
      interaction_number: index + 1,
      option_id: interaction.optionId,
      seal_id: interaction.sealId,
      seal_name: getEnglishSealName(interaction.sealId, interaction.sealName),
      opened_at: interaction.openedAt,
      closed_at: interaction.closedAt,
      duration_ms: interaction.durationMs,
      duration: formatElapsedTime(interaction.durationMs),
      timestamp: input.timestamp,
    })
  );
  const preselectionReorderRows = (
    input.tracking?.preselectionReorders ?? []
  ).map((reorder, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 1,
    reorder_number: index + 1,
    product_name: getEnglishSealName(reorder.sealId, reorder.choiceName),
    option_id: reorder.optionId,
    seal_id: reorder.sealId,
    from_rank: reorder.fromRank,
    to_rank: reorder.toRank,
    moved_at: reorder.movedAt,
    time_since_preselection_started_ms:
      reorder.timeSincePreselectionStartedMs,
    timestamp: input.timestamp,
  }));
  const finalConfirmationRows = (
    input.tracking?.finalConfirmationAttempts ?? []
  ).map((attempt, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 1,
    confirmation_number: index + 1,
    ranking_presented: getEnglishRankingLabel(attempt.ranking),
    started_at: attempt.startedAt,
    responded_at: attempt.respondedAt,
    duration_ms: attempt.durationMs,
    duration: formatElapsedTime(attempt.durationMs),
    response: attempt.response,
    timestamp: input.timestamp,
  }));
  const rankingRevisionRows = (
    input.tracking?.rankingRevisions ?? []
  ).map((revision, index) => {
    const changedProductsCount = countChangedProducts(
      revision.initialRanking,
      revision.finalRanking
    );
    const firstReorderTimeMs =
      revision.reorders[0]?.timeSincePreselectionStartedMs;

    return {
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 1,
      revision_number: index + 1,
      initial_rank: getEnglishRankingLabel(revision.initialRanking),
      final_rank: getEnglishRankingLabel(revision.finalRanking),
      rank_changed: changedProductsCount > 0 ? "Yes" : "No",
      started_at: revision.startedAt,
      completed_at: revision.completedAt,
      total_time_ms: revision.totalTimeMs,
      total_time: formatElapsedTime(revision.totalTimeMs),
      reorder_count: revision.reorders.length,
      changed_products_count: changedProductsCount,
      distinct_products_moved: new Set(
        revision.reorders.map((reorder) => reorder.optionId)
      ).size,
      time_to_first_reorder_ms: firstReorderTimeMs ?? "",
      time_to_first_reorder:
        firstReorderTimeMs === undefined
          ? ""
          : formatElapsedTime(firstReorderTimeMs),
      timestamp: input.timestamp,
    };
  });
  const revisionReorderRows = (
    input.tracking?.rankingRevisions ?? []
  ).flatMap((revision, revisionIndex) =>
    revision.reorders.map((reorder, reorderIndex) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 1,
      revision_number: revisionIndex + 1,
      reorder_number: reorderIndex + 1,
      product_name: getEnglishSealName(reorder.sealId, reorder.choiceName),
      option_id: reorder.optionId,
      seal_id: reorder.sealId,
      from_rank: reorder.fromRank,
      to_rank: reorder.toRank,
      moved_at: reorder.movedAt,
      time_since_revision_started_ms:
        reorder.timeSincePreselectionStartedMs,
      timestamp: input.timestamp,
    }))
  );

  return {
    participantRow,
    longRows,
    decisionAttemptRows,
    sealInteractionRows,
    preselectionReorderRows,
    finalConfirmationRows,
    rankingRevisionRows,
    revisionReorderRows,
  };
}

type SealReadingRecord = {
  sealId: string;
  sealName: string;
  openedAt: string;
};

type RankingSealClickRecord = {
  sealId: string;
  sealName: string;
  clickedAt: string;
};

type SealDisplayOrderItem = {
  sealId: string;
  sealName: string;
};

export function createSessionTwoPayload(
  input: CommonPayloadInput & {
    agreedToDescriptions: string;
    readSealCount: number;
    allSealsRead: boolean;
    sealReadingDisplayOrder: SealDisplayOrderItem[];
    sealReadingRecords: SealReadingRecord[];
    rankingSealClickRecords: RankingSealClickRecord[];
    rankingSealClicks: Record<string, number>;
    rankingSealInteractionRecords?: SealInteractionRecord[];
    sealReadingInteractionRecords?: SealReadingInteractionRecord[];
    readingScreenVisitRecords?: ReadingScreenVisitRecord[];
    readingStartedAt?: string;
    allSealsFirstReadAt?: string;
    tracking?: SessionTwoTracking;
  }
) {
  const method =
    "Seal descriptions + Choice experiment / Best-Worst Scaling ranking";
  const { demographics, ranking } = input;
  const exportRanking = createEnglishSessionOneRanking(
    ranking,
    input.participantLocation
  );

  const longRows = exportRanking.map((option, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    method,
    randomization_seed: input.randomizationSeed,
    agreed_to_descriptions: input.agreedToDescriptions,
    selected_rank: index + 1,
    option_id: option.id,
    cut_id: option.cutId || "",
    seal_id: option.sealId || "",
    title: option.title,
    subtitle: option.subtitle || "",
    cut_image_url: option.cutImageUrl || "",
    seal_image_url: option.sealImageUrl || "",
    seal_color: option.sealColor || "",
    ...createSessionOneTimingFields(option),
    gender: demographics.gender,
    age_group: demographics.ageGroup,
    education_level: demographics.educationLevel,
    income_group: demographics.incomeGroup,
    timestamp: input.timestamp,
  }));

  const participantRow: SessionExportRow = {
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    data_schema_version: DATA_SCHEMA_VERSION,
    method,
    randomization_seed: input.randomizationSeed,
    initial_display_order: getEnglishOptionOrder(
      input.initialDisplayOrder,
      input.participantLocation
    ),
    agreed_to_descriptions: input.agreedToDescriptions,
    gender: demographics.gender,
    age_group: demographics.ageGroup,
    education_level: demographics.educationLevel,
    income_group: demographics.incomeGroup,
    seals_read_count: input.readSealCount,
    all_seals_read: input.allSealsRead ? "Yes" : "No",
    seal_reading_initial_display_order: input.sealReadingDisplayOrder
      .map((seal) => getEnglishSealName(seal.sealId, seal.sealName))
      .join(" > "),
  };

  addRankingSummaryFields(participantRow, exportRanking);
  participantRow.timestamp = input.timestamp;

  const sealReadingRows = input.sealReadingRecords.map((record) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    seal_id: record.sealId,
    seal_name: record.sealName,
    opened_description: "Yes",
    opened_at: record.openedAt,
    agreed_to_descriptions: input.agreedToDescriptions,
    timestamp: input.timestamp,
  }));

  const rankingSealClickRows = input.rankingSealClickRecords.map((record) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    phase: "ranking",
    seal_id: record.sealId,
    seal_name: getEnglishSealName(record.sealId, record.sealName),
    clicked_at: record.clickedAt,
    total_clicks_this_seal: input.rankingSealClicks[record.sealId] || 1,
    timestamp: input.timestamp,
  }));

  addRankingTimingFields(participantRow, ranking);
  addSessionTwoTrackingFields(
    participantRow,
    exportRanking,
    input.tracking,
    input.rankingSealInteractionRecords ?? []
  );
  addSessionTwoReadingFields(
    participantRow,
    input.sealReadingInteractionRecords ?? [],
    input.readingScreenVisitRecords ?? [],
    input.readingStartedAt,
    input.allSealsFirstReadAt,
    input.tracking?.sessionCompletedAt
  );

  const decisionAttemptRows = (input.tracking?.decisionAttempts ?? []).map(
    (attempt, index) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 2,
      attempt_number: index + 1,
      decision_number: attempt.decisionNumber,
      option_id: attempt.optionId,
      seal_id: attempt.sealId,
      choice_name: getEnglishSealName(attempt.sealId, attempt.choiceName),
      selected_at: attempt.selectedAt,
      resolved_at: attempt.resolvedAt,
      response: attempt.response,
      product_selection_time_ms: attempt.productSelectionTimeMs,
      confirmation_time_ms: attempt.confirmationTimeMs,
      timestamp: input.timestamp,
    })
  );
  const rankingSealInteractionRows = (
    input.rankingSealInteractionRecords ?? []
  ).map((interaction, index) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 2,
      interaction_number: index + 1,
      option_id: interaction.optionId,
      seal_id: interaction.sealId,
      seal_name: getEnglishSealName(
        interaction.sealId,
        interaction.sealName
      ),
      opened_at: interaction.openedAt,
      closed_at: interaction.closedAt,
      duration_ms: interaction.durationMs,
      duration: formatElapsedTime(interaction.durationMs),
      timestamp: input.timestamp,
    }));
  const sealReadingInteractionRows = (
    input.sealReadingInteractionRecords ?? []
  ).map((interaction, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    interaction_number: index + 1,
    seal_id: interaction.sealId,
    seal_name: getEnglishSealName(
      interaction.sealId,
      interaction.sealName
    ),
    interaction_type: interaction.firstOpen ? "First open" : "Reopen",
    first_open_order: interaction.firstOpenOrder ?? "",
    opened_at: interaction.openedAt,
    closed_at: interaction.closedAt,
    duration_ms: interaction.durationMs,
    duration: formatElapsedTime(interaction.durationMs),
    timestamp: input.timestamp,
  }));
  const readingScreenVisitRows = (
    input.readingScreenVisitRecords ?? []
  ).map((visit, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    visit_number: index + 1,
    started_at: visit.startedAt,
    completed_at: visit.completedAt,
    duration_ms: visit.durationMs,
    duration: formatElapsedTime(visit.durationMs),
    timestamp: input.timestamp,
  }));
  const preselectionReorderRows = (
    input.tracking?.preselectionReorders ?? []
  ).map((reorder, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    reorder_number: index + 1,
    product_name: getEnglishSealName(reorder.sealId, reorder.choiceName),
    option_id: reorder.optionId,
    seal_id: reorder.sealId,
    from_rank: reorder.fromRank,
    to_rank: reorder.toRank,
    moved_at: reorder.movedAt,
    time_since_preselection_started_ms:
      reorder.timeSincePreselectionStartedMs,
    timestamp: input.timestamp,
  }));
  const finalConfirmationRows = (
    input.tracking?.finalConfirmationAttempts ?? []
  ).map((attempt, index) => ({
    participant_id: input.participantId,
    location: input.participantLocation,
    session_number: 2,
    confirmation_number: index + 1,
    ranking_presented: getEnglishRankingLabel(attempt.ranking),
    started_at: attempt.startedAt,
    responded_at: attempt.respondedAt,
    duration_ms: attempt.durationMs,
    duration: formatElapsedTime(attempt.durationMs),
    response: attempt.response,
    timestamp: input.timestamp,
  }));
  const rankingRevisionRows = (
    input.tracking?.rankingRevisions ?? []
  ).map((revision, index) => {
    const changedProductsCount = countChangedProducts(
      revision.initialRanking,
      revision.finalRanking
    );
    const firstReorderTimeMs =
      revision.reorders[0]?.timeSincePreselectionStartedMs;
    return {
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 2,
      revision_number: index + 1,
      initial_rank: getEnglishRankingLabel(revision.initialRanking),
      final_rank: getEnglishRankingLabel(revision.finalRanking),
      rank_changed: changedProductsCount > 0 ? "Yes" : "No",
      started_at: revision.startedAt,
      completed_at: revision.completedAt,
      total_time_ms: revision.totalTimeMs,
      total_time: formatElapsedTime(revision.totalTimeMs),
      reorder_count: revision.reorders.length,
      changed_products_count: changedProductsCount,
      distinct_products_moved: new Set(
        revision.reorders.map((reorder) => reorder.optionId)
      ).size,
      time_to_first_reorder_ms: firstReorderTimeMs ?? "",
      time_to_first_reorder:
        firstReorderTimeMs === undefined
          ? ""
          : formatElapsedTime(firstReorderTimeMs),
      timestamp: input.timestamp,
    };
  });
  const revisionReorderRows = (
    input.tracking?.rankingRevisions ?? []
  ).flatMap((revision, revisionIndex) =>
    revision.reorders.map((reorder, reorderIndex) => ({
      participant_id: input.participantId,
      location: input.participantLocation,
      session_number: 2,
      revision_number: revisionIndex + 1,
      reorder_number: reorderIndex + 1,
      product_name: getEnglishSealName(reorder.sealId, reorder.choiceName),
      option_id: reorder.optionId,
      seal_id: reorder.sealId,
      from_rank: reorder.fromRank,
      to_rank: reorder.toRank,
      moved_at: reorder.movedAt,
      time_since_revision_started_ms:
        reorder.timeSincePreselectionStartedMs,
      timestamp: input.timestamp,
    }))
  );

  return {
    participantRow,
    longRows,
    sealReadingRows,
    rankingSealClickRows,
    decisionAttemptRows,
    rankingSealInteractionRows,
    sealReadingInteractionRows,
    readingScreenVisitRows,
    preselectionReorderRows,
    finalConfirmationRows,
    rankingRevisionRows,
    revisionReorderRows,
  };
}

export function createSessionThreeTrackingPayload(input: {
  participantId: string;
  participantLocation: string;
  timestamp: string;
  screens: Array<{
    screenNumber: number;
    conditionId: string;
    ranking: RankingExportOption[];
    initialDisplayOrder?: RankingExportOption[];
    tracking?: SessionThreeRankingTracking;
  }>;
  betweenScreenVisits?: BetweenScreenVisitRecord[];
}) {
  const participantFields: SessionExportRow = {
    data_schema_version: DATA_SCHEMA_VERSION,
    screen_condition_order: [...input.screens]
      .sort((a, b) => a.screenNumber - b.screenNumber)
      .map((screen) => screen.conditionId)
      .join(" > "),
  };
  const decisionAttemptRows: SessionExportRow[] = [];
  const sealInteractionRows: SessionExportRow[] = [];
  const preselectionReorderRows: SessionExportRow[] = [];
  const finalConfirmationRows: SessionExportRow[] = [];
  const rankingRevisionRows: SessionExportRow[] = [];
  const revisionReorderRows: SessionExportRow[] = [];
  const allSealInteractions: SealInteractionRecord[] = [];
  const allReorders: Array<PreselectionReorderRecord & { screenNumber: number }> = [];
  const sealNames = new Map<string, string>();
  let allScreensRankingTotalTimeMs = 0;
  let allScreensChoicesTotalTimeMs = 0;
  let allScreensPreselectionTotalTimeMs = 0;
  let allScreensRevisionsTotalTimeMs = 0;
  let allScreensReviewTotalTimeMs = 0;
  let allScreensFinalConfirmationsTotalTimeMs = 0;
  let allScreensReviewAndConfirmationTotalTimeMs = 0;
  let finalConfirmationAttemptsTotal = 0;
  let finalConfirmationRejectionsTotal = 0;
  let rankingRevisionCountTotal = 0;
  let revisionsWithoutChangeTotal = 0;
  let changedProductsTotal = 0;
  let earliestStartedAt = "";
  let latestCompletedAt = "";

  for (const screen of input.screens) {
    const prefix = `screen_${screen.screenNumber}`;
    participantFields[`${prefix}_initial_display_order`] =
      getEnglishOptionOrder(
        screen.initialDisplayOrder,
        input.participantLocation
      );

    if (!screen.tracking) continue;

    const tracking = screen.tracking;
    const rankingCompletedAt =
      tracking.rankingCompletedAt ||
      tracking.preselectionCompletedAt ||
      tracking.firstMomentCompletedAt;
    const finalConfirmationCompletedAt = [...(
      tracking.finalConfirmationAttempts ?? []
    )]
      .reverse()
      .find((attempt) => attempt.response === "Yes")?.respondedAt;
    const flowCompletedAt =
      finalConfirmationCompletedAt || rankingCompletedAt;
    const exportRanking = createEnglishSessionOneRanking(
      screen.ranking,
      input.participantLocation
    );
    const screenFields: SessionExportRow = {};

    exportRanking.forEach((option) => {
      if (option.sealId) {
        sealNames.set(
          option.sealId,
          getEnglishSealName(option.sealId, option.subtitle || option.title)
        );
      }
    });

    addSessionOneTrackingFields(screenFields, exportRanking, {
      ...tracking,
      collectionStartedAt: tracking.rankingStartedAt,
      sessionCompletedAt: flowCompletedAt,
    });

    const renamedFields: Record<string, string | undefined> = {
      collection_started_at: undefined,
      session_1_started_at: "ranking_started_at",
      first_moment_completed_at: "choices_completed_at",
      session_1_completed_at: "ranking_flow_completed_at",
      session_1_total_time_ms: "ranking_flow_total_time_ms",
      session_1_total_time: "ranking_flow_total_time",
      first_moment_total_decision_time_ms:
        "choices_total_decision_time_ms",
      first_moment_total_decision_time: "choices_total_decision_time",
    };

    for (const [field, value] of Object.entries(screenFields)) {
      const renamedField =
        field in renamedFields ? renamedFields[field] : field;

      if (renamedField) {
        participantFields[`${prefix}_${renamedField}`] = value;
      }
    }

    allScreensRankingTotalTimeMs += Number(
      screenFields.session_1_total_time_ms || 0
    );
    allScreensChoicesTotalTimeMs += Number(
      screenFields.first_moment_total_decision_time_ms || 0
    );
    allScreensPreselectionTotalTimeMs += Number(
      screenFields.preselection_total_time_ms || 0
    );
    allScreensRevisionsTotalTimeMs += Number(
      screenFields.ranking_revisions_total_time_ms || 0
    );
    allScreensReviewTotalTimeMs += Number(
      screenFields.preselection_and_revisions_total_time_ms || 0
    );
    allScreensFinalConfirmationsTotalTimeMs += Number(
      screenFields.final_confirmations_total_time_ms || 0
    );
    allScreensReviewAndConfirmationTotalTimeMs += Number(
      screenFields.preselection_and_final_confirmation_total_time_ms || 0
    );
    finalConfirmationAttemptsTotal +=
      tracking.finalConfirmationAttempts?.length ?? 0;
    finalConfirmationRejectionsTotal += (
      tracking.finalConfirmationAttempts ?? []
    ).filter((attempt) => attempt.response === "No").length;
    rankingRevisionCountTotal += tracking.rankingRevisions?.length ?? 0;
    revisionsWithoutChangeTotal += Number(
      screenFields.revision_without_change_count || 0
    );
    changedProductsTotal += Number(
      screenFields.preselection_changed_products_count || 0
    );

    if (
      !earliestStartedAt ||
      Date.parse(tracking.rankingStartedAt) < Date.parse(earliestStartedAt)
    ) {
      earliestStartedAt = tracking.rankingStartedAt;
    }
    if (
      !latestCompletedAt ||
      Date.parse(flowCompletedAt) > Date.parse(latestCompletedAt)
    ) {
      latestCompletedAt = flowCompletedAt;
    }

    tracking.decisionAttempts.forEach((attempt, index) => {
      decisionAttemptRows.push({
        participant_id: input.participantId,
        location: input.participantLocation,
        session_number: 3,
        presentation_screen_number: screen.screenNumber,
        condition_id: screen.conditionId,
        attempt_number: index + 1,
        decision_number: attempt.decisionNumber,
        option_id: attempt.optionId,
        seal_id: attempt.sealId,
        choice_name: getEnglishSealName(attempt.sealId, attempt.choiceName),
        selected_at: attempt.selectedAt,
        resolved_at: attempt.resolvedAt,
        response: attempt.response,
        product_selection_time_ms: attempt.productSelectionTimeMs,
        confirmation_time_ms: attempt.confirmationTimeMs,
        timestamp: input.timestamp,
      });
    });

    tracking.sealInteractions.forEach((interaction, index) => {
      allSealInteractions.push(interaction);
      sealInteractionRows.push({
        participant_id: input.participantId,
        location: input.participantLocation,
        session_number: 3,
        presentation_screen_number: screen.screenNumber,
        condition_id: screen.conditionId,
        interaction_number: index + 1,
        option_id: interaction.optionId,
        seal_id: interaction.sealId,
        seal_name: getEnglishSealName(
          interaction.sealId,
          interaction.sealName
        ),
        opened_at: interaction.openedAt,
        closed_at: interaction.closedAt,
        duration_ms: interaction.durationMs,
        duration: formatElapsedTime(interaction.durationMs),
        timestamp: input.timestamp,
      });
    });

    (tracking.preselectionReorders ?? []).forEach((reorder, index) => {
      allReorders.push({ ...reorder, screenNumber: screen.screenNumber });
      preselectionReorderRows.push({
        participant_id: input.participantId,
        location: input.participantLocation,
        session_number: 3,
        presentation_screen_number: screen.screenNumber,
        condition_id: screen.conditionId,
        reorder_number: index + 1,
        product_name: getEnglishSealName(reorder.sealId, reorder.choiceName),
        option_id: reorder.optionId,
        seal_id: reorder.sealId,
        from_rank: reorder.fromRank,
        to_rank: reorder.toRank,
        moved_at: reorder.movedAt,
        time_since_preselection_started_ms:
          reorder.timeSincePreselectionStartedMs,
        timestamp: input.timestamp,
      });
    });

    (tracking.finalConfirmationAttempts ?? []).forEach((attempt, index) => {
      finalConfirmationRows.push({
        participant_id: input.participantId,
        location: input.participantLocation,
        session_number: 3,
        presentation_screen_number: screen.screenNumber,
        condition_id: screen.conditionId,
        confirmation_number: index + 1,
        ranking_presented: getEnglishRankingLabel(attempt.ranking),
        started_at: attempt.startedAt,
        responded_at: attempt.respondedAt,
        duration_ms: attempt.durationMs,
        duration: formatElapsedTime(attempt.durationMs),
        response: attempt.response,
        timestamp: input.timestamp,
      });
    });

    (tracking.rankingRevisions ?? []).forEach((revision, revisionIndex) => {
      const changedProductsCount = countChangedProducts(
        revision.initialRanking,
        revision.finalRanking
      );
      const firstReorderTimeMs =
        revision.reorders[0]?.timeSincePreselectionStartedMs;

      rankingRevisionRows.push({
        participant_id: input.participantId,
        location: input.participantLocation,
        session_number: 3,
        presentation_screen_number: screen.screenNumber,
        condition_id: screen.conditionId,
        revision_number: revisionIndex + 1,
        initial_rank: getEnglishRankingLabel(revision.initialRanking),
        final_rank: getEnglishRankingLabel(revision.finalRanking),
        rank_changed: changedProductsCount > 0 ? "Yes" : "No",
        started_at: revision.startedAt,
        completed_at: revision.completedAt,
        total_time_ms: revision.totalTimeMs,
        total_time: formatElapsedTime(revision.totalTimeMs),
        reorder_count: revision.reorders.length,
        changed_products_count: changedProductsCount,
        distinct_products_moved: new Set(
          revision.reorders.map((reorder) => reorder.optionId)
        ).size,
        time_to_first_reorder_ms: firstReorderTimeMs ?? "",
        time_to_first_reorder:
          firstReorderTimeMs === undefined
            ? ""
            : formatElapsedTime(firstReorderTimeMs),
        timestamp: input.timestamp,
      });

      revision.reorders.forEach((reorder, reorderIndex) => {
        revisionReorderRows.push({
          participant_id: input.participantId,
          location: input.participantLocation,
          session_number: 3,
          presentation_screen_number: screen.screenNumber,
          condition_id: screen.conditionId,
          revision_number: revisionIndex + 1,
          reorder_number: reorderIndex + 1,
          product_name: getEnglishSealName(
            reorder.sealId,
            reorder.choiceName
          ),
          option_id: reorder.optionId,
          seal_id: reorder.sealId,
          from_rank: reorder.fromRank,
          to_rank: reorder.toRank,
          moved_at: reorder.movedAt,
          time_since_revision_started_ms:
            reorder.timeSincePreselectionStartedMs,
          timestamp: input.timestamp,
        });
      });
    });
  }

  const sessionStarted = Date.parse(earliestStartedAt);
  const sessionCompleted = Date.parse(latestCompletedAt);
  const sessionTotalTimeMs =
    Number.isFinite(sessionStarted) && Number.isFinite(sessionCompleted)
      ? Math.max(0, sessionCompleted - sessionStarted)
      : 0;
  const totalSealOpenTimeMs = allSealInteractions.reduce(
    (total, interaction) => total + interaction.durationMs,
    0
  );
  const averageSealOpenTimeMs = allSealInteractions.length
    ? Math.round(totalSealOpenTimeMs / allSealInteractions.length)
    : 0;
  const betweenScreenVisits = input.betweenScreenVisits ?? [];
  const betweenScreensTotalTimeMs = betweenScreenVisits.reduce(
    (total, visit) => total + visit.durationMs,
    0
  );

  betweenScreenVisits.forEach((visit) => {
    const transitionPrefix =
      `between_screen_${visit.fromScreen}_and_${visit.toScreen}`;
    participantFields[`${transitionPrefix}_started_at`] = visit.startedAt;
    participantFields[`${transitionPrefix}_completed_at`] = visit.completedAt;
    participantFields[`${transitionPrefix}_total_time_ms`] = visit.durationMs;
    participantFields[`${transitionPrefix}_total_time`] =
      formatElapsedTime(visit.durationMs);
  });

  participantFields.between_screens_total_time_ms =
    betweenScreensTotalTimeMs;
  participantFields.between_screens_total_time = formatElapsedTime(
    betweenScreensTotalTimeMs
  );

  participantFields.session_3_started_at = earliestStartedAt;
  participantFields.session_3_completed_at = latestCompletedAt;
  participantFields.session_3_total_time_ms = sessionTotalTimeMs;
  participantFields.session_3_total_time = formatElapsedTime(sessionTotalTimeMs);
  participantFields.all_screens_ranking_flow_total_time_ms =
    allScreensRankingTotalTimeMs;
  participantFields.all_screens_ranking_flow_total_time = formatElapsedTime(
    allScreensRankingTotalTimeMs
  );
  participantFields.all_screens_choices_total_decision_time_ms =
    allScreensChoicesTotalTimeMs;
  participantFields.all_screens_choices_total_decision_time =
    formatElapsedTime(allScreensChoicesTotalTimeMs);
  participantFields.all_screens_preselection_total_time_ms =
    allScreensPreselectionTotalTimeMs;
  participantFields.all_screens_preselection_total_time = formatElapsedTime(
    allScreensPreselectionTotalTimeMs
  );
  participantFields.all_screens_ranking_revisions_total_time_ms =
    allScreensRevisionsTotalTimeMs;
  participantFields.all_screens_ranking_revisions_total_time =
    formatElapsedTime(allScreensRevisionsTotalTimeMs);
  participantFields.all_screens_preselection_and_revisions_total_time_ms =
    allScreensReviewTotalTimeMs;
  participantFields.all_screens_preselection_and_revisions_total_time =
    formatElapsedTime(allScreensReviewTotalTimeMs);
  participantFields.all_screens_final_confirmations_total_time_ms =
    allScreensFinalConfirmationsTotalTimeMs;
  participantFields.all_screens_final_confirmations_total_time =
    formatElapsedTime(allScreensFinalConfirmationsTotalTimeMs);
  participantFields.all_screens_preselection_and_final_confirmation_total_time_ms =
    allScreensReviewAndConfirmationTotalTimeMs;
  participantFields.all_screens_preselection_and_final_confirmation_total_time =
    formatElapsedTime(allScreensReviewAndConfirmationTotalTimeMs);
  participantFields.final_confirmation_attempts_total =
    finalConfirmationAttemptsTotal;
  participantFields.final_confirmation_rejections_total =
    finalConfirmationRejectionsTotal;
  participantFields.ranking_revision_count_total = rankingRevisionCountTotal;
  participantFields.revision_without_change_count_total =
    revisionsWithoutChangeTotal;
  participantFields.decision_attempts_total = decisionAttemptRows.length;
  participantFields.rejected_confirmations_total = decisionAttemptRows.filter(
    (row) => row.response === "No"
  ).length;
  participantFields.preselection_reorder_count_total = allReorders.length;
  participantFields.preselection_changed_products_count_total =
    changedProductsTotal;
  participantFields.preselection_distinct_products_moved_total = new Set(
    allReorders.map(
      (reorder) => `${reorder.screenNumber}:${reorder.optionId}`
    )
  ).size;
  participantFields.seal_interactions_total = allSealInteractions.length;
  participantFields.seals_total_open_time_ms = totalSealOpenTimeMs;
  participantFields.seals_total_open_time = formatElapsedTime(
    totalSealOpenTimeMs
  );
  participantFields.seals_average_open_time_ms = averageSealOpenTimeMs;
  participantFields.seals_average_open_time = formatElapsedTime(
    averageSealOpenTimeMs
  );

  for (const [sealId, sealName] of sealNames) {
    const token = toFieldToken(sealName);
    const interactions = allSealInteractions.filter(
      (interaction) => interaction.sealId === sealId
    );
    const totalOpenTimeMs = interactions.reduce(
      (total, interaction) => total + interaction.durationMs,
      0
    );
    const averageOpenTimeMs = interactions.length
      ? Math.round(totalOpenTimeMs / interactions.length)
      : 0;

    participantFields[`ranking_seal_${token}_interactions`] =
      interactions.length;
    participantFields[`choice_${token}_rejections`] =
      decisionAttemptRows.filter(
        (row) => row.seal_id === sealId && row.response === "No"
      ).length;
    participantFields[`ranking_seal_${token}_reopenings`] = Math.max(
      0,
      interactions.length - 1
    );
    participantFields[`ranking_seal_${token}_total_open_time_ms`] =
      totalOpenTimeMs;
    participantFields[`ranking_seal_${token}_total_open_time`] =
      formatElapsedTime(totalOpenTimeMs);
    participantFields[`ranking_seal_${token}_average_open_time_ms`] =
      averageOpenTimeMs;
    participantFields[`ranking_seal_${token}_average_open_time`] =
      formatElapsedTime(averageOpenTimeMs);
  }

  return {
    participantFields,
    decisionAttemptRows,
    sealInteractionRows,
    preselectionReorderRows,
    finalConfirmationRows,
    rankingRevisionRows,
    revisionReorderRows,
  };
}

export function createSessionClickRows(
  clickRows: Array<Record<string, unknown>>,
  participantId: string,
  participantLocation: string,
  sessionNumber: number,
  timestamp: string
) {
  return clickRows.map((row) => ({
    ...row,
    participant_id: participantId,
    location: participantLocation,
    session_number: sessionNumber,
    timestamp,
  }));
}
