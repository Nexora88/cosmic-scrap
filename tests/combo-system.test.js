import test from "node:test";
import assert from "node:assert/strict";
import { ComboSystem } from "../js/systems/ComboSystem.js";

test("combo multiplier keeps increasing beyond the old hard cap", () => {
  const combo = new ComboSystem();
  for (let i = 0; i < 52; i++) combo.kill();
  const at52 = combo.multiplier;
  for (let i = 0; i < 20; i++) combo.kill();
  assert.ok(combo.multiplier > at52);
  assert.equal(combo.count, 72);
  assert.equal(combo.max, 72);
});

test("combo progression is monotonic and uses softer growth after 40 kills", () => {
  const combo = new ComboSystem();
  for (let i = 0; i < 40; i++) combo.kill();
  const at40 = combo.multiplier;
  combo.kill();
  assert.ok(combo.multiplier > at40);
  assert.ok(combo.multiplier - at40 < 0.035);
});

test("combo timer resets the active streak without erasing the run record", () => {
  const combo = new ComboSystem();
  combo.kill();
  combo.kill();
  combo.update(4.1);
  assert.equal(combo.count, 0);
  assert.equal(combo.multiplier, 1);
  assert.equal(combo.max, 2);
});
