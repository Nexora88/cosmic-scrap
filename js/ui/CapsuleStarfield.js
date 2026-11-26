const RARITY_COLORS={copper:"#b87333",iron:"#9aa4ad",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",titanium:"#a8b7c8",obsidian:"#a994d5",elite:"#ff7bcb"};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function createCapsuleStarfield(canvas){
 const context=canvas?.getContext?.("2d",{alpha:true});
 if(!context)return{start(){},setPhase(){},stop(){},destroy(){}};
 const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
 const lowPower=()=>((navigator.hardwareConcurrency||8)<=4)||((navigator.deviceMemory||8)<=4);
 const count=lowPower()?72:148;
 const stars=Array.from({length:count},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:.08+Math.random()*.92,size:.35+Math.random()*1.45,spin:(Math.random()-.5)*.0008}));
 let width=1,height=1,dpr=1,frame=0,running=false,last=0,phase="idle",color="#75ddff",phaseStartedAt=0,burst=0,rotation=0;
 const resize=()=>{const rect=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,1.5);width=Math.max(1,rect.width);height=Math.max(1,rect.height);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0)};
 const reset=star=>{star.x=Math.random()*2-1;star.y=Math.random()*2-1;star.z=1;star.size=.35+Math.random()*1.45};
 const draw=now=>{
  if(!running)return;
  const elapsed=last?Math.min(34,now-last):16;last=now;
  if(phase==="implode"&&now-phaseStartedAt>=190){phase="supernova";phaseStartedAt=now;burst=0}
  if(phase==="supernova"&&now-phaseStartedAt>=520){phase="reveal";phaseStartedAt=now;burst=1}
  const progress=phase==="implode"?clamp((now-phaseStartedAt)/190,0,1):phase==="supernova"?clamp((now-phaseStartedAt)/520,0,1):0;
  const speed=reduced()?0:(phase==="idle"?.00012:phase==="charge"?.00055:phase==="warp"?.0085:phase==="reveal"?.0011:0);
  rotation+=elapsed*(phase==="warp"?.0018:.00022);
  context.clearRect(0,0,width,height);
  const cx=width*.5,cy=height*.48,depth=Math.min(width,height)*.72;
  const wash=context.createRadialGradient(cx,cy,0,cx,cy,Math.max(width,height)*.72);
  wash.addColorStop(0,(phase==="reveal"||phase==="supernova"?color+"22":"#0a315018"));wash.addColorStop(1,"#02050b00");
  context.fillStyle=wash;context.fillRect(0,0,width,height);
  for(const star of stars){
   const oldZ=star.z;if(phase!=="implode"&&phase!=="supernova")star.z-=speed*elapsed;
   const angle=rotation+star.spin*elapsed,cos=Math.cos(angle),sin=Math.sin(angle),rx=star.x*cos-star.y*sin,ry=star.x*sin+star.y*cos;
   const scale=1/Math.max(.045,star.z),oldScale=1/Math.max(.045,oldZ);
   let x=cx+rx*depth*scale,y=cy+ry*depth*scale,px=cx+rx*depth*oldScale,py=cy+ry*depth*oldScale;
   if(phase==="implode"){const before=Math.max(.035,1-Math.max(0,progress-.12)*1.12),after=Math.max(.025,1-progress);px=cx+(x-cx)*before;py=cy+(y-cy)*before;x=cx+(x-cx)*after;y=cy+(y-cy)*after}
   else if(phase==="supernova"){const before=.025+Math.max(0,progress-.035)*1.55,after=.025+progress*1.75;px=cx+(x-cx)*before;py=cy+(y-cy)*before;x=cx+(x-cx)*after;y=cy+(y-cy)*after}
   if(phase!=="implode"&&phase!=="supernova"&&(star.z<=.045||x<-width||x>width*2||y<-height||y>height*2)){reset(star);continue}
   context.globalAlpha=phase==="implode"?.25+progress*.72:phase==="supernova"?1-progress*.55:clamp((1-star.z)*.9+.12,0,1);
   context.strokeStyle=color;context.fillStyle=phase==="supernova"?"#ffffff":"#e9faff";
   if(["warp","reveal","implode","supernova"].includes(phase)){context.lineWidth=phase==="supernova"?Math.min(3,star.size):Math.min(2.4,star.size*.8);context.beginPath();context.moveTo(px,py);context.lineTo(x,y);context.stroke()}
   context.beginPath();context.arc(x,y,star.size*(.35+scale*.12),0,Math.PI*2);context.fill();
  }
  context.globalAlpha=1;
  if(["warp","reveal","supernova"].includes(phase)){
   const ringProgress=phase==="supernova"?progress:phase==="reveal"?1:clamp(burst,0,1),ringRadius=Math.min(width,height)*(phase==="supernova"?.025+ringProgress*.72:.12+ringProgress*.22);
   context.strokeStyle=phase==="supernova"?"#ffffff":color;context.globalAlpha=phase==="supernova"?1-ringProgress:phase==="reveal"?.18:.1;context.lineWidth=phase==="supernova"?3:1.2;context.beginPath();context.arc(cx,cy,ringRadius,0,Math.PI*2);context.stroke();
   if(phase==="supernova"){const flash=context.createRadialGradient(cx,cy,0,cx,cy,Math.min(width,height)*.62);flash.addColorStop(0,"#ffffffaa");flash.addColorStop(.18,color+"66");flash.addColorStop(1,"#ffffff00");context.globalAlpha=1-progress;context.fillStyle=flash;context.fillRect(0,0,width,height)}
   context.globalAlpha=1;if(phase==="warp")burst=Math.min(1,burst+elapsed/1250);
  }else burst=0;
  frame=requestAnimationFrame(draw);
 };
 const start=()=>{if(running)return;resize();running=true;last=0;frame=requestAnimationFrame(draw)};
 const setPhase=(next,rarity,skipCinematic=false)=>{if(rarity&&RARITY_COLORS[rarity])color=RARITY_COLORS[rarity];phase=next==="reveal"&&!skipCinematic?"implode":next;phaseStartedAt=performance.now();burst=0;if(next==="idle")color="#75ddff"};
 const stop=()=>{running=false;if(frame)cancelAnimationFrame(frame);frame=0;last=0;context.clearRect(0,0,width,height)};
 const onResize=()=>{if(running)resize()};window.addEventListener("resize",onResize,{passive:true});
 return{start,setPhase,stop,destroy(){stop();window.removeEventListener("resize",onResize)}};
}