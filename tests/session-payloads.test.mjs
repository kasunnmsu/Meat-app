import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionClickRows,
  createSessionOnePayload,
  createSessionThreeTrackingPayload,
  createSessionTwoPayload,
} from "../lib/sessionPayloads.ts";

const demographics = {
  gender: "female",
  ageGroup: "age_25_34",
  educationLevel: "bachelor",
  incomeGroup: "income_2",
};

const ranking = Array.from({ length: 5 }, (_, index) => ({
  id: `option-${index + 1}`,
  cutId: `cut-${index + 1}`,
  sealId: `seal-${index + 1}`,
  title: "Picanha bovina",
  subtitle: `Selo ${index + 1}`,
  cutImageUrl: "/images/cuts/13.png",
  sealImageUrl: `/images/seals/pucpr/${index + 1}.png`,
  sealColor: "red",
  screenStartedAt: "2026-01-01T00:00:00.000Z",
  optionSelectedAt: "2026-01-01T00:00:01.000Z",
  purchaseConfirmedAt: "2026-01-01T00:00:02.000Z",
  timeSpentBeforeChoiceMs: 1000,
  timeSpentBeforeChoiceSeconds: 1,
  timeTakenToConfirmMs: 1000,
  timeTakenToConfirmSeconds: 1,
  changedPreferenceBeforeConfirming: "No",
  initialSelectedOptionId: `option-${index + 1}`,
  finalConfirmedOptionId: `option-${index + 1}`,
}));

const commonInput = {
  participantId: "PUCPR-TEST-1",
  participantLocation: "PUCPR",
  randomizationSeed: "PUCPR-TEST-1-session-1",
  ranking,
  initialDisplayOrder: [...ranking].reverse(),
  demographics,
  timestamp: "2026-01-01T00:01:00.000Z",
};

const timingKeys = [
  "screen_started_at",
  "option_selected_at",
  "purchase_confirmed_at",
  "time_spent_before_choice_ms",
  "time_spent_before_choice_seconds",
  "time_taken_to_confirm_ms",
  "time_taken_to_confirm_seconds",
  "changed_preference_before_confirming",
  "initial_selected_option_id",
  "final_confirmed_option_id",
];

const sessionOneDecisionTimingKeys = [
  "decision_sequence",
  "product_selection_time_ms",
  "confirmation_time_ms",
  "total_decision_time_ms",
  "product_selection_time",
  "confirmation_time",
  "total_decision_time",
  "confirmation_attempts",
  "rejected_confirmations",
  "rejected_products",
];

const commonLongRowKeys = [
  "participant_id",
  "location",
  "session_number",
  "method",
  "randomization_seed",
  "selected_rank",
  "option_id",
  "cut_id",
  "seal_id",
  "title",
  "subtitle",
  "cut_image_url",
  "seal_image_url",
  "seal_color",
];

const demographicKeys = [
  "gender",
  "age_group",
  "education_level",
  "income_group",
  "timestamp",
];

test("Session 1 keeps the distinct long-row formats of full and isolated flows", () => {
  const full = createSessionOnePayload({
    ...commonInput,
    includeLongRowTimingFields: true,
  });
  const isolated = createSessionOnePayload({
    ...commonInput,
    includeLongRowTimingFields: false,
  });

  assert.deepEqual(Object.keys(full.longRows[0]), [
    ...commonLongRowKeys,
    ...timingKeys,
    ...sessionOneDecisionTimingKeys,
    ...demographicKeys,
  ]);
  assert.deepEqual(Object.keys(isolated.longRows[0]), [
    ...commonLongRowKeys,
    ...demographicKeys,
  ]);
  assert.equal(full.participantRow.rank_5_option_id, "option-5");
  assert.equal(full.participantRow.data_schema_version, "2.1");
  assert.equal(
    full.participantRow.initial_display_order,
    "Selo 5 > Selo 4 > Selo 3 > Selo 2 > Selo 1"
  );
  assert.equal(full.participantRow.rank_5_time_taken_to_confirm_ms, 1000);
});

test("Session 1 summarizes decision and seal timing in readable fields", () => {
  const trackedRanking = ranking.map((option, index) => ({
    ...option,
    decisionSequence: index + 1,
    productSelectionTimeMs: index === 0 ? 20123 : 7000,
    confirmationTimeMs: index === 0 ? 11456 : 3000,
    decisionTimeMs: index === 0 ? 31579 : 10000,
    confirmationAttempts: index === 0 ? 3 : 1,
    rejectedConfirmations: index === 0 ? 2 : 0,
    rejectedProducts: index === 0 ? "Selo 1, Selo 2" : "",
  }));
  const payload = createSessionOnePayload({
    ...commonInput,
    ranking: trackedRanking,
    includeLongRowTimingFields: true,
    rankingSealClicks: { "seal-1": 3, "seal-2": 1 },
    tracking: {
      collectionStartedAt: "2026-01-01T00:00:00.000Z",
      rankingStartedAt: "2026-01-01T00:00:10.000Z",
      firstMomentCompletedAt: "2026-01-01T00:01:21.000Z",
      sessionCompletedAt: "2026-01-01T00:02:10.000Z",
      decisionAttempts: [
        {
          decisionNumber: 1,
          optionId: "option-1",
          sealId: "seal-1",
          choiceName: "Selo 1",
          selectedAt: "selected-1",
          resolvedAt: "resolved-1",
          response: "No",
          productSelectionTimeMs: 10000,
          confirmationTimeMs: 5000,
        },
        {
          decisionNumber: 1,
          optionId: "option-1",
          sealId: "seal-1",
          choiceName: "Selo 1",
          selectedAt: "selected-2",
          resolvedAt: "resolved-2",
          response: "Yes",
          productSelectionTimeMs: 10000,
          confirmationTimeMs: 6000,
        },
      ],
      sealInteractions: [
        {
          optionId: "option-1",
          sealId: "seal-1",
          sealName: "Selo 1",
          openedAt: "opened-1",
          closedAt: "closed-1",
          durationMs: 3000,
        },
        {
          optionId: "option-1",
          sealId: "seal-1",
          sealName: "Selo 1",
          openedAt: "opened-2",
          closedAt: "closed-2",
          durationMs: 5000,
        },
      ],
    },
  });

  assert.equal(payload.participantRow.decision_1_choice, "Selo 1");
  assert.equal(payload.participantRow.decision_1_product_selection_time, "00:20.123");
  assert.equal(payload.participantRow.decision_1_confirmation_time, "00:11.456");
  assert.equal(payload.participantRow.decision_1_total_decision_time, "00:31.579");
  assert.equal(payload.participantRow.first_moment_total_decision_time, "01:11.579");
  assert.equal(payload.participantRow.session_1_total_time, "02:00.000");
  assert.equal(payload.participantRow.choice_selo_1_rejections, 1);
  assert.equal(payload.participantRow.ranking_seal_selo_1_clicks, 3);
  assert.equal(payload.participantRow.ranking_seal_selo_2_clicks, 1);
  assert.equal(payload.participantRow.ranking_seal_selo_3_clicks, 0);
  assert.equal(payload.participantRow.seal_selo_1_interactions, 2);
  assert.equal(payload.participantRow.seal_selo_1_total_open_time, "00:08.000");
  assert.equal(payload.participantRow.seal_selo_1_average_open_time, "00:04.000");
  assert.equal(payload.decisionAttemptRows.length, 2);
  assert.equal(payload.sealInteractionRows.length, 2);
  assert.equal(payload.sealInteractionRows[0].duration, "00:03.000");
});

test("Session 1 exports Portuguese screen labels as English data", () => {
  const localizedRanking = ranking.map((option, index) => ({
    ...option,
    sealId: ["red-2", "red-1", "green-1", "green-2", "green-3"][index],
    subtitle: [
      "Bem-estar animal",
      "Angus",
      "Comum",
      "Cultivada",
      "Orgânica",
    ][index],
    decisionSequence: index + 1,
    rejectedProducts:
      index === 0 ? "Bem-estar animal, Orgânica" : "",
  }));
  const payload = createSessionOnePayload({
    ...commonInput,
    ranking: localizedRanking,
    includeLongRowTimingFields: true,
    tracking: {
      collectionStartedAt: "2026-01-01T00:00:00.000Z",
      rankingStartedAt: "2026-01-01T00:00:00.000Z",
      firstMomentCompletedAt: "2026-01-01T00:01:00.000Z",
      sessionCompletedAt: "2026-01-01T00:02:00.000Z",
      decisionAttempts: [
        {
          decisionNumber: 1,
          optionId: "option-1",
          sealId: "red-2",
          choiceName: "Bem-estar animal",
          selectedAt: "selected",
          resolvedAt: "resolved",
          response: "No",
          productSelectionTimeMs: 1000,
          confirmationTimeMs: 1000,
        },
      ],
      sealInteractions: [
        {
          optionId: "option-1",
          sealId: "red-2",
          sealName: "Bem-estar animal",
          openedAt: "opened",
          closedAt: "closed",
          durationMs: 1000,
        },
      ],
    },
  });

  assert.equal(payload.longRows[0].title, "Beef top sirloin");
  assert.equal(payload.longRows[0].subtitle, "Animal welfare");
  assert.equal(
    payload.longRows[0].rejected_products,
    "Animal welfare, Organic"
  );
  assert.equal(payload.participantRow.decision_1_choice, "Animal welfare");
  assert.equal(payload.participantRow.choice_animal_welfare_rejections, 1);
  assert.equal(payload.decisionAttemptRows[0].choice_name, "Animal welfare");
  assert.equal(payload.sealInteractionRows[0].seal_name, "Animal welfare");
});

test("Session 1 summarizes preselection ranking changes and reorders", () => {
  const choices = [
    ["option-1", "red-1", "Angus"],
    ["option-2", "red-2", "Bem-estar animal"],
    ["option-3", "green-1", "Comum"],
    ["option-4", "green-2", "Cultivada"],
    ["option-5", "green-3", "Orgânica"],
  ];
  const snapshot = (indexes) =>
    indexes.map((index) => ({
      optionId: choices[index][0],
      sealId: choices[index][1],
      choiceName: choices[index][2],
    }));
  const payload = createSessionOnePayload({
    ...commonInput,
    includeLongRowTimingFields: true,
    tracking: {
      collectionStartedAt: "2026-01-01T00:00:00.000Z",
      rankingStartedAt: "2026-01-01T00:00:00.000Z",
      firstMomentCompletedAt: "2026-01-01T00:01:00.000Z",
      sessionCompletedAt: "2026-01-01T00:03:00.000Z",
      decisionAttempts: [],
      sealInteractions: [],
      preselectionStartedAt: "2026-01-01T00:01:00.000Z",
      preselectionCompletedAt: "2026-01-01T00:01:40.250Z",
      preselectionTotalTimeMs: 40250,
      preselectionInitialRanking: snapshot([0, 1, 2, 3, 4]),
      preselectionFinalRanking: snapshot([1, 0, 2, 4, 3]),
      preselectionReorders: [
        {
          ...snapshot([1])[0],
          fromRank: 2,
          toRank: 1,
          movedAt: "2026-01-01T00:01:12.500Z",
          timeSincePreselectionStartedMs: 12500,
        },
        {
          ...snapshot([4])[0],
          fromRank: 5,
          toRank: 4,
          movedAt: "2026-01-01T00:01:30.000Z",
          timeSincePreselectionStartedMs: 30000,
        },
      ],
    },
  });

  assert.equal(payload.participantRow.preselection_total_time, "00:40.250");
  assert.equal(
    payload.participantRow.preselection_initial_rank,
    "Angus > Animal welfare > Common > Cultivated > Organic"
  );
  assert.equal(
    payload.participantRow.preselection_final_rank,
    "Animal welfare > Angus > Common > Organic > Cultivated"
  );
  assert.equal(payload.participantRow.preselection_rank_changed, "Yes");
  assert.equal(payload.participantRow.preselection_reorder_count, 2);
  assert.equal(payload.participantRow.ranking_reorder_count_total, 2);
  assert.equal(payload.participantRow.preselection_changed_products_count, 4);
  assert.equal(payload.participantRow.preselection_distinct_products_moved, 2);
  assert.equal(
    payload.participantRow.preselection_time_to_first_reorder,
    "00:12.500"
  );
  assert.equal(payload.preselectionReorderRows.length, 2);
  assert.equal(payload.preselectionReorderRows[0].product_name, "Animal welfare");
  assert.equal(payload.preselectionReorderRows[0].from_rank, 2);
  assert.equal(payload.preselectionReorderRows[0].to_rank, 1);
  assert.ok(
    Object.keys(payload.participantRow).indexOf("preselection_total_time") >
      Object.keys(payload.participantRow).indexOf(
        "preselection_time_to_first_reorder"
      )
  );
});

test("Session 1 tracks final confirmations and repeated ranking revisions", () => {
  const choices = [
    ["option-1", "red-1", "Angus"],
    ["option-2", "red-2", "Bem-estar animal"],
    ["option-3", "green-1", "Comum"],
    ["option-4", "green-2", "Cultivada"],
    ["option-5", "green-3", "Orgânica"],
  ];
  const snapshot = (indexes) =>
    indexes.map((index) => ({
      optionId: choices[index][0],
      sealId: choices[index][1],
      choiceName: choices[index][2],
    }));
  const initialRank = snapshot([0, 1, 2, 3, 4]);
  const revisedRank = snapshot([1, 0, 2, 3, 4]);
  const reorder = {
    ...snapshot([1])[0],
    fromRank: 2,
    toRank: 1,
    movedAt: "2026-01-01T00:01:52.500Z",
    timeSincePreselectionStartedMs: 12500,
  };
  const payload = createSessionOnePayload({
    ...commonInput,
    includeLongRowTimingFields: true,
    tracking: {
      collectionStartedAt: "2026-01-01T00:00:00.000Z",
      rankingStartedAt: "2026-01-01T00:00:00.000Z",
      firstMomentCompletedAt: "2026-01-01T00:01:00.000Z",
      sessionCompletedAt: "2026-01-01T00:03:00.000Z",
      decisionAttempts: [],
      sealInteractions: [],
      preselectionStartedAt: "2026-01-01T00:01:00.000Z",
      preselectionCompletedAt: "2026-01-01T00:01:30.000Z",
      preselectionTotalTimeMs: 30000,
      preselectionInitialRanking: initialRank,
      preselectionFinalRanking: initialRank,
      preselectionReorders: [],
      finalConfirmationAttempts: [
        {
          ranking: initialRank,
          startedAt: "2026-01-01T00:01:30.000Z",
          respondedAt: "2026-01-01T00:01:40.000Z",
          durationMs: 10000,
          response: "No",
        },
        {
          ranking: revisedRank,
          startedAt: "2026-01-01T00:02:00.000Z",
          respondedAt: "2026-01-01T00:02:08.000Z",
          durationMs: 8000,
          response: "No",
        },
        {
          ranking: revisedRank,
          startedAt: "2026-01-01T00:02:23.000Z",
          respondedAt: "2026-01-01T00:02:28.000Z",
          durationMs: 5000,
          response: "Yes",
        },
      ],
      rankingRevisions: [
        {
          startedAt: "2026-01-01T00:01:40.000Z",
          completedAt: "2026-01-01T00:02:00.000Z",
          totalTimeMs: 20000,
          initialRanking: initialRank,
          finalRanking: revisedRank,
          reorders: [reorder],
        },
        {
          startedAt: "2026-01-01T00:02:08.000Z",
          completedAt: "2026-01-01T00:02:23.000Z",
          totalTimeMs: 15000,
          initialRanking: revisedRank,
          finalRanking: revisedRank,
          reorders: [],
        },
      ],
    },
  });

  assert.equal(payload.participantRow.final_confirmation_1_time, "00:10.000");
  assert.equal(payload.participantRow.final_confirmation_1_response, "No");
  assert.equal(
    payload.participantRow.ranking_revision_1_initial_rank,
    "Angus > Animal welfare > Common > Cultivated > Organic"
  );
  assert.equal(
    payload.participantRow.ranking_revision_1_final_rank,
    "Animal welfare > Angus > Common > Cultivated > Organic"
  );
  assert.equal(payload.participantRow.ranking_revision_1_rank_changed, "Yes");
  assert.equal(payload.participantRow.ranking_revision_2_rank_changed, "No");
  assert.equal(payload.participantRow.final_confirmation_attempts, 3);
  assert.equal(payload.participantRow.final_confirmation_rejections, 2);
  assert.equal(payload.participantRow.ranking_revision_count, 2);
  assert.equal(payload.participantRow.ranking_reorder_count_total, 1);
  assert.equal(payload.participantRow.revision_without_change_count, 1);
  assert.equal(
    payload.participantRow.ranking_revisions_total_time,
    "00:35.000"
  );
  assert.equal(
    payload.participantRow.preselection_and_revisions_total_time,
    "01:05.000"
  );
  assert.equal(
    payload.participantRow.final_confirmations_total_time,
    "00:23.000"
  );
  assert.equal(
    payload.participantRow.preselection_and_final_confirmation_total_time,
    "01:28.000"
  );
  assert.equal(
    payload.participantRow.final_confirmed_rank,
    "Animal welfare > Angus > Common > Cultivated > Organic"
  );
  assert.equal(payload.finalConfirmationRows.length, 3);
  assert.equal(payload.rankingRevisionRows.length, 2);
  assert.equal(payload.revisionReorderRows.length, 1);
  assert.equal(payload.revisionReorderRows[0].product_name, "Animal welfare");
});

test("Session 2 keeps ranking, reading and seal-click export fields", () => {
  const payload = createSessionTwoPayload({
    ...commonInput,
    randomizationSeed: "PUCPR-TEST-1-session-2",
    agreedToDescriptions: "Yes",
    readSealCount: 5,
    allSealsRead: true,
    sealReadingDisplayOrder: [
      { sealId: "green-3", sealName: "Orgânica" },
      { sealId: "red-1", sealName: "Angus" },
      { sealId: "green-1", sealName: "Comum" },
      { sealId: "red-2", sealName: "Bem-estar animal" },
      { sealId: "green-2", sealName: "Cultivada" },
    ],
    sealReadingRecords: [
      { sealId: "seal-1", sealName: "Selo 1", openedAt: "opened-at" },
    ],
    rankingSealClickRecords: [
      { sealId: "seal-1", sealName: "Selo 1", clickedAt: "clicked-at" },
    ],
    rankingSealClicks: { "seal-1": 2 },
  });

  assert.deepEqual(Object.keys(payload.longRows[0]), [
    ...commonLongRowKeys.slice(0, 5),
    "agreed_to_descriptions",
    ...commonLongRowKeys.slice(5),
    ...timingKeys,
    ...sessionOneDecisionTimingKeys,
    ...demographicKeys,
  ]);
  assert.equal(payload.participantRow.data_schema_version, "2.1");
  assert.equal(
    payload.participantRow.seal_reading_initial_display_order,
    "Organic > Angus > Common > Animal welfare > Cultivated"
  );
  assert.equal(
    payload.participantRow.initial_display_order,
    "Selo 5 > Selo 4 > Selo 3 > Selo 2 > Selo 1"
  );
  assert.deepEqual(payload.sealReadingRows[0], {
    participant_id: "PUCPR-TEST-1",
    location: "PUCPR",
    session_number: 2,
    seal_id: "seal-1",
    seal_name: "Selo 1",
    opened_description: "Yes",
    opened_at: "opened-at",
    agreed_to_descriptions: "Yes",
    timestamp: "2026-01-01T00:01:00.000Z",
  });
  assert.equal(payload.rankingSealClickRows[0].total_clicks_this_seal, 2);
});

test("Session 2 reuses post-reading decision, seal and revision tracking", () => {
  const trackedRanking = ranking.map((option, index) => ({
    ...option,
    sealId: ["red-1", "red-2", "green-1", "green-2", "green-3"][index],
    subtitle: ["Angus", "Bem-estar animal", "Comum", "Cultivada", "Orgânica"][index],
    decisionSequence: index + 1,
    productSelectionTimeMs: 5000,
    confirmationTimeMs: 2000,
    decisionTimeMs: 7000,
    confirmationAttempts: 1,
    rejectedConfirmations: 0,
    rejectedProducts: "",
  }));
  const snapshot = trackedRanking.map((option) => ({
    optionId: option.id,
    sealId: option.sealId,
    choiceName: option.subtitle,
  }));
  const readingInteractions = [
    ["red-1", "Angus", 1, 2000],
    ["red-2", "Bem-estar animal", 2, 3000],
    ["green-1", "Comum", 3, 2500],
    ["green-2", "Cultivada", 4, 3500],
    ["green-3", "Orgânica", 5, 4000],
  ].map(([sealId, sealName, firstOpenOrder, durationMs], index) => ({
    sealId,
    sealName,
    openedAt: `2026-01-01T00:00:${String(2 + index * 7).padStart(2, "0")}.000Z`,
    closedAt: `2026-01-01T00:00:${String(4 + index * 7).padStart(2, "0")}.000Z`,
    durationMs,
    firstOpen: true,
    firstOpenOrder,
  }));
  readingInteractions.push({
    sealId: "red-1",
    sealName: "Angus",
    openedAt: "2026-01-01T00:00:45.000Z",
    closedAt: "2026-01-01T00:00:49.000Z",
    durationMs: 4000,
    firstOpen: false,
    firstOpenOrder: undefined,
  });
  const payload = createSessionTwoPayload({
    ...commonInput,
    ranking: trackedRanking,
    randomizationSeed: "PUCPR-TEST-1-session-2",
    agreedToDescriptions: "Yes",
    readSealCount: 5,
    allSealsRead: true,
    sealReadingDisplayOrder: trackedRanking.map((option) => ({
      sealId: option.sealId,
      sealName: option.subtitle,
    })),
    sealReadingRecords: [],
    rankingSealClickRecords: [],
    rankingSealClicks: {},
    rankingSealInteractionRecords: [
      {
        optionId: "option-1",
        sealId: "red-1",
        sealName: "Angus",
        openedAt: "2026-01-01T00:00:05.000Z",
        closedAt: "2026-01-01T00:00:09.250Z",
        durationMs: 4250,
      },
    ],
    sealReadingInteractionRecords: readingInteractions,
    readingScreenVisitRecords: [
      {
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:00:40.000Z",
        durationMs: 40000,
      },
      {
        startedAt: "2026-01-01T00:00:42.000Z",
        completedAt: "2026-01-01T00:00:52.000Z",
        durationMs: 10000,
      },
    ],
    readingStartedAt: "2026-01-01T00:00:00.000Z",
    allSealsFirstReadAt: "2026-01-01T00:00:30.000Z",
    tracking: {
      rankingStartedAt: "2026-01-01T00:00:00.000Z",
      firstMomentCompletedAt: "2026-01-01T00:00:35.000Z",
      sessionCompletedAt: "2026-01-01T00:01:00.000Z",
      decisionAttempts: [
        {
          decisionNumber: 1,
          optionId: "option-1",
          sealId: "red-1",
          choiceName: "Angus",
          selectedAt: "selected",
          resolvedAt: "resolved",
          response: "Yes",
          productSelectionTimeMs: 5000,
          confirmationTimeMs: 2000,
        },
      ],
      sealInteractions: [],
      preselectionStartedAt: "2026-01-01T00:00:35.000Z",
      preselectionCompletedAt: "2026-01-01T00:00:45.000Z",
      preselectionTotalTimeMs: 10000,
      preselectionInitialRanking: snapshot,
      preselectionFinalRanking: snapshot,
      preselectionReorders: [],
      finalConfirmationAttempts: [
        {
          ranking: snapshot,
          startedAt: "2026-01-01T00:00:45.000Z",
          respondedAt: "2026-01-01T00:00:50.000Z",
          durationMs: 5000,
          response: "Yes",
        },
      ],
      rankingRevisions: [],
    },
  });

  assert.equal(payload.participantRow.decision_1_choice, "Angus");
  assert.equal(payload.participantRow.preselection_total_time, "00:10.000");
  assert.equal(payload.participantRow.final_confirmation_1_time, "00:05.000");
  assert.equal(payload.participantRow.ranking_reorder_count_total, 0);
  assert.equal(payload.participantRow.ranking_seal_angus_interactions, 1);
  assert.equal(payload.participantRow.ranking_seal_angus_total_open_time, "00:04.250");
  assert.equal(payload.participantRow.post_reading_ranking_flow_total_time, "00:50.000");
  assert.equal(
    payload.participantRow.seal_reading_first_open_order,
    "Angus > Animal welfare > Common > Cultivated > Organic"
  );
  assert.equal(payload.participantRow.seal_reading_time_to_first_open, "00:02.000");
  assert.equal(payload.participantRow.seal_reading_time_until_all_read, "00:30.000");
  assert.equal(payload.participantRow.seal_reading_reopening_count, 1);
  assert.equal(payload.participantRow.seal_reading_angus_interactions, 2);
  assert.equal(payload.participantRow.seal_reading_angus_reopenings, 1);
  assert.equal(payload.participantRow.seal_reading_angus_total_open_time, "00:06.000");
  assert.equal(payload.participantRow.seal_reading_angus_average_open_time, "00:03.000");
  assert.equal(payload.participantRow.seal_reading_screen_total_time, "00:50.000");
  assert.equal(payload.participantRow.session_2_total_time, "01:00.000");
  assert.equal(payload.decisionAttemptRows.length, 1);
  assert.equal(payload.rankingSealInteractionRows.length, 1);
  assert.equal(payload.rankingSealInteractionRows[0].duration, "00:04.250");
  assert.equal(payload.finalConfirmationRows.length, 1);
  assert.equal(payload.sealReadingInteractionRows.length, 6);
  assert.equal(payload.sealReadingInteractionRows[5].interaction_type, "Reopen");
  assert.equal(payload.sealReadingInteractionRows[0].duration, "00:02.000");
  assert.equal(payload.readingScreenVisitRows.length, 2);
  assert.equal(payload.sealReadingRows.length, 0);
});

test("Click-row enrichment preserves event fields and adds session metadata", () => {
  assert.deepEqual(
    createSessionClickRows(
      [{ event_type: "ranking_complete_click", participant_id: "old" }],
      "PUCPR-TEST-1",
      "PUCPR",
      1,
      "saved-at"
    ),
    [
      {
        event_type: "ranking_complete_click",
        participant_id: "PUCPR-TEST-1",
        location: "PUCPR",
        session_number: 1,
        timestamp: "saved-at",
      },
    ]
  );
});

test("Session 3 reuses decision, seal and preselection tracking per price screen", () => {
  const screenRanking = ranking.slice(0, 3).map((option, index) => ({
    ...option,
    sealId: ["red-1", "red-2", "green-3"][index],
    subtitle: ["Angus", "Bem-estar animal", "Orgânica"][index],
    decisionSequence: index + 1,
    productSelectionTimeMs: 5000 + index * 1000,
    confirmationTimeMs: 2000,
    decisionTimeMs: 7000 + index * 1000,
    confirmationAttempts: index === 0 ? 2 : 1,
    rejectedConfirmations: index === 0 ? 1 : 0,
    rejectedProducts: index === 0 ? "Orgânica" : "",
  }));
  const snapshot = screenRanking.map((option) => ({
    optionId: option.id,
    sealId: option.sealId,
    choiceName: option.subtitle,
  }));
  const payload = createSessionThreeTrackingPayload({
    participantId: "PUCPR-TEST-3",
    participantLocation: "PUCPR",
    timestamp: "2026-01-01T00:02:00.000Z",
    screens: [
      {
        screenNumber: 1,
        conditionId: "3.2",
        ranking: screenRanking,
        initialDisplayOrder: [
          screenRanking[2],
          screenRanking[0],
          screenRanking[1],
        ],
        tracking: {
          rankingStartedAt: "2026-01-01T00:00:00.000Z",
          rankingCompletedAt: "2026-01-01T00:01:25.000Z",
          firstMomentCompletedAt: "2026-01-01T00:00:30.000Z",
          decisionAttempts: [
            {
              decisionNumber: 1,
              optionId: "option-1",
              sealId: "red-1",
              choiceName: "Angus",
              selectedAt: "2026-01-01T00:00:05.000Z",
              resolvedAt: "2026-01-01T00:00:07.000Z",
              response: "No",
              productSelectionTimeMs: 5000,
              confirmationTimeMs: 2000,
            },
            {
              decisionNumber: 1,
              optionId: "option-1",
              sealId: "red-1",
              choiceName: "Angus",
              selectedAt: "2026-01-01T00:00:10.000Z",
              resolvedAt: "2026-01-01T00:00:12.000Z",
              response: "Yes",
              productSelectionTimeMs: 3000,
              confirmationTimeMs: 2000,
            },
          ],
          sealInteractions: [
            {
              optionId: "option-3",
              sealId: "green-3",
              sealName: "Orgânica",
              openedAt: "2026-01-01T00:00:15.000Z",
              closedAt: "2026-01-01T00:00:19.250Z",
              durationMs: 4250,
            },
          ],
          preselectionStartedAt: "2026-01-01T00:00:30.000Z",
          preselectionCompletedAt: "2026-01-01T00:01:00.000Z",
          preselectionTotalTimeMs: 30000,
          preselectionInitialRanking: snapshot,
          preselectionFinalRanking: [snapshot[1], snapshot[0], snapshot[2]],
          preselectionReorders: [
            {
              ...snapshot[1],
              fromRank: 2,
              toRank: 1,
              movedAt: "2026-01-01T00:00:42.500Z",
              timeSincePreselectionStartedMs: 12500,
            },
          ],
          finalConfirmationAttempts: [
            {
              ranking: [snapshot[1], snapshot[0], snapshot[2]],
              startedAt: "2026-01-01T00:01:00.000Z",
              respondedAt: "2026-01-01T00:01:10.000Z",
              durationMs: 10000,
              response: "No",
            },
            {
              ranking: [snapshot[1], snapshot[2], snapshot[0]],
              startedAt: "2026-01-01T00:01:25.000Z",
              respondedAt: "2026-01-01T00:01:30.000Z",
              durationMs: 5000,
              response: "Yes",
            },
          ],
          rankingRevisions: [
            {
              startedAt: "2026-01-01T00:01:10.000Z",
              completedAt: "2026-01-01T00:01:25.000Z",
              totalTimeMs: 15000,
              initialRanking: [snapshot[1], snapshot[0], snapshot[2]],
              finalRanking: [snapshot[1], snapshot[2], snapshot[0]],
              reorders: [
                {
                  ...snapshot[2],
                  fromRank: 3,
                  toRank: 2,
                  movedAt: "2026-01-01T00:01:20.000Z",
                  timeSincePreselectionStartedMs: 10000,
                },
              ],
            },
          ],
        },
      },
      {
        screenNumber: 2,
        conditionId: "3.1",
        ranking: screenRanking,
        initialDisplayOrder: screenRanking,
      },
      {
        screenNumber: 3,
        conditionId: "3.3",
        ranking: screenRanking,
        initialDisplayOrder: screenRanking,
      },
    ],
    betweenScreenVisits: [
      {
        fromScreen: 1,
        toScreen: 2,
        startedAt: "2026-01-01T00:01:30.000Z",
        completedAt: "2026-01-01T00:01:36.250Z",
        durationMs: 6250,
      },
      {
        fromScreen: 2,
        toScreen: 3,
        startedAt: "2026-01-01T00:02:00.000Z",
        completedAt: "2026-01-01T00:02:04.500Z",
        durationMs: 4500,
      },
    ],
  });

  assert.equal(
    payload.participantFields.screen_1_decision_1_product_selection_time,
    "00:05.000"
  );
  assert.equal(payload.participantFields.data_schema_version, "2.1");
  assert.equal(
    payload.participantFields.screen_condition_order,
    "3.2 > 3.1 > 3.3"
  );
  assert.equal(
    payload.participantFields.screen_1_initial_display_order,
    "Organic > Angus > Animal welfare"
  );
  assert.equal(
    payload.participantFields.between_screen_1_and_2_total_time,
    "00:06.250"
  );
  assert.equal(
    payload.participantFields.between_screen_2_and_3_total_time,
    "00:04.500"
  );
  assert.equal(
    payload.participantFields.between_screens_total_time,
    "00:10.750"
  );
  assert.equal(
    payload.participantFields.screen_1_preselection_initial_rank,
    "Angus > Animal welfare > Organic"
  );
  assert.equal(
    payload.participantFields.screen_1_preselection_final_rank,
    "Animal welfare > Angus > Organic"
  );
  assert.equal(
    payload.participantFields.screen_1_preselection_total_time,
    "00:30.000"
  );
  assert.equal(payload.participantFields.rejected_confirmations_total, 1);
  assert.equal(
    payload.participantFields.screen_1_ranking_reorder_count_total,
    2
  );
  assert.equal(payload.participantFields.ranking_reorder_count_total, undefined);
  assert.equal(payload.participantFields.seal_interactions_total, 1);
  assert.equal(payload.participantFields.seals_total_open_time, "00:04.250");
  assert.equal(
    payload.participantFields.screen_1_final_confirmation_1_response,
    "No"
  );
  assert.equal(
    payload.participantFields.screen_1_final_confirmation_2_response,
    "Yes"
  );
  assert.equal(
    payload.participantFields.screen_1_ranking_revision_1_total_time,
    "00:15.000"
  );
  assert.equal(
    payload.participantFields.all_screens_final_confirmations_total_time,
    "00:15.000"
  );
  assert.equal(
    payload.participantFields.all_screens_preselection_and_final_confirmation_total_time,
    "01:00.000"
  );
  assert.equal(payload.participantFields.session_3_total_time, "01:30.000");
  assert.equal(payload.decisionAttemptRows.length, 2);
  assert.equal(payload.decisionAttemptRows[0].presentation_screen_number, 1);
  assert.equal(payload.decisionAttemptRows[0].condition_id, "3.2");
  assert.equal(payload.sealInteractionRows[0].seal_name, "Organic");
  assert.equal(payload.sealInteractionRows[0].duration, "00:04.250");
  assert.equal(payload.preselectionReorderRows[0].product_name, "Animal welfare");
  assert.equal(payload.finalConfirmationRows.length, 2);
  assert.equal(payload.rankingRevisionRows.length, 1);
  assert.equal(payload.revisionReorderRows.length, 1);
});
