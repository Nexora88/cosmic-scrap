import test from "node:test";
import assert from "node:assert/strict";
import {
  captureRegion, recordRaidWin, isFlagUnlocked, isSkinUnlocked,
  countryCodeForFlag, REGION_REWARDS
} from "../js/systems/RegionProgress.js";

test("a boss-cleared region grants its flag once", () => {
  const profile = { capturedRegions: [] };
  const reward = captureRegion(profile, "debris");
  assert.equal(reward.flag, "🇺🇸");
  assert.deepEqual(profile.capturedRegions, ["debris"]);
  assert.equal(captureRegion(profile, "debris"), null);
  assert.equal(profile.capturedRegions.length, 1);
});

test("region rewards reject unknown sectors and preserve the five-sector route", () => {
  const profile = { capturedRegions: [] };
  assert.equal(captureRegion(profile, "not-a-region"), null);
  for (const region of REGION_REWARDS) captureRegion(profile, region.id);
  assert.equal(profile.capturedRegions.length, 5);
  assert.equal(isFlagUnlocked(profile, "🇧🇷"), true);
});

test("flags and special pilot skins unlock from region and raid progress", () => {
  const profile = { careerLevel: 1, capturedRegions: [], raidWins: 0 };
  assert.equal(isFlagUnlocked(profile, "🇹🇷"), true);
  assert.equal(isFlagUnlocked(profile, "🇺🇸"), false);
  assert.equal(isSkinUnlocked(profile, "red"), false);
  assert.equal(isSkinUnlocked(profile, "gold"), false);
  captureRegion(profile, "debris");
  captureRegion(profile, "ember");
  captureRegion(profile, "cryo");
  assert.equal(isFlagUnlocked(profile, "🇩🇪"), true);
  assert.equal(isSkinUnlocked(profile, "red"), true);
  assert.equal(recordRaidWin(profile), 1);
  assert.equal(recordRaidWin(profile), 2);
  assert.equal(isFlagUnlocked(profile, "🇫🇷"), true);
  assert.equal(recordRaidWin(profile), 3);
  assert.equal(isFlagUnlocked(profile, "🇮🇳"), true);
  assert.equal(isSkinUnlocked(profile, "gold"), true);
});

test("country flag selection maps to the correct ISO code", () => {
  assert.equal(countryCodeForFlag("🇹🇷"), "TR");
  assert.equal(countryCodeForFlag("🇬🇧"), "GB");
  assert.equal(countryCodeForFlag("unknown"), "TR");
});
