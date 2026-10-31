const TAU=Math.PI*2;

export function drawRegionBackdrop(ctx,region,elapsed,width,height,lowEnd=false){
  const id=region?.id||"debris",t=elapsed||0,limit=lowEnd?7:13;
  ctx.save();
  ctx.globalCompositeOperation="screen";
  if(id==="debris"){
    for(let i=0;i<limit;i++){
      const x=((i*137+t*(12+i%4)*((i%2)?1:-1))% (width+100)+width+100)%(width+100)-50;
      const y=(i*89+Math.sin(t*.42+i)*24+height+50)%(height+100)-50;
      const r=5+(i%4)*3,angle=t*(.12+i*.009)+i;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.12+(i%3)*.035;
      ctx.fillStyle=i%2?"#9bc8e8":"#d7e8f5";ctx.beginPath();ctx.moveTo(-r,-r*.35);ctx.lineTo(r*.9,-r*.55);ctx.lineTo(r*.45,r*.8);ctx.lineTo(-r*.7,r*.5);ctx.closePath();ctx.fill();ctx.restore();
    }
  }else if(id==="ember"){
    for(let i=0;i<limit+5;i++){
      const x=(i*97+Math.sin(t*.7+i)*32+width)%width,y=(height-((i*71+t*(34+i%5)*8)%(height+80)));
      const pulse=.35+.35*(.5+.5*Math.sin(t*3+i));
      ctx.globalAlpha=pulse;ctx.strokeStyle=i%3?"#ff9866":"#ffe0a0";ctx.lineWidth=i%4===0?2:1;
      ctx.beginPath();ctx.moveTo(x,y+8+(i%4)*3);ctx.lineTo(x+Math.sin(t*2+i)*3,y-5);ctx.stroke();
      ctx.fillStyle="#ffb078";ctx.beginPath();ctx.arc(x,y,1.5+(i%3)*.7,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=.13;ctx.strokeStyle="#ff6b4e";ctx.lineWidth=1.5;
    for(let i=0;i<4;i++){const y=height*(.18+i*.2)+Math.sin(t*.8+i)*14;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(width*.3,y-28,width*.7,y+28,width,y-8);ctx.stroke()}
  }else if(id==="cryo"){
    for(let i=0;i<limit;i++){
      const x=(i*149+Math.sin(t*.18+i)*28+width)%width,y=(i*103+Math.cos(t*.2+i)*20+height)%height,r=8+(i%4)*4,rot=t*.12+i;
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=.13+(i%3)*.035;ctx.strokeStyle="#a8efff";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.58,-r*.35);ctx.lineTo(r*.58,r*.35);ctx.lineTo(0,r);ctx.lineTo(-r*.58,r*.35);ctx.lineTo(-r*.58,-r*.35);ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.moveTo(-r*.58,-r*.35);ctx.lineTo(r*.58,r*.35);ctx.moveTo(r*.58,-r*.35);ctx.lineTo(-r*.58,r*.35);ctx.stroke();ctx.restore();
    }
  }else if(id==="rift"){
    const cx=width*.5,cy=height*.48;
    for(let i=0;i<(lowEnd?3:5);i++){
      const rx=width*(.18+i*.105),ry=height*(.12+i*.075),rotation=t*(i%2?.08:-.06)+i*.7;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);ctx.globalAlpha=.11+(i%2)*.035;ctx.strokeStyle=i%2?"#e0a5ff":"#9d82ff";ctx.lineWidth=1.4+i*.25;
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.stroke();ctx.restore();
    }
    for(let i=0;i<limit;i++){const x=(i*113+t*18)%width,y=(i*67+t*31)%height;ctx.globalAlpha=.2;ctx.strokeStyle="#d6a5ff";ctx.beginPath();ctx.moveTo(x-8,y-14);ctx.lineTo(x+Math.sin(t*2+i)*12,y+14);ctx.stroke()}
  }else if(id==="starforge"){
    const cx=width*.5,cy=height*.48,breath=.5+.5*Math.sin(t*1.4);
    ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=.09+.035*breath;ctx.strokeStyle="#ffca78";ctx.lineWidth=2;
    for(let i=0;i<12;i++){const a=i*TAU/12+t*.035,r1=Math.min(width,height)*.13,r2=Math.min(width,height)*(.32+.035*breath);ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);ctx.stroke()}
    ctx.globalAlpha=.12;ctx.beginPath();ctx.ellipse(0,0,width*.34,height*.2,t*.08,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,width*.25,height*.34,-t*.06,0,TAU);ctx.stroke();ctx.restore();
    for(let i=0;i<limit;i++){const a=i*2.4+t*.16,r=Math.min(width,height)*(.24+(i%4)*.055),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.65;ctx.globalAlpha=.25+.15*Math.sin(t*2+i);ctx.fillStyle="#ffd18a";ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.5,0,TAU);ctx.fill()}
  }
  ctx.restore();
}
