// Deterministic pacing curves shared by combat and spawn systems.
export function spawnIntervalAt(seconds){
 const t=Math.max(0,seconds);
 if(t<15)return .82-t*.012;
 if(t<50)return .64-(t-15)*.005;
 if(t<110)return .465-(t-50)*.0015;
 return Math.max(.205,.375-(t-110)*.00072);
}
export function bossIntervalAt(seconds){return Math.max(92,116-Math.max(0,seconds-180)*.035)}
export function bossIntervalAfterDefeat(defeatedCount){return Math.max(40,104-Math.max(0,Math.floor(defeatedCount))*9)}
export function bossWarningAt(seconds){return seconds>=105&&Math.abs(seconds-bossIntervalAt(seconds))<0.0001}
export function enemyChancesAt(seconds){
 const t=Math.max(0,seconds);
 const late=Math.max(0,Math.min(1,(t-180)/360));
 const weights={
  tank:t<55?0:t<140?.025+(t-55)*.00065:Math.min(.17,.08025+(t-140)*.00045),
  tankPlus:t<160?0:t<300?(t-160)*.00018:Math.min(.075,.0252+(t-300)*.00012),
  fast:t<12?.10:t<55?.16+(t-12)*.002:t<120?.246+(t-55)*.0007:.30,
  swarm:t<25?.10:t<70?.16+(t-25)*.002:t<150?.25+(t-70)*.001:.34,
  shooter:t<35?0:t<100?(t-35)*.0008:t<240?.052+(t-100)*.0005:Math.min(.25,.122+(t-240)*.00032),
  sniper:t<75?0:t<180?(t-75)*.00045:Math.min(.20,.04725+(t-180)*.00034),
  exploder:t<45?0:t<120?.035+(t-45)*.0004:Math.min(.13,.065+(t-120)*.00015),
  spawner:t<100?0:t<220?(t-100)*.00025:Math.min(.14,.03+(t-220)*.0002),
  prism:t<100?0:t<240?(t-100)*.00015:Math.min(.10,.021+(t-240)*.00018),
  charger:t<70?0:t<180?(t-70)*.00018:Math.min(.10,.025+(t-180)*.00017),
  leech:t<90?0:t<220?(t-90)*.00015:Math.min(.09,.0195+(t-220)*.00016),
  normal:Math.max(.48,1-late*.25)
 };
 const total=Object.values(weights).reduce((sum,value)=>sum+value,0);
 return Object.fromEntries(Object.entries(weights).map(([type,value])=>[type,value/total]));
}
export function healthScaleAt(seconds){return 1+Math.min(7.2,Math.max(0,seconds-30)/165)}
export function speedScaleAt(seconds){return 1+Math.min(1.25,Math.max(0,seconds-25)/250)}
export function damageScaleAt(seconds){return 1+Math.min(2.1,Math.max(0,seconds-35)/205)}
export function xpNeededForLevel(level){return Math.ceil(12*Math.pow(Math.max(1,level),1.65))}
export function rarityAt(roll){
 const r=Math.max(0,Math.min(.999999999,roll));
 return r<.05?"epic":r<.27?"rare":"common";
}
