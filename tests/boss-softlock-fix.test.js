import test from "node:test";
import assert from "node:assert/strict";
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

test("void colossus has dedicated combat and toast paths", () => {
  assert.match(combat, /voidBoss=e\.type==="voidcolossus"/);
  assert.match(game, /voidcolossus.*VOID COLOSSUS/);
});
