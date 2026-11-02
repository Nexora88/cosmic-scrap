export class Player{
 constructor(x,y,meta={}){this.x=x;this.y=y;this.size=9;this.speed=255*(1+(meta.speed||0)*.04);this.maxHealth=100+(meta.health||0)*10;this.health=this.maxHealth;this.damage=18+(meta.damage||0)*2;this.fireRate=.42;this.fireTimer=0;this.projectiles=1;this.projectileSpeed=520;this.pickupRange=105+(meta.pickup||0)*12;this.crit=.08;this.pierce=0;this.riftEcho=0;this.invuln=0;this.vx=0;this.vy=0;this.facing=0;this.enginePhase=0}
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
  this.vx=dx*this.speed;this.vy=dy*this.speed;if(dx||dy)this.facing=Math.atan2(dy,dx)+Math.PI/2;this.enginePhase+=dt*18;this.x=Math.max(14,Math.min(Math.max(14,w-14),this.x+dx*this.speed*dt));
  this.y=Math.max(65,Math.min(Math.max(65,h-48),this.y+dy*this.speed*dt));
  this.fireTimer-=dt;this.invuln=Math.max(0,this.invuln-dt)
 }
 takeDamage(n){if(this.invuln>0)return false;this.health-=n;this.invuln=.55;return this.health<=0}
 draw(ctx,skin="blue"){
  const flag=this.flag||"🌐";
  if(!ctx)return;
  const now=typeof performance!=="undefined"?performance.now():0;
  const pulse=1+.045*Math.sin(now*.007);
  const palettes={
   blue:{core:"#53e8ff",glow:"#12bfff",edge:"#e4fbff",wing:"#167baf"},
   mint:{core:"#79ffd0",glow:"#16d9a2",edge:"#eafff7",wing:"#168d75"},
   violet:{core:"#c79bff",glow:"#8a55ff",edge:"#f2e7ff",wing:"#6740b5"},
   amber:{core:"#ffd166",glow:"#ffad33",edge:"#fff1bd",wing:"#b87522"},
   red:{core:"#ff496b",glow:"#ff244f",edge:"#ffe0e8",wing:"#a52c49"},
   gold:{core:"#ffd166",glow:"#ffad33",edge:"#fff1bd",wing:"#b87522"}
  };
  const colors=palettes[skin]||palettes.blue;
  ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.facing||0);
  if(this.invuln>0&&Math.floor(now/75)%2===0)ctx.globalAlpha=.48;
  // A compact star-pilot craft silhouette replaces the old featureless orb.
  ctx.shadowColor=colors.glow;ctx.shadowBlur=20;
  ctx.fillStyle=colors.wing;ctx.strokeStyle=colors.edge;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(-3,-5);ctx.lineTo(-15,-12);ctx.lineTo(-11,1);ctx.lineTo(-5,7);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(3,-5);ctx.lineTo(15,-12);ctx.lineTo(11,1);ctx.lineTo(5,7);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=colors.core;ctx.beginPath();ctx.moveTo(0,-15*pulse);ctx.lineTo(8,5);ctx.lineTo(5,12);ctx.lineTo(-5,12);ctx.lineTo(-8,5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.shadowBlur=10;ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(0,-1,3.2,5.2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=colors.glow;ctx.globalAlpha*=.82;const flame=14+Math.sin(this.enginePhase)*3;ctx.beginPath();ctx.moveTo(-3,10);ctx.lineTo(0,flame);ctx.lineTo(3,10);ctx.closePath();ctx.fill();ctx.globalAlpha*=.35;ctx.beginPath();ctx.moveTo(-1.4,11);ctx.lineTo(0,flame*.72);ctx.lineTo(1.4,11);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.strokeStyle=colors.edge;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,21+Math.sin(now*.006)*1.5,0,Math.PI*2);ctx.stroke();
  if(flag){
   ctx.font="13px system-ui, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
   ctx.shadowColor="#000";ctx.shadowBlur=5;ctx.fillText(flag,0,-29);
  }
  ctx.restore();
 }
}
