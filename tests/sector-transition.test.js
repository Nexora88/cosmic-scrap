import test from "node:test";
import assert from "node:assert/strict";
import {createSectorTransition,advanceSectorTransition} from "../js/systems/SectorTransition.js";

test("sector shift is short and readable",()=>{
 const state=createSectorTransition({id:"ember",accent:"#ff795f"});
 assert.equal(state.duration,3.6);
 assert.equal(advanceSectorTransition(state,1).done,false);
 assert.equal(advanceSectorTransition(state,2.6).done,true);
});

test("sector shift emits timed energy pulses without pulling or removing enemies",()=>{
 const state=createSectorTransition({id:"cryo"});
 assert.equal(advanceSectorTransition(state,.2).pulse,false);
 assert.equal(advanceSectorTransition(state,.2).pulse,true);
 assert.equal(advanceSectorTransition(state,.38).pulse,true);
 assert.equal("removeCount" in advanceSectorTransition(state,.1),false);
});

test("transition progress is clamped and completion is stable",()=>{
 const state=createSectorTransition({id:"rift"});
 const result=advanceSectorTransition(state,20);
 assert.equal(result.done,true);
 assert.equal(result.progress,1);
});
