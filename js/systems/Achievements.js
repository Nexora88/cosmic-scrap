export const ACHIEVEMENTS=[
 {id:"first-signal",name:"FIRST SIGNAL",description:"Survive for 30 seconds.",reward:1,check:g=>g.elapsed>=30},
 {id:"scavenger",name:"VOID SCAVENGER",description:"Collect 180 scrap in one run.",reward:2,check:g=>g.scrapCollected>=180},
 {id:"storm-veteran",name:"STORM VETERAN",description:"Eliminate 12 enemies during storms in one run.",reward:2,check:g=>g.stormKills>=12},
 {id:"elite-breaker",name:"ELITE BREAKER",description:"Defeat an Elite boss.",reward:3,check:g=>g.bossesDefeated>=1},
 {id:"void-walker",name:"VOID WALKER",description:"Survive for 180 seconds.",reward:3,check:g=>g.elapsed>=180},
 {id:"combo-architect",name:"COMBO ARCHITECT",description:"Reach a 20-kill combo.",reward:2,check:g=>(g.combo?.max||0)>=20}
];
export function awardAchievements(game,profile){
 const known=new Set(Array.isArray(profile.achievements)?profile.achievements:[]),unlocked=[];
 for(const achievement of ACHIEVEMENTS){if(!known.has(achievement.id)&&achievement.check(game)){known.add(achievement.id);unlocked.push(achievement)}}
 profile.achievements=[...known];
 return {unlocked,reward:unlocked.reduce((sum,a)=>sum+a.reward,0),total:known.size};
}
