import test from "node:test";
import assert from "node:assert/strict";
import {applyLoadout,LOADOUTS} from "../js/systems/Loadouts.js";
function pilot(){return {speed:255,damage:18,fireRate:.42,maxHealth:100,health:100,crit:.08,orbitCount:0,chainChance:0}}
test("PULSE remains the balanced baseline with its established fire-rate tradeoff",()=>{const p=pilot();assert.equal(applyLoadout(p,"pulse"),"pulse");assert.ok(p.fireRate<.42);assert.ok(p.damage>18);assert.equal(p.orbitCount,0);assert.equal(p.chainChance,0)});
test("ORBIT is a guardian with two damaging orbit blades and extra core health",()=>{const p=pilot();applyLoadout(p,"orbit");assert.equal(p.orbitCount,2);assert.equal(p.orbitDamage,22);assert.equal(p.orbitRadius,36);assert.equal(p.maxHealth,120);assert.equal(p.health,120);assert.ok(p.speed<255);assert.ok(p.damage<18)});
test("CHAIN has a high-proc critical lightning identity with a direct-hit tradeoff",()=>{const p=pilot();applyLoadout(p,"chain");assert.equal(p.chainChance,.28);assert.equal(p.crit,.26);assert.ok(p.fireRate>.42);assert.ok(p.damage<18);assert.equal(p.orbitCount,0)});
test("unknown loadout safely falls back to PULSE",()=>{const p=pilot();assert.equal(applyLoadout(p,"unknown"),"pulse");assert.ok(LOADOUTS.pulse)});
