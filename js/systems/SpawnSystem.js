import {rand} from "../utils/MathUtils.js";
import {spawnIntervalAt,enemyChancesAt} from "./Balance.js";
export class SpawnSystem{
 constructor(){this.timer=0}
 update(dt,g){
  this.timer-=dt;
  // Denser first 15 seconds; the ramp remains gradual after the opening.
  const t=g.elapsed,rate=spawnIntervalAt(t),chances=enemyChancesAt(t);
  while(this.timer<=0&&g.enemies.length<g.maxEnemies){
   this.timer+=rate;
   const a=rand(0,Math.PI*2);
   const r=Math.min(Math.min(g.width,g.height)*.62,Math.max(g.width,g.height)*.36)+24;
   let type="normal",v=Math.random();
   if(v<chances.tank)type="tank";else if(v<chances.tank+chances.fast)type="fast";else if(v<chances.tank+chances.fast+chances.swarm)type="swarm";
   g.enemies.push(g.enemyPool.take(g.player.x+Math.cos(a)*r,g.player.y+Math.sin(a)*r,type,t));
  }
 }
}