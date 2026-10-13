import {Player} from "../entities/Player.js";
import {XPOrb} from "../entities/XPOrb.js";
import {Particle} from "../entities/Particle.js";
import {Enemy} from "../entities/Enemy.js";
import {Projectile} from "../entities/Projectile.js";
import {SpawnSystem} from "../systems/SpawnSystem.js";
import {CombatSystem} from "../systems/CombatSystem.js";
import {ComboSystem} from "../systems/ComboSystem.js";
import {ScoreSystem} from "../systems/ScoreSystem.js";
import {rand} from "../utils/MathUtils.js";
class Pool{
 constructor(make,max=900){this.make=make;this.max=max;this.items=[]}
 take(...a){const x=this.items.pop();return x?x.reset(...a):this.make(...a)}
 put(x){if(this.items.length<this.max)this.items.push(x)}
}
export class Game{
 constructor(canvas,input,profile,callbacks){this.canvas=canvas;this.ctx=canvas.getContext("2d");this.input=input;this.profile=profile;this.callbacks=callbacks;this.resize();this.reset()}
 resize(){const dpr=Math.min(devicePixelRatio||1,2);this.width=innerWidth;this.height=innerHeight;this.canvas.width=Math.floor(this.width*dpr);this.canvas.height=Math.floor(this.height*dpr);this.canvas.style.width=this.width+"px";this.canvas.style.height=this.height+"px";this.ctx.setTransform(dpr,0,0,dpr,0,0)}
 reset(){
  this.reducedFlash=localStorage.getItem("cosmic-scrap-reduced-flash")==="on";this.elapsed=0;this.level=1;this.xp=0;this.xpNext=7;this.kills=0;this.scrapCollected=0;this.score=0;this.maxCombo=0;this.stormKills=0;this.stormActive=false;this.stormClock=0;
  this.enemies=[];this.projectiles=[];this.orbs=[];this.particles=[];this.maxEnemies=320;this.maxProjectiles=650;this.maxParticles=260;
  this.enemyPool=new Pool((...a)=>new Enemy(...a),600);this.projectilePool=new Pool((...a)=>new Projectile(...a),900);this.particlePool=new Pool((...a)=>new Particle(...a),600);this.orbPool=new Pool((...a)=>new XPOrb(...a),800);
  this.spawn=new SpawnSystem();this.combat=new CombatSystem();this.combo=new ComboSystem();this.player=new Player(this.width/2,this.height/2,this.profile.meta);
  this.running=true;this.levelUpPending=false;this.danger=0;this._stormWasActive=false;this.lightning=[];this.novaFlash=0;this.novaRadius=0;this.target=null;this.hitFlash=0;
 }
 update(dt){
  if(!this.running||this.levelUpPending)return;
  this.elapsed+=dt;this.stormClock+=dt;this.stormActive=this.elapsed>240&&(this.stormClock%92)<18;
  this.novaFlash=Math.max(0,this.novaFlash-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);this.shake=Math.max(0,this.shake-dt*22);
  this.lightning=this.lightning.filter(v=>(v.life-=dt)>0);this.shockwaves=this.shockwaves.filter(w=>(w.life-=dt)>0);
  const pDanger=this.player;const outside=this.danger>0&&(pDanger.x<this.danger||pDanger.x>this.width-this.danger||pDanger.y<this.danger||pDanger.y>this.height-this.danger);
  if(outside){this.dangerDamageTimer-=dt;if(this.dangerDamageTimer<=0){this.dangerDamageTimer=.72;if(pDanger.takeDamage(5)){this.callbacks.audio?.damage();this.endRun()}else{this.hitFlash=Math.max(this.hitFlash,.18);this.callbacks.audio?.damage()}}}else this.dangerDamageTimer=0;
  if(this.stormActive&&!this._stormWasActive)this.callbacks.audio?.storm();
  this._stormWasActive=this.stormActive;this.danger=Math.min(Math.min(this.width,this.height)*.38,Math.max(0,this.elapsed-32)*.58);
  const previousX=this.player.x,previousY=this.player.y;this.player.update(dt,this.input,this.width,this.height);
  this.trailVisualTimer-=dt;if(this.player.trailDamage&&this.trailVisualTimer<=0&&(Math.abs(this.player.x-previousX)+Math.abs(this.player.y-previousY)>.5)){this.trailVisualTimer=.045;for(let i=0;i<2&&this.particles.length<this.maxParticles;i++)this.particles.push(this.particlePool.take(previousX,previousY,"#42d8ff"))}
  this.spawn.update(dt,this);this.combat.update(dt,this);this.combo.update(dt);
  this.orbs=this.orbs.filter(o=>{o.update(dt,this.player);if(!o.dead)return true;this.xp+=o.value*this.combo.multiplier;this.scrapCollected+=o.value;this.callbacks.toast("+"+o.value+" COSMIC SCRAP");this.orbPool.put(o);return false});
  this.particles=this.particles.filter(p=>{p.update(dt);if(p.life>0)return true;this.particlePool.put(p);return false});
  if(this.xp>=this.xpNext){this.xp-=this.xpNext;this.level++;this.xpNext=Math.floor(7*Math.pow(this.level,1.3));this.levelUpPending=true;this.callbacks.levelUp()}
  this.score=ScoreSystem.calculate(this);
 }
 onKill(e){
  this.kills++;const mult=this.combo.kill();this.maxCombo=Math.max(this.maxCombo,this.combo.max);
  if(this.stormActive)this.stormKills++;
  this.orbs.push(this.orbPool.take(e.x+rand(-6,6),e.y+rand(-6,6),e.xp));
  const burstColor=this.stormActive?"#ff416d":"#40cfff";
  for(let i=0;i<Math.min(12,this.maxParticles-this.particles.length);i++)this.particles.push(this.particlePool.take(e.x,e.y,burstColor));
  if(this.player.explosionPower){
   const radius=48+this.player.explosionPower*13,damage=18+this.player.explosionPower*17;
   this.novaFlash=Math.max(this.novaFlash,.12);
   for(const other of this.enemies){
    if(other===e||other.dead||Math.hypot(other.x-e.x,other.y-e.y)>radius)continue;
    other.health-=damage;
    for(let i=0;i<2&&this.particles.length<this.maxParticles;i++)this.particles.push(this.particlePool.take(other.x,other.y,"#ff9d67"));
    if(other.health<=0){other.dead=true;this.onKill(other)}
   }
  }
  if(mult>=1.5&&this.kills%8===0)this.callbacks.audio?.combo();
 }
 resumeAfterUpgrade(){this.levelUpPending=false}
 endRun(){if(!this.running)return;this.running=false;this.score=ScoreSystem.calculate(this);this.callbacks.audio?.death();this.callbacks.gameOver(this)}
 draw(){
  const c=this.ctx;c.clearRect(0,0,this.width,this.height);c.fillStyle="#000";c.fillRect(0,0,this.width,this.height);
  if(this.stormActive){if(!this.reducedFlash){c.fillStyle="rgba(90,0,20,.12)";c.fillRect(0,0,this.width,this.height)}const pulse=this.reducedFlash ? .035 : .08+(.5+.5*Math.sin(this.elapsed*5))*.09;c.strokeStyle="rgba(255,45,92,"+pulse+")";c.lineWidth=this.reducedFlash?5:18;c.strokeRect(9,9,this.width-18,this.height-18)}
  if(this.combo.count>=8&&!this.reducedFlash){const strength=Math.min(.25,(this.combo.count-6)*.008);c.strokeStyle="rgba(64,207,255,"+strength+")";c.lineWidth=10+Math.min(12,this.combo.count*.3);c.strokeRect(5,5,this.width-10,this.height-10)}
  if(this.hitFlash>0&&!this.reducedFlash){c.fillStyle="rgba(255,45,80,"+(this.hitFlash*.18)+")";c.fillRect(0,0,this.width,this.height)}
  if(this.danger>0){c.strokeStyle="rgba(255,38,72,.28)";c.lineWidth=2;c.strokeRect(this.danger,this.danger,this.width-this.danger*2,this.height-this.danger*2)}
  for(const o of this.orbs)o.draw(c);for(const e of this.enemies)e.draw(c);
  if(this.target&&!this.target.dead&&this.target.x>=-90&&this.target.x<=this.width+90&&this.target.y>=-90&&this.target.y<=this.height+90){
   const t=this.target;c.save();c.strokeStyle="#9cfff2";c.shadowColor="#40cfff";c.shadowBlur=10;c.lineWidth=1.5;c.beginPath();c.arc(t.x,t.y,t.size+7,0,Math.PI*2);
   c.moveTo(t.x-t.size-12,t.y);c.lineTo(t.x-t.size-5,t.y);c.moveTo(t.x+t.size+5,t.y);c.lineTo(t.x+t.size+12,t.y);c.moveTo(t.x,t.y-t.size-12);c.lineTo(t.x,t.y-t.size-5);c.moveTo(t.x,t.y+t.size+5);c.lineTo(t.x,t.y+t.size+12);c.stroke();c.restore();
  }
  for(const b of this.projectiles)b.draw(c);for(const p of this.particles)p.draw(c);
  for(const l of this.lightning){c.save();c.globalAlpha=Math.min(1,l.life/.12);c.strokeStyle="#b7fbff";c.shadowColor="#40cfff";c.shadowBlur=16;c.lineWidth=2;c.beginPath();c.moveTo(l.x1,l.y1);for(let i=1;i<5;i++){const f=i/5;c.lineTo(l.x1+(l.x2-l.x1)*f+(Math.random()-.5)*14,l.y1+(l.y2-l.y1)*f+(Math.random()-.5)*14)}c.lineTo(l.x2,l.y2);c.stroke();c.restore()}
  if(this.novaFlash>0){c.save();c.globalAlpha=this.novaFlash/.24;c.strokeStyle="#fff18a";c.shadowColor="#ff3b8b";c.shadowBlur=24;c.lineWidth=4;c.beginPath();c.arc(this.player.x,this.player.y,150*(1-this.novaFlash/.24)+10,0,Math.PI*2);c.stroke();c.restore()}
  const p=this.player;c.save();c.fillStyle="#fff";c.shadowColor="#fff";c.shadowBlur=22;if(p.invuln>0&&Math.floor(p.invuln*20)%2)c.globalAlpha=.4;c.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);c.restore();
  if(p.orbitCount){for(let i=0;i<p.orbitCount;i++){const a=(this.orbitAngle||0)+i*Math.PI*2/p.orbitCount,ox=p.x+Math.cos(a)*31,oy=p.y+Math.sin(a)*31;c.save();c.fillStyle="#9cfff2";c.shadowColor="#42d8ff";c.shadowBlur=16;c.beginPath();c.arc(ox,oy,4,0,Math.PI*2);c.fill();c.restore()}}
  if(p.trailDamage){c.save();c.strokeStyle="#42d8ff";c.globalAlpha=.25;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,18,0,Math.PI*2);c.stroke();c.restore()}
  if(p.slowAura){c.save();c.strokeStyle="#b18cff";c.globalAlpha=.18+.04*Math.sin(this.elapsed*3);c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,118,0,Math.PI*2);c.stroke();c.restore()}
  const dangerClose=this.danger>0&&(p.x<this.danger+26||p.x>this.width-this.danger-26||p.y<this.danger+26||p.y>this.height-this.danger-26);
  if(dangerClose&&!this.reducedFlash){c.save();c.strokeStyle="rgba(255,38,72,.5)";c.lineWidth=4;c.strokeRect(this.danger+3,this.danger+3,this.width-this.danger*2-6,this.height-this.danger*2-6);c.restore()}
  if(this.shake>.1)c.restore();
 }
}