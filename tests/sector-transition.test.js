import test from "node:test";
import assert from "node:assert/strict";
import {createSectorTransition,advanceSectorTransition} from "../js/systems/SectorTransition.js";

test("ordinary sector shift keeps its established short timing",()=>{
 const state=createSectorTransition({id:"ember",accent:"#ff795f"},false);
 assert.equal(state.duration,3.6);
 assert.equal(advanceSectorTransition(state,1).done,false);
 assert.equal(advanceSectorTransition(state,2.6).done,true);
});

test("galaxy arrival keeps the established 7.8-second cinematic without changing game simulation",()=>{
 const state=createSectorTransition({id:"nova",galaxy:2},true);
 assert.equal(state.duration,7.8);
 assert.equal(state.isGalaxyTransition,true);
 assert.equal(advanceSectorTransition(state,7.7).done,false);
 assert.equal(advanceSectorTransition(state,.1).done,true);
});

test("transition emits timed energy pulses without removing enemies",()=>{
 const state=createSectorTransition({id:"cryo"});
 assert.equal(advanceSectorTransition(state,.2).pulse,false);
 assert.equal(advanceSectorTransition(state,.2).pulse,true);
 assert.equal(advanceSectorTransition(state,.38).pulse,true);
 assert.equal("removeCount" in advanceSectorTransition(state,.1),false);
});

test("transition progress is clamped and completion is stable",()=>{
 const state=createSectorTransition({id:"rift"},true);
 const result=advanceSectorTransition(state,20);
 assert.equal(result.done,true);
 assert.equal(result.progress,1);
});

test("longer galaxy visuals do not extend the original meteor damage window",async()=>{
 const {readFile}=await import("node:fs/promises");
 const game=await readFile(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(game,/meteorDamageWindow=!this\.regionTransition\.isGalaxyTransition\|\|this\.regionTransition\.timer>this\.regionTransition\.duration-3\.6/);
});
