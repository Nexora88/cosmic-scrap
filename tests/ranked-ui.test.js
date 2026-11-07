import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const online = fs.readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/hangar-redesign.css", import.meta.url), "utf8");

test("competitive board exposes four scopes and server-ranked season data", () => {
  for (const scope of ["global", "turkey", "friends", "season"]) assert.match(online, new RegExp('"' + scope + '"'));
  assert.match(online, /get_ranked_leaderboard/);
  assert.match(online, /get_friends_leaderboard/);
  assert.match(online, /countryFlag\(record\.country_code\)/);
  assert.match(online, /leader-podium-card/);
  assert.match(css, /leader-podium-card\.podium-1/);
});

test("ranked duel uses the trusted server simulation and does not submit client ratings", () => {
  assert.match(online, /functions\.invoke\("online-match"/);
  assert.match(online, /ranked_join/);
  assert.match(online, /ranked_tick/);
  assert.match(online, /ranked_cancel/);
  assert.match(online, /ranked_duel_matches/);
  assert.doesNotMatch(online, /update\(\{[^}]*rating:/);
  assert.match(css, /ranked-arena-canvas/);
});
