import {rand} from "../utils/MathUtils.js";
export class Particle{
 constructor(x,y,color="#ff3155"){this.reset(x,y,color)}
 reset(x,y,color="#ff3155"){const a=rand(0,Math.PI*2),speed=rand(45,210);this.x=x;this.y=y;this.color=color;this.vx=Math.cos(a)*speed;this.vy=Math.sin(a)*speed;this.life=rand(.24,.68);this.max=this.life;this.size=rand(1.5,4);return this}
 update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=Math.max(0,1-dt*1.8);this.vy*=Math.max(0,1-dt*1.8);this.life-=dt}
 draw(c,lowEnd=false){
  const fade=Math.max(0,this.life/this.max);
  c.globalAlpha=fade;
  c.strokeStyle=this.color;
  c.lineWidth=Math.max(.8,this.size*.55);
  c.lineCap="round";
  c.beginPath();
  c.moveTo(this.x-this.vx*.022,this.y-this.vy*.022);
  c.lineTo(this.x,this.y);
  c.stroke();
  c.fillStyle=this.color;
  if(!lowEnd){c.shadowColor=this.color;c.shadowBlur=7}
  c.beginPath();
  c.arc(this.x,this.y,this.size*.72,0,Math.PI*2);
  c.fill();
  if(!lowEnd)c.shadowBlur=0;
  c.globalAlpha=1;
 }
}
