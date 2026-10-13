export const CONFIG={player:{size:9,speed:255,maxHealth:100,fireRate:.42,damage:18,projectileSpeed:520,pickupRange:105},spawn:{startRate:1.3,minRate:.23,baseHealth:24,baseSpeed:43},progression:{xpBase:7,xpGrowth:1.3,stormStart:240,stormDuration:18,stormInterval:92,comboTimeout:4},performance:{maxEnemies:280,maxProjectiles:560,maxParticles:320},meta:{startingScrap:0,idleCapHours:8}};
export const UPGRADES=[
{id:"fire",name:"Rapid Protocol",icon:"⌁",description:"Fire 15% faster.",available:s=>s.fireRate>.12,apply:s=>s.fireRate=Math.max(.1,s.fireRate*.85)},
{id:"damage",name:"Heavy Payload",icon:"✳",description:"Deal 25% more damage (cap 250).",available:s=>s.damage<250,apply:s=>s.damage=Math.min(250,s.damage*1.25)},
{id:"multishot",name:"Twin Signal",icon:"⋔",description:"Fire an extra projectile (max 5).",available:s=>(s.projectiles||1)<5,apply:s=>s.projectiles=Math.min(5,(s.projectiles||1)+1)},
{id:"health",name:"Reinforced Core",icon:"◇",description:"Restore health and increase max health.",available:s=>s.maxHealth<180,apply:s=>{s.maxHealth=Math.min(180,s.maxHealth+15);s.health=Math.min(s.maxHealth,s.health+40)}},
{id:"speed",name:"Phase Drive",icon:"»",description:"Move 12% faster (max 420).",available:s=>s.speed<420,apply:s=>s.speed=Math.min(420,s.speed*1.12)},
{id:"pickup",name:"Scrap Magnet",icon:"◎",description:"Increase pickup range by 25%.",available:s=>s.pickupRange<320,apply:s=>s.pickupRange=Math.min(320,s.pickupRange*1.25)},
{id:"crit",name:"Critical Spark",icon:"✦",description:"Increase critical chance by 8%.",available:s=>s.crit<.65,apply:s=>s.crit=Math.min(.65,s.crit+.08)},
{id:"pierce",name:"Phase Piercer",icon:"↠",description:"Projectiles pass through one more enemy (max 4).",available:s=>(s.pierce||0)<4,apply:s=>s.pierce=Math.min(4,(s.pierce||0)+1)},
{id:"orbit",name:"Orbiting Shield",icon:"◉",description:"Gain a rotating shard that damages nearby enemies (max 5).",available:s=>(s.orbitCount||0)<5,apply:s=>s.orbitCount=Math.min(5,(s.orbitCount||0)+1)},
{id:"chain",name:"Chain Lightning",icon:"ϟ",description:"Hits can arc damage to a nearby enemy.",available:s=>(s.chainChance||0)<.65,apply:s=>s.chainChance=Math.min(.65,(s.chainChance||0)+.14)},
{id:"trail",name:"Ion Trail",icon:"〰",description:"Movement leaves a damaging energy wake.",available:s=>(s.trailDamage||0)<48,apply:s=>s.trailDamage=Math.min(48,(s.trailDamage||0)+12)},
{id:"nova",name:"Nova Burst",icon:"✹",description:"Periodically blast nearby enemies (max 4).",available:s=>(s.novaPower||0)<4,apply:s=>s.novaPower=Math.min(4,(s.novaPower||0)+1)},
{id:"explosion",name:"Kill Cascade",icon:"✺",description:"Enemies explode on defeat, damaging nearby foes (max 3).",available:s=>(s.explosionPower||0)<3,apply:s=>s.explosionPower=Math.min(3,(s.explosionPower||0)+1)},
{id:"slow",name:"Gravity Well",icon:"◌",description:"Nearby enemies move 18% slower per rank (max 3).",available:s=>(s.slowAura||0)<3,apply:s=>s.slowAura=Math.min(3,(s.slowAura||0)+1)}
];