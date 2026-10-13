import {rand} from "../utils/MathUtils.js";
export class SpawnSystem{
 constructor(){this.timer=0}
 update(dt,g){
  this.timer-=dt;
  // Active opening, then a controlled ramp with room to react.
  const t=g.elapsed;
  const rate=t<18?1.02-t*.014:t<55?.77-(t-18)*.004:t<120?.62-(t-55)*.0024:Math.max(.31,.464-(t-120)*.00115);
  while(this.timer<=0&&g.enemies.length<g.maxEnemies){
   this.timer+=rate;
   const a=rand(0,Math.PI*2);
   const r=Math.min(Math.min(g.width,g.height)*.62,Math.max(g.width,g.height)*.36)+24;
   let type="normal",v=Math.random();
   const tankChance=t<70?0:t<150?.045+(t-70)*.00045:Math.min(.13,.081+(t-150)*.00025);
   const fastChance=t<12?.08:t<55?.16+(t-12)*.002:t<120?.246+(t-55)*.0007:.292;
   const swarmChance=t<25?.08:t<70?.16+(t-25)*.002:t<150?.25+(t-70)*.001:.33;
   if(v<tankChance)type="tank";else if(v<tankChance+fastChance)type="fast";else if(v<tankChance+fastChance+swarmChance)type="swarm";
   g.enemies.push(g.enemyPool.take(g.player.x+Math.cos(a)*r,g.player.y+Math.sin(a)*r,type,t));
  }
 }
}