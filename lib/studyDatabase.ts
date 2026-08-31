import {
  Prisma,
  StudyLocation,
  SubmissionKind,
} from "@/generated/prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";

type JsonRecord = Record<string, unknown>;

type SaveSubmissionInput = {
  submissionId: string;
  participantId: string;
  location: string;
  kind: SubmissionKind;
  sessionNumber?: number;
  payload: JsonRecord;
  demographics?: JsonRecord;
  additionalDatasets?: Record<string, JsonRecord[]>;
};

const LOCATIONS = new Set<string>(Object.values(StudyLocation));

function asLocation(location: string): StudyLocation {
  const normalized = location.trim().toUpperCase();

  if (!LOCATIONS.has(normalized)) {
    throw new Error(`Unsupported study location: ${location}`);
  }

  return normalized as StudyLocation;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function collectDatasets(
  payload: JsonRecord,
  additionalDatasets: Record<string, JsonRecord[]> = {}
) {
  const datasets: Array<{
    dataset: string;
    rowIndex: number;
    data: JsonRecord;
  }> = [];

  for (const [dataset, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      value.forEach((row, rowIndex) => {
        if (isRecord(row)) datasets.push({ dataset, rowIndex, data: row });
      });
    } else if (dataset === "participantRow" && isRecord(value)) {
      datasets.push({ dataset: "participantRows", rowIndex: 0, data: value });
    }
  }

  for (const [dataset, rows] of Object.entries(additionalDatasets)) {
    rows.forEach((row, rowIndex) => {
      if (isRecord(row)) datasets.push({ dataset, rowIndex, data: row });
    });
  }

  return datasets;
}

export async function saveStudySubmission(input: SaveSubmissionInput) {
  if (!isDatabaseConfigured()) {
    return { enabled: false, duplicate: false, savedRows: 0 };
  }

  const prisma = getPrisma();
  const location = asLocation(input.location);
  const datasets = collectDatasets(input.payload, input.additionalDatasets);

  return prisma.$transaction(async (transaction) => {
    await transaction.participant.upsert({
      where: {
        id_location: {
          id: input.participantId,
          location,
        },
      },
      create: {
        id: input.participantId,
        location,
        demographics: input.demographics
          ? json(input.demographics)
          : undefined,
      },
      update: input.demographics
        ? { demographics: json(input.demographics) }
        : {},
    });

    const existing = await transaction.studySubmission.findUnique({
      where: {
        submissionId_location_kind_participantId: {
          submissionId: input.submissionId,
          location,
          kind: input.kind,
          participantId: input.participantId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return { enabled: true, duplicate: true, savedRows: 0 };
    }

    await transaction.studySubmission.create({
      data: {
        submissionId: input.submissionId,
        participantId: input.participantId,
        location,
        kind: input.kind,
        sessionNumber: input.sessionNumber,
        payload: json(input.payload),
        rows: {
          create: datasets.map((row) => ({
            participantId: input.participantId,
            location,
            kind: input.kind,
            sessionNumber: input.sessionNumber,
            dataset: row.dataset,
            rowIndex: row.rowIndex,
            data: json(row.data),
          })),
        },
      },
    });

    return {
      enabled: true,
      duplicate: false,
      savedRows: datasets.length,
    };
  });
}

export async function getLatestSessionPayload(
  participantId: string,
  location: string,
  sessionNumber: 1 | 2 | 3
): Promise<JsonRecord | null> {
  if (!isDatabaseConfigured()) return null;

  const kinds = {
    1: SubmissionKind.SESSION_1,
    2: SubmissionKind.SESSION_2,
    3: SubmissionKind.SESSION_3,
  } as const;

  const submission = await getPrisma().studySubmission.findFirst({
    where: {
      participantId,
      location: asLocation(location),
      kind: kinds[sessionNumber],
    },
    orderBy: { createdAt: "desc" },
    select: { payload: true },
  });

  return isRecord(submission?.payload) ? submission.payload : null;
}

export async function getLatestRankingRows(
  participantId: string,
  sessionNumber: 1 | 2,
  location?: string
) {
  if (!isDatabaseConfigured()) return [];

  const submission = await getPrisma().studySubmission.findFirst({
    where: {
      participantId,
      kind:
        sessionNumber === 1
          ? SubmissionKind.SESSION_1
          : SubmissionKind.SESSION_2,
      ...(location ? { location: asLocation(location) } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { payload: true },
  });

  if (!isRecord(submission?.payload)) return [];
  const rows = submission.payload.longRows;
  return Array.isArray(rows) ? rows.filter(isRecord) : [];
}

export { SubmissionKind };
