import test from "node:test";
import assert from "node:assert/strict";
import { createWorldState, isTileDefended, simulateOffline, towerRange } from "../js/systems/FrontierMap.js";

test("world starts with a personal colony and a nearby settlement", () => {
  const state = createWorldState(1000);
  assert.equal(state.tiles.length, 25);
  assert.equal(state.tiles[12].owner, "player");
  assert.equal(state.tiles[12].settlement, true);
  assert.equal(state.tiles[13].settlement, true);
  assert.equal(state.tiles[13].name, "Yakın Yerleşim");
});

test("tower types expose different defensive ranges and defend nearby tiles", () => {
  const state = createWorldState();
  assert.equal(towerRange("pulse"), 2);
  assert.equal(towerRange("rail"), 3);
  state.tiles[12].tower = "rail";
  assert.equal(isTileDefended(state, 7), true);
  assert.equal(isTileDefended(state, 2), false);
});

test("offline simulation accumulates resources and population without running a browser", () => {
  const state = createWorldState(1000);
  const next = simulateOffline(state, 15000);
  assert.ok(next.resources > state.resources);
  assert.equal(next.tiles[12].population, 25);
  assert.ok(next.lastSimulatedAt >= 1000);
});

test("alliances and territory records are persisted as world-state fields", () => {
  const state = createWorldState();
  state.alliances.push("scrapborn");
  state.tiles[12].tower = "pulse";
  assert.deepEqual(state.alliances, ["scrapborn"]);
  assert.equal(state.tiles[12].tower, "pulse");
});
