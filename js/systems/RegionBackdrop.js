const TAU=Math.PI*2;
const SCENES={
 debris:{planet:[.76,.31,.25],shadow:"#08111d",glow:"#4d9fc7",ring:"#93c9dc",ringed:true,cloud:"#173b58"},
 ember:{planet:[.72,.25,.17],shadow:"#220c13",glow:"#ff684c",ring:"#ff9c68",ringed:false,cloud:"#5a1e27"},
 cryo:{planet:[.34,.62,.78],shadow:"#071b2c",glow:"#7bdfff",ring:"#b8f4ff",ringed:true,cloud:"#174967"},
 rift:{planet:[.43,.29,.68],shadow:"#120d27",glow:"#b18aff",ring:"#d3a9ff",ringed:true,cloud:"#39215d"},
 starforge:{planet:[.86,.57,.25],shadow:"#24150a",glow:"#ffbd61",ring:"#ffe0a0",ringed:false,cloud:"#5d3519"}
};
function drawPlanet(ctx,x,y,r,scene,t,lowEnd){
 const [pr,pg,pb]=scene.planet;
 ctx.save();
 const halo=ctx.createRadialGradient(x,y,r*.78,x,y,r*1.55);
 halo.addColorStop(0,"rgba(0,0,0,0)");halo.addColorStop(.68,scene.glow+"33");halo.addColorStop(1,"rgba(0,0,0,0)");
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*1.55,0,TAU);ctx.fill();
 if(scene.ringed){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.24+Math.sin(t*.025)*.035);ctx.strokeStyle=scene.ring+"38";
  for(let i=0;i<5;i++){ctx.lineWidth=2+i*.9;ctx.beginPath();ctx.ellipse(0,0,r*(1.18+i*.075),r*(.28+i*.018),0,Math.PI*.08,Math.PI*.92);ctx.stroke()}ctx.restore();
 }
 const sphere=ctx.createRadialGradient(x-r*.34,y-r*.42,r*.03,x+r*.12,y+r*.1,r*1.3);
 sphere.addColorStop(0,`rgba(${Math.min(255,pr*255+82)},${Math.min(255,pg*255+82)},${Math.min(255,pb*255+82)},.92)`);
 sphere.addColorStop(.48,`rgba(${pr*255|0},${pg*255|0},${pb*255|0},.88)`);
 sphere.addColorStop(1,scene.shadow);
 ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();
 if(!lowEnd){
  for(let i=0;i<7;i++){const yy=y-r*.72+i*r*.24+Math.sin(t*.08+i)*r*.025;ctx.globalAlpha=.06+(i%3)*.018;ctx.strokeStyle=i%2?"#e6f6ff":scene.glow;ctx.lineWidth=r*(.025+i*.002);ctx.beginPath();ctx.ellipse(x-r*.08,yy,r*(.92-i*.035),r*(.07+i*.008),Math.sin(i+t*.015)*.05,0,TAU);ctx.stroke()}
  for(let i=0;i<5;i++){const cx=x+Math.sin(i*8.3+1)*r*.62,cy=y+Math.cos(i*5.1)*r*.58,cr=r*(.045+(i%3)*.018);ctx.globalAlpha=.12;ctx.fillStyle=scene.shadow;ctx.beginPath();ctx.arc(cx,cy,cr,0,TAU);ctx.fill();ctx.globalAlpha=.12;ctx.strokeStyle="#e8f5ff";ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx-cr*.15,cy-cr*.18,cr*.82,Math.PI*1.05,Math.PI*1.9);ctx.stroke()}
 }
 const shade=ctx.createLinearGradient(x-r,y-r*.3,x+r,y+r*.3);shade.addColorStop(0,"rgba(0,0,0,.08)");shade.addColorStop(.55,"rgba(0,0,0,.02)");shade.addColorStop(1,"rgba(0,0,0,.56)");ctx.fillStyle=shade;ctx.fillRect(x-r,y-r,r*2,r*2);
 ctx.restore();
 ctx.globalAlpha=.32;ctx.strokeStyle=scene.glow;ctx.lineWidth=Math.max(1,r*.012);ctx.beginPath();ctx.arc(x,y,r*.99,-Math.PI*.88,Math.PI*.08);ctx.stroke();
 if(scene.ringed){ctx.save();ctx.translate(x,y);ctx.rotate(-.24+Math.sin(t*.025)*.035);ctx.strokeStyle=scene.ring+"55";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,r*1.38,r*.34,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();ctx.restore()}
 ctx.restore();
}
function drawNebula(ctx,w,h,scene,t,lowEnd){
 ctx.save();ctx.globalCompositeOperation="screen";
 const clouds=lowEnd?2:4;
 for(let i=0;i<clouds;i++){
  const x=w*(.12+((i*.29+Math.sin(t*.018+i)*.045)% .78)),y=h*(.18+((i*.37+Math.cos(t*.016+i)*.05)% .66)),r=Math.min(w,h)*(.22+(i%3)*.1);
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,scene.cloud+"27");g.addColorStop(.48,scene.cloud+"12");g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 ctx.restore();
}
export function drawRegionBackdrop(ctx,region,elapsed,width,height,lowEnd=false){
 const id=region?.id||"debris",scene=SCENES[id]||SCENES.debris,t=elapsed||0;
 ctx.save();
 drawNebula(ctx,width,height,scene,t,lowEnd);
 const positions={
  debris:[.78,.25,.27],ember:[.78,.2,.23],cryo:[.22,.24,.22],rift:[.76,.28,.25],starforge:[.79,.24,.3]
 };
 const [px,py,scale]=positions[id]||positions.debris;
 drawPlanet(ctx,width*px,height*py,Math.min(width,height)*scale,scene,t,lowEnd);
 // A sparse foreground asteroid belt gives the arena depth without obscuring combat.
 const count=lowEnd?5:10;
 for(let i=0;i<count;i++){
  const x=((i*173+t*(3+i%4)*((i%2)?1:-1)+width*2)%(width+120))-60;
  const y=(i*113+Math.sin(t*.12+i*1.7)*26+height+70)%(height+140)-70;
  const r=4+(i%4)*3,rot=t*(.035+i*.006)+i;
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=.11+(i%3)*.025;
  ctx.fillStyle=i%2?"#b4c5d2":"#647d91";ctx.strokeStyle="#dce8f1";ctx.lineWidth=.8;
  ctx.beginPath();ctx.moveTo(-r,-r*.4);ctx.lineTo(-r*.15,-r);ctx.lineTo(r*.85,-r*.52);ctx.lineTo(r,r*.45);ctx.lineTo(-r*.35,r*.82);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
 }
 ctx.restore();
}
