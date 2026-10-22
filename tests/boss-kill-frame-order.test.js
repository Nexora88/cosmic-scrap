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
  assert.match(spawn, /spawnIntervalAt\(t\)\*\(t<25\?1:\.94\)/);
});
