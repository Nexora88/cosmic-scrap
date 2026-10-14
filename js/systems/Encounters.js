export const BOSS_TYPES=Object.freeze(["boss","riftweaver","starbreaker"]);
export function isBossType(type){return BOSS_TYPES.includes(type)}
export function bossTypeForCycle(cycle){return BOSS_TYPES[Math.abs(Math.floor(cycle))%BOSS_TYPES.length]}
export function createRiftEvent(width,height){
 const span=Math.min(width,height),cx=width/2,cy=height/2,orbit=span*.245,radius=Math.max(30,Math.min(52,span*.095));
 const angles=[-Math.PI/2,Math.PI/6,5*Math.PI/6];
 const fields=angles.map((angle,index)=>({x:Math.max(radius+14,Math.min(width-radius-14,cx+Math.cos(angle)*orbit)),y:Math.max(78+radius,Math.min(height-radius-62,cy+Math.sin(angle)*orbit)),radius,index}));
 return {state:"warning",timer:2.5,duration:10,fields};
}
export function riftEventDamageAt(x,y,event){if(!event||event.state!=="active")return false;return event.fields.some(field=>Math.hypot(x-field.x,y-field.y)<field.radius)}
