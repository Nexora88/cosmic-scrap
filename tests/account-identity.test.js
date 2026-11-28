import test from "node:test";
import assert from "node:assert/strict";
import { normalizePilotName } from "../js/systems/AccountIdentity.js";

test("pilot names normalize Turkish letters into stable ASCII handles", () => {
  assert.equal(normalizePilotName("Işık ÇAĞLAR"), "IsikCAGLAR");
  assert.equal(normalizePilotName("İpek Öztürk"), "IpekOzturk");
});

test("pilot names remove unsupported characters and cap at twenty characters", () => {
  assert.equal(normalizePilotName("Pilot Name!_2026"), "PilotName_2026");
  assert.equal(normalizePilotName("abcdefghijklmnopqrstuv"), "abcdefghijklmnopqrst");
});

test("pilot name normalization safely handles missing and non-string input", () => {
  assert.equal(normalizePilotName(null), "");
  assert.equal(normalizePilotName(12345), "12345");
});
