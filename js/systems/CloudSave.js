const NUMERIC_MAX_KEYS=[
  "core","scrapCore","totalScrap","bestScore","contractCompletions",
  "careerXp","careerLevel","totalKills","runs","raidWins"
];
const META_KEYS=["health","damage","idle","speed","pickup"];
const UNION_KEYS=["achievements","completedMissions","unlockedCosmetics","seasonRewards","capturedRegions","ownedFlags"];

export function mergeGameSaves(localSave,cloudSave){
  const local=localSave&&typeof localSave==="object"?localSave:{};
  const cloud=cloudSave&&typeof cloudSave==="object"?cloudSave:{};
  const merged={...cloud,...local,version:2};
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
  const localSeen=Number(local.lastSeen)||0;
  const cloudSeen=Number(cloud.lastSeen)||0;
  if(cloud.selectedFlag&&cloudSeen>localSeen)merged.selectedFlag=cloud.selectedFlag;
  else if(local.selectedFlag)merged.selectedFlag=local.selectedFlag;
  const dates=[local.firstPlayedAt,cloud.firstPlayedAt]
    .filter(value=>value&&!Number.isNaN(Date.parse(value)));
  if(dates.length)merged.firstPlayedAt=dates.sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  return merged;
}

export function mergeCloudSaveConflict(localSave,latestCloudSave){
  return mergeGameSaves(localSave,latestCloudSave);
}
