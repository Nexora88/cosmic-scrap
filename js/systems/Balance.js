// Centralized, deterministic pacing and difficulty curves.
// Rarity is rolled independently per card: Epic 5%, Rare 22%, Common 73%.
export function spawnIntervalAt(seconds){
 const t=Math.max(0,seconds);
 if(t<15)return .82-t*.012;
 if(t<50)return .64-(t-15)*.005;
 if(t<110)return .465-(t-50)*.0015;
 return Math.max(.28,.375-(t-110)*.00055);
}
export function enemyChancesAt(seconds){
 const t=Math.max(0,seconds);
 const weights={
  tank:t<55?0:t<140?.025+(t-55)*.00065:Math.min(.14,.08025+(t-140)*.00035),
  tankPlus:t<160?0:t<300?(t-160)*.00018:Math.min(.06,.0252+(t-300)*.0001),
  fast:t<12?.10:t<55?.16+(t-12)*.002:t<120?.246+(t-55)*.0007:.30,
  swarm:t<25?.10:t<70?.16+(t-25)*.002:t<150?.25+(t-70)*.001:.34,
  shooter:t<35?0:t<100?(t-35)*.0008:t<240?.052+(t-100)*.0005:Math.min(.20,.122+(t-240)*.00025),
  sniper:t<75?0:t<180?(t-75)*.00045:Math.min(.14,.04725+(t-180)*.00028),
  exploder:t<45?0:t<120?.035+(t-45)*.0004:Math.min(.11,.065+(t-120)*.00012),
  spawner:t<100?0:t<220?(t-100)*.00025:Math.min(.09,.03+(t-220)*.00014),
  normal:1
 };
 const total=Object.values(weights).reduce((sum,value)=>sum+value,0);
 return Object.fromEntries(Object.entries(weights).map(([type,value])=>[type,value/total]));
}
export function healthScaleAt(seconds){return 1+Math.min(5.8,Math.max(0,seconds-30)/190)}
export function speedScaleAt(seconds){return 1+Math.min(1.05,Math.max(0,seconds-25)/300)}
export function damageScaleAt(seconds){return 1+Math.min(1.65,Math.max(0,seconds-35)/260)}
export function xpNeededForLevel(level){return Math.ceil(12*Math.pow(Math.max(1,level),1.65))}
export function rarityAt(roll){
 const r=Math.max(0,Math.min(.999999999,roll));
 return r<.05?"epic":r<.27?"rare":"common";
}
