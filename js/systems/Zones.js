export const ZONES=Object.freeze([
 {id:"nebula",name:"NEBULA FRONTIER",subtitle:"The first signal",rgb:[34,12,72],accent:"#a98bff",enemies:["swarm","leech","spawner"]},
 {id:"red-dwarf",name:"RED DWARF",subtitle:"Heat signatures rising",rgb:[92,13,31],accent:"#ff5574",enemies:["fast","charger","exploder"]},
 {id:"ice-rift",name:"ICE RIFT",subtitle:"Long-range threats detected",rgb:[8,52,83],accent:"#54dfff",enemies:["sniper","prism","tank"]},
 {id:"solar-graveyard",name:"SOLAR GRAVEYARD",subtitle:"Heavy units incoming",rgb:[105,55,12],accent:"#ffc15c",enemies:["tankPlus","spawner","leech"]}
]);
export const ZONE_DURATION=210;
export function zoneEnemyWeights(base,index){
 const weights={...base};
 const zone=ZONES[((index%ZONES.length)+ZONES.length)%ZONES.length];
 for(const type of zone.enemies)weights[type]=(weights[type]||0)+.085;
 weights.normal=Math.max(.28,(weights.normal||.5)-.16);
 const total=Object.values(weights).reduce((sum,value)=>sum+value,0);
 return Object.fromEntries(Object.entries(weights).map(([type,value])=>[type,value/total]));
}
export function nextZoneIndex(index){return (Math.max(0,Math.floor(index))+1)%ZONES.length}
