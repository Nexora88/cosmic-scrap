import test from "node:test";
import assert from "node:assert/strict";
import { getMissionView, recordMissionProgress, claimMissionReward } from "../js/systems/DailyMissions.js";

const date = value => new Date(value + "T12:00:00.000Z");
test("daily and weekly missions are deterministic for the same UTC period", () => {
  const a = getMissionView({}, date("2026-11-15"), "en");
  const b = getMissionView({}, date("2026-11-15"), "en");
  assert.deepEqual(a.daily.map(x => x.id), b.daily.map(x => x.id));
  assert.deepEqual(a.weekly.map(x => x.id), b.weekly.map(x => x.id));
  assert.equal(a.daily.length, 3);
  assert.equal(a.weekly.length, 2);
});
test("run results accumulate progress without exceeding mission targets", () => {
  const profile = {};
  const now = date("2026-11-15");
  recordMissionProgress(profile, { survivalSeconds: 80, scrapCollected: 80, score: 1600, level: 4 }, now);
  recordMissionProgress(profile, { survivalSeconds: 80, scrapCollected: 80, score: 1600, level: 5 }, now);
  const view = getMissionView(profile, now);
  for (const task of view.daily) assert.ok(task.progress <= task.target);
});
test("completed mission rewards can be claimed once and add Scrap Core", () => {
  const profile = { scrapCore: 10 };
  const now = date("2026-11-15");
  const selected = getMissionView(profile, now).daily[0];
  const task = selected;
  const state = profile.dailyMissions.daily;
  state.progress[task.id] = task.target;
  const first = claimMissionReward(profile, "daily", task.id, now);
  const duplicate = claimMissionReward(profile, "daily", task.id, now);
  assert.equal(first.ok, true);
  assert.equal(first.reward, task.reward);
  assert.equal(duplicate.reason, "claimed");
  assert.equal(profile.scrapCore, 10 + task.reward);
});
test("incomplete and invalid mission claims cannot award currency", () => {
  const profile = { scrapCore: 5 };
  const now = date("2026-11-15");
  const task = getMissionView(profile, now).daily[0];
  assert.equal(claimMissionReward(profile, "daily", task.id, now).reason, "incomplete");
  assert.equal(claimMissionReward(profile, "unknown", task.id, now).ok, false);
  assert.equal(profile.scrapCore, 5);
});
test("daily tasks rotate at UTC midnight and weekly tasks rotate at ISO week boundary", () => {
  const profile = {};
  const first = getMissionView(profile, date("2026-11-15"));
  const nextDay = getMissionView(profile, date("2026-11-16"));
  assert.notEqual(profile.dailyMissions.daily.period, "2026-11-15");
  assert.equal(nextDay.daily.length, 3);
  const beforeWeek = getMissionView({}, date("2026-11-15"));
  const afterWeek = getMissionView({}, date("2026-11-16"));
  assert.notEqual(beforeWeek.weekly[0].id + beforeWeek.weekly[1].id, afterWeek.weekly[0].id + afterWeek.weekly[1].id);
});
test("all nine supported locales provide mission copy", () => {
  for (const locale of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    const view = getMissionView({}, date("2026-11-15"), locale);
    assert.ok(view.copy.daily.length > 0);
    assert.ok(view.daily.every(task => task.name && task.description));
    assert.ok(view.weekly.every(task => task.name && task.description));
  }
});


test("active daily and weekly objectives stay focused on survival, collection, score and progression",()=>{
 const view=getMissionView({},date("2026-11-15"));
 const ids=[...view.daily,...view.weekly].map(task=>task.id);
 assert.ok(ids.every(id=>!/(kill|boss|weapon)/i.test(id)));
});


test("pilot level objective records the best single-run level instead of adding levels",()=>{
 let now=date("2026-11-15"),profile={},task;
 for(let day=15;day<=31&&!task;day++){
  now=date("2026-11-"+String(day).padStart(2,"0"));
  task=getMissionView(profile,now).daily.find(item=>item.id==="level-5");
 }
 if(!task)throw new Error("Test period did not include the level milestone");
 recordMissionProgress(profile,{level:4},now);
 recordMissionProgress(profile,{level:3},now);
 const current=getMissionView(profile,now).daily.find(item=>item.id==="level-5");
 assert.equal(current.progress,4);
});
