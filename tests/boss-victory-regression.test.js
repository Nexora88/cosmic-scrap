import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
const combat = await readFile(new URL("../js/systems/CombatSystem.js", import.meta.url), "utf8");

test("boss kill starts a short victory grace and clears existing hostile shots", () => {
  assert.match(game, /this\.bossKillGrace=3\.2;this\.enemyProjectiles\.length=0/);
});

test("rift fields damage enemies but never the player; other grace protections remain", () => {
  assert.match(game, /for\(const enemy of this\.enemies\)\{if\(enemy\.dead\|\|!riftEventDamageAt\(enemy\.x,enemy\.y,event\)\)continue;enemy\.health-=32/);
  const activeRift = game.slice(game.indexOf('else if(event.state==="active")'), game.indexOf("this.lowHealthClock-=dt"));
  assert.doesNotMatch(activeRift, /this\.player\.takeDamage|this\.endRun\("rift-surge"\)/);
  assert.match(game, /if\(outside&&this\.bossKillGrace<=0\)/);
  assert.match(game, /this\.bossKillGrace<=0&&Math\.hypot\(this\.player\.x-e\.x,this\.player\.y-e\.y\)<radius/);
});

test("victory grace protects against hostile projectiles and enemy contact", () => {
  assert.match(combat, /if\(g\.bossKillGrace>0\)continue/);
  assert.match(combat, /distance\(e,p\)<e\.size\+p\.size&&g\.bossKillGrace<=0/);
});

test("boss defeat is not wired to a run-ending callback", () => {
  const bossKill = game.slice(game.indexOf("if(isBossType(e.type))"), game.indexOf("if(!this.riftEchoActive", game.indexOf("if(isBossType(e.type))")));
  assert.doesNotMatch(bossKill, /endRun\(/);
});
