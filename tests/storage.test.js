import test from "node:test";
import assert from "node:assert/strict";
import { load, save, resetSave } from "../js/utils/Storage.js";

function withStorage(seed = {}, options = {}) {
  const values = new Map(Object.entries(seed));
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) {
      if (options.failWrites) throw new Error("storage quota exceeded");
      values.set(key, String(value));
    },
    removeItem(key) { values.delete(key); },
  };
  return {
    values,
    restore() {
      if (previousStorage === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = previousStorage;
    },
  };
}

test("progress, flags, achievements and selected cosmetics survive a save reload", () => {
  const env = withStorage();
  try {
    const progress = {
      bestScore: 4200,
      totalScrap: 850,
      scrapCore: 125,
      careerXp: 640,
      careerLevel: 4,
      totalKills: 92,
      runs: 11,
      selectedFlag: "🇹🇷",
      ownedFlags: ["🇹🇷", "🇯🇵"],
      achievements: ["first-run", "boss-defeated"],
      capturedRegions: ["debris", "rift"],
      meta: { health: 2, damage: 1, idle: 0, speed: 1, pickup: 0 },
    };

    save(progress);
    const restored = load();

    for (const key of [
      "bestScore", "totalScrap", "scrapCore", "careerXp", "careerLevel",
      "totalKills", "runs", "selectedFlag", "ownedFlags", "achievements",
      "capturedRegions",
    ]) assert.deepEqual(restored[key], progress[key], key);
    assert.deepEqual(restored.meta, progress.meta);
    assert.equal(restored.version, 2);
  } finally {
    env.restore();
  }
});

test("legacy v1 save migrates core currency without retaining the deprecated core balance", () => {
  const env = withStorage({
    "cosmic-scrap-save-v1": JSON.stringify({
      version: 1,
      core: 35,
      scrapCore: 15,
      selectedFlag: "🇹🇷",
      ownedFlags: ["🇹🇷"],
    }),
  });
  try {
    const restored = load();
    assert.equal(restored.version, 2);
    assert.equal(restored.scrapCore, 50);
    assert.equal(restored.core, 0);
    assert.deepEqual(restored.ownedFlags, ["🇹🇷"]);
  } finally {
    env.restore();
  }
});

test("corrupt save data falls back to a fresh safe profile", () => {
  const env = withStorage({ "cosmic-scrap-save-v2": "{not valid json" });
  try {
    const restored = load();
    assert.equal(restored.version, 2);
    assert.equal(restored.bestScore, 0);
    assert.equal(restored.careerLevel, 1);
    assert.deepEqual(restored.ownedFlags, []);
    assert.deepEqual(restored.achievements, []);
  } finally {
    env.restore();
  }
});

test("loaded progression collections are deduplicated and invalid region IDs are discarded", () => {
  const env = withStorage({
    "cosmic-scrap-save-v2": JSON.stringify({
      version: 2,
      ownedFlags: ["🇹🇷", "🇹🇷", 12, "TOO-LONG-FLAG-VALUE"],
      capturedRegions: ["debris", "unknown", "rift", "debris"],
      achievements: ["first-run", 12, null],
    }),
  });
  try {
    const restored = load();
    assert.deepEqual(restored.ownedFlags, ["🇹🇷"]);
    assert.deepEqual(restored.capturedRegions, ["debris", "rift"]);
    assert.deepEqual(restored.achievements, ["first-run"]);
  } finally {
    env.restore();
  }
});

test("storage write failures do not crash the active game", () => {
  const env = withStorage({}, { failWrites: true });
  try {
    assert.doesNotThrow(() => save({ bestScore: 100, ownedFlags: ["🇹🇷"] }));
    assert.doesNotThrow(() => resetSave());
  } finally {
    env.restore();
  }
});
