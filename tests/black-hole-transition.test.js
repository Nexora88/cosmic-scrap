import test from "node:test";
import assert from "node:assert/strict";
import {createBlackHoleTransition,advanceBlackHoleTransition,blackHoleRadius} from "../js/systems/BlackHoleTransition.js";

test("black hole transition lasts a short readable travel window",()=>{
 const state=createBlackHoleTransition({id:"ember",accent:"#ff795f"});
 assert.equal(state.duration,5.8);
 assert.equal(advanceBlackHoleTransition(state,1).done,false);
 assert.equal(advanceBlackHoleTransition(state,4.8).done,true);
});

test("black hole grows smoothly from a small point to a large portal",()=>{
 const small=blackHoleRadius(0.1,600);
 const medium=blackHoleRadius(0.5,600);
 const large=blackHoleRadius(1,600);
 assert.ok(small<medium&&medium<large);
 assert.ok(large<=204);
});

test("transition cleanup removes enemies at a controlled pace",()=>{
 const state=createBlackHoleTransition({id:"cryo"});
 assert.equal(advanceBlackHoleTransition(state,.21).removeCount,0);
 assert.equal(advanceBlackHoleTransition(state,.22).removeCount,1);
 assert.equal(advanceBlackHoleTransition(state,.66).removeCount,3);
});

test("transition progress is clamped and completion is stable",()=>{
 const state=createBlackHoleTransition({id:"rift"});
 const result=advanceBlackHoleTransition(state,20);
 assert.equal(result.done,true);
 assert.equal(result.progress,1);
 assert.equal(blackHoleRadius(result.progress,500),170);
});
