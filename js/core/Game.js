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
import {xpNeededForLevel,damageScaleAt} from "../systems/Balance.js";
class Pool{
 constructor(make,max=900){this.make=make;this.max=max;this.items=[]}
 take(...a){const x=this.items.pop();return x?x.reset(...a):this.make(...a)}
 put(x){if(this.items.length<this.max)this.items.push(x)}
}
export class Game{
 constructor(canvas,input,profile,callbacks){this.canvas=canvas;this.lowEnd=(navigator.hardwareConcurrency||8)<=4||(typeof navigator.deviceMemory==="number"&&navigator.deviceMemory<=4);this.ctx=canvas.getContext("2d");this.input=input;this.profile=profile;this.callbacks=callbacks;this.resize();this.reset()}
 resize(){const dpr=Math.min(devicePixelRatio||1,this.lowEnd?1:2);this.width=innerWidth;this.height=innerHeight;this.canvas.width=Math.floor(this.width*dpr);this.canvas.height=Math.floor(this.height*dpr);this.canvas.style.width=this.width+"px";this.canvas.style.height=this.height+"px";this.ctx.setTransform(dpr,0,0,dpr,0,0)}
 reset(){
  this.reducedFlash=localStorage.getItem("cosmic-scrap-reduced-flash")==="on";this.elapsed=0;this.level=1;this.xp=0;this.xpNext=xpNeededForLevel(1);this.kills=0;this.scrapCollected=0;this.score=0;this.maxCombo=0;this.stormKills=0;this.stormActive=false;this.stormClock=0;
  this.enemies=[];this.projectiles=[];this.enemyProjectiles=[];this.orbs=[];this.particles=[];this.maxEnemies=this.lowEnd?180:280;this.maxProjectiles=this.lowEnd?320:560;this.maxEnemyProjectiles=this.lowEnd?100:180;this.maxParticles=this.lowEnd?180:320;
  this.enemyPool=new Pool((...a)=>new Enemy(...a),600);this.projectilePool=new Pool((...a)=>new Projectile(...a),900);this.particlePool=new Pool((...a)=>new Particle(...a),600);this.orbPool=new Pool((...a)=>new XPOrb(...a),800);
  this.spawn=new SpawnSystem();this.combat=new CombatSystem();this.combo=new ComboSystem();this.player=new Player(this.width/2,this.height/2,this.profile.meta);
  this.running=true;this.levelUpPending=false;this.danger=0;this._stormWasActive=false;this.lightning=[];this.shockwaves=[];this.shake=0;this.dangerDamageTimer=0;this.trailVisualTimer=0;this.novaFlash=0;this.novaRadius=0;this.target=null;this.hitFlash=0;this.deathContext=null;this.nextBossAt=110;this.bossWarningTimer=0;this.bossWarningShown=false;this.bossActive=false;this.lowHealthClock=0;
 }
 update(dt){
  if(!this.running||this.levelUpPending)return;
  this.elapsed+=dt;this.stormClock+=dt;const stormInterval=Math.max(48,88-this.elapsed/115);const stormDuration=Math.min(34,18+this.elapsed/145);this.stormActive=this.elapsed>150&&(this.stormClock%stormInterval)<stormDuration;
  if(!this.bossActive&&!this.bossWarningShown&&this.elapsed>=this.nextBossAt-3){this.bossWarningShown=true;this.bossWarningTimer=3;this.callbacks.audio?.bossWarning?.();this.callbacks.toast("⚠ ELITE SIGNATURE DETECTED");}
  if(this.bossWarningTimer>0){this.bossWarningTimer-=dt;if(this.bossWarningTimer<=0&&!this.bossActive){const a=rand(0,Math.PI*2),r=Math.max(this.width,this.height)*.43+45,bx=this.player.x+Math.cos(a)*r,by=this.player.y+Math.sin(a)*r;this.enemies.push(this.enemyPool.take(bx,by,"boss",this.elapsed));for(let i=0;i<5&&this.enemies.length<this.maxEnemies;i++){const angle=a+Math.PI+(i-2)*.28;this.enemies.push(this.enemyPool.take(this.player.x+Math.cos(angle)*Math.max(this.width,this.height)*.39,this.player.y+Math.sin(angle)*Math.max(this.width,this.height)*.39,"shooter",this.elapsed))}this.bossActive=true;this.shake=Math.max(this.shake,5);this.callbacks.audio?.bossSpawn?.();this.callbacks.toast("ELITE BOSS · BREAK THE FRONTLINE");this.nextBossAt=this.elapsed+Math.max(92,116-this.elapsed*.035);}}
  this.lowHealthClock-=dt;if(this.player.health>0&&this.player.health/this.player.maxHealth<=.3&&this.lowHealthClock<=0){this.lowHealthClock=1.1;this.callbacks.audio?.lowHealth?.();}
  this.novaFlash=Math.max(0,this.novaFlash-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);this.shake=Math.max(0,this.shake-dt*22);
  this.lightning=this.lightning.filter(v=>(v.life-=dt)>0);this.shockwaves=this.shockwaves.filter(w=>(w.life-=dt)>0);
  const pDanger=this.player;const outside=this.danger>0&&(pDanger.x<this.danger||pDanger.x>this.width-this.danger||pDanger.y<this.danger||pDanger.y>this.height-this.danger);
  if(outside){this.dangerDamageTimer-=dt;if(this.dangerDamageTimer<=0){this.dangerDamageTimer=.72;if(pDanger.takeDamage(5)){this.callbacks.audio?.damage();this.endRun("danger-zone")}else{this.hitFlash=Math.max(this.hitFlash,.18);this.callbacks.audio?.damage()}}}else this.dangerDamageTimer=0;
  if(this.stormActive&&!this._stormWasActive)this.callbacks.audio?.storm();
  this._stormWasActive=this.stormActive;this.danger=Math.min(Math.min(this.width,this.height)*.38,Math.max(0,this.elapsed-32)*.58);
  const previousX=this.player.x,previousY=this.player.y;this.player.update(dt,this.input,this.width,this.height);
  this.trailVisualTimer-=dt;if(this.player.trailDamage&&this.trailVisualTimer<=0&&(Math.abs(this.player.x-previousX)+Math.abs(this.player.y-previousY)>.5)){this.trailVisualTimer=.045;for(let i=0;i<2&&this.particles.length<this.maxParticles;i++)this.particles.push(this.particlePool.take(previousX,previousY,"#42d8ff"))}
  this.spawn.update(dt,this);this.combat.update(dt,this);this.combo.update(dt);
  this.orbs=this.orbs.filter(o=>{o.update(dt,this.player);if(!o.dead)return true;this.xp+=o.value*this.combo.multiplier;this.scrapCollected+=o.value;this.callbacks.toast("+"+o.value+" COSMIC SCRAP");this.orbPool.put(o);return false});
  this.particles=this.particles.filter(p=>{p.update(dt);if(p.life>0)return true;this.particlePool.put(p);return false});
  if(this.xp>=this.xpNext){this.xp-=this.xpNext;this.level++;this.xpNext=xpNeededForLevel(this.level);this.levelUpPending=true;this.callbacks.levelUp()}
  this.score=ScoreSystem.calculate(this);
 }
 onKill(e){
  this.kills++;const mult=this.combo.kill();this.maxCombo=Math.max(this.maxCombo,this.combo.max);
  if(this.stormActive)this.stormKills++;
  this.orbs.push(this.orbPool.take(e.x+rand(-6,6),e.y+rand(-6,6),e.xp));
  if(e.type==="boss"){this.callbacks.audio?.bossKill?.();this.callbacks.toast("ELITE DESTROYED · BONUS SCRAP");this.orbs.push(this.orbPool.take(e.x+rand(-12,12),e.y+rand(-12,12),Math.max(80,e.xp)));this.shake=Math.min(this.lowEnd?5:12,this.shake+5);this.novaFlash=Math.max(this.novaFlash,.3);this.bossActive=false;this.nextBossAt=this.elapsed+Math.max(92,116-this.elapsed*.035);this.bossWarningShown=false;for(let i=0;i<22&&this.particles.length<this.maxParticles;i++)this.particles.push(this.particlePool.take(e.x,e.y,"#ff315e"));}\n  if(e.type==="spawner"){
   for(let i=0;i<3&&this.enemies.length<this.maxEnemies;i++)this.enemies.push(this.enemyPool.take(e.x+rand(-24,24),e.y+rand(-24,24),"swarm",this.elapsed));
  }
  if(e.type==="exploder"){
   const radius=82,damage=34*damageScaleAt(this.elapsed);
   this.shockwaves.push({x:e.x,y:e.y,r:5,max:radius,life:.3,maxLife:.3,color:"#ff6b35"});
   if(Math.hypot(this.player.x-e.x,this.player.y-e.y)<radius){const before=this.player.health;if(this.player.takeDamage(18*damageScaleAt(this.elapsed))){this.endRun("exploder-blast")}if(this.player.health<before){this.hitFlash=.35;this.callbacks.audio?.damage()}}
   for(const other of this.enemies){if(other===e||other.dead||Math.hypot(other.x-e.x,other.y-e.y)>radius)continue;other.health-=damage;if(other.health<=0){other.dead=true;this.onKill(other)}}
  }
  const burstColor=e.type==="boss"?"#ff315e":this.stormActive?"#ff416d":e.type==="tank"?"#ff9b63":"#40cfff";
  this.shockwaves.push({x:e.x,y:e.y,r:4,max:e.type==="boss"?190:e.type==="tank"?54:32,life:e.type==="boss"?.65:.28,maxLife:e.type==="boss"?.65:.28,color:burstColor});if(this.shockwaves.length>(this.lowEnd?24:48))this.shockwaves.shift();
  this.shake=Math.min(this.lowEnd?5:12,this.shake+(e.type==="boss"?6:e.type==="tank"?2.2:mult>=1.5?1.1:.25));this.callbacks.audio?.kill?.(mult,this.kills);
  for(let i=0;i<Math.min(e.type==="boss"?38:e.type==="tank"?20:14,this.maxParticles-this.particles.length);i++)this.particles.push(this.particlePool.take(e.x,e.y,burstColor));
  if(this.player.explosionPower){
   const radius=48+this.player.explosionPower*13,damage=18+this.player.explosionPower*17;
   this.novaFlash=Math.max(this.novaFlash,.16);this.shockwaves.push({x:e.x,y:e.y,r:5,max:radius*1.8,life:.32,maxLife:.32,color:"#ff9d67"});if(this.shockwaves.length>(this.lowEnd?24:48))this.shockwaves.shift();this.shake=Math.min(this.lowEnd?4:9,this.shake+this.player.explosionPower*1.4);
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
 endRun(reason="unknown"){if(!this.running)return;this.running=false;this.score=ScoreSystem.calculate(this);const p=this.player;let nearest=Infinity;for(const e of this.enemies){if(!e.dead)nearest=Math.min(nearest,Math.hypot(e.x-p.x,e.y-p.y))}this.deathContext={reason,nearestEnemy:Number.isFinite(nearest)?Math.round(nearest):null,edgeGap:Math.round(Math.min(p.x,p.y,this.width-p.x,this.height-p.y)-this.danger),healthLeft:Math.max(0,Math.ceil(p.health))};this.callbacks.audio?.death();this.callbacks.gameOver(this)}
 draw(){
  const c=this.ctx;c.clearRect(0,0,this.width,this.height);c.fillStyle="#000";c.fillRect(0,0,this.width,this.height);
  const shaking=this.shake>.1;if(shaking){c.save();c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake)}
  for(const w of this.shockwaves){c.save();c.globalAlpha=Math.max(0,w.life/w.maxLife);c.strokeStyle=w.color;c.shadowColor=w.color;c.shadowBlur=16;c.lineWidth=2.5;c.beginPath();c.arc(w.x,w.y,w.r+(w.max-w.r)*(1-w.life/w.maxLife),0,Math.PI*2);c.stroke();c.restore()}
  if(this.stormActive){if(!this.reducedFlash){c.fillStyle="rgba(90,0,20,.16)";c.fillRect(0,0,this.width,this.height)}const pulse=this.reducedFlash ? .045 : .12+(.5+.5*Math.sin(this.elapsed*8))*.17;c.strokeStyle="rgba(255,35,88,"+pulse+")";c.lineWidth=this.reducedFlash?5:22+Math.sin(this.elapsed*7)*5;c.strokeRect(9,9,this.width-18,this.height-18);if(!this.reducedFlash&&Math.sin(this.elapsed*8)>.88){c.fillStyle="rgba(255,30,80,.055)";c.fillRect(0,0,this.width,this.height)}}
  if(this.combo.count>=8&&!this.reducedFlash){const strength=Math.min(.25,(this.combo.count-6)*.008);c.strokeStyle="rgba(64,207,255,"+strength+")";c.lineWidth=10+Math.min(12,this.combo.count*.3);c.strokeRect(5,5,this.width-10,this.height-10)}
  if(this.hitFlash>0&&!this.reducedFlash){c.fillStyle="rgba(255,45,80,"+(this.hitFlash*.18)+")";c.fillRect(0,0,this.width,this.height)}
  if(this.player.health/this.player.maxHealth<=.3){const pulse=this.reducedFlash?.035:.055+(.5+.5*Math.sin(this.elapsed*7))*.11;c.save();const grad=c.createRadialGradient(this.width/2,this.height/2,Math.min(this.width,this.height)*.2,this.width/2,this.height/2,Math.max(this.width,this.height)*.72);grad.addColorStop(0,"rgba(255,25,65,0)");grad.addColorStop(1,"rgba(255,25,65,"+pulse+")");c.fillStyle=grad;c.fillRect(0,0,this.width,this.height);c.restore();}
  if(this.danger>0){c.strokeStyle="rgba(255,38,72,.28)";c.lineWidth=2;c.strokeRect(this.danger,this.danger,this.width-this.danger*2,this.height-this.danger*2)}
  if(this.bossWarningTimer>0){c.save();c.textAlign="center";c.font="900 13px system-ui";c.fillStyle="#ff6688";c.shadowColor="#ff174f";c.shadowBlur=18;c.fillText("ELITE INCOMING · "+Math.ceil(this.bossWarningTimer),this.width/2,Math.max(90,this.height*.18));c.restore()}
  for(const o of this.orbs)o.draw(c);for(const e of this.enemies)e.draw(c);
  for(const e of this.enemies){if(e.type==="sniper"&&!e.dead&&e.shootCooldown<.55){c.save();c.globalAlpha=Math.max(.18,1-e.shootCooldown/.7);c.strokeStyle="#ffb347";c.lineWidth=1.5;c.setLineDash([5,7]);c.beginPath();c.moveTo(e.x,e.y);c.lineTo(this.player.x,this.player.y);c.stroke();c.restore()}}
  if(this.target&&!this.target.dead&&this.target.x>=-90&&this.target.x<=this.width+90&&this.target.y>=-90&&this.target.y<=this.height+90){
   const t=this.target;c.save();c.strokeStyle="#9cfff2";c.shadowColor="#40cfff";c.shadowBlur=10;c.lineWidth=1.5;c.beginPath();c.arc(t.x,t.y,t.size+7,0,Math.PI*2);
   c.moveTo(t.x-t.size-12,t.y);c.lineTo(t.x-t.size-5,t.y);c.moveTo(t.x+t.size+5,t.y);c.lineTo(t.x+t.size+12,t.y);c.moveTo(t.x,t.y-t.size-12);c.lineTo(t.x,t.y-t.size-5);c.moveTo(t.x,t.y+t.size+5);c.lineTo(t.x,t.y+t.size+12);c.stroke();c.restore();
  }
  for(const b of this.enemyProjectiles){c.save();c.fillStyle=b.type==="sniper"?"#ffb347":b.type==="boss"?"#ff315e":"#c5a0ff";c.shadowColor=b.type==="sniper"?"#ff8a35":b.type==="boss"?"#ff174f":"#a46bff";c.shadowBlur=this.lowEnd?4:13;c.beginPath();if(b.type==="sniper"){c.moveTo(b.x,b.y-6);c.lineTo(b.x+5,b.y+5);c.lineTo(b.x-5,b.y+5);c.closePath()}else c.arc(b.x,b.y,b.type==="boss"?7:4,0,Math.PI*2);c.fill();c.restore()}for(const b of this.projectiles)b.draw(c);for(const p of this.particles)p.draw(c);
  for(const l of this.lightning){c.save();c.globalAlpha=Math.min(1,l.life/.12);c.strokeStyle="#40cfff";c.shadowColor="#40cfff";c.shadowBlur=this.lowEnd?5:28;c.lineWidth=this.lowEnd?2:4;c.beginPath();c.moveTo(l.x1,l.y1);for(let i=1;i<5;i++){const f=i/5;c.lineTo(l.x1+(l.x2-l.x1)*f+(Math.random()-.5)*14,l.y1+(Math.random()-.5)*14+(l.y2-l.y1)*f)}c.lineTo(l.x2,l.y2);c.stroke();if(!this.lowEnd){c.globalAlpha*=.55;c.strokeStyle="#ffffff";c.shadowBlur=4;c.lineWidth=1.25;c.beginPath();c.moveTo(l.x1,l.y1);for(let i=1;i<5;i++){const f=i/5;c.lineTo(l.x1+(l.x2-l.x1)*f+(Math.random()-.5)*7,l.y1+(Math.random()-.5)*7+(l.y2-l.y1)*f)}c.lineTo(l.x2,l.y2);c.stroke()}c.restore()}
  if(this.novaFlash>0){c.save();c.globalAlpha=(this.reducedFlash ? .35 : 1)*Math.min(1,this.novaFlash/.16);c.fillStyle="rgba(255,241,138,.12)";c.strokeStyle="#fff18a";c.shadowColor="#ff3b8b";c.shadowBlur=this.lowEnd?8:32;c.lineWidth=this.lowEnd?3:5;c.beginPath();c.arc(this.player.x,this.player.y,150*(1-this.novaFlash/.24)+10,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle="#ff7bce";c.lineWidth=2;c.beginPath();c.arc(this.player.x,this.player.y,110*(1-this.novaFlash/.24)+8,0,Math.PI*2);c.stroke();c.restore()}
  const p=this.player;c.save();c.fillStyle="#fff";c.shadowColor="#fff";c.shadowBlur=this.lowEnd?6:22;if(p.invuln>0&&Math.floor(p.invuln*20)%2)c.globalAlpha=.4;c.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);c.restore();
  if(p.orbitCount){for(let i=0;i<p.orbitCount;i++){const a=(this.orbitAngle||0)+i*Math.PI*2/p.orbitCount,ox=p.x+Math.cos(a)*31,oy=p.y+Math.sin(a)*31;c.save();c.fillStyle="#9cfff2";c.shadowColor="#42d8ff";c.shadowBlur=this.lowEnd?5:20;c.beginPath();c.arc(ox,oy,4,0,Math.PI*2);c.fill();if(!this.lowEnd){c.globalAlpha=.3;c.strokeStyle="#42d8ff";c.lineWidth=2;c.beginPath();c.arc(ox,oy,8,0,Math.PI*2);c.stroke()}c.restore()}}
  if(p.trailDamage){c.save();c.strokeStyle="#42d8ff";c.globalAlpha=.25;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,18,0,Math.PI*2);c.stroke();c.restore()}
  if(p.slowAura){c.save();c.strokeStyle="#b18cff";c.globalAlpha=.18+.04*Math.sin(this.elapsed*3);c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,118,0,Math.PI*2);c.stroke();c.restore()}
  const dangerClose=this.danger>0&&(p.x<this.danger+26||p.x>this.width-this.danger-26||p.y<this.danger+26||p.y>this.height-this.danger-26);
  if(dangerClose&&!this.reducedFlash){c.save();c.strokeStyle="rgba(255,38,72,.5)";c.lineWidth=4;c.strokeRect(this.danger+3,this.danger+3,this.width-this.danger*2-6,this.height-this.danger*2-6);c.restore()}
  if(shaking)c.restore();
 }
}