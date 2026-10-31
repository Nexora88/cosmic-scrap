export function applyUpgradeChoice(player,upgrade,rarity="common"){
 if(!player||!upgrade||typeof upgrade.apply!=="function")return false;
 const applyOnce=()=>upgrade.apply(player);
 if(rarity==="epic"){applyOnce();applyOnce();return true}
 const before={...player};
 applyOnce();
 if(rarity==="rare"){
  for(const key of Object.keys(before)){
   if(typeof before[key]==="number"&&typeof player[key]==="number"&&player[key]!==before[key]){
    player[key]=before[key]+(player[key]-before[key])*1.25;
   }
  }
 }
 return true;
}
