const NUMERIC_MAX_KEYS=[
  "core","scrapCore","totalScrap","bestScore","contractCompletions",
  "careerXp","careerLevel","totalKills","runs","raidWins"
];
const META_KEYS=["health","damage","idle","speed","pickup"];
const UNION_KEYS=[
  "achievements","completedMissions","unlockedCosmetics","seasonRewards",
  "capturedRegions","ownedFlags"
];
const COSMETIC_VALUES={
  trail:new Set(["rainbow","red-white"]),
  projectile:new Set(["star","plasma"]),
  ship:new Set(["neon-outline"])
};
const SKINS=new Set(["blue","mint","violet","amber","red","gold"]);

function cleanOwnedCosmetics(values){
  if(!Array.isArray(values))return [];
  const seen=new Set();
  return values.filter(item=>{
    if(!item||typeof item!=="object"||typeof item.id!=="string"||
      !COSMETIC_VALUES[item.type]?.has(item.value)||seen.has(item.id))return false;
    seen.add(item.id);
    return true;
  }).map(({id,type,value,name,rarity,label})=>({
    id,type,value,name:String(name||id),rarity:String(rarity||"common"),label:String(label||"")
  }));
}

function mergeDailyStatus(local,cloud){
  const valid=value=>value&&typeof value==="object"&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value.date||"");
  if(!valid(local)&&!valid(cloud))return null;
  if(!valid(local))local=cloud;
  if(!valid(cloud))cloud=local;
  if(local.date!==cloud.date){
    // The calendar day is authoritative; a late-night UTC timestamp must not
    // make yesterday's progress replace the current local-day objective.
    return {...(local.date>=cloud.date?local:cloud)};
  }
  const updatedAt=(Date.parse(local.updatedAt||"")||0)>=(Date.parse(cloud.updatedAt||"")||0)?local.updatedAt:cloud.updatedAt;
  const base=value=>{
    const legacy=value.legacy;
    if(legacy&&typeof legacy==="object")return {
      runs:Math.max(0,Number(legacy.runs)||0),
      bosses:Math.max(0,Number(legacy.bosses)||0),
      scrap:Math.max(0,Number(legacy.scrap)||0)
    };
    return Array.isArray(value.events)&&value.events.length?{runs:0,bosses:0,scrap:0}:{
      runs:Math.max(0,Number(value.runs)||0),
      bosses:Math.max(0,Number(value.bosses)||0),
      scrap:Math.max(0,Number(value.scrap)||0)
    };
  };
  const leftBase=base(local),rightBase=base(cloud);
  const legacy={
    runs:Math.max(leftBase.runs,rightBase.runs),
    bosses:Math.max(leftBase.bosses,rightBase.bosses),
    scrap:Math.max(leftBase.scrap,rightBase.scrap)
  };
  const events=new Map();
  for(const event of [...(Array.isArray(local.events)?local.events:[]),...(Array.isArray(cloud.events)?cloud.events:[])]){
    if(!event||typeof event.id!=="string"||!event.id||events.has(event.id))continue;
    events.set(event.id,{
      id:event.id,
      runs:Math.max(0,Math.min(1,Math.floor(Number(event.runs)||0))),
      bosses:Math.max(0,Math.floor(Number(event.bosses)||0)),
      scrap:Math.max(0,Math.floor(Number(event.scrap)||0))
    });
  }
  const allEvents=[...events.values()];
  const dropped=allEvents.slice(0,Math.max(0,allEvents.length-64));
  for(const event of dropped){
    legacy.runs+=event.runs;
    legacy.bosses+=event.bosses;
    legacy.scrap+=event.scrap;
  }
  const retained=allEvents.slice(-64);
  const totals=retained.reduce((sum,event)=>({
    runs:sum.runs+event.runs,
    bosses:sum.bosses+event.bosses,
    scrap:sum.scrap+event.scrap
  }),{runs:0,bosses:0,scrap:0});
  return {
    date:local.date,
    legacy,
    events:retained,
    runs:legacy.runs+totals.runs,
    bosses:legacy.bosses+totals.bosses,
    scrap:legacy.scrap+totals.scrap,
    ...(updatedAt?{updatedAt}:{})
  };
}

export function mergeGameSaves(localSave,cloudSave){
  const local=localSave&&typeof localSave==="object"?localSave:{};
  const cloud=cloudSave&&typeof cloudSave==="object"?cloudSave:{};
  const localSeen=Math.max(0,Number(local.lastSeen)||0);
  const cloudSeen=Math.max(0,Number(cloud.lastSeen)||0);
  const hasProgress=save=>NUMERIC_MAX_KEYS.some(key=>(Number(save[key])||0)>0)||
    META_KEYS.some(key=>(Number(save.meta?.[key])||0)>0)||
    UNION_KEYS.some(key=>Array.isArray(save[key])&&save[key].length>0)||
    (Array.isArray(save.ownedCapsuleCosmetics)&&save.ownedCapsuleCosmetics.length>0);
  const localHasProgress=hasProgress(local),cloudHasProgress=hasProgress(cloud);
  const preferred=cloudHasProgress&&!localHasProgress?cloud:
    localHasProgress&&!cloudHasProgress?local:
    localSeen>=cloudSeen?local:cloud;
  const fallback=preferred===local?cloud:local;
  const merged={...cloud,...local,version:2,lastSeen:Math.max(localSeen,cloudSeen)};

  for(const key of NUMERIC_MAX_KEYS){
    merged[key]=Math.max(0,Number(local[key])||0,Number(cloud[key])||0);
  }
  merged.meta={};
  for(const key of META_KEYS){
    merged.meta[key]=Math.max(0,Number(local.meta?.[key])||0,Number(cloud.meta?.[key])||0);
  }
  for(const key of UNION_KEYS){
    merged[key]=[...new Set([
      ...(Array.isArray(cloud[key])?cloud[key]:[]),
      ...(Array.isArray(local[key])?local[key]:[])
    ].filter(value=>typeof value==="string"))];
  }

  for(const key of ["selectedFlag","selectedContract","selectedSkin"]){
    if(preferred[key]!==undefined&&preferred[key]!==null)merged[key]=preferred[key];
    else if(fallback[key]!==undefined&&fallback[key]!==null)merged[key]=fallback[key];
  }
  if(!SKINS.has(merged.selectedSkin))merged.selectedSkin="blue";

  merged.ownedCapsuleCosmetics=cleanOwnedCosmetics([
    ...(Array.isArray(cloud.ownedCapsuleCosmetics)?cloud.ownedCapsuleCosmetics:[]),
    ...(Array.isArray(local.ownedCapsuleCosmetics)?local.ownedCapsuleCosmetics:[])
  ]);
  merged.equippedCosmetics={};
  for(const type of Object.keys(COSMETIC_VALUES)){
    const value=preferred.equippedCosmetics?.[type];
    const backup=fallback.equippedCosmetics?.[type];
    merged.equippedCosmetics[type]=COSMETIC_VALUES[type].has(value)?value:
      COSMETIC_VALUES[type].has(backup)?backup:"";
  }
  const dailyStatus=mergeDailyStatus(local.dailyStatus,cloud.dailyStatus);
  if(dailyStatus)merged.dailyStatus=dailyStatus;

  const dates=[local.firstPlayedAt,cloud.firstPlayedAt]
    .filter(value=>value&&!Number.isNaN(Date.parse(value)));
  if(dates.length)merged.firstPlayedAt=dates.sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  return merged;
}

export function mergeCloudSaveConflict(localSave,latestCloudSave){
  return mergeGameSaves(localSave,latestCloudSave);
}
