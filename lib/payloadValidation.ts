type ValidationResult = {
  valid: boolean;
  error?: string;
};

const VALID_LOCATIONS = new Set(["PUCPR", "UFBA", "NMSU"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function invalid(error: string): ValidationResult {
  return { valid: false, error };
}

function valid(): ValidationResult {
  return { valid: true };
}

function isPositiveInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isTimestamp(value: unknown) {
  return Boolean(text(value)) && Number.isFinite(Date.parse(text(value)));
}

function timestampsAreOrdered(startedAt: unknown, completedAt: unknown) {
  return (
    isTimestamp(startedAt) &&
    isTimestamp(completedAt) &&
    Date.parse(text(completedAt)) >= Date.parse(text(startedAt))
  );
}

function isOptionalNonNegativeNumber(value: unknown) {
  return value === "" || isNonNegativeNumber(value);
}

function validateOptionalRows(
  rows: unknown,
  validateRow: (row: Record<string, unknown>) => boolean
) {
  if (rows === undefined) return true;
  return Array.isArray(rows) && rows.every((row) => isRecord(row) && validateRow(row));
}

function isSessionThreeTrackingRow(
  row: Record<string, unknown>,
  participantId: string,
  location: string
) {
  return (
    text(row.participant_id) === participantId &&
    text(row.location) === location &&
    Number(row.session_number) === 3 &&
    [1, 2, 3].includes(Number(row.presentation_screen_number)) &&
    Boolean(text(row.condition_id)) &&
    isTimestamp(row.timestamp)
  );
}

function validateSessionThreeTrackingRows(
  body: Record<string, unknown>,
  participantId: string,
  location: string
): ValidationResult {
  const common = (row: Record<string, unknown>) =>
    isSessionThreeTrackingRow(row, participantId, location);

  const validators: Array<[
    string,
    (row: Record<string, unknown>) => boolean,
  ]> = [
    [
      "decisionAttemptRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.attempt_number) &&
        isPositiveInteger(row.decision_number) &&
        Boolean(text(row.option_id)) &&
        Boolean(text(row.seal_id)) &&
        Boolean(text(row.choice_name)) &&
        timestampsAreOrdered(row.selected_at, row.resolved_at) &&
        ["Yes", "No"].includes(text(row.response)) &&
        isNonNegativeNumber(row.product_selection_time_ms) &&
        isNonNegativeNumber(row.confirmation_time_ms),
    ],
    [
      "sealInteractionRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.interaction_number) &&
        Boolean(text(row.option_id)) &&
        Boolean(text(row.seal_id)) &&
        Boolean(text(row.seal_name)) &&
        timestampsAreOrdered(row.opened_at, row.closed_at) &&
        isNonNegativeNumber(row.duration_ms) &&
        Boolean(text(row.duration)),
    ],
    [
      "preselectionReorderRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.reorder_number) &&
        Boolean(text(row.product_name)) &&
        Boolean(text(row.option_id)) &&
        Boolean(text(row.seal_id)) &&
        [1, 2, 3].includes(Number(row.from_rank)) &&
        [1, 2, 3].includes(Number(row.to_rank)) &&
        Number(row.from_rank) !== Number(row.to_rank) &&
        isTimestamp(row.moved_at) &&
        isNonNegativeNumber(row.time_since_preselection_started_ms),
    ],
    [
      "finalConfirmationRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.confirmation_number) &&
        Boolean(text(row.ranking_presented)) &&
        timestampsAreOrdered(row.started_at, row.responded_at) &&
        isNonNegativeNumber(row.duration_ms) &&
        Boolean(text(row.duration)) &&
        ["Yes", "No"].includes(text(row.response)),
    ],
    [
      "rankingRevisionRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.revision_number) &&
        Boolean(text(row.initial_rank)) &&
        Boolean(text(row.final_rank)) &&
        ["Yes", "No"].includes(text(row.rank_changed)) &&
        timestampsAreOrdered(row.started_at, row.completed_at) &&
        isNonNegativeNumber(row.total_time_ms) &&
        Boolean(text(row.total_time)) &&
        isNonNegativeInteger(row.reorder_count) &&
        isNonNegativeInteger(row.changed_products_count) &&
        isNonNegativeInteger(row.distinct_products_moved) &&
        isOptionalNonNegativeNumber(row.time_to_first_reorder_ms),
    ],
    [
      "revisionReorderRows",
      (row) =>
        common(row) &&
        isPositiveInteger(row.revision_number) &&
        isPositiveInteger(row.reorder_number) &&
        Boolean(text(row.product_name)) &&
        Boolean(text(row.option_id)) &&
        Boolean(text(row.seal_id)) &&
        [1, 2, 3].includes(Number(row.from_rank)) &&
        [1, 2, 3].includes(Number(row.to_rank)) &&
        Number(row.from_rank) !== Number(row.to_rank) &&
        isTimestamp(row.moved_at) &&
        isNonNegativeNumber(row.time_since_revision_started_ms),
    ],
  ];

  for (const [field, validateRow] of validators) {
    if (!validateOptionalRows(body[field], validateRow)) {
      return invalid(`Registros tecnicos invalidos em ${field}.`);
    }
  }

  return valid();
}

function validateEnvelope(body: unknown) {
  if (!isRecord(body)) return invalid("Formato de envio inválido.");
  if (!text(body.submissionId)) return invalid("Protocolo do envio ausente.");
  return valid();
}

function validateParticipantRow(
  row: unknown,
  expectedSession: number
): ValidationResult {
  if (!isRecord(row)) return invalid("Dados do participante ausentes.");

  const participantId = text(row.participant_id);
  const location = text(row.location);

  if (!participantId || participantId.length > 200) {
    return invalid("ID do participante inválido.");
  }

  if (!VALID_LOCATIONS.has(location)) {
    return invalid("Local da pesquisa inválido.");
  }

  if (Number(row.session_number) !== expectedSession) {
    return invalid("Número da etapa inválido.");
  }

  return valid();
}

function validateRankingRows(
  rows: unknown,
  expectedCount: number,
  expectedSession: number,
  participantId: string,
  expectedRanks: number[]
): ValidationResult {
  if (!Array.isArray(rows) || rows.length !== expectedCount) {
    return invalid(`A etapa precisa ter exatamente ${expectedCount} escolhas.`);
  }

  const optionIds = new Set<string>();
  const ranks = new Set<number>();

  for (const row of rows) {
    if (!isRecord(row)) return invalid("Escolha com formato inválido.");

    const optionId = text(row.option_id);
    const rank = Number(row.selected_rank);

    if (
      text(row.participant_id) !== participantId ||
      Number(row.session_number) !== expectedSession
    ) {
      return invalid("Escolha associada ao participante ou etapa incorreta.");
    }

    if (!optionId || optionIds.has(optionId)) {
      return invalid("Existem escolhas ausentes ou repetidas.");
    }

    if (!Number.isInteger(rank)) {
      return invalid("Posição de escolha inválida.");
    }

    optionIds.add(optionId);
    ranks.add(rank);
  }

  if (
    ranks.size !== expectedRanks.length ||
    expectedRanks.some((rank) => !ranks.has(rank))
  ) {
    return invalid("A ordem das escolhas está incompleta.");
  }

  return valid();
}

export function validateSessionOnePayload(body: unknown): ValidationResult {
  const envelope = validateEnvelope(body);
  if (!envelope.valid || !isRecord(body)) return envelope;

  const participant = validateParticipantRow(body.participantRow, 1);
  if (!participant.valid || !isRecord(body.participantRow)) return participant;

  return validateRankingRows(
    body.longRows,
    5,
    1,
    text(body.participantRow.participant_id),
    [1, 2, 3, 4, 5]
  );
}

export function validateSessionTwoPayload(body: unknown): ValidationResult {
  const envelope = validateEnvelope(body);
  if (!envelope.valid || !isRecord(body)) return envelope;

  const participant = validateParticipantRow(body.participantRow, 2);
  if (!participant.valid || !isRecord(body.participantRow)) return participant;

  const participantId = text(body.participantRow.participant_id);
  const ranking = validateRankingRows(
    body.longRows,
    5,
    2,
    participantId,
    [1, 2, 3, 4, 5]
  );

  if (!ranking.valid) return ranking;

  if (!Array.isArray(body.sealReadingRows) || body.sealReadingRows.length !== 5) {
    return invalid("As cinco descrições dos selos precisam ser lidas.");
  }

  const sealIds = new Set<string>();

  for (const row of body.sealReadingRows) {
    if (!isRecord(row) || text(row.participant_id) !== participantId) {
      return invalid("Leitura de selo inválida.");
    }

    const sealId = text(row.seal_id);
    if (!sealId || sealIds.has(sealId)) {
      return invalid("Existem leituras de selos ausentes ou repetidas.");
    }

    sealIds.add(sealId);
  }

  return valid();
}

export function validateSessionThreePayload(body: unknown): ValidationResult {
  const envelope = validateEnvelope(body);
  if (!envelope.valid || !isRecord(body)) return envelope;

  const participant = validateParticipantRow(body.participantRow, 3);
  if (!participant.valid || !isRecord(body.participantRow)) return participant;

  const participantId = text(body.participantRow.participant_id);
  const ranking = validateRankingRows(
    body.longRows,
    9,
    3,
    participantId,
    [1, 2, 3]
  );

  if (!ranking.valid || !Array.isArray(body.longRows)) return ranking;

  const screens = new Map<number, Set<number>>();

  for (const row of body.longRows) {
    if (!isRecord(row)) return invalid("Escolha com formato inválido.");

    const screen = Number(row.presentation_screen_number);
    const rank = Number(row.selected_rank);

    if (![1, 2, 3].includes(screen)) {
      return invalid("Tela de preços inválida.");
    }

    const screenRanks = screens.get(screen) ?? new Set<number>();
    screenRanks.add(rank);
    screens.set(screen, screenRanks);
  }

  for (const screen of [1, 2, 3]) {
    const screenRanks = screens.get(screen);
    if (
      !screenRanks ||
      screenRanks.size !== 3 ||
      [1, 2, 3].some((rank) => !screenRanks.has(rank))
    ) {
      return invalid("Cada tela de preços precisa ter três escolhas completas.");
    }
  }

  return validateSessionThreeTrackingRows(
    body,
    participantId,
    text(body.participantRow.location)
  );
}

export function validateFullSurveyPayload(body: unknown): ValidationResult {
  const envelope = validateEnvelope(body);
  if (!envelope.valid || !isRecord(body)) return envelope;

  if (!text(body.participantId) || text(body.participantId).length > 200) {
    return invalid("ID do participante inválido.");
  }

  if (!VALID_LOCATIONS.has(text(body.location))) {
    return invalid("Local da pesquisa inválido.");
  }

  if (!isRecord(body.demographics)) {
    return invalid("Questionário sociodemográfico ausente.");
  }

  const requiredFields = ["gender", "ageGroup", "educationLevel", "incomeGroup"];

  if (requiredFields.some((field) => !text(body.demographics?.[field]))) {
    return invalid("Questionário sociodemográfico incompleto.");
  }

  const surveyStartedAt = text(body.surveyStartedAt);
  const surveyCompletedAt = text(body.surveyCompletedAt);

  if (
    (body.surveyStartedAt !== undefined &&
      !Number.isFinite(Date.parse(surveyStartedAt))) ||
    (body.surveyCompletedAt !== undefined &&
      !Number.isFinite(Date.parse(surveyCompletedAt)))
  ) {
    return invalid("Tempos do procedimento completo inválidos.");
  }

  if (
    surveyStartedAt &&
    surveyCompletedAt &&
    Date.parse(surveyCompletedAt) < Date.parse(surveyStartedAt)
  ) {
    return invalid("O término do procedimento não pode anteceder o início.");
  }

  return valid();
}

export function validateClickLogsPayload(body: unknown): ValidationResult {
  const envelope = validateEnvelope(body);
  if (!envelope.valid || !isRecord(body)) return envelope;

  if (!Array.isArray(body.clickRows) || body.clickRows.length === 0) {
    return invalid("Nenhum registro de clique recebido.");
  }

  for (const row of body.clickRows) {
    if (
      !isRecord(row) ||
      !text(row.participant_id) ||
      !VALID_LOCATIONS.has(text(row.location)) ||
      ![1, 2, 3].includes(Number(row.session_number)) ||
      !text(row.event_type) ||
      !text(row.clicked_at)
    ) {
      return invalid("Registro de clique inválido.");
    }
  }

  return valid();
}

export function isCompleteRanking(
  ranking: Array<{ id?: string }> | undefined,
  expectedCount: number
) {
  if (!Array.isArray(ranking) || ranking.length !== expectedCount) return false;

  const ids = ranking.map((option) => option?.id?.trim()).filter(Boolean);
  return ids.length === expectedCount && new Set(ids).size === expectedCount;
}
