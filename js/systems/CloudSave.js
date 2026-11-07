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

export function mergeGameSaves(localSave,cloudSave){
  const local=localSave&&typeof localSave==="object"?localSave:{};
  const cloud=cloudSave&&typeof cloudSave==="object"?cloudSave:{};
  const localSeen=Math.max(0,Number(local.lastSeen)||0);
  const cloudSeen=Math.max(0,Number(cloud.lastSeen)||0);
  const preferred=localSeen>=cloudSeen?local:cloud;
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

  const dates=[local.firstPlayedAt,cloud.firstPlayedAt]
    .filter(value=>value&&!Number.isNaN(Date.parse(value)));
  if(dates.length)merged.firstPlayedAt=dates.sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  return merged;
}

export function mergeCloudSaveConflict(localSave,latestCloudSave){
  return mergeGameSaves(localSave,latestCloudSave);
}
