import test from "node:test";
import assert from "node:assert/strict";
import { getRegion, getGalaxyProgress, REGIONS } from "../js/systems/Regions.js";
import { galaxyScalingAt, healthScaleAt, speedScaleAt, damageScaleAt } from "../js/systems/Balance.js";
import { UPGRADES } from "../js/config.js";
import { applyUpgradeChoice } from "../js/systems/UpgradeEffects.js";
import { readFileSync } from "node:fs";

test("the seven sectors roll into a new galaxy instead of stopping at sector seven", () => {
  assert.equal(REGIONS.length, 7);
  assert.deepEqual(getGalaxyProgress(6 * 210, 6), { cleared: 6, galaxy: 1, sector: 7, cycle: 0 });
  assert.deepEqual(getGalaxyProgress(7 * 210, 7), { cleared: 7, galaxy: 2, sector: 1, cycle: 1 });
  assert.equal(getRegion(8 * 210, 8).id, "ember");
  assert.equal(getRegion(8 * 210, 8).galaxy, 2);
  assert.equal(getRegion(8 * 210, 8).sector, 2);
});

test("enemy health, speed and damage continue scaling on later galaxy cycles", () => {
  const first = galaxyScalingAt(0);
  const second = galaxyScalingAt(7 * 210);
  const third = galaxyScalingAt(14 * 210);
  assert.equal(first.cycle, 0);
  assert.equal(second.cycle, 1);
  assert.equal(third.cycle, 2);
  assert.ok(healthScaleAt(7 * 210) > healthScaleAt(0));
  assert.ok(speedScaleAt(7 * 210) > speedScaleAt(0));
  assert.ok(damageScaleAt(7 * 210) > damageScaleAt(0));
  assert.ok(healthScaleAt(14 * 210) > healthScaleAt(7 * 210));
});

test("Singularity Overclock stacks and strengthens the pilot on repeated selections", () => {
  const overclock = UPGRADES.find(item => item.id === "overclock");
  assert.ok(overclock);
  const pilot = { damage: 100, speed: 250, maxHealth: 100, health: 50, overclockRank: 0 };
  assert.equal(applyUpgradeChoice(pilot, overclock, "common"), true);
  const first = { ...pilot };
  assert.equal(applyUpgradeChoice(pilot, overclock, "common"), true);
  assert.equal(pilot.overclockRank, 2);
  assert.ok(pilot.damage > first.damage);
  assert.ok(pilot.speed > first.speed);
  assert.ok(pilot.maxHealth > first.maxHealth);
  assert.ok(pilot.health > first.health);
});

test("settings expose English, Turkish and Brazilian Portuguese with flag labels", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const language = readFileSync(new URL("../js/language.js", import.meta.url), "utf8");
  assert.match(html, /id="setting-language"/);
  assert.match(html, /🇺🇸 English/);
  assert.match(html, /🇹🇷 Türkçe/);
  assert.match(html, /🇧🇷 Português \(Brasil\)/);
  assert.match(language, /translations\["pt-BR"\]/);
  assert.match(language, /cosmic-scrap-language/);
});
