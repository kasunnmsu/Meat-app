import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateParticipantTopSeals,
  calculateTopSeals,
  FALLBACK_TOP_SEALS,
  SESSION_1_WEIGHT,
  SESSION_2_WEIGHT,
} from "../lib/topSeals.ts";

test("Browser choices are isolated by participant and collection location", () => {
  const sessionOneRows = [
    { participant_id: "P1", location: "PUCPR", seal_id: "green-3", selected_rank: 1 },
    { participant_id: "P2", location: "PUCPR", seal_id: "red-1", selected_rank: 1 },
    { participant_id: "P1", location: "UFBA", seal_id: "red-2", selected_rank: 1 },
  ];
  const sessionTwoRows = [
    { participant_id: "P1", location: "PUCPR", seal_id: "green-2", selected_rank: 1 },
    { participant_id: "P2", location: "PUCPR", seal_id: "red-2", selected_rank: 1 },
  ];

  const result = calculateParticipantTopSeals(
    sessionOneRows,
    sessionTwoRows,
    "P1",
    "PUCPR"
  );

  assert.deepEqual(result?.topSealIds.slice(0, 2), ["green-2", "green-3"]);
  assert.equal(Object.hasOwn(result?.weightedScores ?? {}, "red-1"), false);
  assert.equal(Object.hasOwn(result?.weightedScores ?? {}, "red-2"), false);
  assert.equal(
    calculateParticipantTopSeals(sessionOneRows, sessionTwoRows, "P3", "PUCPR"),
    null
  );
});

test("Top seals preserve weights, participant filtering and ranking order", () => {
  const result = calculateTopSeals(
    [
      { participant_id: "participant-1", seal_id: "red-1", selected_rank: 1 },
      { participant_id: "participant-1", seal_id: "green-1", selected_rank: 2 },
      { participant_id: "participant-2", seal_id: "green-3", selected_rank: 1 },
    ],
    [
      { participant_id: "participant-1", seal_id: "green-1", selected_rank: 1 },
      { participant_id: "participant-1", seal_id: "red-2", selected_rank: 2 },
      { participant_id: "participant-1", seal_id: "red-1", selected_rank: 5 },
      { participant_id: "participant-2", seal_id: "green-3", selected_rank: 1 },
    ],
    "participant-1"
  );

  assert.equal(SESSION_1_WEIGHT, 0.33);
  assert.equal(SESSION_2_WEIGHT, 0.67);
  assert.deepEqual(result.topSealIds, ["green-1", "red-2", "red-1"]);
  assert.deepEqual(result.weightedScores, {
    "green-1": 4.67,
    "red-2": 2.68,
    "red-1": 2.3200000000000003,
  });
  assert.equal(Object.hasOwn(result.weightedScores, "green-3"), false);
});

test("Top seals preserve the fixed fallback order when no scores exist", () => {
  assert.deepEqual(calculateTopSeals([], []).topSealIds, FALLBACK_TOP_SEALS);
});

test("Top seal ties prefer session 2 and then the seal identifier", () => {
  const sessionOneOnly = Array.from({ length: 67 }, () => ({
    seal_id: "red-2",
    selected_rank: 5,
  }));
  const sessionTwoOnly = Array.from({ length: 33 }, () => ({
    seal_id: "red-1",
    selected_rank: 5,
  }));

  assert.deepEqual(
    calculateTopSeals(sessionOneOnly, sessionTwoOnly).topSealIds.slice(0, 2),
    ["red-1", "red-2"]
  );

  assert.deepEqual(
    calculateTopSeals(
      [
        { seal_id: "red-2", selected_rank: 1 },
        { seal_id: "red-1", selected_rank: 1 },
      ],
      []
    ).topSealIds.slice(0, 2),
    ["red-1", "red-2"]
  );
});
