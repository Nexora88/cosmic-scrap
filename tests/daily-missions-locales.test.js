import test from "node:test";
import assert from "node:assert/strict";
import { getMissionView, supportedMissionLocales } from "../js/systems/DailyMissions.js";

const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];

test("daily and weekly mission copy is complete and readable in all nine locales",()=>{
  const profile={};
  for(const language of locales){
    const view=getMissionView(profile,new Date("2026-11-16T12:00:00.000Z"),language);
    assert.equal(view.daily.length,3);
    assert.equal(view.weekly.length,2);
    assert.ok(view.copy.daily && view.copy.weekly && view.copy.claim && view.copy.reward && view.copy.core);
    for(const task of [...view.daily,...view.weekly]){
      assert.ok(task.name.trim().length>2,language+" missing name for "+task.id);
      assert.ok(task.description.trim().length>5,language+" missing description for "+task.id);
      assert.doesNotMatch(task.name+task.description,/\uFFFD|\?{3,}/,language+" has corrupted copy");
    }
  }
  assert.deepEqual(supportedMissionLocales(),locales);
});

test("daily mission state resets at UTC midnight without changing the weekly period",()=>{
  const profile={};
  getMissionView(profile,new Date("2026-11-16T23:59:00.000Z"),"en");
  const firstDaily=profile.dailyMissions.daily.period;
  const firstWeekly=profile.dailyMissions.weekly.period;
  getMissionView(profile,new Date("2026-11-17T00:00:00.000Z"),"en");
  assert.equal(profile.dailyMissions.daily.period,"2026-11-17");
  assert.notEqual(profile.dailyMissions.daily.period,firstDaily);
  assert.equal(profile.dailyMissions.weekly.period,firstWeekly);
});
