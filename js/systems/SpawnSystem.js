import {rand} from "../utils/MathUtils.js";
export class SpawnSystem{
 constructor(){this.timer=0}
 update(dt,g){
  this.timer-=dt;
  // A calmer opening, then a smooth ramp instead of a sudden mid-run wall.
  const t=g.elapsed;
  const rate=t<35?1.48-t*.006:t<100?1.27-(t-35)*.0065:Math.max(.34,1.0-(t-100)*.00145);
  while(this.timer<=0&&g.enemies.length<g.maxEnemies){
   this.timer+=rate;
   const a=rand(0,Math.PI*2);
   const r=Math.min(Math.min(g.width,g.height)*.62,Math.max(g.width,g.height)*.36)+24;
   let type="normal",v=Math.random();
   if(t>95&&v<.08)type="tank";
   else if(t>22&&v<Math.min(.3,.12+t*.0012))type="fast";
   else if(t>55&&v<Math.min(.48,.22+t*.0015))type="swarm";
   g.enemies.push(g.enemyPool.take(g.player.x+Math.cos(a)*r,g.player.y+Math.sin(a)*r,type,t));
  }
 }
}