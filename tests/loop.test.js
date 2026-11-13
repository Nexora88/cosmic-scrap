import test from "node:test";
import assert from "node:assert/strict";
import { Loop } from "../js/core/Loop.js";

function setup() {
  const previous = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, performance: globalThis.performance };
  const frames = [];
  const listeners = new Map();
  globalThis.document = { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  globalThis.requestAnimationFrame = fn => { frames.push(fn); return frames.length; };
  let now = 1000;
  globalThis.performance = { now: () => now };
  return { previous, frames, listeners, setNow: value => { now = value; } };
}
function restore(previous) {
  for (const key of ["document", "requestAnimationFrame", "performance"]) {
    if (previous[key] === undefined) delete globalThis[key]; else globalThis[key] = previous[key];
  }
}

test("one update per rendered frame prevents catch-up bursts", () => {
  const env = setup();
  try {
    const deltas = [];
    let renders = 0;
    const loop = new Loop(dt => deltas.push(dt), () => { renders += 1; });
    loop.start();
    env.frames.shift()(1050);
    assert.equal(deltas.length, 1);
    assert.ok(Math.abs(deltas[0] - 0.05) < 1e-9);
    assert.equal(renders, 1);
    loop.destroy();
  } finally { restore(env.previous); }
});

test("a long frame stall is clamped instead of running many simulation updates", () => {
  const env = setup();
  try {
    const deltas = [];
    const loop = new Loop(dt => deltas.push(dt));
    loop.start();
    env.frames.shift()(1300);
    assert.equal(deltas.length, 1);
    assert.ok(Math.abs(deltas[0] - 0.0667) < 1e-9);
    loop.destroy();
  } finally { restore(env.previous); }
});

test("hidden tabs resume without stale frames or duplicate loops", () => {
  const env = setup();
  try {
    let updates = 0;
    const loop = new Loop(() => { updates += 1; });
    loop.start();
    const stale = env.frames.shift();
    document.hidden = true;
    env.listeners.get("visibilitychange")();
    document.hidden = false;
    env.setNow(1100);
    env.listeners.get("visibilitychange")();
    const resumed = env.frames.shift();
    stale(1116);
    assert.equal(updates, 0);
    resumed(1117);
    assert.equal(updates, 1);
    assert.equal(env.frames.length, 1);
    loop.stop();
    loop.destroy();
  } finally { restore(env.previous); }
});

test("frame errors stop the loop and report the original error", () => {
  const env = setup();
  try {
    const failure = new Error("simulated frame fault");
    let reported = null;
    const loop = new Loop(() => { throw failure; }, null, error => { reported = error; });
    loop.start();
    env.frames.shift()(1017);
    assert.equal(loop.running, false);
    assert.equal(reported, failure);
    assert.equal(env.frames.length, 0);
    loop.destroy();
  } finally { restore(env.previous); }
});

test("slow rendering never triggers multiple updates in a single frame", () => {
  const env = setup();
  try {
    let updates = 0;
    const loop = new Loop(() => { updates += 1; });
    loop.start();
    for (let frame = 1; frame <= 5; frame++) env.frames.shift()(1000 + frame * 200);
    assert.equal(updates, 5);
    loop.destroy();
  } finally { restore(env.previous); }
});
