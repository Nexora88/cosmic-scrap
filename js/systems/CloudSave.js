const NUMERIC_MAX_KEYS=[
  "core","scrapCore","totalScrap","bestScore","contractCompletions",
  "careerXp","careerLevel","totalKills","runs","raidWins"
];
const META_KEYS=["health","damage","idle","speed","pickup"];
const UNION_KEYS=["achievements","completedMissions","unlockedCosmetics","seasonRewards","capturedRegions","ownedFlags"];

function mergeMissionPeriod(local, cloud) {
  const a = local && typeof local === "object" ? local : {};
  const b = cloud && typeof cloud === "object" ? cloud : {};
  const aKey = typeof a.period === "string" ? a.period : "";
  const bKey = typeof b.period === "string" ? b.period : "";
  if (aKey !== bKey) {
    const newest = aKey > bKey ? a : b;
    return { period: newest.period || "", progress: { ...(newest.progress || {}) }, claimed: [...new Set(Array.isArray(newest.claimed) ? newest.claimed : [])] };
  }
  const progress = {};
  for (const key of new Set([...Object.keys(a.progress || {}), ...Object.keys(b.progress || {})])) {
    progress[key] = Math.max(0, Number(a.progress?.[key]) || 0, Number(b.progress?.[key]) || 0);
  }
  return { period: aKey, progress, claimed: [...new Set([...(Array.isArray(a.claimed) ? a.claimed : []), ...(Array.isArray(b.claimed) ? b.claimed : [])])] };
}
function mergeDailyMissions(local, cloud) {
  const a = local && typeof local === "object" ? local : {};
  const b = cloud && typeof cloud === "object" ? cloud : {};
  return {
    daily: mergeMissionPeriod(a.daily, b.daily),
    weekly: mergeMissionPeriod(a.weekly, b.weekly)
  };
}
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
  merged.dailyMissions=mergeDailyMissions(local.dailyMissions,cloud.dailyMissions);
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
