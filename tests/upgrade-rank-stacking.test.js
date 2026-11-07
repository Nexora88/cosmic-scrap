import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {UPGRADES} from "../js/config.js";
import {applyUpgradeChoice,getUpgradeRank,resetUpgradeRanks} from "../js/systems/UpgradeEffects.js";

const player=()=>({
 fireRate:.42,damage:18,projectiles:1,maxHealth:100,health:80,speed:255,pickupRange:105,
 crit:.08,pierce:0,orbitCount:0,chainChance:0,trailDamage:0,novaPower:0,
 explosionPower:0,slowAura:0,riftEcho:0,supportDrones:0
});

test("selecting the same upgrade again raises its rank and makes the second effect stronger",()=>{
 resetUpgradeRanks();
 const pilot=player(),damage=UPGRADES.find(item=>item.id==="damage");
 const initial=pilot.damage;
 assert.equal(getUpgradeRank("damage"),0);
 assert.equal(applyUpgradeChoice(pilot,damage,"common"),true);
 const firstGain=pilot.damage-initial;
 assert.equal(getUpgradeRank("damage"),1);
 assert.equal(applyUpgradeChoice(pilot,damage,"common"),true);
 const secondGain=pilot.damage-(initial+firstGain);
 assert.equal(getUpgradeRank("damage"),2);
 assert.ok(secondGain>firstGain,"second damage pick must be measurably stronger");
});

test("rank scaling makes repeat multishot picks add more projectiles and respects the hard cap",()=>{
 resetUpgradeRanks();
 const pilot=player(),multishot=UPGRADES.find(item=>item.id==="multishot");
 assert.equal(applyUpgradeChoice(pilot,multishot,"common"),true);
 assert.equal(pilot.projectiles,2);
 assert.equal(applyUpgradeChoice(pilot,multishot,"common"),true);
 assert.equal(pilot.projectiles,4);
 assert.equal(multishot.available(pilot),false);
 assert.equal(getUpgradeRank("multishot"),2);
});

test("a new pilot starts with fresh upgrade ranks",()=>{
 resetUpgradeRanks();
 const first=player(),damage=UPGRADES.find(item=>item.id==="damage");
 applyUpgradeChoice(first,damage,"common");
 assert.equal(getUpgradeRank("damage"),1);
 const nextRun=player();
 applyUpgradeChoice(nextRun,damage,"common");
 assert.equal(getUpgradeRank("damage"),1);
});

test("level-up cards show the next rank for a previously selected upgrade",()=>{
 const source=fs.readFileSync(new URL("../js/ui/LevelUpScreen.js",import.meta.url),"utf8");
 assert.match(source,/getUpgradeRank\(u\.id\) \+ 1/);
 assert.match(source,/dataset\.upgradeRank = String\(nextRank\)/);
 assert.match(source,/SEVİYE/);
});
