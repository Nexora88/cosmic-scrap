import test from "node:test";
import assert from "node:assert/strict";
import { createWorldState, isTileDefended, simulateOffline } from "../js/systems/FrontierMap.js";

test("expanded frontier is a 15x15 sector map with a centered home colony", () => {
  const state = createWorldState(1000);
  assert.equal(state.tiles.length, 225);
  assert.equal(state.selectedTile, 112);
  assert.equal(state.tiles[112].owner, "player");
  assert.equal(state.tiles[112].settlement, true);
  assert.ok(state.tiles[112].army >= 1);
});

test("army and tower defense data is present for visual command analytics", () => {
  const state = createWorldState(1000);
  assert.ok(state.tiles.every(tile => Number.isFinite(tile.army) && tile.army >= 0));
  state.tiles[112].tower = "pulse";
  assert.equal(isTileDefended(state, 112), true);
  assert.equal(isTileDefended(state, 113), true);
});

test("offline simulation advances resources and preserves expanded map size", () => {
  const state = createWorldState(1000);
  const before = state.resources;
  const next = simulateOffline(state, 15000);
  assert.equal(next.tiles.length, 225);
  assert.ok(next.resources > before);
  assert.equal(state.resources, before, "simulation must not mutate the input save");
});
