// Tuning values are deterministic and covered by node:test.
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
 const tank=t<55?0:t<140?.025+(t-55)*.00065:Math.min(.12,.08025+(t-140)*.0003);
 const fast=t<12?.10:t<55?.16+(t-12)*.002:t<120?.246+(t-55)*.0007:.2915;
 const swarm=t<25?.10:t<70?.16+(t-25)*.002:t<150?.25+(t-70)*.001:.33;
 return {tank,fast,swarm,normal:Math.max(0,1-tank-fast-swarm)};
}
export function rarityAt(roll){
 const r=Math.max(0,Math.min(.999999999,roll));
 return r<.05?"epic":r<.27?"rare":"common";
}
