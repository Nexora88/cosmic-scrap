const KEY="cosmic-scrap-save-v2";
const OLD=["cosmic-scrap-save-v1"];
const fresh=()=>({version:2,bestScore:0,totalScrap:0,scrapCore:0,core:0,careerXp:0,careerLevel:1,totalKills:0,runs:0,meta:{health:0,damage:0,idle:0,speed:0,pickup:0},contractCompletions:0,selectedContract:"none",achievements:[],lastSeen:Date.now()});
export const load=()=>{
 try{
  let raw=localStorage.getItem(KEY);
  if(!raw)for(const k of OLD){raw=localStorage.getItem(k);if(raw)break}
  const old=raw?JSON.parse(raw):{};
  const legacyCore=Math.max(0,Number(old.core)||0);
  const earnedCore=Math.max(0,Number(old.scrapCore)||0);
  return {...fresh(),...old,version:2,scrapCore:earnedCore+legacyCore,core:0,meta:{...fresh().meta,...(old.meta||{})},contractCompletions:Math.max(0,Number(old.contractCompletions)||0),selectedContract:typeof old.selectedContract==="string"?old.selectedContract:"salvager",achievements:Array.isArray(old.achievements)?old.achievements.filter(x=>typeof x==="string"):[]};
 }catch{return fresh()}
};
export const save=data=>{try{localStorage.setItem(KEY,JSON.stringify({...data,core:0,version:2,lastSeen:Date.now()}))}catch{}};
export const exportSave=data=>JSON.stringify({...data,core:0,version:2},null,2);
export const resetSave=()=>{try{localStorage.removeItem(KEY);OLD.forEach(k=>localStorage.removeItem(k))}catch{}return fresh()};
export const awardIdle=data=>{const hours=Math.min(8,Math.max(0,(Date.now()-(data.lastSeen||Date.now()))/3600000));const amount=Math.floor(hours*(1+(data.meta?.idle||0)*.5)*5);data.totalScrap=(data.totalScrap||0)+amount;data.scrapCore=(data.scrapCore||0)+amount;data.core=0;data.lastSeen=Date.now();save(data);return amount};
