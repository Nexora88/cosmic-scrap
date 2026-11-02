export const REGION_REWARDS=[
 {id:"debris",flag:"🇺🇸",name:"United States"},
 {id:"ember",flag:"🇬🇧",name:"United Kingdom"},
 {id:"cryo",flag:"🇩🇪",name:"Germany"},
 {id:"rift",flag:"🇯🇵",name:"Japan"},
 {id:"starforge",flag:"🇧🇷",name:"Brazil"},
 {id:"nova",flag:"🇦🇺",name:"Australia"},
 {id:"eclipse",flag:"🇨🇦",name:"Canada"}
];
export const FLAG_UNLOCKS=[
 {flag:"🇹🇷",label:"Türkiye",countryCode:"TR",regions:0,raids:0},
 {flag:"🇺🇸",label:"United States",countryCode:"US",regions:1,raids:0},
 {flag:"🇬🇧",label:"United Kingdom",countryCode:"GB",regions:2,raids:0},
 {flag:"🇩🇪",label:"Germany",countryCode:"DE",regions:3,raids:0},
 {flag:"🇯🇵",label:"Japan",countryCode:"JP",regions:4,raids:0},
 {flag:"🇧🇷",label:"Brazil",countryCode:"BR",regions:5,raids:0},
 {flag:"🇦🇺",label:"Australia",countryCode:"AU",regions:6,raids:0},
 {flag:"🇨🇦",label:"Canada",countryCode:"CA",regions:7,raids:0},
 {flag:"🇫🇷",label:"France",countryCode:"FR",regions:0,raids:2},
 {flag:"🇮🇳",label:"India",countryCode:"IN",regions:0,raids:3}
];
export const FLAG_PRICES={ "🇺🇸":100,"🇬🇧":150,"🇩🇪":200,"🇯🇵":250,"🇧🇷":300,"🇦🇺":350,"🇨🇦":400,"🇫🇷":180,"🇮🇳":220 };
export function purchaseFlag(profile,flag){
 const option=FLAG_UNLOCKS.find(item=>item.flag===flag);
 if(!profile||!option)return {ok:false,reason:"invalid",cost:0};
 if(isFlagUnlocked(profile,flag))return {ok:false,reason:"owned",cost:0};
 const cost=FLAG_PRICES[flag]||500;
 const balance=Math.max(0,Number(profile.scrapCore)||0);
 if(balance<cost)return {ok:false,reason:"funds",cost,balance};
 profile.scrapCore=balance-cost;
 profile.ownedFlags=[...new Set([...(Array.isArray(profile.ownedFlags)?profile.ownedFlags:[]),flag])];
 return {ok:true,reason:"purchased",cost,balance:profile.scrapCore};
}
export function captureRegion(profile,regionId){
 if(!profile||!REGION_REWARDS.some(region=>region.id===regionId))return null;
 const captured=Array.isArray(profile.capturedRegions)?profile.capturedRegions:[];
 if(captured.includes(regionId))return null;
 profile.capturedRegions=[...captured,regionId];
 return REGION_REWARDS.find(region=>region.id===regionId);
}
export function recordRaidWin(profile){
 if(!profile)return 0;
 profile.raidWins=Math.max(0,Number(profile.raidWins)||0)+1;
 return profile.raidWins;
}
export function countryCodeForFlag(flag){
 return FLAG_UNLOCKS.find(option=>option.flag===flag)?.countryCode||"TR";
}
export function isFlagUnlocked(profile,flag){
 const option=FLAG_UNLOCKS.find(item=>item.flag===flag);
 if(!option)return false;
 return (Array.isArray(profile?.ownedFlags)?profile.ownedFlags.includes(flag):false)
   || ((Array.isArray(profile?.capturedRegions)?profile.capturedRegions.length:0)>=option.regions
   && (Number(profile?.raidWins)||0)>=option.raids);
}
export function isSkinUnlocked(profile,skin){
 const regions=Array.isArray(profile?.capturedRegions)?profile.capturedRegions.length:0;
 const raids=Math.max(0,Number(profile?.raidWins)||0);
 if(skin==="red")return regions>=3;
 if(skin==="gold")return raids>=3;
 const required={blue:1,mint:2,violet:3,amber:5};
 return (Number(profile?.careerLevel)||1)>=(required[skin]||999);
}
