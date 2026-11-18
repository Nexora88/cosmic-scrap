import {COSMETIC_ALLOWED_VALUES} from "./CosmeticCatalog.js";
export const COSMETIC_STORAGE_KEYS=Object.freeze({trail:"cosmic-scrap-equipped-trail",projectile:"cosmic-scrap-equipped-projectile",ship:"cosmic-scrap-equipped-ship",flag:"cosmic-scrap-flag",banner:"cosmic-scrap-equipped-banner",color:"cosmic-scrap-equipped-color",symbol:"cosmic-scrap-equipped-symbol",aura:"cosmic-scrap-equipped-aura",badge:"cosmic-scrap-equipped-badge"});
const legacy={trail:["rainbow","red-white"],projectile:["star","plasma"],ship:["neon-outline","comet-frame","eclipse-frame"],flag:["🇹🇷🔥","🇦🇿","🇺🇸","🇬🇧","🇩🇪","🇯🇵","🇧🇷","🇫🇷","🇮🇳"]};
const ALLOWED=Object.freeze(Object.fromEntries(Object.keys(COSMETIC_STORAGE_KEYS).map(type=>[type,new Set([...(legacy[type]||[]),...(COSMETIC_ALLOWED_VALUES[type]||[])])])));
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
 try{owned=normalizeOwnedCosmetics([...JSON.parse(storage.getItem("cosmic-scrap-capsule-cosmetics")||"[]"),...JSON.parse(storage.getItem("cosmic-scrap-server-cosmetics")||"[]")])}catch{return false}
 if(!owned.some(entry=>entry.id===item.id&&entry.type===item.type&&entry.value===item.value))return false;
 try{storage.setItem(COSMETIC_STORAGE_KEYS[item.type],item.value);return true}catch{return false}
}
export function readEquippedCosmetics(storage){
 const result={};
 for(const [type,key] of Object.entries(COSMETIC_STORAGE_KEYS)){
  let value="";try{value=storage.getItem(key)||""}catch{}
  result[type]=ALLOWED[type].has(value)?value:"";
 }
 return result;
}
