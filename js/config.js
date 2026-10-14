export const CONFIG={player:{size:9,speed:255,maxHealth:100,fireRate:.42,damage:18,projectileSpeed:520,pickupRange:105},spawn:{startRate:1.3,minRate:.23,baseHealth:24,baseSpeed:43},progression:{xpBase:12,xpGrowth:1.65,stormStart:180,stormDuration:18,stormInterval:92,comboTimeout:4},performance:{maxEnemies:280,maxProjectiles:560,maxParticles:320},meta:{startingScrap:0,idleCapHours:8}};
export const UPGRADES=[
{id:"fire",name:"Rapid Protocol",icon:"⌁",description:"Fire 15% faster.",available:s=>s.fireRate>.18,apply:s=>s.fireRate=Math.max(.18,s.fireRate*.88)},
{id:"damage",name:"Heavy Payload",icon:"✳",description:"Deal more damage with diminishing returns (cap 180).",available:s=>s.damage<180,apply:s=>s.damage=Math.min(180,s.damage*(s.damage<90?1.22:1.10))},
{id:"multishot",name:"Twin Signal",icon:"⋔",description:"Fire an extra projectile (max 4).",available:s=>(s.projectiles||1)<4,apply:s=>s.projectiles=Math.min(4,(s.projectiles||1)+1)},
{id:"health",name:"Reinforced Core",icon:"◇",description:"Restore health and increase max health.",available:s=>s.maxHealth<160,apply:s=>{s.maxHealth=Math.min(160,s.maxHealth+12);s.health=Math.min(s.maxHealth,s.health+28)}},
{id:"speed",name:"Phase Drive",icon:"»",description:"Move 12% faster (max 420).",available:s=>s.speed<420,apply:s=>s.speed=Math.min(420,s.speed*1.12)},
{id:"pickup",name:"Scrap Magnet",icon:"◎",description:"Increase pickup range by 25%.",available:s=>s.pickupRange<320,apply:s=>s.pickupRange=Math.min(320,s.pickupRange*1.25)},
{id:"crit",name:"Critical Spark",icon:"✦",description:"Increase critical chance by 8%.",available:s=>s.crit<.5,apply:s=>s.crit=Math.min(.5,s.crit+.06)},
{id:"pierce",name:"Phase Piercer",icon:"↠",description:"Projectiles pass through one more enemy (max 3).",available:s=>(s.pierce||0)<3,apply:s=>s.pierce=Math.min(3,(s.pierce||0)+1)},
{id:"orbit",name:"Orbiting Shield",icon:"◉",description:"Gain a rotating shard that damages nearby enemies (max 4); Gravity Well boosts orbit damage.",available:s=>(s.orbitCount||0)<4,apply:s=>s.orbitCount=Math.min(4,(s.orbitCount||0)+1)},
{id:"chain",name:"Chain Lightning",icon:"ϟ",description:"Hits arc to nearby foes; with Critical Spark, crits create a stronger bonus chain.",available:s=>(s.chainChance||0)<.5,apply:s=>s.chainChance=Math.min(.5,(s.chainChance||0)+.10)},
{id:"trail",name:"Ion Trail",icon:"〰",description:"Movement leaves a damaging energy wake.",available:s=>(s.trailDamage||0)<36,apply:s=>s.trailDamage=Math.min(36,(s.trailDamage||0)+9)},
{id:"nova",name:"Nova Burst",icon:"✹",description:"Periodically blast nearby enemies (max 3).",available:s=>(s.novaPower||0)<3,apply:s=>s.novaPower=Math.min(3,(s.novaPower||0)+1)},
{id:"explosion",name:"Kill Cascade",icon:"✺",description:"Enemies explode on defeat, damaging nearby foes (max 2).",available:s=>(s.explosionPower||0)<2,apply:s=>s.explosionPower=Math.min(2,(s.explosionPower||0)+1)},
{id:"slow",name:"Gravity Well",icon:"◌",description:"Nearby enemies move slower per rank (max 2); with Orbiting Shield, shards deal bonus damage.",available:s=>(s.slowAura||0)<2,apply:s=>s.slowAura=Math.min(2,(s.slowAura||0)+1)},
{id:"riftEcho",name:"Rift Echo",icon:"✧",description:"Every few kills, trigger a violet echo burst that damages nearby enemies (max 3).",available:s=>(s.riftEcho||0)<3,apply:s=>s.riftEcho=Math.min(3,(s.riftEcho||0)+1)}
];