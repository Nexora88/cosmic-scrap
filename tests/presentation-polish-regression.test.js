import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const enemy = await readFile(new URL("../js/entities/Enemy.js", import.meta.url), "utf8");
const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
const capsule = await readFile(new URL("../js/ui/ScrapCapsules.js", import.meta.url), "utf8");
const capsuleTiming = await readFile(new URL("../js/systems/CapsuleTiming.js", import.meta.url), "utf8");
const contracts = await readFile(new URL("../js/systems/Contracts.js", import.meta.url), "utf8");

test("Starbreaker keeps a thin outline and gains subtle inner neon rings", () => {
  assert.match(enemy, /ctx\.lineWidth=isStar\?1\.45:phase===3\?2\.1:1\.65/);
  assert.match(enemy, /this\.size\*\.68/);
  assert.match(enemy, /this\.size\*\.42/);
});

test("revive keeps its existing shield and adds a cosmetic EMP pulse", () => {
  assert.match(main, /game\.player\.invuln=4/);
  assert.match(main, /game\.enemyProjectiles\.length=0/);
  assert.match(main, /color:"#56eaff"/);
  assert.match(main, /game\.particlePool\.take\(game\.player\.x,game\.player\.y/);
});

test("capsule automatically advances through charge and shell split while skip remains", () => {
  assert.match(capsule, /capsulePhase===1&&layerIsOpen\(\)\)openReveal\(\)\},CAPSULE_TIMING\.charge\)/);
  assert.match(capsule, /capsulePhase===2&&layerIsOpen\(\)\)openReveal\(\)\},CAPSULE_TIMING\.shellOpen\)/);
  assert.match(capsule, /function skipCapsuleAnimation\(\)/);
  assert.match(capsuleTiming, /charge:1100/);
  assert.match(capsuleTiming, /shellOpen:720/);
});

test("the four selectable directives retain distinct objective metrics without altering combat systems", () => {
  for (const metric of ['metric:"none"','metric:"scrap"','metric:"boss"','metric:"storm"']) assert.ok(contracts.includes(metric));
});
