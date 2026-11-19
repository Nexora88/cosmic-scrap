import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mergeGameSaves,mergeCloudSaveConflict} from "../js/systems/CloudSave.js";
import {COSMETIC_REWARDS} from "../js/systems/CosmeticCatalog.js";

test("cloud save merge keeps the highest non-additive career balances and stats",()=>{
  const merged=mergeGameSaves(
    {version:2,scrapCore:45,totalScrap:320,bestScore:900,careerXp:180,careerLevel:2,runs:5,meta:{health:2,speed:1}},
    {version:2,scrapCore:60,totalScrap:280,bestScore:1200,careerXp:240,careerLevel:3,runs:4,meta:{health:1,damage:2}}
  );
  assert.equal(merged.scrapCore,60);
  assert.equal(merged.totalScrap,320);
  assert.equal(merged.bestScore,1200);
  assert.equal(merged.careerXp,240);
  assert.equal(merged.careerLevel,3);
  assert.equal(merged.runs,5);
  assert.deepEqual(merged.meta,{health:2,damage:2,idle:0,speed:1,pickup:0});
});

test("cloud save merge unions achievements and future unlock collections without duplicates",()=>{
  const merged=mergeGameSaves(
    {achievements:["first","boss"],completedMissions:["sector-1"],unlockedCosmetics:["mint"]},
    {achievements:["first","storm"],completedMissions:["sector-0"],unlockedCosmetics:["mint","violet"]}
  );
  assert.deepEqual(new Set(merged.achievements),new Set(["first","boss","storm"]));
  assert.deepEqual(new Set(merged.completedMissions),new Set(["sector-0","sector-1"]));
  assert.deepEqual(new Set(merged.unlockedCosmetics),new Set(["mint","violet"]));
});

test("cloud save merge preserves the earliest pilot creation timestamp",()=>{
  const merged=mergeGameSaves(
    {firstPlayedAt:"2026-10-10T10:00:00.000Z"},
    {firstPlayedAt:"2026-10-12T10:00:00.000Z"}
  );
  assert.equal(merged.firstPlayedAt,"2026-10-10T10:00:00.000Z");
});

test("conflict resolution merges the latest server copy with this device instead of overwriting either",()=>{
  const resolved=mergeCloudSaveConflict(
    {scrapCore:25,achievements:["local"],meta:{damage:2}},
    {scrapCore:40,achievements:["cloud"],meta:{health:1}}
  );
  assert.equal(resolved.scrapCore,40);
  assert.deepEqual(new Set(resolved.achievements),new Set(["local","cloud"]));
  assert.equal(resolved.meta.damage,2);
  assert.equal(resolved.meta.health,1);
});



test("cloud save merge syncs purchased flag collections without duplicates",()=>{
 const merged=mergeGameSaves(
  {ownedFlags:["🇺🇸","🇯🇵"],selectedFlag:"🇯🇵"},
  {ownedFlags:["🇺🇸","🇫🇷"],selectedFlag:"🇫🇷"}
 );
 assert.deepEqual(new Set(merged.ownedFlags),new Set(["🇺🇸","🇯🇵","🇫🇷"]));
 assert.equal(merged.selectedFlag,"🇯🇵");
});


test("cloud save keeps the equipped flag from the most recently played device",()=>{
 const local={lastSeen:100,selectedFlag:"🇹🇷",ownedFlags:["🇹🇷"]};
 const cloud={lastSeen:200,selectedFlag:"🏴‍☠️",ownedFlags:["🏴‍☠️"]};
 const merged=mergeGameSaves(local,cloud);
 assert.equal(merged.selectedFlag,"🏴‍☠️");
 assert.deepEqual(new Set(merged.ownedFlags),new Set(["🇹🇷","🏴‍☠️"]));
});


test("daily mission progress merges conservatively across devices and keeps claimed rewards",()=>{
 const merged=mergeGameSaves(
  {dailyMissions:{daily:{period:"2026-11-15",progress:{"scrap-120":80},claimed:[]},weekly:{period:"2026-W46",progress:{"weekly-runs-8":3},claimed:[]}}},
  {dailyMissions:{daily:{period:"2026-11-15",progress:{"scrap-120":120},claimed:["scrap-120"]},weekly:{period:"2026-W46",progress:{"weekly-runs-8":5},claimed:[]}}}
 );
 assert.equal(merged.dailyMissions.daily.progress["scrap-120"],120);
 assert.deepEqual(merged.dailyMissions.daily.claimed,["scrap-120"]);
 assert.equal(merged.dailyMissions.weekly.progress["weekly-runs-8"],5);
});
test("daily mission cloud merge prefers the newer period instead of carrying stale progress forward",()=>{
 const merged=mergeGameSaves(
  {dailyMissions:{daily:{period:"2026-11-14",progress:{"scrap-120":120},claimed:["scrap-120"]},weekly:{period:"2026-W45",progress:{"weekly-runs-8":8},claimed:["weekly-runs-8"]}}},
  {dailyMissions:{daily:{period:"2026-11-15",progress:{},claimed:[]},weekly:{period:"2026-W46",progress:{},claimed:[]}}}
 );
 assert.equal(merged.dailyMissions.daily.period,"2026-11-15");
 assert.deepEqual(merged.dailyMissions.daily.progress,{});
 assert.deepEqual(merged.dailyMissions.weekly.claimed,[]);
});


test("capsule inventory, reward history and counts merge across devices without duplicate items",()=>{
 const merged=mergeGameSaves(
  {lastSeen:200,capsuleCount:2,capsuleRuns:4,capsuleCosmetics:[{id:"comet-frame",type:"ship",value:"comet-frame",name:"Comet Vanguard",rarity:"gold"}],capsuleHistory:[{rewardId:"comet-frame",rarity:"gold",duplicate:false,compensation:0,earnedAt:"2026-11-16T10:00:00.000Z"}]},
  {lastSeen:100,capsuleCount:3,capsuleRuns:5,capsuleCosmetics:[{id:"comet-frame",type:"ship",value:"comet-frame",name:"Comet Vanguard",rarity:"gold"},{id:"neon-outline",type:"ship",value:"neon-outline",name:"Neon Frame",rarity:"silver"}],capsuleHistory:[{rewardId:"neon-outline",rarity:"silver",duplicate:false,compensation:0,earnedAt:"2026-11-16T09:00:00.000Z"}]}
 );
 assert.equal(merged.capsuleCount,3);
 assert.equal(merged.capsulesEarned,3);
 assert.equal(merged.capsulesSpent,0);
 assert.equal(merged.capsuleRuns,5);
 assert.deepEqual(new Set(merged.capsuleCosmetics.map(item=>item.id)),new Set(["comet-frame","neon-outline"]));
 assert.equal(merged.capsuleHistory.length,2);
 assert.equal(merged.capsuleHistory[0].rewardId,"neon-outline");
});

test("capsule reward history stays bounded to the newest twenty valid records",()=>{
 const local=Array.from({length:15},(_,i)=>({rewardId:"local-"+i,rarity:"gold",duplicate:false,earnedAt:new Date(Date.UTC(2026,10,1,0,i)).toISOString()}));
 const cloud=Array.from({length:15},(_,i)=>({rewardId:"cloud-"+i,rarity:"silver",duplicate:false,earnedAt:new Date(Date.UTC(2026,10,1,0,i+15)).toISOString()}));
 const merged=mergeGameSaves({capsuleHistory:local},{capsuleHistory:cloud});
 assert.equal(merged.capsuleHistory.length,20);
 assert.equal(merged.capsuleHistory[0].rewardId,"local-10");
 assert.equal(merged.capsuleHistory.at(-1).rewardId,"cloud-14");
});

test("equipped capsule cosmetics follow the most recently active device",()=>{
 const merged=mergeGameSaves(
  {lastSeen:300,equippedCosmetics:{trail:"rainbow",ship:"comet-frame"}},
  {lastSeen:200,equippedCosmetics:{trail:"red-white",ship:"neon-outline",flag:"🇯🇵"}}
 );
 assert.deepEqual(merged.equippedCosmetics,{trail:"rainbow",ship:"comet-frame",flag:"🇯🇵"});
});


test("account cloud sync hydrates and restores capsule inventory, history, count and equipment",()=>{
 const source=readFileSync(new URL("../js/cloud-account.js",import.meta.url),"utf8");
 assert.match(source,/localSave = hydrateLocalCapsuleSave\(localSave\)/);
 assert.match(source,/persistCloudCapsuleSave\(merged\)/);
 for(const key of ["cosmic-scrap-capsules","cosmic-scrap-capsule-runs","cosmic-scrap-capsule-cosmetics","cosmic-scrap-capsule-history"])assert.ok(source.includes(key));
 assert.match(source,/cosmic-scrap:capsules-restored/);
});

test("capsule inventory changes request cloud sync and refresh after remote restore",()=>{
 const source=readFileSync(new URL("../js/ui/ScrapCapsules.js",import.meta.url),"utf8");
 assert.match(source,/function notifyCloudSave\(\)\{window\.dispatchEvent\(new Event\("cosmic-scrap:save-changed"\)\)\}/);
 assert.match(source,/addEventListener\("cosmic-scrap:capsules-restored"/);
});

test("capsule consumption is monotonic across cloud merges and cannot resurrect opened capsules",()=>{
 const merged=mergeGameSaves(
  {capsuleCount:0,capsulesEarned:4,capsulesSpent:4},
  {capsuleCount:4,capsulesEarned:4,capsulesSpent:1}
 );
 assert.equal(merged.capsulesEarned,4);
 assert.equal(merged.capsulesSpent,4);
 assert.equal(merged.capsuleCount,0);
});
test("capsule ledger merges new earnings and spends from separate devices",()=>{
 const merged=mergeGameSaves(
  {capsulesEarned:5,capsulesSpent:2},
  {capsulesEarned:7,capsulesSpent:4}
 );
 assert.equal(merged.capsuleCount,3);
});


test("all 166 catalogue cosmetics survive a two-device cloud roundtrip",()=>{
 const local=COSMETIC_REWARDS.filter((_,i)=>i%2===0).map(item=>({...item}));
 const cloud=COSMETIC_REWARDS.filter((_,i)=>i%2===1).map(item=>({...item}));
 const merged=mergeGameSaves({capsuleCosmetics:local},{capsuleCosmetics:cloud});
 assert.equal(COSMETIC_REWARDS.length,166);
 assert.equal(merged.capsuleCosmetics.length,166);
 assert.deepEqual(new Set(merged.capsuleCosmetics.map(x=>x.id)),new Set(COSMETIC_REWARDS.map(x=>x.id)));
 const restored=mergeGameSaves({},merged);
 assert.equal(restored.capsuleCosmetics.length,166);
});

test("all eight capsule rarity classes survive cloud history roundtrip",()=>{
 const rarities=["copper","iron","silver","gold","platinum","titanium","obsidian","elite"];
 const entries=rarities.map((rarity,i)=>({rewardId:"rarity-"+i,rarity,duplicate:false,earnedAt:new Date(Date.UTC(2026,10,19,0,i)).toISOString()}));
 const merged=mergeGameSaves({capsuleHistory:entries.slice(0,4)},{capsuleHistory:entries.slice(4)});
 assert.deepEqual(new Set(merged.capsuleHistory.map(x=>x.rarity)),new Set(rarities));
 assert.deepEqual(new Set(mergeGameSaves({},merged).capsuleHistory.map(x=>x.rarity)),new Set(rarities));
});
