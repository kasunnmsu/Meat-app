export type ResultRow = Record<string, string | number>;

function choiceName(row: ResultRow) {
  return String(row.subtitle || row.title || row.seal_id || "");
}

function participantRowsForExport(
  participantRow: ResultRow,
  longRows: ResultRow[]
) {
  const participantId = participantRow.participant_id;
  const matchingParticipant = longRows.filter(
    (row) => row.participant_id === participantId
  );
  const timestamp = participantRow.timestamp;
  const matchingSubmission = timestamp
    ? matchingParticipant.filter((row) => row.timestamp === timestamp)
    : [];

  return matchingSubmission.length > 0
    ? matchingSubmission
    : matchingParticipant;
}

function isTechnicalParticipantField(field: string, sessionNumber: number) {
  if (sessionNumber === 1 || sessionNumber === 2) {
    return (
      /^rank_\d+_(option_id|cut_id|seal_id|title)$/.test(field) ||
      ((sessionNumber === 1 || sessionNumber === 2) &&
        (/^rank_\d+_(screen_started_at|option_selected_at|purchase_confirmed_at|time_spent_before_choice_ms|time_spent_before_choice_seconds|time_taken_to_confirm_ms|time_taken_to_confirm_seconds|changed_preference_before_confirming|initial_selected_option_id|final_confirmed_option_id)$/.test(
          field
        ) ||
          field.endsWith("_ms") ||
          [
            "timestamp",
            "session_1_started_at",
            "first_moment_completed_at",
            "preselection_started_at",
            "preselection_completed_at",
            "session_1_completed_at",
            "ranking_flow_started_at",
            "ranking_flow_completed_at",
            "seal_reading_started_at",
            "session_2_started_at",
            "session_2_completed_at",
          ].includes(field)))
    );
  }

  return (
    /^screen_\d+_rank_\d+_(option_id|seal_id|title|subtitle)$/.test(
      field
    ) ||
    /^top_seal_\d+$/.test(field) ||
    field.endsWith("_ms") ||
    field.endsWith("_seconds") ||
    field.endsWith("_at") ||
    field.includes("changed_preference_before_confirming") ||
    field.includes("initial_selected_option_id") ||
    field.includes("final_confirmed_option_id")
  );
}

export function createAnalysisParticipantRows(
  participantRows: ResultRow[],
  longRows: ResultRow[],
  sessionNumber: number
) {
  return participantRows.map((participantRow) => {
    const rankingRows = participantRowsForExport(participantRow, longRows);
    const choiceFields: ResultRow = {};

    if (sessionNumber === 1 || sessionNumber === 2) {
      for (const row of rankingRows) {
        const rank = Number(row.selected_rank);

        if (Number.isInteger(rank)) {
          choiceFields[`rank_${rank}_choice`] = choiceName(row);
        }
      }
    } else {
      const sealNames = new Map(
        rankingRows.map((row) => [String(row.seal_id || ""), choiceName(row)])
      );

      for (const row of rankingRows) {
        const screen = Number(row.presentation_screen_number);
        const rank = Number(row.selected_rank);

        if (Number.isInteger(screen) && Number.isInteger(rank)) {
          choiceFields[`screen_${screen}_rank_${rank}_choice`] =
            choiceName(row);
        }
      }

      for (const position of [1, 2, 3]) {
        const sealId = String(participantRow[`top_seal_${position}`] || "");
        choiceFields[`top_choice_${position}`] =
          sealNames.get(sealId) || sealId;
      }
    }

    const output: ResultRow = {};

    for (const [field, value] of Object.entries(participantRow)) {
      if (isTechnicalParticipantField(field, sessionNumber)) {
        const rankMatch = field.match(/^(rank_\d+)_/);
        const screenRankMatch = field.match(/^(screen_\d+_rank_\d+)_/);
        const topSealMatch = field.match(/^top_seal_(\d+)$/);
        const replacementField = rankMatch
          ? `${rankMatch[1]}_choice`
          : screenRankMatch
            ? `${screenRankMatch[1]}_choice`
            : topSealMatch
              ? `top_choice_${topSealMatch[1]}`
              : "";

        if (replacementField && replacementField in choiceFields) {
          output[replacementField] = choiceFields[replacementField];
        }
        continue;
      }

      output[field] = value;
    }

    for (const [field, value] of Object.entries(choiceFields)) {
      if (!(field in output)) {
        output[field] = value;
      }
    }

    return output;
  });
}

export function createAnalysisLongRows(longRows: ResultRow[]) {
  const sealNames = new Map(
    longRows.map((row) => [String(row.seal_id || ""), choiceName(row)])
  );
  const technicalFields = new Set([
    "option_id",
    "cut_id",
    "seal_id",
    "title",
    "subtitle",
    "cut_image_url",
    "seal_image_url",
    "seal_color",
  ]);

  return longRows.map((row) => {
    const output: ResultRow = {};

    for (const [field, value] of Object.entries(row)) {
      if (technicalFields.has(field)) {
        continue;
      }

      if (
        [1, 2, 3].includes(Number(row.session_number)) &&
        (field.endsWith("_ms") ||
          field.endsWith("_seconds") ||
          field.endsWith("_at") ||
          field === "timestamp" ||
          field === "changed_preference_before_confirming" ||
          field === "initial_selected_option_id" ||
          field === "final_confirmed_option_id")
      ) {
        continue;
      }

      if (field === "top_three_seals_used") {
        const choices = String(value)
          .split(",")
          .map((sealId) => sealId.trim())
          .filter(Boolean)
          .map((sealId) => sealNames.get(sealId) || sealId);
        output.top_three_choices_used = choices.join(", ");
        continue;
      }

      output[field] = value;

      if (field === "selected_rank") {
        output.choice = choiceName(row);
      }
    }

    return output;
  });
}

export function createCodebookRows(longRows: ResultRow[]) {
  const uniqueRows = new Map<string, ResultRow>();

  for (const row of longRows) {
    const codebookRow: ResultRow = {
      location: row.location || "",
      session_number: row.session_number || "",
      option_id: row.option_id || "",
      cut_id: row.cut_id || "",
      seal_id: row.seal_id || "",
      cut_name: row.title || "",
      choice_name: choiceName(row),
      condition_id: row.condition_id || "",
      price: row.price || "",
      price_currency: row.price_currency || "",
      price_increase_percent: row.price_increase_percent || "",
    };
    const key = Object.values(codebookRow).join("|");
    uniqueRows.set(key, codebookRow);
  }

  return Array.from(uniqueRows.values());
}

export function createFullSurveyAnalysisRows(rows: ResultRow[]) {
  return rows.map((row) => {
    const output: ResultRow = {};

    for (const [field, value] of Object.entries(row)) {
      const isSessionOneOrTwoTechnical =
        /^s[12]_rank_\d+_(option_id|cut_id|seal_id|title)$/.test(field);
      const isSessionThreeTechnical =
        /^s3_screen_\d+_rank_\d+_(option_id|seal_id|title|subtitle)$/.test(
          field
        ) || /^s3_top_seal_\d+$/.test(field);
      const isSessionOneTimingTechnical =
        (/^s[12]_/.test(field) && field.endsWith("_ms")) ||
        /^s[12]_rank_\d+_(screen_started_at|option_selected_at|purchase_confirmed_at|time_spent_before_choice_seconds|time_taken_to_confirm_seconds|changed_preference_before_confirming|initial_selected_option_id|final_confirmed_option_id)$/.test(
          field
        ) ||
        [
          "s1_timestamp",
          "s1_session_1_started_at",
          "s1_first_moment_completed_at",
          "s1_preselection_started_at",
          "s1_preselection_completed_at",
          "s1_session_1_completed_at",
          "s2_timestamp",
          "s2_ranking_flow_started_at",
          "s2_ranking_flow_completed_at",
          "s2_seal_reading_started_at",
          "s2_session_2_started_at",
          "s2_session_2_completed_at",
        ].includes(field);
      const isSessionThreeTimingTechnical =
        (/^s3_/.test(field) &&
          (field.endsWith("_ms") ||
            field.endsWith("_seconds") ||
            field.endsWith("_at"))) ||
        field.includes("s3_screen_") &&
          (field.includes("changed_preference_before_confirming") ||
            field.includes("initial_selected_option_id") ||
            field.includes("final_confirmed_option_id"));
      const isFullSurveyTimingTechnical =
        field === "full_survey_started_at" ||
        field === "full_survey_completed_at" ||
        field === "full_survey_total_time_ms" ||
        field === "full_survey_saved_at";

      if (
        isSessionOneOrTwoTechnical ||
        isSessionThreeTechnical ||
        isSessionOneTimingTechnical ||
        isSessionThreeTimingTechnical ||
        isFullSurveyTimingTechnical
      ) {
        const rankMatch = field.match(/^(s[12]_rank_\d+)_/);
        const screenRankMatch = field.match(/^(s3_screen_\d+_rank_\d+)_/);
        const topSealMatch = field.match(/^s3_top_seal_(\d+)$/);
        const replacementField = rankMatch
          ? `${rankMatch[1]}_choice`
          : screenRankMatch
            ? `${screenRankMatch[1]}_choice`
            : topSealMatch
              ? `s3_top_choice_${topSealMatch[1]}`
              : "";

        if (replacementField && replacementField in row) {
          output[replacementField] = row[replacementField];
        }
        continue;
      }

      output[field] = value;
    }

    return output;
  });
}
