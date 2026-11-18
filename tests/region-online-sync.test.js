import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const onlineHub = readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");

test("region captures remain local and do not emit client-trusted online score claims", () => {
  assert.match(main, /captureRegion\(profile,regionId\)/);
  assert.match(main, /cosmic-scrap:region-captured/);
  assert.doesNotMatch(main, /cosmic-scrap:submit-region-capture/);
  assert.doesNotMatch(onlineHub, /capture_pilot_region|award_country_galaxy_point/);
});

test("region leaderboards stay paused until server-side region validation exists", () => {
  assert.match(onlineHub, /async function loadRegionBoard/);
  assert.match(onlineHub, /copy\.casualPaused/);
  assert.doesNotMatch(onlineHub, /get_region_country_leaderboard|get_region_player_leaderboard/);
});
