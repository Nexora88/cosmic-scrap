import test from "node:test";
import assert from "node:assert/strict";
import { createFrontierState, FRONTIER_MISSIONS, missionSucceeded, purchaseBuilding, rollLoot } from "../js/systems/FrontierCommand.js";

test("frontier missions define four distinct objective and difficulty profiles", () => {
  assert.deepEqual(FRONTIER_MISSIONS.map(mission => mission.id), ["resource", "elite", "debris", "boss"]);
  assert.equal(new Set(FRONTIER_MISSIONS.map(mission => mission.difficulty)).size, 4);
});

test("mission success validates run results rather than trusting a UI selection", () => {
  assert.equal(missionSucceeded("resource", { scrapCollected: 120 }), true);
  assert.equal(missionSucceeded("resource", { scrapCollected: 119 }), false);
  assert.equal(missionSucceeded("elite", { bossesDefeated: 0 }), false);
  assert.equal(missionSucceeded("elite", { bossesDefeated: 1 }), true);
  assert.equal(missionSucceeded("debris", { survivalSeconds: 74, kills: 20 }), false);
  assert.equal(missionSucceeded("debris", { survivalSeconds: 75, kills: 8 }), true);
  assert.equal(missionSucceeded("boss", { bossesDefeated: 1 }), true);
});

test("base structures spend resources and cannot be purchased when unaffordable", () => {
  const state = createFrontierState();
  assert.equal(purchaseBuilding(state, "turret"), true);
  assert.equal(state.resources, 40);
  assert.equal(state.buildings.turret, 1);
  assert.equal(purchaseBuilding(state, "shield"), false);
  assert.equal(state.resources, 40);
});

test("loot has common, rare, and legendary tiers with deterministic probability boundaries", () => {
  assert.equal(rollLoot(() => 0.8).rarity, "common");
  assert.equal(rollLoot(() => 0.2).rarity, "rare");
  assert.equal(rollLoot(() => 0.01).rarity, "legendary");
});

test("combat effects settings support reduced motion and disable camera shake", async () => {
  const game = await import("../js/core/Game.js");
  assert.equal(typeof game.Game, "function");
  const source = (await import("node:fs")).readFileSync(new URL("../js/core/Game.js", import.meta.url), "utf8");
  assert.match(source, /this\.effectsMode==="reduced"\|\|\(this\.effectsMode==="auto"&&hardwareLowEnd\)/);
  assert.match(source, /this\.screenShakeEnabled&&this\.shake>\.1/);
});
