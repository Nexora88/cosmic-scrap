import {healthScaleAt,speedScaleAt,damageScaleAt} from "../systems/Balance.js";
export class Enemy{
 constructor(x,y,type,elapsed){this.reset(x,y,type,elapsed)}
 reset(x,y,type,elapsed){
  this.x=x;this.y=y;this.type=type;
  const stats={normal:[6,24,1,10],fast:[4,15,1.8,7],tank:[11,95,.48,26],tankPlus:[14,155,.34,42],swarm:[3,9,1.35,4],shooter:[7,19,.78,12],sniper:[7,23,.42,18],exploder:[8,30,1.18,14],spawner:[10,68,.4,24],boss:[30,720,.43,180]}[type]||[6,24,1,10];
  this.size=stats[0];this.maxHealth=stats[1]*healthScaleAt(elapsed)*(type==="boss"?1+Math.min(1.2,Math.max(0,elapsed-120)/600):1);this.health=this.maxHealth;
  this.speed=stats[2]*speedScaleAt(elapsed)*48;this.xp=stats[3];
  const baseDamage=type==="boss"?34:type==="tankPlus"?27:type==="tank"?19:type==="swarm"?4:type==="shooter"?6:type==="sniper"?13:type==="exploder"?15:type==="spawner"?7:8;
  this.damage=baseDamage*damageScaleAt(elapsed);this.shootCooldown=type==="shooter"?1.05+Math.random()*.35:type==="sniper"?2.2+Math.random()*.6:type==="boss"?1.4:Infinity;
  this.dead=false;this._orbitTimer=0;this.bossShotClock=0;this.bossPhase=1;this.phaseClock=0;return this;
 }
 update(dt,player){
  const dx=player.x-this.x,dy=player.y-this.y,d=Math.hypot(dx,dy)||1;
  const slowed=player.slowAura&&d<118?Math.max(.36,1-player.slowAura*.2):1;
  if(this.type==="boss"){this.phaseClock+=dt;const phase=this.health/this.maxHealth<=.33?3:this.health/this.maxHealth<=.66?2:1;const pace=phase===3?1.65:phase===2?1.2:1;const tangentX=-dy/d,tangentY=dx/d,orbit=phase===1?0:phase===2?.28:.5;this.x+=(dx/d+tangentX*orbit)*this.speed*slowed*pace*dt;this.y+=(dy/d+tangentY*orbit)*this.speed*slowed*pace*dt;return}
  if(this.type==="shooter"||this.type==="sniper"||this.type==="spawner"){
   if(this.type!=="spawner")this.shootCooldown-=dt;
   const near=this.type==="sniper"?340:this.type==="spawner"?190:150;
   const far=this.type==="sniper"?490:this.type==="spawner"?295:235;
   const direction=d<near?-1:d>far?1:0;
   if(direction){this.x+=dx/d*this.speed*slowed*dt*direction;this.y+=dy/d*this.speed*slowed*dt*direction}
  }else{this.x+=dx/d*this.speed*slowed*dt;this.y+=dy/d*this.speed*slowed*dt}
 }
 draw(ctx){
  if(this.type==="boss"){
   const phase=this.health/this.maxHealth<=.33?3:this.health/this.maxHealth<=.66?2:1;const bossColor=phase===3?"#ff4fd8":phase===2?"#ff9b4a":"#ff244f";ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.PI/4);ctx.fillStyle=bossColor;ctx.shadowColor=bossColor;ctx.shadowBlur=phase===3?38:30;ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size);ctx.strokeStyle=phase===3?"#fff0fb":phase===2?"#ffe0b9":"#ffd1dc";ctx.lineWidth=phase===3?4:3;ctx.strokeRect(-this.size/2-5,-this.size/2-5,this.size+10,this.size+10);if(phase>1){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(0,0,this.size*.95+Math.sin(this.phaseClock*5)*4,0,Math.PI*2);ctx.stroke()}ctx.restore();
   ctx.save();const w=78,h=5;ctx.fillStyle="#300b19";ctx.fillRect(this.x-w/2,this.y-this.size/2-17,w,h);ctx.fillStyle=bossColor;ctx.fillRect(this.x-w/2,this.y-this.size/2-17,w*Math.max(0,this.health/this.maxHealth),h);ctx.strokeStyle="#ffb5c5";ctx.strokeRect(this.x-w/2,this.y-this.size/2-17,w,h);ctx.restore();return;
  }
  if(this.type==="shooter"||this.type==="sniper"||this.type==="spawner"||this.type==="tankPlus"||this.type==="exploder"){
   ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.PI/4);const colors={shooter:"#a46bff",sniper:"#ffb347",spawner:"#53e0a1",tankPlus:"#ff304f",exploder:"#ff6b35"};const color=colors[this.type]||"#a46bff";ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=16;if(this.type==="sniper"){ctx.beginPath();ctx.moveTo(0,-this.size);ctx.lineTo(this.size,0);ctx.lineTo(0,this.size);ctx.lineTo(-this.size,0);ctx.closePath();ctx.fill()}else if(this.type==="exploder"){ctx.beginPath();ctx.arc(0,0,this.size/2,0,Math.PI*2);ctx.fill()}else ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size);ctx.strokeStyle="#e3caff";ctx.lineWidth=1.5;ctx.strokeRect(-this.size/2-2,-this.size/2-2,this.size+4,this.size+4);ctx.restore();return;
  }
  ctx.save();ctx.fillStyle=this.type==="tank"||this.type==="tankPlus"?"#9c1834":this.type==="fast"?"#ff8b9b":"#ff304f";ctx.shadowColor="#ff173f";ctx.shadowBlur=this.type==="tank"?18:10;ctx.fillRect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);ctx.restore();
 }
}
