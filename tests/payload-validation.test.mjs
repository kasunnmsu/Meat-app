import test from "node:test";
import assert from "node:assert/strict";
import {
  isCompleteRanking,
  validateClickLogsPayload,
  validateFullSurveyPayload,
  validateSessionOnePayload,
  validateSessionThreePayload,
  validateSessionTwoPayload,
} from "../lib/payloadValidation.ts";

function participantRow(sessionNumber) {
  return {
    participant_id: "PUCPR-TEST-1",
    location: "PUCPR",
    session_number: sessionNumber,
  };
}

function rankingRows(sessionNumber, count) {
  return Array.from({ length: count }, (_, index) => ({
    ...participantRow(sessionNumber),
    selected_rank: sessionNumber === 3 ? (index % 3) + 1 : index + 1,
    option_id: `option-${sessionNumber}-${index + 1}`,
  }));
}

function sessionOnePayload() {
  return {
    submissionId: "submission-1",
    participantRow: participantRow(1),
    longRows: rankingRows(1, 5),
  };
}

function sessionTwoPayload() {
  return {
    submissionId: "submission-2",
    participantRow: participantRow(2),
    longRows: rankingRows(2, 5),
    sealReadingRows: Array.from({ length: 5 }, (_, index) => ({
      ...participantRow(2),
      seal_id: `seal-${index + 1}`,
    })),
  };
}

function sessionThreePayload() {
  return {
    submissionId: "submission-3",
    participantRow: participantRow(3),
    longRows: rankingRows(3, 9).map((row, index) => ({
      ...row,
      presentation_screen_number: Math.floor(index / 3) + 1,
    })),
  };
}

test("Session 1 accepts five unique choices", () => {
  assert.equal(validateSessionOnePayload(sessionOnePayload()).valid, true);
});

test("Session 1 rejects four choices", () => {
  const payload = sessionOnePayload();
  payload.longRows.pop();
  assert.equal(validateSessionOnePayload(payload).valid, false);
});

test("Session 1 rejects a repeated product", () => {
  const payload = sessionOnePayload();
  payload.longRows[4].option_id = payload.longRows[0].option_id;
  assert.equal(validateSessionOnePayload(payload).valid, false);
});

test("Session 2 requires five choices and five seal readings", () => {
  const payload = sessionTwoPayload();
  assert.equal(validateSessionTwoPayload(payload).valid, true);

  payload.sealReadingRows.pop();
  assert.equal(validateSessionTwoPayload(payload).valid, false);
});

test("Session 3 requires three complete screens", () => {
  const payload = sessionThreePayload();
  assert.equal(validateSessionThreePayload(payload).valid, true);

  payload.longRows.pop();
  assert.equal(validateSessionThreePayload(payload).valid, false);
});

test("Session 3 validates technical tracking rows when provided", () => {
  const payload = sessionThreePayload();
  const common = {
    ...participantRow(3),
    presentation_screen_number: 1,
    condition_id: "3.1",
    timestamp: "2026-01-01T00:01:00.000Z",
  };

  payload.decisionAttemptRows = [
    {
      ...common,
      attempt_number: 1,
      decision_number: 1,
      option_id: "option-3-1",
      seal_id: "green-1",
      choice_name: "Grass-fed",
      selected_at: "2026-01-01T00:00:05.000Z",
      resolved_at: "2026-01-01T00:00:07.000Z",
      response: "Yes",
      product_selection_time_ms: 5000,
      confirmation_time_ms: 2000,
    },
  ];
  payload.sealInteractionRows = [];
  payload.preselectionReorderRows = [];
  payload.finalConfirmationRows = [
    {
      ...common,
      confirmation_number: 1,
      ranking_presented: "Grass-fed > Organic > Animal welfare",
      started_at: "2026-01-01T00:00:30.000Z",
      responded_at: "2026-01-01T00:00:35.000Z",
      duration_ms: 5000,
      duration: "00:05.000",
      response: "Yes",
    },
  ];
  payload.rankingRevisionRows = [];
  payload.revisionReorderRows = [];

  assert.equal(validateSessionThreePayload(payload).valid, true);

  payload.decisionAttemptRows = [null];
  assert.equal(validateSessionThreePayload(payload).valid, false);
});

test("Session 3 rejects technical rows from another participant", () => {
  const payload = sessionThreePayload();
  payload.finalConfirmationRows = [
    {
      ...participantRow(3),
      participant_id: "PUCPR-OTHER",
      presentation_screen_number: 1,
      condition_id: "3.1",
      confirmation_number: 1,
      ranking_presented: "Grass-fed > Organic > Animal welfare",
      started_at: "2026-01-01T00:00:30.000Z",
      responded_at: "2026-01-01T00:00:35.000Z",
      duration_ms: 5000,
      duration: "00:05.000",
      response: "Yes",
      timestamp: "2026-01-01T00:01:00.000Z",
    },
  ];

  assert.equal(validateSessionThreePayload(payload).valid, false);
});

test("Full survey requires all demographic fields", () => {
  const payload = {
    submissionId: "full-survey-1",
    participantId: "PUCPR-TEST-1",
    location: "PUCPR",
    demographics: {
      gender: "female",
      ageGroup: "age_25_34",
      educationLevel: "bachelor",
      incomeGroup: "income_2",
    },
  };

  assert.equal(validateFullSurveyPayload(payload).valid, true);
  payload.demographics.incomeGroup = "";
  assert.equal(validateFullSurveyPayload(payload).valid, false);
});

test("Full survey validates the complete procedure timestamps", () => {
  const payload = {
    submissionId: "full-survey-timing-1",
    participantId: "PUCPR-TEST-1",
    location: "PUCPR",
    demographics: {
      gender: "female",
      ageGroup: "age_25_34",
      educationLevel: "bachelor",
      incomeGroup: "income_2",
    },
    surveyStartedAt: "2026-01-01T00:00:00.000Z",
    surveyCompletedAt: "2026-01-01T00:30:00.000Z",
  };

  assert.equal(validateFullSurveyPayload(payload).valid, true);
  payload.surveyCompletedAt = "2025-12-31T23:59:59.999Z";
  assert.equal(validateFullSurveyPayload(payload).valid, false);
  payload.surveyCompletedAt = "invalid";
  assert.equal(validateFullSurveyPayload(payload).valid, false);
});

test("Click logs require participant, location, session and event", () => {
  const payload = {
    submissionId: "clicks-1",
    clickRows: [
      {
        ...participantRow(1),
        event_type: "ranking_complete_click",
        clicked_at: new Date().toISOString(),
      },
    ],
  };

  assert.equal(validateClickLogsPayload(payload).valid, true);
  payload.clickRows[0].event_type = "";
  assert.equal(validateClickLogsPayload(payload).valid, false);
});

test("Client-side ranking check keeps partial choices incomplete", () => {
  assert.equal(
    isCompleteRanking(
      [1, 2, 3, 4].map((id) => ({ id: String(id) })),
      5
    ),
    false
  );

  assert.equal(
    isCompleteRanking(
      [1, 2, 3, 4, 5].map((id) => ({ id: String(id) })),
      5
    ),
    true
  );
});
