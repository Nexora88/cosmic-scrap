import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Player } from "../js/entities/Player.js";

test("tap movement follows the actual target from the player's current position", () => {
  const player = new Player(100, 100);
  player.update(0.1, { x: 0, y: 0, pointer: { down: true, active: true, x: 300, y: 100 } }, 500, 400);
  assert.ok(player.x > 100, "player should move toward the tapped point");
  assert.equal(player.y, 100, "horizontal target should not cause vertical drift");
});

test("tap movement stops when the target is reached", () => {
  const player = new Player(100, 100);
  player.update(0.1, { x: 0, y: 0, pointer: { down: true, active: true, x: 104, y: 100 } }, 500, 400);
  assert.equal(player.x, 100);
  assert.equal(player.y, 100);
});

test("player stays visible inside the playable viewport bounds", () => {
  const player = new Player(490, 390);
  player.update(0.1, { x: 1, y: 1, pointer: { down: false, active: false, x: 0, y: 0 } }, 500, 400);
  assert.ok(player.x <= 486 && player.x >= 14);
  assert.ok(player.y <= 352 && player.y >= 65);
});

test("heavy visual effects are capped and duplicate vignette rendering is absent", () => {
  const game = fs.readFileSync(new URL("../js/core/Game.js", import.meta.url), "utf8");
  const combat = fs.readFileSync(new URL("../js/systems/CombatSystem.js", import.meta.url), "utf8");
  const particles = fs.readFileSync(new URL("../js/entities/Particle.js", import.meta.url), "utf8");
  const vignette = 'if(this.stormActive||this.player.health/this.player.maxHealth<=.3||this.bossActive||this.riftEvent){const edge=this.riftEvent?';
  assert.equal(game.split(vignette).length - 1, 1, "vignette should be rendered once per frame");
  assert.match(game, /this\.maxEnemies=this\.lowEnd\?140:220/);
  assert.match(game, /this\.maxParticles=this\.lowEnd\?110:220/);
  assert.match(combat, /if\(!g\.running\)return/);
  assert.match(particles, /draw\(c,lowEnd=false\)/);
});

test("boss spawn position is chosen on a visible arena edge", () => {
  const game = fs.readFileSync(new URL("../js/core/Game.js", import.meta.url), "utf8");
  assert.match(game, /const edge=Math\.floor\(Math\.random\(\)\*4\),margin=28/);
  assert.match(game, /this\.width-margin/);
  assert.match(game, /this\.height-margin/);
});


test("enemy spawning cannot perform unbounded catch-up work in one frame", () => {
  const spawn = fs.readFileSync(new URL("../js/systems/SpawnSystem.js", import.meta.url), "utf8");
  assert.match(spawn, /spawned<3/);
  assert.match(spawn, /this\.timer=rate/);
});

test("pooled enemies reset their kill guard and kill handling is idempotent", () => {
  const enemy = fs.readFileSync(new URL("../js/entities/Enemy.js", import.meta.url), "utf8");
  const game = fs.readFileSync(new URL("../js/core/Game.js", import.meta.url), "utf8");
  assert.match(enemy, /this\._killProcessed=false/);
  assert.match(game, /if\(!e\|\|e\._killProcessed\)return/);
  assert.match(game, /const edge=Math\.floor\(Math\.random\(\)\*4\),margin=28,a=rand\(0,Math\.PI\*2\),bx=/);
});


test("elite contract boss defeat ends the run cleanly instead of scheduling endless waves", () => {
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(game,/this\.contract\?\.metric==="boss"&&this\.contractComplete\)this\.pendingContractVictory=true/);
 assert.match(game,/if\(this\.pendingContractVictory\)\{this\.endRun\("contract-complete"\);return\}/);
 const screen=fs.readFileSync(new URL("../js/ui/DeathScreen.js",import.meta.url),"utf8");assert.match(screen,/MISSION COMPLETE · ELITE TARGET ELIMINATED/);
});
test("support drones are a capped selectable upgrade and target enemies automatically",()=>{const config=fs.readFileSync(new URL("../js/config.js",import.meta.url),"utf8");const combat=fs.readFileSync(new URL("../js/systems/CombatSystem.js",import.meta.url),"utf8");assert.match(config,/id:"supportDrones".*max 3/s);assert.match(combat,/Friendly support drones automatically focus the nearest visible threat/);});
test("health regenerates only after a damage-free grace period",()=>{const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");assert.match(game,/this\.damageQuietTime>=5/);assert.match(game,/this\.player\.health=Math\.min\(this\.player\.maxHealth,this\.player\.health\+1\)/);});
