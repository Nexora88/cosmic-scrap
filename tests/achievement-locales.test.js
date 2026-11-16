import test from "node:test";
import assert from "node:assert/strict";
import { ACHIEVEMENTS, getAchievementCopy, awardAchievements } from "../js/systems/Achievements.js";

const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];

test("every achievement has localized name and description in all supported languages",()=>{
  assert.equal(ACHIEVEMENTS.length,6);
  for(const language of locales){
    for(const achievement of ACHIEVEMENTS){
      const copy=getAchievementCopy(achievement,language);
      assert.ok(copy.name.length>2,language+" missing "+achievement.id+" name");
      assert.ok(copy.description.length>8,language+" missing "+achievement.id+" description");
      assert.doesNotMatch(copy.name+copy.description,/\uFFFD|\?{3,}/);
    }
  }
});

test("achievement unlocks remain one-time and do not alter gameplay rules",()=>{
  const profile={achievements:[]};
  const game={elapsed:31,scrapCollected:200,stormKills:12,bossesDefeated:1,combo:{max:20}};
  const first=awardAchievements(game,profile);
  const second=awardAchievements(game,profile);
  assert.equal(first.unlocked.length,6);
  assert.equal(first.reward,13);
  assert.equal(second.unlocked.length,0);
  assert.equal(profile.achievements.length,6);
});
