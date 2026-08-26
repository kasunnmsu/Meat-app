import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeFileAtomic, writeFileAtomicSync } from "../lib/atomicFile.ts";
import { withFileLock } from "../lib/fileLock.ts";
import {
  attachSubmissionId,
  hasProcessedSubmission,
  rememberSubmission,
} from "../lib/submissionId.ts";
import {
  getRelativeResultsDirectory,
  getRelativeResultsAreaDirectory,
  getResultsDirectory,
  getResultsAreaDirectory,
} from "../lib/dataPaths.ts";

test("Results are separated by location and survey category", () => {
  const root = path.join("workspace", "project");

  assert.equal(
    getResultsDirectory("PUCPR", "session-1", root),
    path.join(root, "data", "PUCPR", "session-1")
  );
  assert.equal(
    getResultsDirectory("UFBA", "full-survey", root),
    path.join(root, "data", "UFBA", "full-survey")
  );
  assert.equal(
    getRelativeResultsDirectory("UFBA", "click-logs"),
    "data/UFBA/click-logs"
  );
  assert.equal(
    getResultsAreaDirectory("PUCPR", "session-1", "technical", root),
    path.join(root, "data", "PUCPR", "session-1", "technical")
  );
  assert.equal(
    getRelativeResultsAreaDirectory("UFBA", "full-survey", "analysis"),
    "data/UFBA/full-survey/analysis"
  );
  assert.throws(() =>
    getResultsDirectory("../PUCPR", "session-1", root)
  );
});

test("A retry keeps the same submission protocol", () => {
  const firstAttempt = attachSubmissionId({ answer: 1 });
  const retry = attachSubmissionId(firstAttempt);

  assert.equal(retry.submissionId, firstAttempt.submissionId);

  const store = {};
  rememberSubmission(store, firstAttempt.submissionId);
  assert.equal(hasProcessedSubmission(store, retry.submissionId), true);
});

test("Atomic writes replace the complete file without temporary leftovers", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "meat-app-test-"));
  const filePath = path.join(directory, "results.json");

  try {
    writeFileAtomicSync(filePath, "first");
    await writeFileAtomic(filePath, "second");

    assert.equal(fs.readFileSync(filePath, "utf8"), "second");
    assert.deepEqual(
      fs.readdirSync(directory).filter((name) => name.endsWith(".tmp")),
      []
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("File lock serializes simultaneous saves", async () => {
  const order = [];
  let releaseFirst;
  const firstCanFinish = new Promise((resolve) => {
    releaseFirst = resolve;
  });

  const first = withFileLock("same-file", async () => {
    order.push("first-start");
    await firstCanFinish;
    order.push("first-end");
  });

  const second = withFileLock("same-file", async () => {
    order.push("second-start");
    order.push("second-end");
  });

  await Promise.resolve();
  releaseFirst();
  await Promise.all([first, second]);

  assert.deepEqual(order, [
    "first-start",
    "first-end",
    "second-start",
    "second-end",
  ]);
});
