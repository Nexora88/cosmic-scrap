export class Player{
 constructor(x,y,meta={}){this.x=x;this.y=y;this.size=9;this.speed=255*(1+(meta.speed||0)*.04);this.maxHealth=100+(meta.health||0)*10;this.health=this.maxHealth;this.damage=18+(meta.damage||0)*2;this.fireRate=.42;this.fireTimer=0;this.projectiles=1;this.projectileSpeed=520;this.pickupRange=105+(meta.pickup||0)*12;this.crit=.08;this.pierce=0;this.riftEcho=0;this.invuln=0}
 update(dt,input,w,h){
  let dx=input.x,dy=input.y;
  // Tap/click movement targets the actual pointer position relative to the player.
  // Using the screen center here caused the core to travel in the wrong direction
  // as soon as the player moved away from the center.
  if(!dx&&!dy&&input.pointer.down&&input.pointer.active){
   dx=input.pointer.x-this.x;dy=input.pointer.y-this.y;
   const d=Math.hypot(dx,dy)||1;
   if(d>this.size*1.5){dx/=d;dy/=d}else{dx=0;dy=0}
  }else if(dx||dy){const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d}
  this.x=Math.max(14,Math.min(Math.max(14,w-14),this.x+dx*this.speed*dt));
  this.y=Math.max(65,Math.min(Math.max(65,h-48),this.y+dy*this.speed*dt));
  this.fireTimer-=dt;this.invuln=Math.max(0,this.invuln-dt)
 }
 takeDamage(n){if(this.invuln>0)return false;this.health-=n;this.invuln=.55;return this.health<=0}
 draw(ctx,skin="blue"){
  if(!ctx)return;
  const now=typeof performance!=="undefined"?performance.now():0;
  const pulse=1+.1*Math.sin(now*.008);
  const colors=skin==="red"?{core:"#ff496b",glow:"#ff244f",edge:"#ffe0e8"}:skin==="gold"?{core:"#ffd166",glow:"#ffad33",edge:"#fff1bd"}:{core:"#53e8ff",glow:"#12bfff",edge:"#e4fbff"};
  ctx.save();ctx.translate(this.x,this.y);
  if(this.invuln>0&&Math.floor(now/75)%2===0)ctx.globalAlpha=.5;
  ctx.shadowColor=colors.glow;ctx.shadowBlur=22;ctx.fillStyle=colors.core;
  ctx.beginPath();ctx.arc(0,0,this.size*pulse,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle=colors.edge;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,this.size+4,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha*=.72;ctx.strokeStyle=colors.glow;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,this.size+9+Math.sin(now*.006)*2,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,0,2.6,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
}
