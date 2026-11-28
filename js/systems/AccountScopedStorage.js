const PREFIX = "cosmic-scrap-";
const ACTIVE_KEY = "cosmic-scrap-account-active-user";
const ACCOUNT_PREFIX = "cosmic-scrap-account:";
const GUEST_PREFIX = "cosmic-scrap-guest:";
const GLOBAL_PREFERENCES = new Set(["cosmic-scrap-language","cosmic-scrap-muted","cosmic-scrap-music-enabled","cosmic-scrap-sound-enabled","cosmic-scrap-volume","cosmic-scrap-vibration-enabled","cosmic-scrap-reduced-motion"]);
function isPlayerDataKey(key){return key.startsWith(PREFIX)&&key!==ACTIVE_KEY&&!GLOBAL_PREFERENCES.has(key)}
function namespaceFor(userId){return userId?ACCOUNT_PREFIX+userId+":":GUEST_PREFIX}
function snapshotCurrent(storage){const values={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&isPlayerDataKey(key))values[key]=storage.getItem(key)}return values}
function clearCurrent(storage){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&isPlayerDataKey(key))keys.push(key)}for(const key of keys)storage.removeItem(key)}
function persistSnapshot(storage,namespace,values){for(const [key,value] of Object.entries(values))if(typeof value==="string")storage.setItem(namespace+key,value)}
function readSnapshot(storage,namespace){const values={},keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&key.startsWith(namespace))keys.push(key)}for(const key of keys){const originalKey=key.slice(namespace.length);if(isPlayerDataKey(originalKey))values[originalKey]=storage.getItem(key)}return values}
/** Switch local player data to a guest or stable Supabase UUID partition. */
export function activateAccountStorage(userId,storage=globalThis.localStorage){
 if(!storage)return{changed:false,activeUserId:null};
 const next=typeof userId==="string"&&userId?userId:null;
 const previous=storage.getItem(ACTIVE_KEY);
 if((previous||null)===next)return{changed:false,activeUserId:next};
 const current=snapshotCurrent(storage);
 if(previous!==null||Object.keys(current).length)persistSnapshot(storage,namespaceFor(previous||null),current);
 clearCurrent(storage);
 for(const [key,value] of Object.entries(readSnapshot(storage,namespaceFor(next))))if(typeof value==="string")storage.setItem(key,value);
 if(next)storage.setItem(ACTIVE_KEY,next);else storage.removeItem(ACTIVE_KEY);
 return{changed:true,activeUserId:next};
}
export function accountStorageKey(userId,key){if(!userId||!isPlayerDataKey(key))throw new TypeError("A valid user ID and player-data key are required.");return ACCOUNT_PREFIX+userId+":"+key}
