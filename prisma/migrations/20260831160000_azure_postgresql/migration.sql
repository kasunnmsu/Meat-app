-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StudyLocation" AS ENUM ('PUCPR', 'UFBA', 'NMSU');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('SESSION_1', 'SESSION_2', 'SESSION_3', 'FULL_SURVEY', 'CLICK_LOGS');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "location" "StudyLocation" NOT NULL,
    "demographics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id","location")
);

-- CreateTable
CREATE TABLE "StudySubmission" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "location" "StudyLocation" NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "sessionNumber" INTEGER,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyDataRow" (
    "id" BIGSERIAL NOT NULL,
    "submissionDbId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "location" "StudyLocation" NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "sessionNumber" INTEGER,
    "dataset" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyDataRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_location_idx" ON "Participant"("location");

-- CreateIndex
CREATE INDEX "StudySubmission_location_kind_createdAt_idx" ON "StudySubmission"("location", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "StudySubmission_participantId_location_sessionNumber_idx" ON "StudySubmission"("participantId", "location", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StudySubmission_submissionId_location_kind_participantId_key" ON "StudySubmission"("submissionId", "location", "kind", "participantId");

-- CreateIndex
CREATE INDEX "StudyDataRow_location_dataset_idx" ON "StudyDataRow"("location", "dataset");

-- CreateIndex
CREATE INDEX "StudyDataRow_participantId_location_sessionNumber_idx" ON "StudyDataRow"("participantId", "location", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StudyDataRow_submissionDbId_dataset_rowIndex_key" ON "StudyDataRow"("submissionDbId", "dataset", "rowIndex");

-- AddForeignKey
ALTER TABLE "StudySubmission" ADD CONSTRAINT "StudySubmission_participantId_location_fkey" FOREIGN KEY ("participantId", "location") REFERENCES "Participant"("id", "location") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDataRow" ADD CONSTRAINT "StudyDataRow_submissionDbId_fkey" FOREIGN KEY ("submissionDbId") REFERENCES "StudySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
