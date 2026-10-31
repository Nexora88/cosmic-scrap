import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readFile } from "node:fs/promises";

const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
const level = await readFile(new URL("../js/ui/LevelUpScreen.js", import.meta.url), "utf8");
const combat = await readFile(new URL("../js/systems/CombatSystem.js", import.meta.url), "utf8");

test("empty upgrade pool never soft-locks the run after level-up", () => {
  assert.match(main, /if\(!choices\.length\)\{game\.player\.health/);
  assert.match(main, /game\.levelUpPending=false;return/);
  assert.match(level, /if \(!choices \|\| !choices\.length\)/);
});

test("boss kill recursion is depth-capped", () => {
  assert.match(game, /onKill\(e,depth=0\)/);
  assert.match(game, /if\(depth>12\)/);
  assert.match(game, /this\.onKill\(other,depth\+1\)/);
});

test("boss victory grace is at least 3 seconds and weakens nearby escorts", () => {
  assert.match(game, /this\.bossKillGrace=3\.2/);
  assert.match(game, /other\.health=Math\.min\(other\.health,Math\.max\(1,other\.maxHealth\*\.35\)\)/);
});

test("void colossus is registered and receives shared boss combat handling", () => {
  const encounters = fs.readFileSync(new URL("../js/systems/Encounters.js", import.meta.url), "utf8");
  assert.match(encounters, /BOSS_TYPES=Object\.freeze\(\[[^\]]*"voidcolossus"[^\]]*\]\)/);
  assert.match(encounters, /function isBossType\(type\)\{return BOSS_TYPES\.includes\(type\)\}/);
  assert.match(combat, /if\(isBossType\(e\.type\)\)/);
  assert.match(combat, /isBossType\(e\.type\)\)&&e\.shootCooldown<=0/);
  assert.match(game, /bossTypeForCycle\(this\.bossCycle\+\+\)/);
});
