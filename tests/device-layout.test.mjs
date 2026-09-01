import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getAutomaticViewportProfile,
  isDeviceSettingsPinValid,
  normalizeDeviceLayoutProfile,
} from "../lib/deviceLayout.ts";

test("Device layout keeps the current tablet profile by default", () => {
  assert.equal(normalizeDeviceLayoutProfile(undefined), "current");
  assert.equal(normalizeDeviceLayoutProfile("current"), "current");
  assert.equal(normalizeDeviceLayoutProfile("invalid"), "current");
  assert.equal(normalizeDeviceLayoutProfile("automatic"), "automatic");
});

test("Automatic layout classifies phones, tablets and orientation", () => {
  assert.deepEqual(getAutomaticViewportProfile(390, 844), {
    size: "phone",
    orientation: "portrait",
  });
  assert.deepEqual(getAutomaticViewportProfile(820, 1180), {
    size: "compact-tablet",
    orientation: "portrait",
  });
  assert.deepEqual(getAutomaticViewportProfile(1180, 820), {
    size: "wide",
    orientation: "landscape",
  });
});

test("Device settings require the configured moderator PIN", () => {
  assert.equal(isDeviceSettingsPinValid("banana2"), true);
  assert.equal(isDeviceSettingsPinValid("Banana2"), false);
  assert.equal(isDeviceSettingsPinValid(""), false);
});

test("Automatic layout safely centers PUCPR without trapping tall content", () => {
  const css = fs.readFileSync(
    new URL("../app/automatic-layout.css", import.meta.url),
    "utf8"
  );
  const automaticPucprRule = css.match(
    /html\[data-layout-profile="automatic"\] \.location-pucpr \.study-shell\s*\{([^}]*)\}/
  );

  assert.ok(automaticPucprRule);
  assert.match(automaticPucprRule[1], /margin-top:\s*0;/);
  assert.match(automaticPucprRule[1], /display:\s*flex;/);
  assert.match(automaticPucprRule[1], /flex-direction:\s*column;/);
  assert.match(automaticPucprRule[1], /justify-content:\s*flex-start;/);
  assert.match(
    css,
    /\.location-pucpr \.study-shell > \*\s*\{[^}]*margin-block:\s*auto;/s
  );
});

test("Automatic layout keeps vertical touch scrolling enabled", () => {
  const css = fs.readFileSync(
    new URL("../app/automatic-layout.css", import.meta.url),
    "utf8"
  );
  const automaticDocumentRule = css.match(
    /html\[data-layout-profile="automatic"\],\s*html\[data-layout-profile="automatic"\] body\s*\{([^}]*)\}/
  );

  assert.ok(automaticDocumentRule);
  assert.match(automaticDocumentRule[1], /overflow-x:\s*hidden;/);
  assert.match(automaticDocumentRule[1], /overflow-y:\s*auto;/);
  assert.match(automaticDocumentRule[1], /touch-action:\s*pan-y pinch-zoom;/);
  assert.match(
    automaticDocumentRule[1],
    /-webkit-overflow-scrolling:\s*touch;/
  );
  assert.match(
    css,
    /@supports \(overflow:\s*clip\)[\s\S]*overflow-x:\s*clip;[\s\S]*overflow-y:\s*visible;/
  );
  assert.match(
    css,
    /\.study-page\s*\{[^}]*overflow-y:\s*visible;[^}]*touch-action:\s*pan-y pinch-zoom;/s
  );
});
