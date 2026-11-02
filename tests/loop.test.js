import test from "node:test";
import assert from "node:assert/strict";
import { Loop } from "../js/core/Loop.js";

function makeLoop(canResume = true) {
  const listeners = new Map();
  globalThis.document = {
    hidden: false,
    addEventListener(name, handler) { listeners.set(name, handler); },
    removeEventListener(name) { listeners.delete(name); }
  };
  globalThis.requestAnimationFrame = () => 1;
  const loop = new Loop(() => {}, null, error => { throw error; });
  loop.canResume = () => canResume.value;
  return { loop, listeners, canResume };
}

test("a hidden tab resumes only when the run is still active and not manually paused", () => {
  const canResume = { value: true };
  const { loop, listeners } = makeLoop(canResume);
  loop.start();
  assert.equal(loop.running, true);

  document.hidden = true;
  listeners.get("visibilitychange")();
  assert.equal(loop.running, false);
  assert.equal(loop.resumeWhenVisible, true);

  canResume.value = false;
  document.hidden = false;
  listeners.get("visibilitychange")();
  assert.equal(loop.running, false);
  assert.equal(loop.resumeWhenVisible, false);
  loop.destroy();
});

test("an active run resumes after returning to a visible tab", () => {
  const canResume = { value: true };
  const { loop, listeners } = makeLoop(canResume);
  loop.start();
  document.hidden = true;
  listeners.get("visibilitychange")();
  document.hidden = false;
  listeners.get("visibilitychange")();
  assert.equal(loop.running, true);
  loop.destroy();
});
