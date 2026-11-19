import { COSMETIC_REWARDS } from "./CosmeticCatalog.js";

const NUMERIC_MAX_KEYS=[
  "core","scrapCore","totalScrap","bestScore","contractCompletions",
  "careerXp","careerLevel","totalKills","runs","raidWins","capsuleCount","capsuleRuns","capsulesEarned","capsulesSpent"
];
const META_KEYS=["health","damage","idle","speed","pickup"];
const UNION_KEYS=["achievements","completedMissions","unlockedCosmetics","seasonRewards","capturedRegions","ownedFlags"];
const COSMETIC_TYPES = new Map();
for (const reward of COSMETIC_REWARDS) {
  if (!reward || typeof reward.type !== "string" || typeof reward.value !== "string") continue;
  if (!COSMETIC_TYPES.has(reward.type)) COSMETIC_TYPES.set(reward.type, new Set());
  COSMETIC_TYPES.get(reward.type).add(reward.value);
}
for (const [type, values] of Object.entries({trail:["rainbow","red-white"],projectile:["star","plasma"],ship:["neon-outline","comet-frame","eclipse-frame"]})) {
  if (!COSMETIC_TYPES.has(type)) COSMETIC_TYPES.set(type, new Set());
  for (const value of values) COSMETIC_TYPES.get(type).add(value);
}
const CAPSULE_RARITIES = new Set(["copper","iron","silver","gold","platinum","titanium","obsidian","elite"]);
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
  return { daily: mergeMissionPeriod(a.daily, b.daily), weekly: mergeMissionPeriod(a.weekly, b.weekly) };
}
function mergeCapsuleCosmetics(local, cloud) {
  const merged = new Map();
  for (const item of [...(Array.isArray(cloud) ? cloud : []), ...(Array.isArray(local) ? local : [])]) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" || !COSMETIC_TYPES.get(item.type)?.has(item.value)) continue;
    if (merged.has(item.id)) continue;
    merged.set(item.id, { id:item.id.slice(0,64), type:item.type, value:item.value, name:item.name.slice(0,80), rarity:String(item.rarity||"common").slice(0,24), label:String(item.label||"").slice(0,120) });
  }
  return [...merged.values()];
}
function mergeCapsuleHistory(local, cloud) {
  const entries = new Map();
  for (const item of [...(Array.isArray(cloud) ? cloud : []), ...(Array.isArray(local) ? local : [])]) {
    if (!item || typeof item.rewardId !== "string" || !item.rewardId || typeof item.earnedAt !== "string" || Number.isNaN(Date.parse(item.earnedAt))) continue;
    const normalized = {
      rewardId:item.rewardId.slice(0,64),
      rarity:CAPSULE_RARITIES.has(item.rarity)?item.rarity:"silver",
      duplicate:Boolean(item.duplicate),
      compensation:item.duplicate?Math.max(0,Math.floor(Number(item.compensation)||0)):0,
      earnedAt:item.earnedAt
    };
    entries.set([normalized.rewardId,normalized.earnedAt,normalized.duplicate].join("|"),normalized);
  }
  return [...entries.values()].sort((a,b)=>Date.parse(a.earnedAt)-Date.parse(b.earnedAt)).slice(-20);
}
export function mergeGameSaves(localSave,cloudSave){
  const local=localSave&&typeof localSave==="object"?localSave:{};
  const cloud=cloudSave&&typeof cloudSave==="object"?cloudSave:{};
  const merged={...cloud,...local,version:2};
  for(const key of NUMERIC_MAX_KEYS) merged[key]=Math.max(0,Number(local[key])||0,Number(cloud[key])||0);
  merged.meta={};
  for(const key of META_KEYS) merged.meta[key]=Math.max(0,Number(local.meta?.[key])||0,Number(cloud.meta?.[key])||0);
  for(const key of UNION_KEYS){
    merged[key]=[...new Set([...(Array.isArray(cloud[key])?cloud[key]:[]),...(Array.isArray(local[key])?local[key]:[])].filter(value=>typeof value==="string"))];
  }
  const localEarned=Number.isFinite(Number(local.capsulesEarned))?Math.max(0,Number(local.capsulesEarned)):Math.max(0,Number(local.capsuleCount)||0);
  const cloudEarned=Number.isFinite(Number(cloud.capsulesEarned))?Math.max(0,Number(cloud.capsulesEarned)):Math.max(0,Number(cloud.capsuleCount)||0);
  merged.capsulesEarned=Math.max(localEarned,cloudEarned);
  merged.capsulesSpent=Math.max(0,Number(local.capsulesSpent)||0,Number(cloud.capsulesSpent)||0);
  merged.capsuleCount=Math.max(0,merged.capsulesEarned-merged.capsulesSpent);
  merged.capsuleCosmetics=mergeCapsuleCosmetics(local.capsuleCosmetics,cloud.capsuleCosmetics);
  merged.capsuleHistory=mergeCapsuleHistory(local.capsuleHistory,cloud.capsuleHistory);
  merged.dailyMissions=mergeDailyMissions(local.dailyMissions,cloud.dailyMissions);
  const localSeen=Number(local.lastSeen)||0,cloudSeen=Number(cloud.lastSeen)||0;
  const localIsNewer=localSeen>=cloudSeen;
  if(cloud.selectedFlag&&cloudSeen>localSeen)merged.selectedFlag=cloud.selectedFlag;
  else if(local.selectedFlag)merged.selectedFlag=local.selectedFlag;
  const preferred=localIsNewer?local:cloud, fallback=localIsNewer?cloud:local;
  merged.equippedCosmetics={...(fallback.equippedCosmetics||{}),...(preferred.equippedCosmetics||{})};
  const dates=[local.firstPlayedAt,cloud.firstPlayedAt].filter(value=>value&&!Number.isNaN(Date.parse(value)));
  if(dates.length)merged.firstPlayedAt=dates.sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  return merged;
}
export function mergeCloudSaveConflict(localSave,latestCloudSave){return mergeGameSaves(localSave,latestCloudSave);}
