import test from "node:test";
import assert from "node:assert/strict";
import {
  captureRegion, recordRaidWin, isFlagUnlocked, isSkinUnlocked,
  countryCodeForFlag, REGION_REWARDS, purchaseFlag, FLAG_UNLOCKS
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
  assert.equal(profile.capturedRegions.length, 7);
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


test("flags can be bought with banked Scrap Core and remain owned", () => {
  const profile = { careerLevel: 1, capturedRegions: [], raidWins: 0, scrapCore: 250, ownedFlags: [] };
  const first = purchaseFlag(profile, "🇺🇸");
  assert.equal(first.ok, true);
  assert.equal(profile.scrapCore, 150);
  assert.equal(isFlagUnlocked(profile, "🇺🇸"), true);
  const repeat = purchaseFlag(profile, "🇺🇸");
  assert.equal(repeat.reason, "owned");
  assert.equal(profile.scrapCore, 150);
});

test("flag purchases reject insufficient balance without changing progress", () => {
  const profile = { capturedRegions: [], raidWins: 0, scrapCore: 20, ownedFlags: [] };
  const result = purchaseFlag(profile, "🇨🇦");
  assert.equal(result.reason, "funds");
  assert.equal(result.cost, 400);
  assert.equal(profile.scrapCore, 20);
  assert.deepEqual(profile.ownedFlags, []);
});


test("the armory includes the full ISO country flag catalogue and rare custom banners", () => {
  assert.ok(FLAG_UNLOCKS.length >= 200);
  assert.equal(new Set(FLAG_UNLOCKS.map(item => item.flag)).size, FLAG_UNLOCKS.length);
  assert.ok(FLAG_UNLOCKS.some(item => item.countryCode === "TR" && item.label === "Türkiye"));
  assert.ok(FLAG_UNLOCKS.some(item => item.category === "special" && item.label === "Pirate Fleet"));
  assert.ok(FLAG_UNLOCKS.some(item => item.countryCode === "JP"));
});

test("rare banners are purchasable, persistent cosmetics rather than country identities", () => {
  const profile = { scrapCore: 5000, capturedRegions: [], raidWins: 0, ownedFlags: [] };
  const result = purchaseFlag(profile, "🏴‍☠️");
  assert.equal(result.ok, true);
  assert.ok(profile.ownedFlags.includes("🏴‍☠️"));
  assert.equal(isFlagUnlocked(profile, "🏴‍☠️"), true);
  assert.equal(countryCodeForFlag("🏴‍☠️"), "TR");
});
