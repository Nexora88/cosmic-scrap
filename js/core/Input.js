export class Input{
 constructor(canvas){
  this.keys=new Set();this.pointer={x:0,y:0,down:false,active:false};this.stick={x:0,y:0,active:false,id:null};
  addEventListener("keydown",e=>{this.keys.add(e.key.toLowerCase());if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault()});
  addEventListener("keyup",e=>this.keys.delete(e.key.toLowerCase()));
  const moveStick=e=>{if(!this.stick.active||e.pointerId!==this.stick.id)return;const dx=e.clientX-this.stick.cx,dy=e.clientY-this.stick.cy,d=Math.max(1,Math.hypot(dx,dy)),scale=Math.min(1,42/d);this.stick.x=dx/d*scale;this.stick.y=dy/d*scale;const k=document.getElementById("joystick-knob");if(k)k.style.transform="translate("+this.stick.x*34+"px,"+this.stick.y*34+"px)"};
  const endStick=e=>{if(this.stick.id!==null&&e.pointerId!==undefined&&e.pointerId!==this.stick.id)return;this.stick.active=false;this.stick.id=null;this.stick.x=0;this.stick.y=0;const k=document.getElementById("joystick-knob");if(k)k.style.transform="translate(0,0)"};
  canvas.addEventListener("pointermove",e=>{const r=canvas.getBoundingClientRect();this.pointer.x=e.clientX-r.left;this.pointer.y=e.clientY-r.top;this.pointer.active=true});
  canvas.addEventListener("pointerdown",e=>{const r=canvas.getBoundingClientRect();this.pointer.x=e.clientX-r.left;this.pointer.y=e.clientY-r.top;this.pointer.active=true;this.pointer.down=true;canvas.setPointerCapture?.(e.pointerId)});
  addEventListener("pointerup",e=>{this.pointer.down=false;endStick(e)});addEventListener("pointercancel",endStick);
  const stick=document.getElementById("joystick");
  if(stick){stick.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();const r=stick.getBoundingClientRect();this.stick.active=true;this.stick.id=e.pointerId;this.stick.cx=r.left+r.width/2;this.stick.cy=r.top+r.height/2;stick.setPointerCapture?.(e.pointerId);moveStick(e)});stick.addEventListener("pointermove",moveStick);stick.addEventListener("pointerup",endStick);stick.addEventListener("pointercancel",endStick);stick.addEventListener("lostpointercapture",endStick)}
  addEventListener("blur",()=>{this.keys.clear();this.pointer.down=false;endStick({})});
 }
 get x(){return Math.max(-1,Math.min(1,(this.keys.has("d")||this.keys.has("arrowright")?1:0)-(this.keys.has("a")||this.keys.has("arrowleft")?1:0)+this.stick.x))}
 get y(){return Math.max(-1,Math.min(1,(this.keys.has("s")||this.keys.has("arrowdown")?1:0)-(this.keys.has("w")||this.keys.has("arrowup")?1:0)+this.stick.y))}
}