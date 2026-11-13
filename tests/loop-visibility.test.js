import test from "node:test";
import assert from "node:assert/strict";
import { Loop } from "../js/core/Loop.js";

test("visibility resume invalidates stale animation frames instead of starting a second loop", () => {
  const previous = {
    document: globalThis.document,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  let hidden = false;
  const listeners = new Map();
  const frames = [];
  let now = 1000;
  let updates = 0;
  globalThis.document = {
    get hidden() { return hidden; },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name)
  };
  globalThis.requestAnimationFrame = fn => { frames.push(fn); return frames.length; };
  globalThis.performance = { now: () => now };
  try {
    const loop = new Loop(() => { updates += 1; });
    loop.start();
    const staleFrame = frames.shift();
    hidden = true;
    listeners.get("visibilitychange")();
    hidden = false;
    now += 16;
    listeners.get("visibilitychange")();
    const resumedFrame = frames.shift();
    staleFrame(1016);
    assert.equal(updates, 0, "stale frame from the old run must be ignored");
    resumedFrame(1032);
    assert.equal(updates, 1, "only the resumed loop may update the game");
    assert.equal(frames.length, 1, "exactly one next frame should be scheduled");
    loop.stop();
    assert.equal(loop.resumeWhenVisible, false, "manual stop must cancel auto-resume");
    loop.destroy();
  } finally {
    if (previous.document === undefined) delete globalThis.document; else globalThis.document = previous.document;
    if (previous.requestAnimationFrame === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    if (previous.performance === undefined) delete globalThis.performance; else globalThis.performance = previous.performance;
  }
});

test("a frame error stops cleanly and reports the original error", () => {
  const previous = {
    document: globalThis.document,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  const listeners = new Map();
  const frames = [];
  const failure = new Error("simulated frame fault");
  let reported = null;
  globalThis.document = { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  globalThis.requestAnimationFrame = fn => { frames.push(fn); };
  globalThis.performance = { now: () => 1000 };
  try {
    const loop = new Loop(() => { throw failure; }, null, error => { reported = error; });
    loop.start();
    frames.shift()(1016);
    assert.equal(loop.running, false);
    assert.equal(reported, failure);
    assert.equal(frames.length, 0);
    loop.destroy();
  } finally {
    if (previous.document === undefined) delete globalThis.document; else globalThis.document = previous.document;
    if (previous.requestAnimationFrame === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    if (previous.performance === undefined) delete globalThis.performance; else globalThis.performance = previous.performance;
  }
});
