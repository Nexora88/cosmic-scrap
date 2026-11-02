const TAU=Math.PI*2;
const PALETTES={
 debris:{band:"rgba(104,137,170,",star:["#dceaff","#f5f8ff","#a9c9ed","#ffd9b0"]},
 ember:{band:"rgba(153,91,77,",star:["#fff0df","#f7d5c2","#d9c8ff","#fff8ee"]},
 cryo:{band:"rgba(80,133,171,",star:["#e4f5ff","#ffffff","#a9dcff","#f8e7d4"]},
 rift:{band:"rgba(119,91,158,",star:["#f0e8ff","#ffffff","#c9b8ff","#c9e6ff"]},
 starforge:{band:"rgba(154,125,83,",star:["#fff0d8","#ffffff","#ffd6a2","#d5e5ff"]},\n nova:{band:"rgba(132,91,170,",star:["#f4eaff","#ffffff","#d9baff","#b9e9ff"]},\n eclipse:{band:"rgba(83,105,164,",star:["#e8edff","#ffffff","#b9c9ff","#d9dfff"]}
};
function hash(n){const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)}
function drawRegionBackdrop(ctx,region,elapsed,width,height,lowEnd=false){
 const id=region?.id||"debris",palette=PALETTES[id]||PALETTES.debris,t=elapsed||0;
 ctx.save();
 // Deep black space with only a restrained, physically-inspired galactic dust band.
 const base=ctx.createLinearGradient(0,0,width,height);
 base.addColorStop(0,"#02040a");base.addColorStop(.52,"#050812");base.addColorStop(1,"#010207");
 ctx.fillStyle=base;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.translate(width*.52,height*.52);ctx.rotate(-.38);
 const band=ctx.createRadialGradient(0,0,Math.min(width,height)*.025,0,0,Math.max(width,height)*.78);
 band.addColorStop(0,palette.band+".075)");band.addColorStop(.42,palette.band+".035)");band.addColorStop(1,palette.band+"0)");
 ctx.fillStyle=band;ctx.fillRect(-width,-height,width*2,height*2);ctx.restore();
 const count=lowEnd?230:620;
 for(let i=0;i<count;i++){
  const x=hash(i+11)*width,y=hash(i+count+73)*height;
  const size=hash(i+count*2+9)>.986?(lowEnd?1.25:1.8):hash(i+count*3+5)>.72?.85:.48;
  const phase=hash(i+count*4+1)*TAU,twinkle=.78+.22*Math.sin(t*(.45+hash(i+4)*.9)+phase);
  const tint=palette.star[Math.floor(hash(i+count*5+2)*palette.star.length)];
  ctx.globalAlpha=(size>1.2?.7:.32+hash(i+7)*.34)*twinkle;
  ctx.fillStyle=tint;ctx.fillRect(x,y,size,size);
  if(!lowEnd&&size>1.2&&twinkle>.96){
   ctx.globalAlpha*=.18;ctx.fillRect(x-3.5,y+.5,8,0.55);ctx.fillRect(x+.2,y-3.5,.55,8);
  }
 }
 // Fine drifting dust streaks add motion while keeping the background star-only.
 const streaks=lowEnd?10:24;
 ctx.save();ctx.globalCompositeOperation="screen";
 for(let i=0;i<streaks;i++){
  const drift=(t*(5+hash(i+401)*13))%(width+120),x=hash(i+501)*width+drift-width*.12,y=hash(i+601)*height;
  ctx.globalAlpha=.035+.025*Math.sin(t*.8+i);
  ctx.strokeStyle=i%4===0?"#ff9a85":palette.star[i%palette.star.length];ctx.lineWidth=.5;
  ctx.beginPath();ctx.moveTo(x-12,y-2);ctx.lineTo(x+12,y+2);ctx.stroke();
 }
 ctx.restore();
 // A few distant, naturally subdued stellar points add depth without graphic flares.
 if(!lowEnd){
  for(let i=0;i<9;i++){
   const x=hash(i+901)*width,y=hash(i+1901)*height,r=1.15+hash(i+2901)*.8;
   const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);
   glow.addColorStop(0,"rgba(190,215,255,.14)");glow.addColorStop(1,"rgba(190,215,255,0)");
   ctx.fillStyle=glow;ctx.fillRect(x-r*5,y-r*5,r*10,r*10);
  }
 }
 ctx.globalAlpha=1;ctx.restore();
}
export {drawRegionBackdrop};
