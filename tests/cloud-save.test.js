import test from "node:test";
import assert from "node:assert/strict";
import {mergeGameSaves,mergeCloudSaveConflict} from "../js/systems/CloudSave.js";

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


test("cloud save merges capsule cosmetic ownership and the newest equipped appearance",()=>{
 const cosmetic=(id,type,value)=>({id,type,value,name:id,rarity:"rare",label:"test"});
 const merged=mergeGameSaves(
  {lastSeen:20,selectedSkin:"mint",selectedContract:"storm",
   ownedCapsuleCosmetics:[cosmetic("local-trail","trail","rainbow")],
   equippedCosmetics:{trail:"rainbow",projectile:"",ship:""}},
  {lastSeen:10,selectedSkin:"blue",selectedContract:"salvager",
   ownedCapsuleCosmetics:[cosmetic("cloud-star","projectile","star")],
   equippedCosmetics:{trail:"",projectile:"star",ship:""}}
 );
 assert.equal(merged.selectedSkin,"mint");
 assert.equal(merged.selectedContract,"storm");
 assert.deepEqual(merged.equippedCosmetics,{trail:"rainbow",projectile:"star",ship:""});
 assert.deepEqual(merged.ownedCapsuleCosmetics.map(item=>item.id).sort(),["cloud-star","local-trail"]);
});

test("newer cloud preferences win without losing local career progress or cosmetic ownership",()=>{
 const cosmetic=(id,type,value)=>({id,type,value,name:id,rarity:"rare",label:"test"});
 const merged=mergeCloudSaveConflict(
  {lastSeen:10,bestScore:1200,scrapCore:80,selectedSkin:"mint",
   ownedCapsuleCosmetics:[cosmetic("local-frame","ship","neon-outline")]},
  {lastSeen:30,bestScore:900,scrapCore:120,selectedSkin:"violet",
   ownedCapsuleCosmetics:[cosmetic("cloud-plasma","projectile","plasma")]}
 );
 assert.equal(merged.selectedSkin,"violet");
 assert.equal(merged.bestScore,1200);
 assert.equal(merged.scrapCore,120);
 assert.deepEqual(merged.ownedCapsuleCosmetics.map(item=>item.id).sort(),["cloud-plasma","local-frame"]);
});

test("invalid cosmetic values are discarded and an unknown ship skin falls back safely",()=>{
 const merged=mergeGameSaves(
  {lastSeen:2,selectedSkin:"unknown",ownedCapsuleCosmetics:[{id:"bad",type:"ship",value:"weapon",name:"bad"}]},
  {}
 );
 assert.equal(merged.selectedSkin,"blue");
 assert.deepEqual(merged.ownedCapsuleCosmetics,[]);
});


test("same-day daily objective progress merges across devices without double counting",()=>{
 const merged=mergeGameSaves(
  {dailyStatus:{date:"2026-11-07",runs:1,bosses:0,scrap:120,updatedAt:"2026-11-07T08:00:00Z"}},
  {dailyStatus:{date:"2026-11-07",runs:0,bosses:1,scrap:240,updatedAt:"2026-11-07T08:30:00Z"}}
 );
 assert.equal(merged.dailyStatus.date,"2026-11-07");
 assert.equal(merged.dailyStatus.runs,1);
 assert.equal(merged.dailyStatus.bosses,1);
 assert.equal(merged.dailyStatus.scrap,240);
 assert.equal(merged.dailyStatus.updatedAt,"2026-11-07T08:30:00Z");
});

test("a newer daily objective date replaces yesterday's progress",()=>{
 const merged=mergeGameSaves(
  {dailyStatus:{date:"2026-11-06",runs:1,bosses:1,scrap:300,updatedAt:"2026-11-06T23:00:00Z"}},
  {dailyStatus:{date:"2026-11-07",runs:0,bosses:0,scrap:0,updatedAt:"2026-11-07T07:00:00Z"}}
 );
 assert.equal(merged.dailyStatus.date,"2026-11-07");
 assert.equal(merged.dailyStatus.runs,0);
});


test("an empty new-device save does not replace an established cloud pilot's choices",()=>{
 const merged=mergeGameSaves(
  {lastSeen:999,selectedFlag:"🇹🇷",selectedContract:"none",selectedSkin:"blue",runs:0,scrapCore:0},
  {lastSeen:100,selectedFlag:"🇯🇵",selectedContract:"storm",selectedSkin:"violet",runs:12,scrapCore:80}
 );
 assert.equal(merged.selectedFlag,"🇯🇵");
 assert.equal(merged.selectedContract,"storm");
 assert.equal(merged.selectedSkin,"violet");
 assert.equal(merged.runs,12);
});


test("daily run events merge additively across devices without double-counting shared run IDs",()=>{
 const merged=mergeGameSaves(
  {dailyStatus:{date:"2026-11-07",legacy:{runs:0,bosses:0,scrap:0},
   events:[{id:"device-a-run-1",runs:1,bosses:0,scrap:120}],runs:1,bosses:0,scrap:120}},
  {dailyStatus:{date:"2026-11-07",legacy:{runs:0,bosses:0,scrap:0},
   events:[{id:"device-b-run-1",runs:1,bosses:1,scrap:240}],runs:1,bosses:1,scrap:240}}
 );
 assert.equal(merged.dailyStatus.runs,2);
 assert.equal(merged.dailyStatus.bosses,1);
 assert.equal(merged.dailyStatus.scrap,360);
 assert.equal(merged.dailyStatus.events.length,2);
});

test("daily run event IDs prevent a repeated cloud sync from counting the same run twice",()=>{
 const event={id:"same-run",runs:1,bosses:1,scrap:300};
 const merged=mergeGameSaves(
  {dailyStatus:{date:"2026-11-07",legacy:{runs:0,bosses:0,scrap:0},events:[event],runs:1,bosses:1,scrap:300}},
  {dailyStatus:{date:"2026-11-07",legacy:{runs:0,bosses:0,scrap:0},events:[event],runs:1,bosses:1,scrap:300}}
 );
 assert.equal(merged.dailyStatus.runs,1);
 assert.equal(merged.dailyStatus.bosses,1);
 assert.equal(merged.dailyStatus.scrap,300);
 assert.equal(merged.dailyStatus.events.length,1);
});

test("daily event history compaction moves old runs into the legacy totals without losing progress",()=>{
 const events=Array.from({length:65},(_,index)=>({id:"run-"+index,runs:1,bosses:index===0?1:0,scrap:10}));
 const merged=mergeGameSaves(
  {dailyStatus:{date:"2026-11-07",legacy:{runs:0,bosses:0,scrap:0},events,runs:65,bosses:1,scrap:650}},
  {}
 );
 assert.equal(merged.dailyStatus.runs,65);
 assert.equal(merged.dailyStatus.bosses,1);
 assert.equal(merged.dailyStatus.scrap,650);
 assert.equal(merged.dailyStatus.events.length,64);
 assert.deepEqual(merged.dailyStatus.legacy,{runs:1,bosses:1,scrap:10});
});
