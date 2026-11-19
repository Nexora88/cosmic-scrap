export const LOADOUTS=Object.freeze({
 pulse:Object.freeze({role:"balanced",label:"PULSE",summary:"Balanced fire and reliable damage"}),
 orbit:Object.freeze({role:"guardian",label:"ORBIT",summary:"Two orbit blades and a tougher core"}),
 chain:Object.freeze({role:"arc-hunter",label:"CHAIN",summary:"Critical hits can arc lightning to nearby threats"})
});
export function applyLoadout(player,selection="pulse"){
 const key=Object.hasOwn(LOADOUTS,selection)?selection:"pulse";
 player.loadout=key;
 if(key==="orbit"){
  player.speed*=.92;player.damage*=.90;player.fireRate*=1.03;
  player.maxHealth+=20;player.health+=20;player.orbitCount=2;player.orbitDamage=22;player.orbitRadius=36;
 }else if(key==="chain"){
  player.damage*=.90;player.fireRate*=1.08;player.crit=Math.min(.5,player.crit+.18);player.chainChance=.28;
 }else{player.fireRate*=.92;player.damage*=1.03}
 return key;
}
