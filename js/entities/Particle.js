import {rand} from "../utils/MathUtils.js";
export class Particle{
 constructor(x,y,color="#ff3155"){this.reset(x,y,color)}
 reset(x,y,color="#ff3155"){const a=rand(0,Math.PI*2),speed=rand(45,210);this.x=x;this.y=y;this.color=color;this.vx=Math.cos(a)*speed;this.vy=Math.sin(a)*speed;this.life=rand(.24,.68);this.max=this.life;this.size=rand(1.5,4);return this}
 update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=Math.max(0,1-dt*1.8);this.vy*=Math.max(0,1-dt*1.8);this.life-=dt}
 draw(c){c.save();c.globalAlpha=Math.max(0,this.life/this.max);c.fillStyle=this.color;c.shadowColor=this.color;c.shadowBlur=6;c.fillRect(this.x,this.y,this.size,this.size);c.restore()}
}