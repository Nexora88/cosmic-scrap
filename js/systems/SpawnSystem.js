import {rand} from "../utils/MathUtils.js";
import {spawnIntervalAt,enemyChancesAt} from "./Balance.js";
export class SpawnSystem{
 constructor(){this.timer=.12;this.openingSpawned=0}
 update(dt,g){
  this.timer-=dt;const t=g.elapsed,rate=spawnIntervalAt(t),chances=enemyChancesAt(t);let spawned=0;
  while(this.timer<=0&&g.enemies.length<g.maxEnemies&&spawned<3){
   this.timer+=rate;spawned++;const a=rand(0,Math.PI*2);
   const r=Math.min(Math.min(g.width,g.height)*.62,Math.max(g.width,g.height)*.36)+24;
   const v=Math.random();let type="normal",edge=0;
   for(const candidate of ["tank","tankPlus","fast","swarm","shooter","sniper","exploder","spawner","prism","charger","leech"]){edge+=chances[candidate];if(v<edge){type=candidate;break}}
   const opening=t<4&&this.openingSpawned<3;
   const spawnRadius=opening?Math.min(g.width,g.height)*(.24+.07*this.openingSpawned):r;
   const chosen=opening?(this.openingSpawned===2?"fast":"normal"):type;
   g.enemies.push(g.enemyPool.take(g.player.x+Math.cos(a)*spawnRadius,g.player.y+Math.sin(a)*spawnRadius,chosen,t));
   if(opening)this.openingSpawned++;
  }
  // Never carry a large spawn backlog forward: it can turn one frame into an unbounded catch-up loop.
  if(g.enemies.length>=g.maxEnemies&&this.timer<=0)this.timer=rate;
  else if(this.timer<=0)this.timer=rate;
 }
}
