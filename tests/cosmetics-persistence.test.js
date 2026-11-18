import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {equipOwnedCosmetic,normalizeOwnedCosmetics,readEquippedCosmetics} from "../js/systems/Cosmetics.js";
function storage(seed={}){const data=new Map(Object.entries(seed));return{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),data}}
test("earned cosmetic can be equipped and survives a fresh storage read",()=>{
 const item={id:"star-projectile",type:"projectile",value:"star",name:"Star Lance"};
 const s=storage({"cosmic-scrap-capsule-cosmetics":JSON.stringify([item])});
 assert.equal(equipOwnedCosmetic(item,s),true);
 const equipped=readEquippedCosmetics(s);
 assert.equal(equipped.trail,"");assert.equal(equipped.projectile,"star");assert.equal(equipped.ship,"");assert.equal(equipped.flag,"");
 for(const type of ["banner","color","symbol","aura","badge"])assert.equal(equipped[type],"");
});
test("equipment rejects items that are not owned or have an unsupported value",()=>{
 const s=storage({"cosmic-scrap-capsule-cosmetics":"[]"});
 assert.equal(equipOwnedCosmetic({id:"fake",type:"ship",value:"invincible"},s),false);
 assert.equal(readEquippedCosmetics(storage({"cosmic-scrap-equipped-ship":"invincible"})).ship,"");
});
test("owned cosmetic records are deduplicated and validated",()=>{
 const valid={id:"plasma-projectile",type:"projectile",value:"plasma",name:"Plasma Core"};
 const result=normalizeOwnedCosmetics([valid,valid,{id:"bad",type:"ship",value:"damage-boost",name:"Bad"}]);
 assert.equal(result.length,1);assert.equal(result[0].id,valid.id);assert.equal(result[0].value,valid.value);
});

test("equipped cosmetics are restored as the next run loadout",()=>{
 const source=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(source,/this\.cosmetics=\{trail:localStorage\.getItem\("cosmic-scrap-equipped-trail"\)/);
 assert.match(source,/this\.player\.cosmetics=this\.cosmetics/);
});
