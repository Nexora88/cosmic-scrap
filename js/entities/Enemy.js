export class Enemy{
 constructor(x,y,type,elapsed){this.reset(x,y,type,elapsed)}
 reset(x,y,type,elapsed){
  this.x=x;this.y=y;this.type=type;
  const stats={normal:[6,24,1,20],fast:[4,15,1.8,14],tank:[11,95,.48,65],swarm:[3,9,1.35,8]}[type];
  this.size=stats[0];
  // Keep early enemies readable; scale durability gradually after the opening.
  this.maxHealth=stats[1]*Math.min(4.2,1+Math.max(0,elapsed-45)/310);
  this.health=this.maxHealth;
  this.speed=stats[2]*(1+Math.max(0,elapsed-30)/600)*48;
  this.xp=stats[3];this.damage=type==="tank"?19:type==="swarm"?4:8;
  this.dead=false;this._orbitTimer=0;return this;
 }
 update(dt,player){
  const dx=player.x-this.x,dy=player.y-this.y,d=Math.hypot(dx,dy)||1;
  const slowed=player.slowAura&&d<118?Math.max(.46,1-player.slowAura*.18):1;
  this.x+=dx/d*this.speed*slowed*dt;this.y+=dy/d*this.speed*slowed*dt;
 }
 draw(ctx){
  ctx.save();ctx.fillStyle=this.type==="tank"?"#9c1834":this.type==="fast"?"#ff8b9b":"#ff304f";
  ctx.shadowColor="#ff173f";ctx.shadowBlur=this.type==="tank"?18:10;
  ctx.fillRect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);ctx.restore();
 }
}