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
import {xpNeededForLevel,damageScaleAt,bossIntervalAfterDefeat} from "../systems/Balance.js";
import {isBossType,bossTypeForCycle,createRiftEvent,riftEventDamageAt} from "../systems/Encounters.js";
import {getRegion} from "../systems/Regions.js";
import {drawRegionBackdrop} from "../systems/RegionBackdrop.js";
import {createSectorTransition,advanceSectorTransition} from "../systems/SectorTransition.js";
class Pool{
 constructor(make,max=900){this.make=make;this.max=max;this.items=[]}
 take(...a){const x=this.items.pop();return x?x.reset(...a):this.make(...a)}
 put(x){if(this.items.length<this.max)this.items.push(x)}
}
export class Game{
 constructor(canvas,input,profile,callbacks){this.canvas=canvas;this.effectsMode=(()=>{try{return localStorage.getItem("cosmic-scrap-effects-mode")||"auto"}catch{return"auto"}})();const hardwareLowEnd=(navigator.hardwareConcurrency||8)<=4||(typeof navigator.deviceMemory==="number"&&navigator.deviceMemory<=4);this.lowEnd=this.effectsMode==="reduced"||(this.effectsMode==="auto"&&hardwareLowEnd);this.screenShakeEnabled=(()=>{try{return localStorage.getItem("cosmic-scrap-screen-shake")!=="off"}catch{return true}})();this.ctx=canvas.getContext("2d");this.input=input;this.profile=profile;this.callbacks=callbacks;this.resize();this.reset()}
 resize(){const coarsePointer=typeof matchMedia==="function"&&matchMedia("(pointer: coarse)").matches;const dpr=Math.min(devicePixelRatio||1,this.lowEnd?1:coarsePointer?1.5:2);this.width=innerWidth;this.height=innerHeight;this.canvas.width=Math.floor(this.width*dpr);this.canvas.height=Math.floor(this.height*dpr);this.canvas.style.width=this.width+"px";this.canvas.style.height=this.height+"px";this.ctx.setTransform(dpr,0,0,dpr,0,0);if(this.player){this.player.x=Math.max(14,Math.min(Math.max(14,this.width-14),this.player.x));this.player.y=Math.max(65,Math.min(Math.max(65,this.height-48),this.player.y))}}
 reset(){
  this.reducedFlash=localStorage.getItem("cosmic-scrap-reduced-flash")==="on";this.skin=localStorage.getItem("cosmic-scrap-skin")||"blue";this.contract=this.callbacks.getContract?.()||null;this.contractProgress=0;this.contractComplete=false;this.elapsed=0;this.region=getRegion(0,0);this.regionIndex=0;this.regionTransition=null;this.meteors=[];this.meteorClock=0;this.level=1;this.xp=0;this.xpNext=xpNeededForLevel(1);this.kills=0;this.bossesDefeated=0;this.scrapCollected=0;this.score=0;this.maxCombo=0;this.stormKills=0;this.stormActive=false;this.stormClock=0;
  this.stars=Array.from({length:this.lowEnd?64:112},()=>({x:Math.random()*this.width,y:Math.random()*this.height,size:Math.random()>.88?1.6:.8,alpha:.12+Math.random()*.38,phase:Math.random()*Math.PI*2,rate:.35+Math.random()*1.2}));this.enemies=[];this.projectiles=[];this.enemyProjectiles=[];this.orbs=[];this.particles=[];this.maxEnemies=this.lowEnd?140:220;this.maxProjectiles=this.lowEnd?240:420;this.maxEnemyProjectiles=this.lowEnd?72:140;this.maxParticles=this.lowEnd?110:220;
  this.enemyPool=new Pool((...a)=>new Enemy(...a),600);this.projectilePool=new Pool((...a)=>new Projectile(...a),900);this.particlePool=new Pool((...a)=>new Particle(...a),600);this.orbPool=new Pool((...a)=>new XPOrb(...a),800);
  this.spawn=new SpawnSystem();this.combat=new CombatSystem();this.combo=new ComboSystem();this.player=new Player(this.width/2,this.height/2,this.profile.meta);
  const loadout=(()=>{try{return localStorage.getItem("cosmic-scrap-loadout")||"pulse"}catch{return"pulse"}})();
  if(loadout==="orbit"){this.player.speed*=.94;this.player.orbitCount=1;this.player.damage*=.96}
  else if(loadout==="chain"){this.player.crit=Math.min(.5,this.player.crit+.08);this.player.chainChance=.10;this.player.fireRate*=1.06}
  else{this.player.fireRate*=.92;this.player.damage*=1.03}
  this.running=true;this.levelUpPending=false;this.danger=0;this._stormWasActive=false;this.lightning=[];this.shockwaves=[];this.shake=0;this.dangerDamageTimer=0;this.trailVisualTimer=0;this.novaFlash=0;this.novaRadius=0;this.target=null;this.hitFlash=0;this.deathContext=null;this.nextBossAt=78;this.bossWarningTimer=0;this.bossWarningShown=false;this.bossActive=false;this.bossCycle=0;this.bossCelebration=0;this.bossCelebrationType="boss";this.bossKillGrace=0;this.nextRiftAt=205;this.riftEvent=null;this.riftDamageTimer=0;this.riftEventCount=0;this.riftEchoActive=false;this.lowHealthClock=0;this.damageQuietTime=0;this.regenClock=0;this.pendingContractVictory=false;this._pendingDeathReason=null;this._updating=false;this._bossesDefeatedAtFrameStart=0;
 }
 // FULL FILE CONTINUES IN NEXT UPDATE - this is partial due to size; use raw restore next
 update(dt){if(!this.running||this.levelUpPending)return;this.elapsed+=dt;this.spawn.update(dt,this);this.combat.update(dt,this);this.combo.update(dt);this.score=ScoreSystem.calculate(this)}
 draw(){const c=this.ctx;c.clearRect(0,0,this.width,this.height);drawRegionBackdrop(c,this.region,this.elapsed,this.width,this.height,this.lowEnd);for(const e of this.enemies)if(!e.dead)e.draw(c,this.lowEnd);this.player.draw(c,this.skin)}
 onKill(e){if(!e||e._killProcessed)return;e._killProcessed=true;this.kills++;this.combo.kill();if(!isBossType(e.type))this.orbs.push(this.orbPool.take(e.x,e.y,e.xp))}
 endRun(){this.running=false;this.callbacks.gameOver?.(this)}
 trackContract(){}
 resumeAfterUpgrade(){this.levelUpPending=false}
}
