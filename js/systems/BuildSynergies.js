export function hasBuildSynergy(player,id){
 if(id==="orbit-gravity")return (player.orbitCount||0)>0&&(player.slowAura||0)>0;
 if(id==="critical-chain")return (player.chainChance||0)>0&&(player.crit||0)>=.14;
 if(id==="drone-relay")return (player.supportDrones||0)>0&&(player.chainChance||0)>0;
 return false;
}
export function orbitDamageFor(player){return 12+(hasBuildSynergy(player,"orbit-gravity")?6:0)}
export function droneDamageFor(player){return (player.damage||0)*((player.chainChance||0)>.0?.58:.48)}
export const BUILD_SYNERGIES=Object.freeze([
 {id:"orbit-gravity",name:"ORBITAL GRAVITY",hint:"Orbit shards hit harder"},
 {id:"critical-chain",name:"CRITICAL CASCADE",hint:"Critical hits strengthen chain lightning"},
 {id:"drone-relay",name:"DRONE RELAY",hint:"Support drones pass damage to a nearby target"}
]);
