const SURVEY_DRAFT_PREFIX = "beef-choice-survey-draft-v1:";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

type SurveyDraftEnvelope<T> = {
  version: 1;
  participantId: string;
  location: string;
  savedAt: string;
  data: T;
};

function browserStorage(): DraftStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getSurveyDraftKey(section: string) {
  return `${SURVEY_DRAFT_PREFIX}${section}`;
}

export function saveSurveyDraft<T>(
  section: string,
  participantId: string,
  location: string,
  data: T,
  storage: DraftStorage | null = browserStorage()
) {
  if (!storage || !participantId) return false;

  const envelope: SurveyDraftEnvelope<T> = {
    version: 1,
    participantId,
    location,
    savedAt: new Date().toISOString(),
    data,
  };

  try {
    storage.setItem(getSurveyDraftKey(section), JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function loadSurveyDraft<T>(
  section: string,
  participantId: string,
  location: string,
  storage: DraftStorage | null = browserStorage()
): T | null {
  if (!storage || !participantId) return null;

  try {
    const rawDraft = storage.getItem(getSurveyDraftKey(section));
    if (!rawDraft) return null;

    const envelope = JSON.parse(rawDraft) as Partial<SurveyDraftEnvelope<T>>;
    if (
      envelope.version !== 1 ||
      envelope.participantId !== participantId ||
      envelope.location !== location ||
      envelope.data === undefined
    ) {
      return null;
    }

    return envelope.data;
  } catch {
    return null;
  }
}

export function clearSurveyDraft(
  section: string,
  storage: DraftStorage | null = browserStorage()
) {
  if (!storage) return;

  try {
    storage.removeItem(getSurveyDraftKey(section));
  } catch {
    // A temporary draft must never interrupt the survey flow.
  }
}

export function clearAllSurveyDrafts(
  storage: DraftStorage | null = browserStorage()
) {
  if (!storage) return;

  try {
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(SURVEY_DRAFT_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // A temporary draft must never interrupt creation of a new participant.
  }
}
