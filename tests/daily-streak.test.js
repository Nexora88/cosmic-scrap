import test from "node:test";
import assert from "node:assert/strict";
import {claimDailyStreak,dailyStreakMessage} from "../js/systems/DailyStreak.js";
function storage(){const data=new Map();return{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),data}}
test("daily streak awards 50, 100 and 150 Scrap Core on consecutive days",()=>{
 const s=storage(),profile={scrapCore:0};
 const a=claimDailyStreak(profile,s,new Date(2026,10,1));
 const b=claimDailyStreak(profile,s,new Date(2026,10,2));
 const c=claimDailyStreak(profile,s,new Date(2026,10,3));
 assert.deepEqual([a.coreReward,b.coreReward,c.coreReward],[50,100,150]);
 assert.equal(profile.scrapCore,300);
 assert.equal(c.streak,3);
});
test("fourth consecutive day grants a capsule instead of currency and the cycle repeats",()=>{
 const s=storage(),profile={scrapCore:0};
 for(let day=1;day<=3;day++)claimDailyStreak(profile,s,new Date(2026,10,day));
 const fourth=claimDailyStreak(profile,s,new Date(2026,10,4));
 assert.equal(fourth.capsuleReward,true);
 assert.equal(fourth.coreReward,0);
 const fifth=claimDailyStreak(profile,s,new Date(2026,10,5));
 assert.equal(fifth.coreReward,50);
});
test("same-day claims are idempotent and missed days reset the streak",()=>{
 const s=storage(),profile={scrapCore:0};
 const first=claimDailyStreak(profile,s,new Date(2026,10,1));
 const duplicate=claimDailyStreak(profile,s,new Date(2026,10,1));
 assert.equal(first.claimed,true);
 assert.equal(duplicate.claimed,false);
 assert.equal(profile.scrapCore,50);
 const missed=claimDailyStreak(profile,s,new Date(2026,10,3));
 assert.equal(missed.streak,1);
 assert.equal(missed.coreReward,50);
});
test("daily reward message has localized labels in all nine supported languages",()=>{
 for(const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"])assert.ok(dailyStreakMessage({claimed:true,streak:2,coreReward:100},locale).length>8);
});


test("daily login reward uses UTC dates consistently across local time zones",()=>{
 const s=storage(),profile={scrapCore:0};
 const first=claimDailyStreak(profile,s,new Date("2026-11-15T00:30:00+03:00"));
 const duplicate=claimDailyStreak(profile,s,new Date("2026-11-14T21:45:00Z"));
 assert.equal(first.claimed,true);
 assert.equal(duplicate.claimed,false);
 assert.equal(profile.scrapCore,50);
});
