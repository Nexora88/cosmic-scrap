import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const combat = await readFile(new URL("../js/systems/CombatSystem.js", import.meta.url), "utf8");
const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
const spawn = await readFile(new URL("../js/systems/SpawnSystem.js", import.meta.url), "utf8");

test("friendly hits resolve before hostile bullets can end the same frame", () => {
  const friendlyCleanup = combat.indexOf("g.projectiles=g.projectiles.filter");
  const hostileLoop = combat.indexOf("for(const b of g.enemyProjectiles)");
  const enemyContact = combat.indexOf("distance(e,p)<e.size+p.size");
  assert.notEqual(friendlyCleanup, -1);
  assert.ok(hostileLoop > friendlyCleanup, "hostile shots must be checked after player hits");
  assert.ok(enemyContact > hostileLoop, "enemy contact remains after projectile resolution");
});

test("boss kill clears hostile bullets and starts victory grace", () => {
  const bossKill = game.indexOf("if(isBossType(e.type)){this.bossKillGrace=2.25;this.enemyProjectiles.length=0");
  assert.notEqual(bossKill, -1);
  assert.ok(bossKill < game.indexOf("endRun(reason="));
});

test("arena background uses lightweight 2D color drift and star twinkle", () => {
  assert.match(game, /createRadialGradient/);
  assert.match(game, /Math\.sin\(this\.elapsed\*s\.rate\+s\.phase\)/);
  assert.doesNotMatch(game, /WebGLRenderer|THREE\.WebGLRenderer/);
});

test("enemy pressure increases modestly after the opening", () => {
  assert.match(spawn, /spawnIntervalAt\(t\)\*\(t<25\?1:\.90\)/);
});


test("lethal damage is adjudicated after combat so a same-frame boss kill wins", () => {
  assert.match(game, /this\._updating=true;this\._bossesDefeatedAtFrameStart=this\.bossesDefeated/);
  assert.match(game, /if\(this\._pendingDeathReason\).*this\.bossesDefeated>this\._bossesDefeatedAtFrameStart/s);
  assert.match(game, /endRun\(reason="unknown"\)\{if\(!this\.running\)return;if\(this\._updating\)\{this\._pendingDeathReason=this\._pendingDeathReason\|\|reason;return\}/);
  assert.match(game, /this\.player\.health=Math\.max\(1,this\.player\.health\)/);
});

test("mobile movement joystick is on the right for right-handed play", async () => {
  const ui = await readFile(new URL("../css/ui.css", import.meta.url), "utf8");
  assert.match(ui, /#joystick\{[^}]*left:auto;right:22px/s);
});

test("XP collection is boosted and combat visuals use a stronger red palette", async () => {
  const projectile = await readFile(new URL("../js/entities/Projectile.js", import.meta.url), "utf8");
  assert.match(game, /this\.xp\+=o\.value\*this\.combo\.multiplier\*2/);
  assert.match(game, /redPhase=this\.bossActive\|\|this\.stormActive/);
  assert.match(projectile, /"#ff3d5a"/);
});


test("mobile joystick final override stays on the right edge", async () => {
  const ui = await readFile(new URL("../css/ui.css", import.meta.url), "utf8");
  assert.match(ui, /left:auto;right:16px/);
});

test("lethal hit does not abort the combat frame before a same-frame boss kill", () => {
  assert.doesNotMatch(combat, /g\.endRun\("ranged-hit"\);return/);
  assert.doesNotMatch(combat, /g\.endRun\("enemy-contact"\);return/);
  assert.match(game, /if\(this\._pendingDeathReason\).*this\.bossesDefeated>this\._bossesDefeatedAtFrameStart/s);
});
