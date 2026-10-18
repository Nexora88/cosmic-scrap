import test from "node:test";
import assert from "node:assert/strict";
import { createWorldState, isTileDefended, simulateOffline } from "../js/systems/FrontierMap.js";

test("expanded frontier is a 9x9 sector map with a centered home colony", () => {
  const state = createWorldState(1000);
  assert.equal(state.tiles.length, 81);
  assert.equal(state.selectedTile, 40);
  assert.equal(state.tiles[40].owner, "player");
  assert.equal(state.tiles[40].settlement, true);
  assert.ok(state.tiles[40].army >= 1);
});

test("army and tower defense data is present for visual command analytics", () => {
  const state = createWorldState(1000);
  assert.ok(state.tiles.every(tile => Number.isFinite(tile.army) && tile.army >= 0));
  state.tiles[40].tower = "pulse";
  assert.equal(isTileDefended(state, 40), true);
  assert.equal(isTileDefended(state, 41), true);
});

test("offline simulation advances resources and preserves expanded map size", () => {
  const state = createWorldState(1000);
  const before = state.resources;
  const next = simulateOffline(state, 15000);
  assert.equal(next.tiles.length, 81);
  assert.ok(next.resources > before);
  assert.equal(state.resources, before, "simulation must not mutate the input save");
});
