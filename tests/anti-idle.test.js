import test from "node:test";
import assert from "node:assert/strict";
import { AntiIdleTracker } from "../js/systems/AntiIdle.js";

test("warns after remaining in a small area", () => {
  const tracker = new AntiIdleTracker();
  let result = tracker.update(100, 100, 0.25);
  for (let i = 0; i < 30; i++) result = tracker.update(100, 100, 0.25);
  assert.equal(result.warning, false);
  result = tracker.update(100, 100, 0.25);
  assert.equal(result.warning, true);
});

test("applies a small penalty after the grace period and repeats it", () => {
  const tracker = new AntiIdleTracker();
  let damage = 0;
  for (let i = 0; i < 60; i++) damage += tracker.update(100, 100, 0.25).damage;
  assert.ok(damage >= 4);
});

test("movement resets idle warning and damage timers", () => {
  const tracker = new AntiIdleTracker();
  for (let i = 0; i < 40; i++) tracker.update(100, 100, 0.25);
  const result = tracker.update(130, 100, 0.25);
  assert.equal(result.idleSeconds, 0);
  assert.equal(result.damage, 0);
  assert.equal(result.warning, false);
});

test("ignores invalid snapshots and non-positive frame times", () => {
  const tracker = new AntiIdleTracker();
  assert.equal(tracker.update(Number.NaN, 0, 0.1).damage, 0);
  assert.equal(tracker.update(0, 0, 0).idleSeconds, 0);
});
