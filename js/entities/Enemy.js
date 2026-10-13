import {healthScaleAt,speedScaleAt,damageScaleAt} from "../systems/Balance.js";
export class Enemy{
 constructor(x,y,type,elapsed){this.reset(x,y,type,elapsed)}
 reset(x,y,type,elapsed){
  this.x=x;this.y=y;this.type=type;
  const stats={normal:[6,24,1,10],fast:[4,15,1.8,7],tank:[11,95,.48,26],swarm:[3,9,1.35,4],shooter:[7,19,.78,12]}[type]||[6,24,1,10];
  this.size=stats[0];this.maxHealth=stats[1]*healthScaleAt(elapsed);this.health=this.maxHealth;
  this.speed=stats[2]*speedScaleAt(elapsed)*48;this.xp=stats[3];
  const baseDamage=type==="tank"?19:type==="swarm"?4:type==="shooter"?6:8;
  this.damage=baseDamage*damageScaleAt(elapsed);this.shootCooldown=type==="shooter"?1.25+Math.random()*.45:Infinity;
  this.dead=false;this._orbitTimer=0;return this;
 }
 update(dt,player){
  const dx=player.x-this.x,dy=player.y-this.y,d=Math.hypot(dx,dy)||1;
  const slowed=player.slowAura&&d<118?Math.max(.46,1-player.slowAura*.18):1;
  if(this.type==="shooter"){
   this.shootCooldown-=dt;
   // Ranged units try to hold a firing lane instead of blindly rushing the core.
   const direction=d<172?-1:d>258?1:0;
   if(direction){this.x+=dx/d*this.speed*slowed*dt*direction;this.y+=dy/d*this.speed*slowed*dt*direction}
  }else{this.x+=dx/d*this.speed*slowed*dt;this.y+=dy/d*this.speed*slowed*dt}
 }
 draw(ctx){
  if(this.type==="shooter"){
   ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.PI/4);ctx.fillStyle="#a46bff";ctx.shadowColor="#a46bff";ctx.shadowBlur=16;ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size);ctx.strokeStyle="#e3caff";ctx.lineWidth=1.5;ctx.strokeRect(-this.size/2-2,-this.size/2-2,this.size+4,this.size+4);ctx.restore();return;
  }
  ctx.save();ctx.fillStyle=this.type==="tank"?"#9c1834":this.type==="fast"?"#ff8b9b":"#ff304f";
  ctx.shadowColor="#ff173f";ctx.shadowBlur=this.type==="tank"?18:10;
  ctx.fillRect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);ctx.restore();
 }
}
