import test from "node:test";
import assert from "node:assert/strict";
import {REGIONS,getRegion,getGalaxyProgress} from "../js/systems/Regions.js";

test("the opening sector is always the Debris Belt",()=>{
  assert.equal(getRegion(0,0).id,"debris");
  assert.equal(getRegion(180,0).id,"debris");
});

test("a sector transition needs both elapsed time and a boss defeat",()=>{
  assert.equal(getRegion(209,1).id,"debris");
  assert.equal(getRegion(210,0).id,"debris");
  assert.equal(getRegion(210,1).id,"ember");
  assert.equal(getRegion(419,1).id,"ember");
  assert.equal(getRegion(420,1).id,"ember");
  assert.equal(getRegion(420,2).id,"cryo");
});

test("seven sectors roll into the next galaxy and progression never stops",()=>{
  assert.equal(getRegion(1260,6).id,REGIONS.at(-1).id);
  assert.equal(getRegion(1470,7).id,REGIONS[0].id);
  assert.equal(getRegion(1470,7).galaxy,2);
  assert.deepEqual(getGalaxyProgress(9999,999).galaxy,7);
  assert.equal(getRegion(9999,999).galaxy,7);
});

test("every sector defines its own readable identity and encounter",()=>{
  for(const region of REGIONS){
    assert.ok(region.name.en);
    assert.ok(region.name.tr);
    assert.ok(region.accent.startsWith("#"));
    assert.ok(region.specialEnemy);
  }
});

test("the expanded frontier adds two late sectors without changing opening pacing",()=>{
  assert.deepEqual(REGIONS.slice(-2).map(region=>region.id),["nova","eclipse"]);
  assert.equal(getRegion(0,0).id,"debris");
  assert.equal(getRegion(840,4).id,"starforge");
  assert.equal(getRegion(1050,5).id,"nova");
  assert.equal(getRegion(1260,6).id,"eclipse");
});
