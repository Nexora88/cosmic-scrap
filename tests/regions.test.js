import test from "node:test";
import assert from "node:assert/strict";
import {REGIONS,getRegion} from "../js/systems/Regions.js";

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

test("progression is capped at the final sector",()=>{
  assert.equal(getRegion(9999,999).id,REGIONS.at(-1).id);
});

test("every sector defines its own readable identity and encounter",()=>{
  for(const region of REGIONS){
    assert.ok(region.name.en);
    assert.ok(region.name.tr);
    assert.ok(region.accent.startsWith("#"));
    assert.ok(region.specialEnemy);
  }
});
