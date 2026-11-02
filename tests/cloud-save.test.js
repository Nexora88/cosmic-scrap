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
