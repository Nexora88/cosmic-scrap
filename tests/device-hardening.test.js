import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const music=fs.readFileSync(new URL("../js/systems/Music.js",import.meta.url),"utf8");
const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
const mobile=fs.readFileSync(new URL("./mobile-playtest.mjs",import.meta.url),"utf8");

test("music tracks loop by default and only the reveal stinger is one-shot",()=>{
 assert.match(music,/audio\.loop = true/);
 assert.match(music,/nextAudio\.loop = !oneShot/);
 assert.match(music,/oneShot: true/);
 assert.match(music,/visibilitychange/);
 assert.match(music,/pagehide/);
 assert.match(music,/this\.resume\(\)/);
});

test("low-end devices receive reduced canvas resolution and bounded entity/effect pools",()=>{
 assert.match(game,/navigator\.hardwareConcurrency\|\|8\)\s*<=4/);
 assert.match(game,/navigator\.deviceMemory[^;]*<=4/);
 assert.match(game,/this\.lowEnd\?1:coarsePointer\?1\.5:2/);
 assert.match(game,/this\.maxEnemies=this\.lowEnd\?140:220/);
 assert.match(game,/this\.maxProjectiles=this\.lowEnd\?240:420/);
 assert.match(game,/this\.maxEnemyProjectiles=this\.lowEnd\?72:140/);
 assert.match(game,/this\.maxParticles=this\.lowEnd\?110:220/);
 assert.match(game,/frameCostEMA/);
 assert.match(mobile,/hardwareConcurrency/);
 assert.match(mobile,/deviceMemory/);
 assert.match(mobile,/lowEndClass/);
});
