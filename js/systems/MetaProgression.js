export const META=[
{id:"health",name:"Core Reinforcement",description:"+10 starting health per rank.",cost:20,max:8},
{id:"damage",name:"Starting Payload",description:"+2 starting damage per rank.",cost:25,max:10},
{id:"idle",name:"Idle Recycler",description:"+50% idle scrap per rank.",cost:30,max:10},
{id:"speed",name:"Move Speed",description:"+4% starting movement speed per rank. More room to dodge and reposition.",cost:35,max:6},
{id:"pickup",name:"Scrap Magnet",description:"+12 starting scrap pickup range per rank. Collect from safer distances.",cost:30,max:6}
];
export function buyMeta(save,id){const m=META.find(x=>x.id===id);if(!m||save.core<m.cost||(save.meta[id]||0)>=m.max)return false;save.core-=m.cost;save.meta[id]=(save.meta[id]||0)+1;return true}