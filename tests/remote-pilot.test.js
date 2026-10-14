import test from "node:test";
import assert from "node:assert/strict";
import { RemotePilot } from "../js/systems/RemotePilot.js";

test("remote pilot clamps normalized positions to the visible arena", () => {
  const pilot = new RemotePilot();
  assert.equal(pilot.receive({ xNorm: 1.4, yNorm: -0.2, username: "Pilot" }, 100), true);
  assert.deepEqual(pilot.update(800, 600, 110), { x: 800, y: 0, username: "Pilot", alpha: 1 });
});

test("remote pilot interpolates movement rather than jumping to each snapshot", () => {
  const pilot = new RemotePilot();
  pilot.receive({ xNorm: 0.2, yNorm: 0.3, username: "Rift" }, 100);
  pilot.receive({ xNorm: 0.8, yNorm: 0.7, username: "Rift" }, 120);
  const position = pilot.update(1000, 500, 130, 0.25);
  assert.ok(Math.abs(position.x - 350) < 1e-9);
  assert.ok(Math.abs(position.y - 200) < 1e-9);
});

test("remote pilot hides after a five-second disconnect/stale snapshot window", () => {
  const pilot = new RemotePilot();
  pilot.receive({ xNorm: 0.5, yNorm: 0.5 }, 100);
  assert.ok(pilot.update(800, 600, 5100));
  assert.equal(pilot.update(800, 600, 5101), null);
});

test("invalid snapshots do not replace a valid target", () => {
  const pilot = new RemotePilot();
  pilot.receive({ xNorm: 0.2, yNorm: 0.4 }, 100);
  assert.equal(pilot.receive({ xNorm: NaN, yNorm: 0.1 }, 110), false);
  assert.equal(pilot.update(100, 100, 120).x, 20);
});
