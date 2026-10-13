import {Game} from "../js/core/Game.js";

const canvas=document.querySelector("#game"),status=document.querySelector("#status"),report=document.querySelector("#report");
const buttons=[...document.querySelectorAll("button")],stopButton=document.querySelector("#stop");
let cancelled=false;
const noop=()=>{};
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function setBusy(b){buttons.slice(0,3).forEach(x=>x.disabled=b);stopButton.disabled=!b}
function runScenario(mode){
 cancelled=false;setBusy(true);report.textContent="Running…";status.textContent="Preparing "+mode+" scenario…";
 const oldRandom=Math.random;Math.random=rng(mode==="baseline"?1337:mode==="stacked"?2026:9090);
 const input={x:0,y:0,pointer:{down:false,active:false,x:0,y:0}};
 const result={scenario:mode,seed:mode==="baseline"?1337:mode==="stacked"?2026:9090,simulatedSeconds:0,frames:0,avgFrameMs:0,p95FrameMs:0,framesOver16_7ms:0,framesOver33ms:0,maxEnemies:0,maxPlayerProjectiles:0,maxEnemyProjectiles:0,maxParticles:0,bossesSeen:0,bossesDefeated:0,deathReason:null,checkpoints:[],lowEndCaps:null};
 let samples=[],seenBoss=false,killedBosses=0,lastKills=0,game;
 const profile={meta:{health:0,damage:0,speed:0,pickup:0}};
 const callbacks={toast:noop,levelUp:()=>{if(mode==="stacked"){const p=game.player;p.damage=36;p.fireRate=.20;p.projectiles=4;p.crit=.45;p.pierce=3;p.chainChance=.65;p.orbitCount=6;p.slowAura=true;p.novaPower=3;p.explosionPower=3;p.trailDamage=24;p.speed=320;}game.resumeAfterUpgrade()},gameOver:g=>{result.deathReason=g.deathContext?.reason||"unknown"}};
 try{game=new Game(canvas,input,profile,callbacks)}catch(e){Math.random=oldRandom;setBusy(false);status.textContent="Could not initialize simulation.";report.textContent=String(e.stack||e);return}
 if(mode==="low-end"){game.lowEnd=true;game.maxEnemies=180;game.maxProjectiles=320;game.maxEnemyProjectiles=100;game.maxParticles=180}
 result.lowEndCaps={enemies:game.maxEnemies,playerProjectiles:game.maxProjectiles,enemyProjectiles:game.maxEnemyProjectiles,particles:game.maxParticles};
 const totalFrames=300*60,chunk=120;
 function step(){
  if(cancelled){finish("Stopped manually");return}
  const stop=Math.min(result.frames+chunk,totalFrames);
  for(;result.frames<stop;result.frames++){
   if(!game.running)break;
   const start=performance.now();
   game.update(1/60);
   if(game.running)game.draw();
   const ms=performance.now()-start;samples.push(ms);
   if(ms>16.7)result.framesOver16_7ms++;if(ms>33)result.framesOver33ms++;
   result.maxEnemies=Math.max(result.maxEnemies,game.enemies.length);
   result.maxPlayerProjectiles=Math.max(result.maxPlayerProjectiles,game.projectiles.length);
   result.maxEnemyProjectiles=Math.max(result.maxEnemyProjectiles,game.enemyProjectiles.length);
   result.maxParticles=Math.max(result.maxParticles,game.particles.length);
   const boss=game.enemies.some(e=>e.type==="boss"&&!e.dead);
   if(boss&&!seenBoss){result.bossesSeen++;seenBoss=true}
   if(seenBoss&&!boss&&game.kills>lastKills){result.bossesDefeated++;seenBoss=false}
   lastKills=game.kills;
   const sec=Math.floor(game.elapsed);
   if([60,110,120,180,240,300].includes(sec)&&!result.checkpoints.some(c=>c.second===sec))result.checkpoints.push({second:sec,kills:game.kills,level:game.level,enemies:game.enemies.length,enemyProjectiles:game.enemyProjectiles.length,health:Math.max(0,Math.round(game.player.health)),bossActive:boss});
  }
  result.simulatedSeconds=+game.elapsed.toFixed(1);
  status.textContent=mode+" · simulated "+result.simulatedSeconds+" / 300 s · "+result.frames+" frames";
  if(result.frames>=totalFrames||!game.running){finish(game.running?"Completed":"Run ended in game");return}
  setTimeout(step,0);
 }
 function finish(reason){
  result.finish=reason;result.simulatedSeconds=+game.elapsed.toFixed(1);result.kills=game.kills;result.level=game.level;result.score=game.score;result.health=Math.max(0,Math.round(game.player.health));result.bossesDefeated=Math.max(result.bossesDefeated,0);
  const sorted=samples.slice().sort((a,b)=>a-b);result.avgFrameMs=+(samples.reduce((a,b)=>a+b,0)/Math.max(1,samples.length)).toFixed(2);result.p95FrameMs=+(sorted[Math.floor((sorted.length-1)*.95)]||0).toFixed(2);
  result.framesOver16_7Pct=+(100*result.framesOver16_7ms/Math.max(1,samples.length)).toFixed(2);result.framesOver33Pct=+(100*result.framesOver33ms/Math.max(1,samples.length)).toFixed(2);
  Math.random=oldRandom;setBusy(false);status.textContent=mode+" · "+reason+" · "+result.simulatedSeconds+" simulated seconds";report.textContent=JSON.stringify(result,null,2);
 }
 setTimeout(step,0);
}
document.querySelector("#baseline").addEventListener("click",()=>runScenario("baseline"));
document.querySelector("#stacked").addEventListener("click",()=>runScenario("stacked"));
document.querySelector("#low").addEventListener("click",()=>runScenario("low-end"));
stopButton.addEventListener("click",()=>{cancelled=true});
