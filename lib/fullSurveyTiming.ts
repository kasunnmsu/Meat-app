function formatElapsedTime(milliseconds: number) {
  const totalMilliseconds = Math.max(0, Math.round(milliseconds));
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const millisecondsPart = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millisecondsPart).padStart(3, "0")}`;
}

export function createFullSurveyTimingFields(
  startedAt: unknown,
  completedAt: unknown
) {
  const normalizedStartedAt =
    typeof startedAt === "string" ? startedAt.trim() : "";
  const normalizedCompletedAt =
    typeof completedAt === "string" ? completedAt.trim() : "";
  const startedAtMs = Date.parse(normalizedStartedAt);
  const completedAtMs = Date.parse(normalizedCompletedAt);

  if (
    !Number.isFinite(startedAtMs) ||
    !Number.isFinite(completedAtMs) ||
    completedAtMs < startedAtMs
  ) {
    return {
      full_survey_started_at: normalizedStartedAt,
      full_survey_completed_at: normalizedCompletedAt,
      full_survey_total_time_ms: "",
      full_survey_total_time: "",
    };
  }

  const totalTimeMs = completedAtMs - startedAtMs;

  return {
    full_survey_started_at: normalizedStartedAt,
    full_survey_completed_at: normalizedCompletedAt,
    full_survey_total_time_ms: totalTimeMs,
    full_survey_total_time: formatElapsedTime(totalTimeMs),
  };
}
