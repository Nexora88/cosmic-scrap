export const BOSS_TYPES=Object.freeze(["boss","riftweaver","starbreaker","voidcolossus","novawarden","eclipse"]);
export const BOSS_CATALOG = Object.freeze({
 boss:Object.freeze({name:{en:"Elite Boss",tr:"Elit Patron"},size:30,health:720,speed:.43,xp:180,damage:34,interval:1.4,style:{en:"Direct pursuit · three phases",tr:"Doğrudan takip · üç faz"}}),
 riftweaver:Object.freeze({name:{en:"Rift Weaver",tr:"Yarık Dokuyucu"},size:27,health:610,speed:.38,xp:220,damage:30,interval:2.1,style:{en:"Orbiting movement · changes radius by phase",tr:"Yörüngesel hareket · faza göre mesafe değiştirir"}}),
 starbreaker:Object.freeze({name:{en:"Starbreaker",tr:"Yıldız Kıran"},size:34,health:920,speed:.46,xp:240,damage:36,interval:1.75,style:{en:"Aggressive pursuit · wider late-phase orbit",tr:"Saldırgan takip · son fazlarda geniş yörünge"}}),
 voidcolossus:Object.freeze({name:{en:"Void Colossus",tr:"Boşluk Kolosu"},size:42,health:1260,speed:.32,xp:300,damage:42,interval:1.85,style:{en:"Heavy pressure · highest base durability",tr:"Ağır baskı · en yüksek temel dayanıklılık"}}),
 novawarden:Object.freeze({name:{en:"Nova Warden",tr:"Nova Muhafızı"},size:36,health:880,speed:.4,xp:260,damage:34,interval:1.6,style:{en:"Phase-based pursuit · ranged pressure",tr:"Fazlı takip · menzilli baskı"}}),
 eclipse:Object.freeze({name:{en:"Eclipse",tr:"Tutulma"},size:40,health:1080,speed:.35,xp:280,damage:38,interval:1.7,style:{en:"Three-phase pursuit · ranged pressure",tr:"Üç fazlı takip · menzilli baskı"}})
});
export function isBossType(type){return BOSS_TYPES.includes(type)}
export function bossTypeForCycle(cycle){return BOSS_TYPES[Math.abs(Math.floor(cycle))%BOSS_TYPES.length]}
export function createRiftEvent(width,height){
 const span=Math.min(width,height),cx=width/2,cy=height/2,orbit=span*.245,radius=Math.max(30,Math.min(52,span*.095));
 const angles=[-Math.PI/2,Math.PI/6,5*Math.PI/6];
 const fields=angles.map((angle,index)=>({x:Math.max(radius+14,Math.min(width-radius-14,cx+Math.cos(angle)*orbit)),y:Math.max(78+radius,Math.min(height-radius-62,cy+Math.sin(angle)*orbit)),radius,index}));
 return {state:"warning",timer:2.5,duration:10,fields};
}
export function riftEventDamageAt(x,y,event){if(!event||event.state!=="active")return false;return event.fields.some(field=>Math.hypot(x-field.x,y-field.y)<field.radius)}
