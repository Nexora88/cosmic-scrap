export const COSMETIC_STORAGE_KEYS=Object.freeze({trail:"cosmic-scrap-equipped-trail",projectile:"cosmic-scrap-equipped-projectile",ship:"cosmic-scrap-equipped-ship"});
const ALLOWED=Object.freeze({trail:new Set(["rainbow","red-white"]),projectile:new Set(["star","plasma"]),ship:new Set(["neon-outline"])});
export function normalizeOwnedCosmetics(value){
 if(!Array.isArray(value))return [];
 const seen=new Set();
 return value.filter(item=>{
  if(!item||typeof item!=="object"||!ALLOWED[item.type]?.has(item.value)||typeof item.id!=="string"||typeof item.name!=="string"||seen.has(item.id))return false;
  seen.add(item.id);return true;
 }).map(({id,type,value,name,rarity,label})=>({id,type,value,name,rarity:String(rarity||"common"),label:String(label||"")}));
}
export function equipOwnedCosmetic(item,storage){
 if(!item||!ALLOWED[item.type]?.has(item.value))return false;
 let owned=[];
 try{owned=normalizeOwnedCosmetics(JSON.parse(storage.getItem("cosmic-scrap-capsule-cosmetics")||"[]"))}catch{return false}
 if(!owned.some(entry=>entry.id===item.id&&entry.type===item.type&&entry.value===item.value))return false;
 try{
  storage.setItem(COSMETIC_STORAGE_KEYS[item.type],item.value);
  if(typeof window!=="undefined")window.dispatchEvent(new Event("cosmic-scrap:save-changed"));
  return true;
 }catch{return false}
}
export function readEquippedCosmetics(storage){
 const result={};
 for(const [type,key] of Object.entries(COSMETIC_STORAGE_KEYS)){
  let value="";try{value=storage.getItem(key)||""}catch{}
  result[type]=ALLOWED[type].has(value)?value:"";
 }
 return result;
}
