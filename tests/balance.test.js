import test from "node:test";
import assert from "node:assert/strict";
import {spawnIntervalAt,enemyChancesAt,rarityAt} from "../js/systems/Balance.js";

test("opening is active and spawn interval ramps down smoothly",()=>{
 const times=[0,15,50,110,240,600],rates=times.map(spawnIntervalAt);
 assert.ok(rates[0]<=.83 && rates[0]>.8);
 for(let i=1;i<rates.length;i++)assert.ok(rates[i]<=rates[i-1],"spawn interval should not rise with run time");
 assert.ok(rates.every(x=>x>=.28&&x<=.82));
});
test("enemy archetype probabilities stay valid through the run",()=>{
 for(const t of [0,12,25,55,70,140,240,600]){
  const c=enemyChancesAt(t);
  assert.ok(Object.values(c).every(x=>x>=0&&x<=1));
  assert.ok(Math.abs(c.tank+c.fast+c.swarm+c.normal-1)<1e-9);
 }
 assert.equal(enemyChancesAt(20).tank,0);
 assert.ok(enemyChancesAt(240).tank>0);
 assert.ok(enemyChancesAt(20).fast>enemyChancesAt(0).fast);
});
test("rarity roll boundaries match advertised per-card odds",()=>{
 assert.equal(rarityAt(0),"epic");
 assert.equal(rarityAt(.049999),"epic");
 assert.equal(rarityAt(.05),"rare");
 assert.equal(rarityAt(.269999),"rare");
 assert.equal(rarityAt(.27),"common");
 assert.equal(rarityAt(.999),"common");
});
test("three-card offer has a measurable epic chance",()=>{
 const chance=1-Math.pow(.95,3);
 assert.ok(chance>.14&&chance<.15);
});
