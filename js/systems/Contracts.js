export const CONTRACTS=[
 {id:"none",name:"ENDLESS SURVIVAL",metric:"none",target:1,reward:0,tag:"FREE FLIGHT",description:"No objective. Survive as long as you want.",short:"FREE PLAY"},
 {id:"salvager",name:"SALVAGE RUN",metric:"scrap",target:180,reward:2,tag:"SCAVENGER",description:"Collect 180 cosmic scrap in one run.",short:"COLLECT 180 SCRAP"},
 {id:"elite",name:"ELITE HUNTER",metric:"boss",target:1,reward:3,tag:"BOSS SLAYER",description:"Defeat one Elite boss in a single run.",short:"DEFEAT AN ELITE"},
 {id:"storm",name:"STORMBREAKER",metric:"storm",target:12,reward:2,tag:"STORM PROTOCOL",description:"Eliminate 12 enemies while the cosmic storm is active.",short:"12 STORM KILLS"}
];
export function getContract(id){return CONTRACTS.find(c=>c.id===id)||CONTRACTS[0]}
export function contractProgressText(contract,progress){if(!contract)return "";if(contract.metric==="none")return "ENDLESS · NO OBJECTIVE";return contract.metric==="boss"?(progress>=1?"ELITE DEFEATED":"ELITE NOT YET DEFEATED"):`${Math.min(contract.target,Math.floor(progress))} / ${contract.target} ${contract.metric==="scrap"?"SCRAP":"STORM KILLS"}`}
