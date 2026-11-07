const RARITY_MULTIPLIERS={common:1,rare:1.25,epic:2};
const upgradeRanks=new WeakMap();
let activePlayer=null;

export function resetUpgradeRanks(){
 activePlayer=null;
}

if(typeof window!=="undefined"){
 window.addEventListener("cosmic-scrap:run-restarted",resetUpgradeRanks);
}

export function getUpgradeRank(id){
 if(!activePlayer)return 0;
 return upgradeRanks.get(activePlayer)?.get(id)||0;
}

export function applyUpgradeChoice(player,upgrade,rarity="common"){
 if(!player||!upgrade||typeof upgrade.apply!=="function")return false;
 const rarityMultiplier=RARITY_MULTIPLIERS[rarity];
 if(!rarityMultiplier)return false;
 if(activePlayer!==player)activePlayer=player;
 const ranks=upgradeRanks.get(player)||new Map();
 const previousRank=ranks.get(upgrade.id)||0;
 // Repeat picks gain +60% effect per existing rank, while each upgrade's own cap remains authoritative.
 const rankMultiplier=1+previousRank*.6;
 upgrade.apply(player,rarityMultiplier*rankMultiplier);
 ranks.set(upgrade.id,previousRank+1);
 upgradeRanks.set(player,ranks);
 return true;
}
