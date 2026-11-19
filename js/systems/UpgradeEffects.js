const RARITY_MULTIPLIERS={common:1,rare:1.25,epic:2};
export function applyUpgradeChoice(player,upgrade,rarity="common"){
 if(!player||!upgrade||typeof upgrade.apply!=="function")return false;
 const multiplier=RARITY_MULTIPLIERS[rarity];
 if(!multiplier)return false;
 // Apply rarity before the upgrade's own caps, so a boosted card cannot exceed its limit.
 upgrade.apply(player,multiplier);
 // Track each selected card rank so repeat picks are explicit and testable.
 if(!player.upgradeRanks||typeof player.upgradeRanks!=="object")player.upgradeRanks={};
 player.upgradeRanks[upgrade.id]=(player.upgradeRanks[upgrade.id]||0)+1;
 return true;
}
