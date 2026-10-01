import test from "node:test";
import assert from "node:assert/strict";
import {
  hasMatchingTcleConsent,
  locationRequiresTcle,
  parseTcleConsent,
} from "../lib/tcleConsent.ts";

test("TCLE is required for every study location", () => {
  assert.equal(locationRequiresTcle("PUCPR"), true);
  assert.equal(locationRequiresTcle("UFBA"), true);
  assert.equal(locationRequiresTcle("NMSU"), true);
});

test("TCLE consent belongs to one participant and location", () => {
  const consent = parseTcleConsent(
    JSON.stringify({
      participantId: "PUCPR-123",
      location: "PUCPR",
      acceptedAt: "2026-09-09T12:00:00.000Z",
    })
  );

  assert.equal(hasMatchingTcleConsent(consent, "PUCPR-123", "PUCPR"), true);
  assert.equal(hasMatchingTcleConsent(consent, "PUCPR-456", "PUCPR"), false);
  assert.equal(hasMatchingTcleConsent(consent, "PUCPR-123", "UFBA"), false);
  assert.equal(parseTcleConsent("invalid-json"), null);
});
