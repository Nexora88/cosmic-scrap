import test from "node:test";
import assert from "node:assert/strict";
import {UPGRADES} from "../js/config.js";
import {applyUpgradeChoice} from "../js/systems/UpgradeEffects.js";
import {META,buyMeta} from "../js/systems/MetaProgression.js";
import {Player} from "../js/entities/Player.js";
import {load,save,awardIdle} from "../js/utils/Storage.js";

const makePlayer=()=>({
 fireRate:.42,damage:18,projectiles:1,maxHealth:100,health:80,speed:255,pickupRange:105,
 crit:.08,pierce:0,orbitCount:0,chainChance:0,trailDamage:0,novaPower:0,
 explosionPower:0,slowAura:0,riftEcho:0,supportDrones:0
});

test("every level-up card changes the selected pilot stat",()=>{
 for(const upgrade of UPGRADES){
  const player=makePlayer();
  assert.equal(upgrade.available(player),true,upgrade.id+" should be available");
  assert.equal(applyUpgradeChoice(player,upgrade,"common"),true);
  const changed=Object.keys(player).some(key=>player[key]!==makePlayer()[key]);
  assert.equal(changed,true,upgrade.id+" should apply an effect");
 }
});

test("rarity scales only the chosen upgrade: common, rare, epic",()=>{
 const common={value:0},rare={value:0},epic={value:0};
 const upgrade={apply:player=>{player.value+=10}};
 applyUpgradeChoice(common,upgrade,"common");
 applyUpgradeChoice(rare,upgrade,"rare");
 applyUpgradeChoice(epic,upgrade,"epic");
 assert.equal(common.value,10);
 assert.equal(rare.value,12.5);
 assert.equal(epic.value,20);
});

test("permanent upgrades spend Scrap Core and enforce rank and balance limits",()=>{
 const profile={scrapCore:50,meta:{}};
 assert.equal(buyMeta(profile,"health"),true);
 assert.equal(profile.scrapCore,30);
 assert.equal(profile.meta.health,1);
 assert.equal(buyMeta(profile,"unknown"),false);
 profile.scrapCore=0;
 assert.equal(buyMeta(profile,"damage"),false);
 profile.scrapCore=1000;
 profile.meta.health=META.find(item=>item.id==="health").max;
 assert.equal(buyMeta(profile,"health"),false);
});

test("permanent player upgrades affect the next run's starting stats",()=>{
 const player=new Player(0,0,{health:2,damage:3,speed:2,pickup:4});
 assert.equal(player.maxHealth,120);
 assert.equal(player.health,120);
 assert.equal(player.damage,24);
 assert.equal(player.speed,255*1.08);
 assert.equal(player.pickupRange,153);
});

test("legacy core and run-earned Scrap Core migrate into one spendable balance",()=>{
 const values=new Map([["cosmic-scrap-save-v2",JSON.stringify({core:40,scrapCore:12,meta:{}})]]);
 globalThis.localStorage={
  getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,value),
  removeItem:key=>values.delete(key)
 };
 const profile=load();
 assert.equal(profile.scrapCore,52);
 assert.equal(profile.core,0);
 save(profile);
 assert.equal(JSON.parse(values.get("cosmic-scrap-save-v2")).core,0);
});

test("idle rewards add to the same Scrap Core balance",()=>{
 const values=new Map();
 globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const profile={scrapCore:7,core:0,meta:{idle:0},lastSeen:Date.now()-3600000};
 const earned=awardIdle(profile);
 assert.equal(earned,5);
 assert.equal(profile.scrapCore,12);
 assert.equal(profile.core,0);
});
