const PALETTES={
 debris:{band:"rgba(104,137,170,",star:["#dceaff","#f5f8ff","#a9c9ed","#ffd9b0"]},
 ember:{band:"rgba(153,91,77,",star:["#fff0df","#f7d5c2","#d9c8ff","#fff8ee"]},
 cryo:{band:"rgba(80,133,171,",star:["#e4f5ff","#ffffff","#a9dcff","#f8e7d4"]},
 rift:{band:"rgba(119,91,158,",star:["#f0e8ff","#ffffff","#c9b8ff","#c9e6ff"]},
 starforge:{band:"rgba(154,125,83,",star:["#fff0d8","#ffffff","#ffd6a2","#d5e5ff"]},
 nova:{band:"rgba(132,91,170,",star:["#f4eaff","#ffffff","#d9baff","#b9e9ff"]},
 eclipse:{band:"rgba(83,105,164,",star:["#e8edff","#ffffff","#b9c9ff","#d9dfff"]}
};
function hash(n){const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)}
let cachedKey="",cachedCanvas=null;
function createLayer(width,height){
 let layer=null;
 try{if(typeof OffscreenCanvas!=="undefined")layer=new OffscreenCanvas(Math.max(1,Math.ceil(width)),Math.max(1,Math.ceil(height)));else if(typeof document!=="undefined"){layer=document.createElement("canvas");layer.width=Math.max(1,Math.ceil(width));layer.height=Math.max(1,Math.ceil(height))}}catch{}
 return layer;
}
function drawMapGrid(ctx,width,height,accent,lowEnd){
 ctx.save();ctx.globalAlpha=lowEnd?.018:.034;ctx.strokeStyle=accent;ctx.lineWidth=1;
 const step=lowEnd?112:72;
 for(let x=0;x<=width;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}
 for(let y=0;y<=height;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
 ctx.globalAlpha=lowEnd?.035:.06;ctx.setLineDash([3,9]);ctx.strokeStyle="#b7d7ef";
 const inset=Math.min(width,height)*.055;ctx.strokeRect(inset,inset,width-inset*2,height-inset*2);
 ctx.setLineDash([]);ctx.restore();
}
function drawCelestialLandmarks(ctx,width,height,accent,lowEnd){
 const min=Math.min(width,height),cx=width*.72,cy=height*.29,r=min*(lowEnd?.105:.14);
 const glow=ctx.createRadialGradient(cx-r*.25,cy-r*.3,r*.08,cx,cy,r*2.5);
 glow.addColorStop(0,"rgba(188,220,255,.11)");glow.addColorStop(.42,"rgba(90,142,190,.055)");glow.addColorStop(1,"rgba(30,70,110,0)");
 ctx.fillStyle=glow;ctx.fillRect(cx-r*2.5,cy-r*2.5,r*5,r*5);
 const planet=ctx.createRadialGradient(cx-r*.34,cy-r*.38,r*.04,cx,cy,r);
 planet.addColorStop(0,"#9bb5ca");planet.addColorStop(.38,"#3d627e");planet.addColorStop(.82,"#142b43");planet.addColorStop(1,"#07111e");
 ctx.save();ctx.globalAlpha=.34;ctx.fillStyle=planet;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=.16;ctx.strokeStyle=accent;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx,cy,r*1.55,r*.42,-.28,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=.12;ctx.strokeStyle="#c9e5ff";ctx.beginPath();ctx.ellipse(cx,cy,r*1.78,r*.52,-.28,0,Math.PI*2);ctx.stroke();ctx.restore();
 const sx=width*.22,sy=height*.72,sr=min*.035;
 const station=ctx.createRadialGradient(sx,sy,1,sx,sy,sr*3);station.addColorStop(0,"rgba(180,226,255,.22)");station.addColorStop(1,"rgba(100,190,255,0)");
 ctx.fillStyle=station;ctx.fillRect(sx-sr*3,sy-sr*3,sr*6,sr*6);
 ctx.save();ctx.globalAlpha=.4;ctx.translate(sx,sy);ctx.rotate(-.35);ctx.strokeStyle="#b9d8ee";ctx.lineWidth=1.1;ctx.strokeRect(-sr*.8,-sr*.8,sr*1.6,sr*1.6);ctx.beginPath();ctx.moveTo(-sr*2.1,0);ctx.lineTo(sr*2.1,0);ctx.moveTo(0,-sr*2.1);ctx.lineTo(0,sr*2.1);ctx.stroke();ctx.restore();
}
function drawAsteroidBelts(ctx,width,height,accent,lowEnd){
 const count=lowEnd?42:120,centerX=width*.5,centerY=height*.53,rx=width*.43,ry=height*.28;
 ctx.save();ctx.translate(centerX,centerY);ctx.rotate(-.22);ctx.globalAlpha=lowEnd?.22:.3;
 for(let i=0;i<count;i++){
  const a=hash(i+71)*Math.PI*2,band=(hash(i+191)-.5)*(lowEnd?26:42),rad=1+hash(i+311)*(lowEnd?1.5:2.8);
  const x=Math.cos(a)*(rx+band),y=Math.sin(a)*(ry+band*.48);
  ctx.fillStyle=i%7===0?accent:(i%3===0?"#a9c1d6":"#61778e");
  ctx.beginPath();ctx.moveTo(x-rad,y-rad*.45);ctx.lineTo(x+rad*.8,y-rad);ctx.lineTo(x+rad*1.3,y+rad*.35);ctx.lineTo(x-rad*.4,y+rad);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}
function drawRouteNetwork(ctx,width,height,accent,lowEnd){
 const pts=[[.13,.22],[.34,.16],[.53,.35],[.72,.29],[.86,.55],[.66,.78],[.4,.69],[.2,.82]].map(([x,y])=>[x*width,y*height]);
 ctx.save();ctx.globalAlpha=lowEnd?.075:.13;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.setLineDash([4,9]);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
 pts.forEach(([x,y],i)=>{const r=i===3?3.2:2;ctx.globalAlpha=i===3?.42:.25;ctx.fillStyle=i===3?"#fff":accent;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.1;ctx.beginPath();ctx.arc(x,y,r*3.5,0,Math.PI*2);ctx.fill()});
 ctx.restore();
}
function drawStaticLayer(ctx,region,width,height,lowEnd){
 const id=region?.id||"debris",palette=PALETTES[id]||PALETTES.debris,accent=region?.accent||"#40cfff";
 const base=ctx.createLinearGradient(0,0,width,height);base.addColorStop(0,"#02040a");base.addColorStop(.52,"#050812");base.addColorStop(1,"#010207");ctx.fillStyle=base;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.translate(width*.52,height*.52);ctx.rotate(-.38);const band=ctx.createRadialGradient(0,0,Math.min(width,height)*.025,0,0,Math.max(width,height)*.78);band.addColorStop(0,palette.band+".075)");band.addColorStop(.42,palette.band+".035)");band.addColorStop(1,palette.band+"0)");ctx.fillStyle=band;ctx.fillRect(-width,-height,width*2,height*2);ctx.restore();
 drawMapGrid(ctx,width,height,accent,lowEnd);
 drawCelestialLandmarks(ctx,width,height,accent,lowEnd);
 drawAsteroidBelts(ctx,width,height,accent,lowEnd);
 drawRouteNetwork(ctx,width,height,accent,lowEnd);
 const count=lowEnd?140:620;
 for(let i=0;i<count;i++){
  const x=hash(i+11)*width,y=hash(i+count+73)*height;
  const size=hash(i+count*2+9)>.986?(lowEnd?1.25:1.8):hash(i+count*3+5)>.72?.85:.48;
  const tint=palette.star[Math.floor(hash(i+count*5+2)*palette.star.length)];
  ctx.globalAlpha=size>1.2?.7:.5;ctx.fillStyle=tint;ctx.fillRect(x,y,size,size);
  if(!lowEnd&&size>1.2){ctx.globalAlpha=.12;ctx.fillRect(x-3.5,y+.5,8,.55);ctx.fillRect(x+.2,y-3.5,.55,8)}
 }
 if(!lowEnd){for(let i=0;i<9;i++){const x=hash(i+901)*width,y=hash(i+1901)*height,r=1.15+hash(i+2901)*.8;const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);glow.addColorStop(0,"rgba(190,215,255,.14)");glow.addColorStop(1,"rgba(190,215,255,0)");ctx.fillStyle=glow;ctx.fillRect(x-r*5,y-r*5,r*10,r*10)}}
 ctx.globalAlpha=1;
}
function drawRegionBackdrop(ctx,region,elapsed,width,height,lowEnd=false){
 const id=region?.id||"debris",key=[id,Math.ceil(width),Math.ceil(height),lowEnd?1:0].join(":");
 if(key!==cachedKey||!cachedCanvas){cachedKey=key;cachedCanvas=createLayer(width,height);if(cachedCanvas){const layerCtx=cachedCanvas.getContext("2d");if(layerCtx)drawStaticLayer(layerCtx,region,width,height,lowEnd);else cachedCanvas=null}}
 if(cachedCanvas)ctx.drawImage(cachedCanvas,0,0,width,height);else drawStaticLayer(ctx,region,width,height,lowEnd);
 const palette=PALETTES[id]||PALETTES.debris,t=elapsed||0,streaks=lowEnd?0:14;
 ctx.save();ctx.globalCompositeOperation="screen";
 for(let i=0;i<streaks;i++){
  const drift=(t*(5+hash(i+401)*13))%(width+120),x=hash(i+501)*width+drift-width*.12,y=hash(i+601)*height;
  ctx.globalAlpha=.025+.018*Math.sin(t*.8+i);ctx.strokeStyle=i%4===0?"#c7a69a":palette.star[i%palette.star.length];ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-12,y-2);ctx.lineTo(x+12,y+2);ctx.stroke();
 }
 ctx.restore();ctx.globalAlpha=1;
}
export {drawRegionBackdrop};
