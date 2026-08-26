export type SubmissionTrackedStore = {
  processedSubmissionIds?: string[];
};

function createSubmissionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function attachSubmissionId(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const record = body as Record<string, unknown>;

  if (typeof record.submissionId === "string" && record.submissionId.trim()) {
    return body;
  }

  return {
    ...record,
    submissionId: createSubmissionId(),
  };
}

export function normalizeSubmissionId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 200) : "";
}

export function hasProcessedSubmission(
  store: SubmissionTrackedStore,
  submissionId: string
) {
  return Boolean(
    submissionId && store.processedSubmissionIds?.includes(submissionId)
  );
}

export function rememberSubmission(
  store: SubmissionTrackedStore,
  submissionId: string
) {
  if (!submissionId) return;

  store.processedSubmissionIds = [
    ...(store.processedSubmissionIds ?? []),
    submissionId,
  ];
}
