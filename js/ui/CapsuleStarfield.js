const RARITY_COLORS={copper:"#b87333",iron:"#9aa4ad",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",titanium:"#a8b7c8",obsidian:"#a994d5",elite:"#ff7bcb"};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function createCapsuleStarfield(canvas){
 const context=canvas?.getContext?.("2d",{alpha:true});
 if(!context)return{start(){},setPhase(){},stop(){}};
 const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
 const lowPower=()=>((navigator.hardwareConcurrency||8)<=4)||((navigator.deviceMemory||8)<=4);
 const count=lowPower()?72:148;
 const stars=Array.from({length:count},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:.08+Math.random()*.92,twinkle:Math.random()*Math.PI*2,size:.35+Math.random()*1.45,spin:(Math.random()-.5)*.0008}));
 let width=1,height=1,dpr=1,frame=0,running=false,last=0,phase="idle",color="#75ddff",burst=0,rotation=0;
 const resize=()=>{
  const rect=canvas.getBoundingClientRect();
  dpr=Math.min(window.devicePixelRatio||1,1.5);
  width=Math.max(1,rect.width);height=Math.max(1,rect.height);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  context.setTransform(dpr,0,0,dpr,0,0);
 };
 const reset=star=>{star.x=Math.random()*2-1;star.y=Math.random()*2-1;star.z=1;star.twinkle=Math.random()*Math.PI*2;star.size=.35+Math.random()*1.45};
 const draw=now=>{
  if(!running)return;
  const elapsed=last?Math.min(34,now-last):16;last=now;
  const speed=reduced()?0:(phase==="idle"?.00012:phase==="charge"?.00055:phase==="warp"?.0085:.002);
  const twist=phase==="warp"?.0018:.00022;
  rotation+=elapsed*twist;
  context.clearRect(0,0,width,height);
  const cx=width*.5,cy=height*.48,depth=Math.min(width,height)*.72;
  const wash=context.createRadialGradient(cx,cy,0,cx,cy,Math.max(width,height)*.72);
  wash.addColorStop(0,phase==="reveal"?color+"18":"#0a315018");
  wash.addColorStop(1,"#02050b00");
  context.fillStyle=wash;context.fillRect(0,0,width,height);
  for(const star of stars){
   const oldZ=star.z;
   star.z-=speed*elapsed;
   const angle=rotation+star.spin*elapsed;
   const cos=Math.cos(angle),sin=Math.sin(angle);
   const rx=star.x*cos-star.y*sin,ry=star.x*sin+star.y*cos;
   const scale=1/Math.max(.045,star.z);
   const oldScale=1/Math.max(.045,oldZ);
   const x=cx+rx*depth*scale,y=cy+ry*depth*scale;
   const px=cx+rx*depth*oldScale,py=cy+ry*depth*oldScale;
   if(star.z<=.045||x<-width||x>width*2||y<-height||y>height*2){reset(star);continue}
   const alpha=clamp((1-star.z)*.9+.12,0,1);
   const radius=star.size*(.35+scale*.12);
   context.globalAlpha=alpha;
   context.strokeStyle=color;context.fillStyle="#e9faff";
   if(phase==="warp"||phase==="reveal"){
    context.lineWidth=Math.min(2.4,radius*.8);
    context.beginPath();context.moveTo(px,py);context.lineTo(x,y);context.stroke();
   }
   context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fill();
  }
  context.globalAlpha=1;
  if(phase==="warp"||phase==="reveal"){
   const ringRadius=Math.min(width,height)*(.12+Math.min(1,burst)*.22);
   context.strokeStyle=color;context.globalAlpha=phase==="reveal"?.24:.1;context.lineWidth=1.2;
   context.beginPath();context.arc(cx,cy,ringRadius,0,Math.PI*2);context.stroke();context.globalAlpha=1;
   burst=Math.min(1,burst+elapsed/(phase==="reveal"?430:1250));
  }else burst=0;
  frame=requestAnimationFrame(draw);
 };
 const start=()=>{
  if(running)return;
  resize();running=true;last=0;
  if(reduced()){draw(performance.now());return}
  frame=requestAnimationFrame(draw);
 };
 const setPhase=(next,rarity)=>{
  phase=next;
  if(rarity&&RARITY_COLORS[rarity])color=RARITY_COLORS[rarity];
  if(next==="idle")color="#75ddff";
  if(next==="warp")burst=0;
  if(next==="reveal")burst=0;
 };
 const stop=()=>{running=false;if(frame)cancelAnimationFrame(frame);frame=0;last=0;context.clearRect(0,0,width,height)};
 const onResize=()=>{if(running)resize()};
 window.addEventListener("resize",onResize,{passive:true});
 return{start,setPhase,stop,destroy(){stop();window.removeEventListener("resize",onResize)}};
}
