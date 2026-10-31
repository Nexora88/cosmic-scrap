export class Loop{
 constructor(update,render,onError){this.update=update;this.render=render;this.onError=onError;this.last=0;this.running=false;this.frame=t=>{
  if(!this.running)return;
  const dt=Math.min(.033,(t-this.last)/1000||0);this.last=t;
  try{this.update(dt);this.render?.()}
  catch(error){this.onError?.(error);this.running=false;return}
  if(this.running)requestAnimationFrame(this.frame)
 }}
 start(){if(this.running)return;this.running=true;this.last=performance.now();requestAnimationFrame(this.frame)}
 stop(){this.running=false}
}