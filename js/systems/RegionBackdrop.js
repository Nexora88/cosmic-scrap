const PALETTES={
 debris:{dust:"rgba(113,145,177,",stars:["#e7f1ff","#ffffff","#b8d4f1","#f4dfc7"]},
 ember:{dust:"rgba(165,112,93,",stars:["#fff0df","#ffffff","#f0d1bd","#d9d4ff"]},
 cryo:{dust:"rgba(95,151,190,",stars:["#e4f5ff","#ffffff","#b7e0ff","#f8e7d4"]},
 rift:{dust:"rgba(137,111,179,",stars:["#f0e8ff","#ffffff","#c9b8ff","#c9e6ff"]},
 starforge:{dust:"rgba(169,139,96,",stars:["#fff0d8","#ffffff","#ffd6a2","#d5e5ff"]},
 nova:{dust:"rgba(145,112,180,",stars:["#f4eaff","#ffffff","#d9baff","#b9e9ff"]},
 eclipse:{dust:"rgba(103,126,180,",stars:["#e8edff","#ffffff","#b9c9ff","#d9dfff"]}
};
function hash(n){const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)}
function createLayer(width,height){
 let layer=null;
 try{if(typeof OffscreenCanvas!=="undefined")layer=new OffscreenCanvas(Math.max(1,Math.ceil(width)),Math.max(1,Math.ceil(height)));else if(typeof document!=="undefined"){layer=document.createElement("canvas");layer.width=Math.max(1,Math.ceil(width));layer.height=Math.max(1,Math.ceil(height))}}catch{}
 return layer;
}
function drawMilkyWayBand(ctx,width,height,palette){
 ctx.save();ctx.translate(width*.5,height*.5);ctx.rotate(-.34);
 const extent=Math.max(width,height),bandHeight=Math.max(90,Math.min(width,height)*.48);
 const band=ctx.createLinearGradient(0,-bandHeight,0,bandHeight);
 band.addColorStop(0,palette.dust+"0)");band.addColorStop(.28,palette.dust+".018)");band.addColorStop(.5,palette.dust+".055)");band.addColorStop(.72,palette.dust+".018)");band.addColorStop(1,palette.dust+"0)");
 ctx.fillStyle=band;ctx.fillRect(-extent,-bandHeight,extent*2,bandHeight*2);
 const core=ctx.createRadialGradient(-width*.08,0,1,-width*.08,0,extent*.42);
 core.addColorStop(0,"rgba(226,235,247,.045)");core.addColorStop(.42,"rgba(174,194,220,.018)");core.addColorStop(1,"rgba(120,150,190,0)");
 ctx.fillStyle=core;ctx.fillRect(-extent,-bandHeight,extent*2,bandHeight*2);
 // Fine dust lanes break up the glow without looking like a UI grid or colored nebula.
 ctx.globalAlpha=.16;ctx.strokeStyle="rgba(5,8,15,.8)";ctx.lineWidth=Math.max(3,Math.min(width,height)*.012);
 for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-extent,i*bandHeight*.19);ctx.bezierCurveTo(-width*.2,i*bandHeight*.12,width*.18,i*bandHeight*.28,extent,i*bandHeight*.13);ctx.stroke()}
 ctx.restore();
}
function drawStarField(ctx,width,height,palette,lowEnd){
 const count=lowEnd?180:360;
 for(let i=0;i<count;i++){
  const x=hash(i+11)*width,y=hash(i+count+73)*height;
  const size=hash(i+count*2+9)>.989?(lowEnd?1.45:2.05):hash(i+count*3+5)>.76?.9:.55;
  const tint=palette.stars[Math.floor(hash(i+count*5+2)*palette.stars.length)];
  const alpha=.28+hash(i+count*7+3)*.55;
  ctx.globalAlpha=alpha;ctx.fillStyle=tint;ctx.fillRect(x,y,size,size);
  if(size>1.4){ctx.globalAlpha=alpha*.16;ctx.fillRect(x-2.5,y+.2,6,.45);ctx.fillRect(x+.2,y-2.5,.45,6)}
 }
 // A handful of distant stars have a very restrained optical halo.
 for(let i=0;i<(lowEnd?3:7);i++){
  const x=hash(i+901)*width,y=hash(i+1901)*height,r=1.2+hash(i+2901)*.9;
  const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);
  glow.addColorStop(0,"rgba(211,229,250,.12)");glow.addColorStop(1,"rgba(190,215,255,0)");
  ctx.globalAlpha=1;ctx.fillStyle=glow;ctx.fillRect(x-r*5,y-r*5,r*10,r*10);
 }
 ctx.globalAlpha=1;
}
function drawStaticLayer(ctx,region,width,height,lowEnd){
 const id=region?.id||"debris",palette=PALETTES[id]||PALETTES.debris;
 const base=ctx.createLinearGradient(0,0,width,height);
 base.addColorStop(0,"#010208");base.addColorStop(.5,"#03060d");base.addColorStop(1,"#010207");
 ctx.fillStyle=base;ctx.fillRect(0,0,width,height);
 const horizon=ctx.createRadialGradient(width*.5,height*.45,0,width*.5,height*.45,Math.max(width,height)*.78);
 horizon.addColorStop(0,"rgba(22,34,52,.16)");horizon.addColorStop(1,"rgba(0,0,0,0)");
 ctx.fillStyle=horizon;ctx.fillRect(0,0,width,height);
 drawMilkyWayBand(ctx,width,height,palette);
 drawStarField(ctx,width,height,palette,lowEnd);
}
function drawRegionBackdrop(ctx,region,elapsed,width,height,lowEnd=false){
 const id=region?.id||"debris",key=[id,Math.ceil(width),Math.ceil(height),lowEnd?1:0].join(":");
 if(key!==cachedKey||!cachedCanvas){
  cachedKey=key;cachedCanvas=createLayer(width,height);
  if(cachedCanvas){const layerCtx=cachedCanvas.getContext("2d");if(layerCtx)drawStaticLayer(layerCtx,region,width,height,lowEnd);else cachedCanvas=null}
 }
 if(cachedCanvas)ctx.drawImage(cachedCanvas,0,0,width,height);
 else drawStaticLayer(ctx,region,width,height,lowEnd);
}
let cachedKey="",cachedCanvas=null;
export {drawRegionBackdrop};