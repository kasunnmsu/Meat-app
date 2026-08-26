import test from "node:test";
import assert from "node:assert/strict";
import {
  createAnalysisLongRows,
  createAnalysisParticipantRows,
  createCodebookRows,
  createFullSurveyAnalysisRows,
} from "../lib/analysisRows.ts";

test("Session analysis replaces technical choice codes with readable names", () => {
  const participantRows = [
    {
      participant_id: "PUCPR-1",
      location: "PUCPR",
      session_number: 1,
      rank_1_option_id: "option-1",
      rank_1_cut_id: "cut-1",
      rank_1_seal_id: "red-1",
      rank_1_title: "Picanha bovina",
      rank_1_time_spent_before_choice_ms: 1200,
      decision_1_product_selection_time: "00:01",
      preselection_started_at: "started-at",
      preselection_completed_at: "completed-at",
      preselection_total_time_ms: 40250,
      preselection_total_time: "00:40.250",
      preselection_initial_rank: "Angus > Organic",
      preselection_final_rank: "Organic > Angus",
      timestamp: "saved-at",
    },
  ];
  const longRows = [
    {
      participant_id: "PUCPR-1",
      location: "PUCPR",
      session_number: 1,
      selected_rank: 1,
      option_id: "option-1",
      cut_id: "cut-1",
      seal_id: "red-1",
      title: "Picanha bovina",
      subtitle: "Angus",
      cut_image_url: "/cut.png",
      seal_image_url: "/seal.png",
      seal_color: "red",
      timestamp: "saved-at",
    },
  ];

  const [participant] = createAnalysisParticipantRows(
    participantRows,
    longRows,
    1
  );
  const [longRow] = createAnalysisLongRows(longRows);

  assert.equal(participant.rank_1_choice, "Angus");
  assert.equal(participant.rank_1_option_id, undefined);
  assert.equal(participant.rank_1_cut_id, undefined);
  assert.equal(participant.rank_1_seal_id, undefined);
  assert.equal(participant.rank_1_time_spent_before_choice_ms, undefined);
  assert.equal(participant.decision_1_product_selection_time, "00:01");
  assert.equal(participant.preselection_started_at, undefined);
  assert.equal(participant.preselection_completed_at, undefined);
  assert.equal(participant.preselection_total_time_ms, undefined);
  assert.equal(participant.preselection_total_time, "00:40.250");
  assert.equal(participant.preselection_initial_rank, "Angus > Organic");
  assert.equal(participant.preselection_final_rank, "Organic > Angus");
  assert.ok(
    Object.keys(participant).indexOf("rank_1_choice") <
      Object.keys(participant).indexOf("decision_1_product_selection_time")
  );
  assert.equal(longRow.choice, "Angus");
  assert.equal(longRow.option_id, undefined);
  assert.equal(longRow.seal_id, undefined);
});

test("Session 3 analysis names choices and keeps prices", () => {
  const participantRows = [
    {
      participant_id: "UFBA-1",
      top_seal_1: "green-3",
      screen_1_rank_1_option_id: "technical-option",
      screen_1_rank_1_seal_id: "green-3",
      screen_1_rank_1_title: "Picanha bovina",
      screen_1_rank_1_subtitle: "Orgânica",
      screen_1_rank_1_price: 84,
      screen_1_decision_1_product_selection_time_ms: 12500,
      screen_1_decision_1_product_selection_time: "00:12.500",
      screen_1_ranking_started_at: "started-at",
      all_screens_preselection_total_time_ms: 30000,
      all_screens_preselection_total_time: "00:30.000",
    },
  ];
  const longRows = [
    {
      participant_id: "UFBA-1",
      session_number: 3,
      presentation_screen_number: 1,
      selected_rank: 1,
      seal_id: "green-3",
      title: "Picanha bovina",
      subtitle: "Orgânica",
      price: 84,
      time_spent_before_choice_ms: 12500,
      time_spent_before_choice_seconds: 12.5,
      screen_started_at: "started-at",
    },
  ];

  const [participant] = createAnalysisParticipantRows(
    participantRows,
    longRows,
    3
  );
  const [longRow] = createAnalysisLongRows(longRows);

  assert.equal(participant.screen_1_rank_1_choice, "Orgânica");
  assert.equal(participant.screen_1_rank_1_price, 84);
  assert.equal(participant.top_choice_1, "Orgânica");
  assert.equal(participant.top_seal_1, undefined);
  assert.equal(
    participant.screen_1_decision_1_product_selection_time,
    "00:12.500"
  );
  assert.equal(
    participant.screen_1_decision_1_product_selection_time_ms,
    undefined
  );
  assert.equal(participant.screen_1_ranking_started_at, undefined);
  assert.equal(participant.all_screens_preselection_total_time, "00:30.000");
  assert.equal(participant.all_screens_preselection_total_time_ms, undefined);
  assert.equal(longRow.time_spent_before_choice_ms, undefined);
  assert.equal(longRow.time_spent_before_choice_seconds, undefined);
  assert.equal(longRow.screen_started_at, undefined);
});

test("Codebook retains the technical mapping outside analysis sheets", () => {
  const [code] = createCodebookRows([
    {
      location: "PUCPR",
      session_number: 1,
      option_id: "option-1",
      cut_id: "cut-1",
      seal_id: "red-1",
      title: "Picanha bovina",
      subtitle: "Angus",
    },
  ]);

  assert.deepEqual(
    {
      option_id: code.option_id,
      cut_id: code.cut_id,
      seal_id: code.seal_id,
      choice_name: code.choice_name,
    },
    {
      option_id: "option-1",
      cut_id: "cut-1",
      seal_id: "red-1",
      choice_name: "Angus",
    }
  );
});

test("Full survey analysis hides IDs and preserves readable choices", () => {
  const [row] = createFullSurveyAnalysisRows([
    {
      participant_id: "PUCPR-1",
      s1_rank_1_option_id: "option-1",
      s1_rank_1_cut_id: "cut-1",
      s1_rank_1_seal_id: "red-1",
      s1_rank_1_title: "Picanha bovina",
      s1_rank_1_choice: "Angus",
      s3_screen_1_decision_1_total_decision_time_ms: 12000,
      s3_screen_1_decision_1_total_decision_time: "00:12.000",
      s3_session_3_started_at: "started-at",
      full_survey_started_at: "2026-01-01T00:00:00.000Z",
      full_survey_completed_at: "2026-01-01T00:30:00.000Z",
      full_survey_total_time_ms: 1800000,
      full_survey_total_time: "30:00.000",
      full_survey_saved_at: "2026-01-01T00:30:01.000Z",
    },
  ]);

  assert.deepEqual(row, {
    participant_id: "PUCPR-1",
    s1_rank_1_choice: "Angus",
    s3_screen_1_decision_1_total_decision_time: "00:12.000",
    full_survey_total_time: "30:00.000",
  });
});
