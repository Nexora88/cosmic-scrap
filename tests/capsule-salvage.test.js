import test from "node:test";
import assert from "node:assert/strict";
import {getCapsuleSellValue,isCapsuleCosmeticSellable} from "../js/systems/CapsuleCollection.js";

test("cosmetic salvage has a fixed transparent value for every mineral tier",()=>{
 const values={copper:10,iron:18,silver:30,gold:50,platinum:75,titanium:100,obsidian:140,elite:200};
 for(const [rarity,value] of Object.entries(values)){
  assert.equal(getCapsuleSellValue({rarity}),value);
  assert.equal(isCapsuleCosmeticSellable({id:"trail-1",type:"trail",rarity}),true);
 }
});

test("the free standard Turkish flag and shared country flags cannot be sold",()=>{
 assert.equal(isCapsuleCosmeticSellable({id:"flag-tr",type:"flag",rarity:"copper"}),false);
 assert.equal(isCapsuleCosmeticSellable({id:"flag-us",type:"flag",rarity:"copper"}),false);
 assert.equal(isCapsuleCosmeticSellable({id:"flag-jp",type:"flag",rarity:"iron"}),false);
});

test("the capsule-exclusive TAVIRO Elite Turkish emblem is distinct and salvageable",()=>{
 const elite={id:"anatolian-fire",type:"flag",value:"🇹🇷🔥",rarity:"elite"};
 assert.equal(isCapsuleCosmeticSellable(elite),true);
 assert.equal(getCapsuleSellValue(elite),200);
});
