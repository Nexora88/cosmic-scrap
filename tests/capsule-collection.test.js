import test from "node:test";
import assert from "node:assert/strict";
import {
  CAPSULE_DUPLICATE_COMPENSATION,
  CAPSULE_HISTORY_LIMIT,
  appendCapsuleHistory,
  applyDuplicateCompensation,
  CAPSULE_COLLECTION_COPY,
  getCapsuleCollectionProgress
} from "../js/systems/CapsuleCollection.js";

test("all nine locales include collection progress and reward-history copy", () => {
  for (const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]) {
    assert.ok(CAPSULE_COLLECTION_COPY[locale].progress);
    assert.ok(CAPSULE_COLLECTION_COPY[locale].history);
    assert.ok(CAPSULE_COLLECTION_COPY[locale].emptyHistory);
    assert.ok(CAPSULE_COLLECTION_COPY[locale].duplicate);
  }
});

test("collection progress counts only unique known cosmetic rewards", () => {
  const rewards=[{id:"a"},{id:"b"},{id:"c"}];
  const inventory=[{id:"a"},{id:"a"},{id:"unknown"}];
  assert.deepEqual(getCapsuleCollectionProgress(rewards,inventory),{owned:1,total:3,percent:33});
});

test("collection progress safely handles an empty reward catalogue", () => {
  assert.deepEqual(getCapsuleCollectionProgress([],[]),{owned:0,total:0,percent:0});
});

test("reward history is newest-last, bounded, and validates records", () => {
  let history=[];
  for(let i=0;i<CAPSULE_HISTORY_LIMIT+3;i++) history=appendCapsuleHistory(history,{rewardId:"reward-"+i,rarity:"gold",earnedAt:"2026-11-16T12:00:00.000Z"});
  assert.equal(history.length,CAPSULE_HISTORY_LIMIT);
  assert.equal(history[0].rewardId,"reward-3");
  assert.equal(history.at(-1).rewardId,"reward-22");
  assert.equal(history.at(-1).duplicate,false);
});

test("duplicate history records the exact compensation amount", () => {
  const history=appendCapsuleHistory([],{rewardId:"elite-item",rarity:"elite",duplicate:true,compensation:CAPSULE_DUPLICATE_COMPENSATION,earnedAt:"2026-11-16T12:00:00.000Z"});
  assert.deepEqual(history[0],{rewardId:"elite-item",rarity:"elite",duplicate:true,compensation:25,earnedAt:"2026-11-16T12:00:00.000Z"});
});

test("duplicate compensation adds Scrap Core without changing gameplay stats", () => {
  const profile={scrapCore:40,core:0,meta:{damage:2}};
  assert.equal(applyDuplicateCompensation(profile),25);
  assert.equal(profile.scrapCore,65);
  assert.equal(profile.core,0);
  assert.deepEqual(profile.meta,{damage:2});
});

test("duplicate compensation safely handles invalid profiles and amounts", () => {
  assert.equal(applyDuplicateCompensation(null),0);
  const profile={scrapCore:10};
  assert.equal(applyDuplicateCompensation(profile,-4),0);
  assert.equal(profile.scrapCore,10);
});
