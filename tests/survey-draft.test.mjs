import assert from "node:assert/strict";
import test from "node:test";
import {
  clearAllSurveyDrafts,
  getSurveyDraftKey,
  loadSurveyDraft,
  saveSurveyDraft,
} from "../lib/surveyDraft.ts";

function createMemoryStorage() {
  const values = new Map();
  return {
    get length() {
      return values.size;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
  };
}

test("Temporary survey progress is restored only for the same participant and location", () => {
  const storage = createMemoryStorage();
  const progress = { step: "ranking", choices: ["green-1"] };

  assert.equal(saveSurveyDraft("session-1", "P001", "PUCPR", progress, storage), true);
  assert.deepEqual(loadSurveyDraft("session-1", "P001", "PUCPR", storage), progress);
  assert.equal(loadSurveyDraft("session-1", "P002", "PUCPR", storage), null);
  assert.equal(loadSurveyDraft("session-1", "P001", "UFBA", storage), null);
});

test("Starting a new participant removes every temporary survey draft", () => {
  const storage = createMemoryStorage();
  storage.setItem(getSurveyDraftKey("session-1"), "draft one");
  storage.setItem(getSurveyDraftKey("session-2"), "draft two");
  storage.setItem("unrelated-setting", "keep me");

  clearAllSurveyDrafts(storage);

  assert.equal(storage.getItem(getSurveyDraftKey("session-1")), null);
  assert.equal(storage.getItem(getSurveyDraftKey("session-2")), null);
  assert.equal(storage.getItem("unrelated-setting"), "keep me");
});
