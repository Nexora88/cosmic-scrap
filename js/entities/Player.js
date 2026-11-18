const countryFlagImages=new Map();
export function flagCountryCode(flag){
 const points=Array.from(String(flag||"")).map(char=>char.codePointAt(0)).filter(point=>point>=127462&&point<=127487);
 return points.length>=2?String.fromCharCode(points[0]-127397,points[1]-127397):"";
}
export function flagStyle(flag){
 if(flag==="🇹🇷"||flag.startsWith("🇹🇷"))return "turkey";
 if(flag==="🇦🇿")return "azerbaijan";
 return "generic";
}
function drawFlagStar(ctx,cx,cy,r,color){
 ctx.fillStyle=color;ctx.beginPath();
 for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.43:r,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
 ctx.closePath();ctx.fill();
}
function roundedRectPath(ctx,x,y,w,h,r){
 ctx.beginPath();
 ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
 ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
 ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
export function drawPilotFlag(ctx,flag,edge="#ffffff",motion=0){
 if(!ctx||!flag)return;
 const x=-17,y=-48,w=34,h=23,now=typeof performance!=="undefined"?performance.now():0;
 let reduced=false;
 try{reduced=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||localStorage.getItem("cosmic-scrap-performance-mode")==="low"}catch{}
 const slices=reduced?1:5,alpha=.82,speed=Math.min(1,Math.max(0,Number(motion)||0)/255),wave=reduced?0:1.45;
 const code=flagCountryCode(flag);
 let countryImage=null;
 if(code&&typeof Image!=="undefined"){
  countryImage=countryFlagImages.get(code);
  if(!countryImage){countryImage=new Image();countryImage.crossOrigin="anonymous";countryImage.src="https://flagcdn.com/w80/"+code.toLowerCase()+".png";countryFlagImages.set(code,countryImage)}
 }
 ctx.save();ctx.shadowColor="#000";ctx.shadowBlur=7;roundedRectPath(ctx,x,y,w,h,4);ctx.fillStyle="rgba(5,12,22,.96)";ctx.fill();ctx.shadowBlur=0;roundedRectPath(ctx,x,y,w,h,4);ctx.clip();
 for(let i=0;i<slices;i++){
  const sx=x+w*i/slices,sw=w/slices+.25,offset=wave*Math.sin(now*.0045+ i*.72)*(0.45+speed*.55);
  ctx.save();ctx.globalAlpha=alpha;if(typeof ctx.translate==="function")ctx.translate(0,offset);
  if(countryImage?.complete&&countryImage.naturalWidth>0&&typeof ctx.drawImage==="function"){
   const sourceX=countryImage.naturalWidth*i/slices,sourceW=countryImage.naturalWidth/slices+.5;
   ctx.drawImage(countryImage,sourceX,0,sourceW,countryImage.naturalHeight,sx,y,sw,h);
  }else{
   const style=flagStyle(flag);
   if(style==="turkey"){
    ctx.fillStyle="#e30a17";ctx.fillRect(sx,y,sw,h);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(sx+sw*.43,y+h*.5,5.8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e30a17";ctx.beginPath();ctx.arc(sx+sw*.49,y+h*.46,4.7,0,Math.PI*2);ctx.fill();drawFlagStar(ctx,sx+sw*.69,y+h*.5,2.7,"#fff");
   }else if(style==="azerbaijan"){
    ctx.fillStyle="#00b5e2";ctx.fillRect(sx,y,sw,h/3);ctx.fillStyle="#ed2939";ctx.fillRect(sx,y+h/3,sw,h/3);ctx.fillStyle="#3f9c35";ctx.fillRect(sx,y+2*h/3,sw,h/3);
   }else{
    ["#e9edf5","#d83b55","#2879c7"].forEach((color,j)=>{ctx.fillStyle=color;ctx.fillRect(sx,y+j*h/3,sw,h/3)});
   }
  }
  ctx.restore();
 }
 ctx.restore();
 ctx.save();ctx.shadowColor="#000";ctx.shadowBlur=6;ctx.strokeStyle=edge;ctx.lineWidth=1.6;roundedRectPath(ctx,x,y,w,h,4);ctx.stroke();ctx.restore();
}
export class Player{
 constructor(x,y,meta={}){this.x=x;this.y=y;this.size=9;this.speed=255*(1+(meta.speed||0)*.04);this.maxHealth=100+(meta.health||0)*10;this.health=this.maxHealth;this.damage=18+(meta.damage||0)*2;this.overclockRank=0;this.fireRate=.42;this.fireTimer=0;this.projectiles=1;this.projectileSpeed=520;this.pickupRange=105+(meta.pickup||0)*12;this.crit=.08;this.pierce=0;this.riftEcho=0;this.invuln=0;this.vx=0;this.vy=0;this.facing=0;this.enginePhase=0;this.trailHistory=[];this.trailClock=0}
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
  this.trailClock+=dt;if((dx||dy)&&this.trailClock>=.035){this.trailClock=0;this.trailHistory.push({x:this.x,y:this.y});if(this.trailHistory.length>24)this.trailHistory.shift()}
  this.fireTimer-=dt;this.invuln=Math.max(0,this.invuln-dt)
 }
 takeDamage(n){if(this.invuln>0)return false;this.health-=n;this.invuln=.55;return this.health<=0}
 draw(ctx,skin="blue"){
  const cosmetics=arguments[2]||this.cosmetics||{};
  const flag=this.flag||"🌐";
  if(!ctx)return;
  const trail=cosmetics.trail||"";
  if(trail&&this.trailHistory.length>2){
   ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=trail==="red-white"?5:4;ctx.globalAlpha=.58;
   const first=this.trailHistory[0],last=this.trailHistory[this.trailHistory.length-1],gradient=ctx.createLinearGradient(first.x,first.y,last.x,last.y);
   if(trail==="rainbow"){gradient.addColorStop(0,"#ff5c8a");gradient.addColorStop(.25,"#ffd166");gradient.addColorStop(.5,"#72f1b8");gradient.addColorStop(.75,"#55d9ff");gradient.addColorStop(1,"#b58cff")}
   else if(trail.startsWith("trail-")){const hue=(Number(trail.split("-")[1])||1)*47%360;gradient.addColorStop(0,"hsl("+hue+" 95% 65%)");gradient.addColorStop(.5,"hsl("+(hue+48)%360+" 95% 75%)");gradient.addColorStop(1,"hsl("+(hue+105)%360+" 95% 65%)")}
   else{gradient.addColorStop(0,"#e30a17");gradient.addColorStop(.48,"#ffffff");gradient.addColorStop(1,"#e30a17")}
   ctx.strokeStyle=gradient;ctx.shadowColor=trail==="rainbow"?"#8a7cff":"#e30a17";ctx.shadowBlur=12;ctx.beginPath();this.trailHistory.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.stroke();ctx.restore();
  }
  const now=typeof performance!=="undefined"?performance.now():0;
  const pulse=1+.045*Math.sin(now*.007);
  const palettes={
   blue:{core:"#53e8ff",glow:"#12bfff",edge:"#e4fbff",wing:"#167baf"},
   mint:{core:"#79ffd0",glow:"#16d9a2",edge:"#eafff7",wing:"#168d75"},
   violet:{core:"#c79bff",glow:"#8a55ff",edge:"#f2e7ff",wing:"#6740b5"},
   amber:{core:"#ffd166",glow:"#ffad33",edge:"#fff1bd",wing:"#b87522"},
   red:{core:"#ff496b",glow:"#ff244f",edge:"#ffe0e8",wing:"#a52c49"},
   gold:{core:"#ffd166",glow:"#ffad33",edge:"#fff1bd",wing:"#b87522"},cyan:{core:"#53e8ff",glow:"#12bfff",edge:"#e4fbff",wing:"#167baf"},
   ice:{core:"#a8f0ff",glow:"#4bdfff",edge:"#e7fbff",wing:"#3688a8"},coral:{core:"#ff9a8b",glow:"#ff6f91",edge:"#fff0e9",wing:"#a94762"},emerald:{core:"#69f0ae",glow:"#00c878",edge:"#eafff2",wing:"#176b4a"},sapphire:{core:"#7aa7ff",glow:"#477dff",edge:"#e8f0ff",wing:"#294b9a"},amethyst:{core:"#d2a6ff",glow:"#a45cff",edge:"#f4eaff",wing:"#6842a3"},rose:{core:"#ff9fce",glow:"#ff5da8",edge:"#fff0f8",wing:"#a74376"},plasma:{core:"#ff7bff",glow:"#c13cff",edge:"#ffeaff",wing:"#762b99"},arctic:{core:"#b9fff8",glow:"#5fe8df",edge:"#efffff",wing:"#287f85"},solar:{core:"#ffe18a",glow:"#ffb52e",edge:"#fff8d8",wing:"#9b6720"},jade:{core:"#8affbf",glow:"#2ddf91",edge:"#effff5",wing:"#277c55"},ruby:{core:"#ff8798",glow:"#f03b68",edge:"#fff0f2",wing:"#8f2948"},pearl:{core:"#f2f0ff",glow:"#b8c5ff",edge:"#ffffff",wing:"#777caa"},ultraviolet:{core:"#c9a0ff",glow:"#8a3dff",edge:"#f6eaff",wing:"#51258d"},obsidian:{core:"#b6a9d6",glow:"#78659f",edge:"#eee8ff",wing:"#39334f"}
  };
  const colors=palettes[cosmetics.color]||palettes[skin]||palettes.blue;
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
  if(cosmetics.ship==="neon-outline"){ctx.strokeStyle="#b58cff";ctx.shadowColor="#a66bff";ctx.shadowBlur=18;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(19,-7);ctx.lineTo(16,15);ctx.lineTo(0,22);ctx.lineTo(-16,15);ctx.lineTo(-19,-7);ctx.closePath();ctx.stroke();}
  if(cosmetics.ship==="comet-frame"){ctx.strokeStyle="#ffd166";ctx.shadowColor="#ffd166";ctx.shadowBlur=20;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(22,8);ctx.lineTo(0,20);ctx.lineTo(-22,8);ctx.closePath();ctx.stroke()}
  if(cosmetics.ship==="eclipse-frame"){ctx.strokeStyle="#ff7bcb";ctx.shadowColor="#ff4db8";ctx.shadowBlur=25;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,27,18,Math.PI/4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke()}
  if(cosmetics.ship?.startsWith("frame-")){const hue=(Number(cosmetics.ship.split("-")[1])||1)*31%360;ctx.strokeStyle="hsl("+hue+" 95% 70%)";ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=18;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,0,25+(Number(cosmetics.ship.split("-")[1])%4),19,Math.PI/4,0,Math.PI*2);ctx.stroke()}
  if(cosmetics.aura){const hue=(Number(cosmetics.aura.split("-")[1])||1)*41%360;ctx.globalAlpha=.28;ctx.strokeStyle="hsl("+hue+" 100% 70%)";ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=26;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,30+Math.sin(now*.004)*2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(cosmetics.symbol){const symbol=Number(cosmetics.symbol.split("-")[1])||1;const glyphs=["✦","◇","✧","☼","✺","✶","✷","∞","⌘","⟡","✹","◈","✪","✥","✵"];ctx.shadowBlur=8;ctx.fillStyle=colors.edge;ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(glyphs[(symbol-1)%glyphs.length],0,5)}
  if(cosmetics.banner){const hue=(Number(cosmetics.banner.split("-")[1])||1)*29%360;ctx.save();ctx.rotate(-this.facing||0);ctx.fillStyle="hsl("+hue+" 85% 58%)";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(13,-24);ctx.lineTo(25,-20);ctx.lineTo(13,-14);ctx.closePath();ctx.fill();ctx.restore()}
  if(cosmetics.badge){const badge=Number(cosmetics.badge.split("-")[1])||1;ctx.save();ctx.rotate(-this.facing||0);ctx.globalAlpha=.9;ctx.fillStyle=colors.edge;ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(["✦","★","◇","✧","∞"][(badge-1)%5],-23,-20);ctx.restore()}
  ctx.restore();
  // Keep the country badge upright and above the ship, independent of its heading.
  if(flag){ctx.save();ctx.translate(this.x,this.y);drawPilotFlag(ctx,flag,colors.edge,Math.hypot(this.vx||0,this.vy||0));ctx.restore()}
 }
}
