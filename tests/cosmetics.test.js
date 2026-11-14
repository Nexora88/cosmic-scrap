import test from "node:test";
import assert from "node:assert/strict";
import {normalizeOwnedCosmetics,equipOwnedCosmetic,readEquippedCosmetics} from "../js/systems/Cosmetics.js";
function storage(){
 const values=new Map();
 return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
}
test("capsule inventory preserves flag emblems and the new ship frame variants",()=>{
 const items=[
  {id:"tr-fire",type:"flag",value:"🇹🇷🔥",name:"Anadolu Ateşi"},
  {id:"comet",type:"ship",value:"comet-frame",name:"Comet Vanguard"},
  {id:"eclipse",type:"ship",value:"eclipse-frame",name:"Eclipse Sovereign"}
 ];
 assert.deepEqual(normalizeOwnedCosmetics(items).map(item=>item.id),["tr-fire","comet","eclipse"]);
});
test("equipping capsule flag and ship cosmetics persists without touching gameplay stats",()=>{
 const store=storage();
 const items=[{id:"tr-fire",type:"flag",value:"🇹🇷🔥",name:"Anadolu Ateşi"},{id:"eclipse",type:"ship",value:"eclipse-frame",name:"Eclipse Sovereign"}];
 store.setItem("cosmic-scrap-capsule-cosmetics",JSON.stringify(items));
 assert.equal(equipOwnedCosmetic(items[0],store),true);
 assert.equal(equipOwnedCosmetic(items[1],store),true);
 const equipped=readEquippedCosmetics(store);
 assert.equal(equipped.flag,"🇹🇷🔥");
 assert.equal(equipped.ship,"eclipse-frame");
 assert.equal(equipped.trail,"");
 assert.equal(equipped.projectile,"");
});
