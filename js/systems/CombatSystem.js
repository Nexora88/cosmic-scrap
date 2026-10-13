import {distance} from "../utils/MathUtils.js";
const FIRE_RANGE=400,VIEW_MARGIN=90;
function isTargetable(e,g,p){return !e.dead&&distance(p,e)<=FIRE_RANGE&&e.x>=-VIEW_MARGIN&&e.x<=g.width+VIEW_MARGIN&&e.y>=-VIEW_MARGIN&&e.y<=g.height+VIEW_MARGIN}
export class CombatSystem{
 update(dt,g){
  const p=g.player;
  // Hostile shots are separate from player shots to prevent accidental enemy damage.
  for(const b of g.enemyProjectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life>0&&distance(b,p)<p.size+5){b.life=0;const before=p.health;if(p.takeDamage(b.damage)){g.endRun("ranged-hit")}if(p.health<before){g.hitFlash=.28;g.callbacks.audio?.damage()}}}
  g.enemyProjectiles=g.enemyProjectiles.filter(b=>b.life>0);
  if(p.fireTimer<=0&&g.enemies.length){
   let t=null,best=Infinity;
   for(const e of g.enemies){if(!isTargetable(e,g,p))continue;const d=distance(p,e);if(d<best){best=d;t=e}}
   g.target=t;
   if(t){p.fireTimer=p.fireRate;g.callbacks.audio?.shot?.();for(let i=0;i<p.projectiles&&g.projectiles.length<g.maxProjectiles;i++)g.projectiles.push(g.projectilePool.take(p.x,p.y,{x:t.x,y:t.y+(i-(p.projectiles-1)/2)*8},p.damage,p.projectileSpeed,p.pierce,Math.random()<p.crit))}
  }else if(p.fireTimer<=0)g.target=null;
  for(const b of g.projectiles){
   b.update(dt);
   for(const e of g.enemies){
    if(e.dead||b.hit.has(e))continue;
    if(distance(b,e)<e.size+4){
     e.health-=b.damage;b.hit.add(e);g.callbacks.audio?.hit?.(b.crit);
     if(b.crit){g.shockwaves.push({x:e.x,y:e.y,r:4,max:30,life:.18,maxLife:.18,color:"#fff18a"});g.shake=Math.min(6,g.shake+1.5)}
     for(let i=0;i<(b.crit?9:4)&&g.particles.length<g.maxParticles;i++)g.particles.push(g.particlePool.take(e.x,e.y,b.crit?"#fff18a":"#40cfff"));
     if(p.chainChance&&Math.random()<Math.min(.72,p.chainChance+(b.crit&&p.crit>.1?.08:0))){
      let near=null,nd=125;
      for(const other of g.enemies){if(other===e||!isTargetable(other,g,p))continue;const d=distance(e,other);if(d<nd){nd=d;near=other}}
      if(near){g.lightning.push({x1:e.x,y1:e.y,x2:near.x,y2:near.y,life:.2});near.health-=p.damage*(b.crit&&p.crit>.1?1.05:.7);if(b.crit&&p.crit>.1){g.lightning.push({x1:near.x,y1:near.y,x2:p.x,y2:p.y,life:.13});g.shake=Math.min(7,g.shake+1)}if(near.health<=0){near.dead=true;g.onKill(near)}}
     }
     if(e.health<=0){e.dead=true;g.onKill(e)}
     if(b.hit.size>b.pierce)b.life=0;
     break;
    }
   }
  }
  g.projectiles=g.projectiles.filter(b=>{if(b.life>0)return true;g.projectilePool.put(b);return false});
  for(const e of g.enemies){
   if(e.dead)continue;
   e.update(dt,p);
   if(e.type==="boss")e.shootCooldown-=dt;\n   if((e.type==="shooter"||e.type==="sniper"||e.type==="boss")&&e.shootCooldown<=0&&g.enemyProjectiles.length<g.maxEnemyProjectiles){
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
    const sniper=e.type==="sniper",range=sniper?850:520;
    if(d<range){const speed=sniper?330:225;g.enemyProjectiles.push({x:e.x,y:e.y,vx:dx/d*speed,vy:dy/d*speed,damage:e.damage*(sniper?1.7:1),life:sniper?3.0:2.35,type:e.type})}
    e.shootCooldown=sniper?2.5+Math.random()*.65:1.15+Math.random()*.45;
   }
   if(distance(e,p)<e.size+p.size){
    const before=p.health;
    if(p.takeDamage(e.damage))g.endRun("enemy-contact");
    if(p.health<before){g.hitFlash=.35;g.callbacks.audio?.damage()}
   }
  }
  g.enemies=g.enemies.filter(e=>{if(!e.dead)return true;g.enemyPool.put(e);return false});
  g.orbitAngle=(g.orbitAngle||0)+dt*2.8;g.novaTimer=(g.novaTimer||0)+dt;g.trailTimer=(g.trailTimer||0)+dt;
  if(p.orbitCount){
   for(let i=0;i<p.orbitCount;i++){
    const a=g.orbitAngle+i*Math.PI*2/p.orbitCount,ox=p.x+Math.cos(a)*31,oy=p.y+Math.sin(a)*31;
    for(const e of g.enemies){if(e.dead)continue;e._orbitTimer=Math.max(0,(e._orbitTimer||0)-dt);if(e._orbitTimer===0&&Math.hypot(e.x-ox,e.y-oy)<e.size+7){e.health-=12;e._orbitTimer=.45;if(g.shockwaves.length<(g.lowEnd?24:48))g.shockwaves.push({x:ox,y:oy,r:2,max:g.lowEnd?13:21,life:.16,maxLife:.16,color:"#9cfff2"});g.shake=Math.min(g.lowEnd?3:5,g.shake+.25);if(e.health<=0){e.dead=true;g.onKill(e)}}}
    if(g.particles.length<g.maxParticles&&Math.random()<.18)g.particles.push(g.particlePool.take(ox,oy,"#9cfff2"));
   }
  }
  if(p.trailDamage&&g.trailTimer>.16){g.trailTimer=0;for(const e of g.enemies){if(!e.dead&&distance(e,p)<e.size+16){e.health-=p.trailDamage*.16;if(e.health<=0){e.dead=true;g.onKill(e)}}}}
  if(p.novaPower&&g.novaTimer>Math.max(4,12/p.novaPower)){
   g.novaTimer=0;g.novaFlash=.24;g.shake=Math.min(g.lowEnd?4:10,g.shake+2.4*p.novaPower);g.shockwaves.push({x:p.x,y:p.y,r:8,max:150+p.novaPower*24,life:.42,maxLife:.42,color:"#fff18a"});if(!g.lowEnd)g.shockwaves.push({x:p.x,y:p.y,r:4,max:115+p.novaPower*18,life:.32,maxLife:.32,color:"#ff7bce"});
   for(let i=0;i<Math.min(g.lowEnd?8:24,g.maxParticles-g.particles.length);i++)g.particles.push(g.particlePool.take(p.x,p.y,"#fff18a"));
   for(const e of g.enemies){if(!e.dead&&distance(e,p)<150){e.health-=42*p.novaPower;if(e.health<=0){e.dead=true;g.onKill(e)}}}
   g.callbacks.audio?.combo();
  }
  g.enemies=g.enemies.filter(e=>{if(!e.dead)return true;g.enemyPool.put(e);return false});
 }
}