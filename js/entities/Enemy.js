import {healthScaleAt,speedScaleAt,damageScaleAt} from "../systems/Balance.js";
export class Enemy{
 constructor(x,y,type,elapsed){this.reset(x,y,type,elapsed)}
 reset(x,y,type,elapsed){
  this.x=x;this.y=y;this.type=type;
  const stats={normal:[6,24,1,10],fast:[4,15,1.8,7],tank:[11,95,.48,26],tankPlus:[14,155,.34,42],swarm:[3,9,1.35,4],shooter:[7,19,.78,12],sniper:[7,23,.42,18],exploder:[8,30,1.18,14],spawner:[10,68,.4,24]}[type]||[6,24,1,10];
  this.size=stats[0];this.maxHealth=stats[1]*healthScaleAt(elapsed);this.health=this.maxHealth;
  this.speed=stats[2]*speedScaleAt(elapsed)*48;this.xp=stats[3];
  const baseDamage=type==="tankPlus"?27:type==="tank"?19:type==="swarm"?4:type==="shooter"?6:type==="sniper"?13:type==="exploder"?15:type==="spawner"?7:8;
  this.damage=baseDamage*damageScaleAt(elapsed);this.shootCooldown=type==="shooter"?1.05+Math.random()*.35:type==="sniper"?2.2+Math.random()*.6:Infinity;
  this.dead=false;this._orbitTimer=0;return this;
 }
 update(dt,player){
  const dx=player.x-this.x,dy=player.y-this.y,d=Math.hypot(dx,dy)||1;
  const slowed=player.slowAura&&d<118?Math.max(.46,1-player.slowAura*.18):1;
  if(this.type==="shooter"||this.type==="sniper"||this.type==="spawner"){
   if(this.type!=="spawner")this.shootCooldown-=dt;
   // Ranged units keep a firing lane; spawners drift behind the frontline.
   const near=this.type==="sniper"?370:this.type==="spawner"?205:172;
   const far=this.type==="sniper"?520:this.type==="spawner"?315:258;
   const direction=d<near?-1:d>far?1:0;
   if(direction){this.x+=dx/d*this.speed*slowed*dt*direction;this.y+=dy/d*this.speed*slowed*dt*direction}
  }else{this.x+=dx/d*this.speed*slowed*dt;this.y+=dy/d*this.speed*slowed*dt}
 }
 draw(ctx){
  if(this.type==="shooter"||this.type==="sniper"||this.type==="spawner"||this.type==="tankPlus"||this.type==="exploder"){
   ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.PI/4);const colors={shooter:"#a46bff",sniper:"#ffb347",spawner:"#53e0a1",tankPlus:"#ff304f",exploder:"#ff6b35"};const color=colors[this.type]||"#a46bff";ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=16;if(this.type==="sniper"){ctx.beginPath();ctx.moveTo(0,-this.size);ctx.lineTo(this.size,0);ctx.lineTo(0,this.size);ctx.lineTo(-this.size,0);ctx.closePath();ctx.fill()}else if(this.type==="exploder"){ctx.beginPath();ctx.arc(0,0,this.size/2,0,Math.PI*2);ctx.fill()}else ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size);ctx.strokeStyle="#e3caff";ctx.lineWidth=1.5;ctx.strokeRect(-this.size/2-2,-this.size/2-2,this.size+4,this.size+4);ctx.restore();return;
  }
  ctx.save();ctx.fillStyle=this.type==="tank"||this.type==="tankPlus"?"#9c1834":this.type==="fast"?"#ff8b9b":"#ff304f";
  ctx.shadowColor="#ff173f";ctx.shadowBlur=this.type==="tank"?18:10;
  ctx.fillRect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);ctx.restore();
 }
}
