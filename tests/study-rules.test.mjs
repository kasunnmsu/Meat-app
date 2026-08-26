import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePrice,
  createPriceLevels,
  PRICE_CONDITIONS,
} from "../lib/pricing.ts";
import { seededShuffle } from "../lib/randomization.ts";
import {
  getLocationColor,
  getLocationConfig,
  getSession1Options,
  getSession2Options,
  STUDY_LOCATIONS,
} from "../lib/locations.ts";
import { getSealDefinitions } from "../lib/seals.ts";

test("Price increases are calculated with two decimal places", () => {
  assert.equal(calculatePrice(80, 5), 84);
  assert.equal(calculatePrice(85, 20), 102);
  assert.deepEqual(createPriceLevels(80), [
    { increasePercent: 5, price: 84 },
    { increasePercent: 10, price: 88 },
    { increasePercent: 20, price: 96 },
  ]);
});

test("The same participant seed always produces the same order", () => {
  const items = ["a", "b", "c", "d", "e"];
  const first = seededShuffle(items, "participant-1-session-1");
  const second = seededShuffle(items, "participant-1-session-1");

  assert.deepEqual(first, second);
  assert.deepEqual([...first].sort(), items);
  assert.deepEqual(items, ["a", "b", "c", "d", "e"]);
});

test("Location prices, colors and units keep the study contract", () => {
  assert.deepEqual(STUDY_LOCATIONS, ["PUCPR", "UFBA", "NMSU"]);
  assert.deepEqual(
    STUDY_LOCATIONS.map((location) => ({
      location,
      color: getLocationColor(location),
      basePrice: getLocationConfig(location).basePrice,
      currencyCode: getLocationConfig(location).currencyCode,
      unit: getLocationConfig(location).unit,
    })),
    [
      { location: "PUCPR", color: "#bb0b0b", basePrice: 85, currencyCode: "BRL", unit: "kg" },
      { location: "UFBA", color: "#1a7a3a", basePrice: 80, currencyCode: "BRL", unit: "kg" },
      { location: "NMSU", color: "#bb0b0b", basePrice: 20, currencyCode: "USD", unit: "lb" },
    ]
  );
});

test("PUCPR and UFBA option assets and colors remain unchanged", () => {
  for (const [location, cutImageUrl, sealColor, sealDirectory] of [
    ["PUCPR", "/images/cuts/13.png", "red", "pucpr"],
    ["UFBA", "/images/cuts/12.png", "green", "ufba"],
  ]) {
    const sessionOne = getSession1Options(location);
    const sessionTwo = getSession2Options(location);

    assert.deepEqual(sessionOne.map((option) => option.id), [
      "option-1",
      "option-2",
      "option-3",
      "option-4",
      "option-5",
    ]);
    assert.deepEqual(sessionTwo.map((option) => option.id), [
      "session-2-option-1",
      "session-2-option-2",
      "session-2-option-3",
      "session-2-option-4",
      "session-2-option-5",
    ]);

    for (const option of [...sessionOne, ...sessionTwo]) {
      assert.equal(option.cutImageUrl, cutImageUrl);
      assert.equal(option.sealColor, sealColor);
      assert.match(option.sealImageUrl, new RegExp(`/seals/${sealDirectory}/`));
    }
  }
});

test("Seal definitions keep IDs, translation keys and location assets", () => {
  assert.deepEqual(
    getSealDefinitions("PUCPR").map((seal) => [seal.id, seal.color, seal.imageUrl]),
    [
      ["red-1", "red", "/images/seals/pucpr/a.png"],
      ["red-2", "red", "/images/seals/pucpr/bea.png"],
      ["green-1", "red", "/images/seals/pucpr/cb.png"],
      ["green-2", "red", "/images/seals/pucpr/cc.png"],
      ["green-3", "red", "/images/seals/pucpr/o.png"],
    ]
  );

  assert.deepEqual(
    getSealDefinitions("UFBA").map((seal) => [seal.id, seal.color, seal.imageUrl]),
    [
      ["red-1", "green", "/images/seals/ufba/a.png"],
      ["red-2", "green", "/images/seals/ufba/bea.png"],
      ["green-1", "green", "/images/seals/ufba/cb.png"],
      ["green-2", "green", "/images/seals/ufba/cc.png"],
      ["green-3", "green", "/images/seals/ufba/o.png"],
    ]
  );
});

test("Session 3 price conditions preserve the three Latin-square assignments", () => {
  assert.deepEqual(
    PRICE_CONDITIONS.map((condition) => ({
      conditionId: condition.conditionId,
      increases: condition.prices.map((price) => price.priceIncreasePercent),
    })),
    [
      { conditionId: "3.1", increases: [20, 10, 5] },
      { conditionId: "3.2", increases: [5, 20, 10] },
      { conditionId: "3.3", increases: [10, 5, 20] },
    ]
  );
});
