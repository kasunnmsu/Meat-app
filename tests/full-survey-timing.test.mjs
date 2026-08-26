import test from "node:test";
import assert from "node:assert/strict";
import { createFullSurveyTimingFields } from "../lib/fullSurveyTiming.ts";

test("Full survey timing covers the complete participant procedure", () => {
  assert.deepEqual(
    createFullSurveyTimingFields(
      "2026-01-01T10:00:00.000Z",
      "2026-01-01T10:42:15.321Z"
    ),
    {
      full_survey_started_at: "2026-01-01T10:00:00.000Z",
      full_survey_completed_at: "2026-01-01T10:42:15.321Z",
      full_survey_total_time_ms: 2535321,
      full_survey_total_time: "42:15.321",
    }
  );
});

test("Full survey timing does not calculate invalid intervals", () => {
  const fields = createFullSurveyTimingFields(
    "2026-01-01T10:00:00.000Z",
    "invalid"
  );

  assert.equal(fields.full_survey_total_time_ms, "");
  assert.equal(fields.full_survey_total_time, "");
});
