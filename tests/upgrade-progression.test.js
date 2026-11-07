import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {UPGRADES} from "../js/config.js";
import {applyUpgradeChoice} from "../js/systems/UpgradeEffects.js";
import {META,buyMeta} from "../js/systems/MetaProgression.js";
import {Player} from "../js/entities/Player.js";
import {CombatSystem} from "../js/systems/CombatSystem.js";
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
 const upgrade={apply:(player,multiplier=1)=>{player.value+=10*multiplier}};
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

test("rare and epic rarity multipliers respect every upgrade's hard caps",()=>{
 const cases=[
  ["damage",{damage:175},180],["multishot",{projectiles:2},4],["health",{maxHealth:155,health:150},160],["speed",{speed:410},420],["pickup",{pickupRange:315},320],
  ["crit",{crit:.48},.5],["pierce",{pierce:2},3],["orbit",{orbitCount:3},4],
  ["chain",{chainChance:.68},.72],["trail",{trailDamage:33},36],
  ["nova",{novaPower:2},3],["explosion",{explosionPower:1},2],
  ["slow",{slowAura:1},2],["riftEcho",{riftEcho:2},3],["supportDrones",{supportDrones:2},3]
 ];
 for(const [id,initial,cap] of cases){
  const upgrade=UPGRADES.find(item=>item.id===id);
  for(const rarity of ["rare","epic"]){
   const player={...makePlayer(),...initial};
   assert.equal(applyUpgradeChoice(player,upgrade,rarity),true,id+" "+rarity+" should apply");
   const stat=Object.keys(initial)[0];
   assert.ok(player[stat]<=cap,id+" "+rarity+" exceeded cap: "+player[stat]);
   assert.ok(player[stat]>initial[stat],id+" "+rarity+" should visibly improve");
  }
 }
});
test("invalid rarities and missing choices do not mutate player state",()=>{
 const player=makePlayer(),before={...player};
 assert.equal(applyUpgradeChoice(player,UPGRADES[0],"mythic"),false);
 assert.equal(applyUpgradeChoice(player,null,"common"),false);
 assert.deepEqual(player,before);
});
test("the level-up UI commits at most one selected card and disables the other offers",()=>{
 const screen=fs.readFileSync(new URL("../js/ui/LevelUpScreen.js",import.meta.url),"utf8");
 assert.match(screen,/let choiceCommitted = false/);
 assert.match(screen,/if \(choiceCommitted \|\| b\.disabled\) return/);
 assert.match(screen,/querySelectorAll\("button"\).*card\.disabled = true/s);
 assert.match(screen,/onChoose\(u, rarity\)/);
});


test("Orbiting Shield visibly damages enemies passing through its wider shard path",()=>{
 const player={x:0,y:0,size:9,fireTimer:10,orbitCount:1};
 const enemy={x:31,y:0,size:10,health:100,dead:false,update(){}};
 const game={player,enemies:[enemy],projectiles:[],enemyProjectiles:[],particles:[],lightning:[],shockwaves:[],maxParticles:0,maxEnemyProjectiles:0,lowEnd:false,shake:0,running:true,elapsed:0,callbacks:{},enemyPool:{put(){}},projectilePool:{put(){}},particlePool:{take(){return null}},onKill(){}};
 new CombatSystem().update(.01,game);
 assert.equal(enemy.health,82);
 assert.equal(game.shockwaves.length,1);
});

test("Chain Lightning creates a visible arc and damages the secondary target",()=>{
 const player={x:0,y:0,size:9,fireTimer:10,chainChance:1,crit:0,damage:20};
 const first={x:50,y:0,size:10,health:100,dead:false,update(){}};
 const second={x:90,y:0,size:10,health:100,dead:false,update(){}};
 const projectile={x:0,y:0,life:1,damage:10,crit:false,pierce:0,hit:new Set(),update(){this.x=50;this.y=0}};
 const game={player,enemies:[first,second],projectiles:[projectile],enemyProjectiles:[],particles:[],lightning:[],shockwaves:[],width:400,height:800,maxParticles:0,maxEnemyProjectiles:0,lowEnd:false,shake:0,running:true,elapsed:0,callbacks:{},enemyPool:{put(){}},projectilePool:{put(){}},particlePool:{take(){return null}},onKill(){}};
 const random=Math.random;Math.random=()=>0;
 try{new CombatSystem().update(.01,game)}finally{Math.random=random}
 assert.equal(first.health,90);
 assert.equal(second.health,82.4);
 assert.equal(game.lightning.length,1);
});

test("all upgrade cards have Turkish copy and combat effects are rendered",()=>{
 const screen=fs.readFileSync(new URL("../js/ui/LevelUpScreen.js",import.meta.url),"utf8");
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 for(const upgrade of UPGRADES)assert.ok(screen.includes('"'+upgrade.name+'"'),upgrade.id+" needs Turkish card copy");
 for(const marker of ["this.player.orbitCount","this.player.slowAura","this.lightning.length","this.shockwaves.length","this.bossWarningTimer>0"])assert.ok(game.includes(marker),marker+" must render in-game feedback");
});


test("save migration preserves captures in both new frontier sectors",()=>{
 const values=new Map([["cosmic-scrap-save-v2",JSON.stringify({capturedRegions:["debris","nova","eclipse"],ownedFlags:["🇨🇦"],scrapCore:500})]]);
 globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const profile=load();
 assert.deepEqual(profile.capturedRegions,["debris","nova","eclipse"]);
 assert.deepEqual(profile.ownedFlags,["🇨🇦"]);
 assert.equal(profile.scrapCore,500);
});
