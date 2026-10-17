import {Game} from "../js/core/Game.js";
import {isBossType} from "../js/systems/Encounters.js";

const canvas=document.querySelector("#game"),status=document.querySelector("#status"),report=document.querySelector("#report");
const buttons=[...document.querySelectorAll("button")],stopButton=document.querySelector("#stop");
let cancelled=false;
const noop=()=>{};
const SEEDS={baseline:1337,stacked:2026,"low-end":9090};
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function setBusy(b){buttons.slice(0,3).forEach(x=>x.disabled=b);stopButton.disabled=!b}
function steerBot(game,input){
 const p=game.player,w=game.width,h=game.height,cx=w/2,cy=h/2;
 let dx=0,dy=0;
 // Maintain a moving orbit instead of standing still; move away from nearby enemies.
 let nearest=null,nearestD=Infinity;
 for(const e of game.enemies){if(e.dead)continue;const ex=p.x-e.x,ey=p.y-e.y,d=Math.hypot(ex,ey)||1;if(d<nearestD){nearestD=d;nearest=e}}
 if(nearest&&nearestD<255){const weight=(255-nearestD)/255;dx+=(p.x-nearest.x)/(nearestD||1)*(1.15+weight);dy+=(p.y-nearest.y)/(nearestD||1)*(1.15+weight)}
 // Dodge incoming hostile shots while they are close enough to matter.
 for(const b of game.enemyProjectiles){const ex=p.x-b.x,ey=p.y-b.y,d=Math.hypot(ex,ey)||1;if(d<125){const weight=(125-d)/125;dx+=ex/d*weight*1.7;dy+=ey/d*weight*1.7}}
 // Orbit around the arena centre so the bot doesn't drift into the shrinking boundary.
 const rx=p.x-cx,ry=p.y-cy,r=Math.hypot(rx,ry)||1,targetR=Math.min(w,h)*.22;
 const tangentX=ry/r,tangentY=-rx/r,radial=(targetR-r)/Math.max(1,targetR);
 dx+=tangentX*.85+rx/r*radial*.8;dy+=tangentY*.85+ry/r*radial*.8;
 const margin=game.danger+58;
 if(p.x<margin)dx+=(margin-p.x)/58;
 if(p.x>w-margin)dx-=(p.x-(w-margin))/58;
 if(p.y<margin+45)dy+=(margin+45-p.y)/58;
 if(p.y>h-margin-45)dy-=(p.y-(h-margin-45))/58;
 input.x=dx;input.y=dy;
}
function runScenario(mode){
 cancelled=false;setBusy(true);report.textContent="Running…";status.textContent="Preparing "+mode+" scenario…";
 const oldRandom=Math.random;Math.random=rng(SEEDS[mode]);
 const input={x:0,y:0,pointer:{down:false,active:false,x:0,y:0}};
 const result={scenario:mode,seed:SEEDS[mode],controller:"deterministic-kiting-bot",simulationHz:30,testBossWindowSeconds:55,drawSampleEveryNSteps:6,simulatedSeconds:0,frames:0,avgFrameMs:0,p95FrameMs:0,framesOver16_7ms:0,framesOver33ms:0,maxEnemies:0,maxPlayerProjectiles:0,maxEnemyProjectiles:0,maxParticles:0,bossesSeen:0,bossesDefeated:0,bossSpawnSeconds:[],bossKillSeconds:[],damageTaken:0,deathReason:null,checkpoints:[],lowEndCaps:null};
 const samples=[];
 const profile={meta:{health:0,damage:0,speed:0,pickup:0}};
 let game,lastHealth=null,bossWasActive=false,lastCheckpoint=-1;
 const callbacks={toast:noop,levelUp:()=>{if(mode==="stacked"){const p=game.player;p.damage=36;p.fireRate=.20;p.projectiles=4;p.crit=.45;p.pierce=3;p.chainChance=.65;p.orbitCount=6;p.slowAura=true;p.novaPower=3;p.explosionPower=3;p.trailDamage=24;p.speed=320;}game.resumeAfterUpgrade()},gameOver:g=>{result.deathReason=g.deathContext?.reason||"unknown"}};
 try{game=new Game(canvas,input,profile,callbacks)}catch(e){Math.random=oldRandom;setBusy(false);status.textContent="Could not initialize simulation.";report.textContent=String(e.stack||e);return}
 game.nextBossAt=55; // Short CI probe: keep one deterministic boss encounter in the 90-second window. 
 const originalOnKill=game.onKill.bind(game);
 game.onKill=e=>{if(isBossType(e.type)){result.bossesDefeated++;result.bossTypesDefeated??=[];result.bossTypesDefeated.push(e.type);result.bossKillSeconds.push(+game.elapsed.toFixed(1))}originalOnKill(e)};
 if(mode==="low-end"){game.lowEnd=true;game.maxEnemies=180;game.maxProjectiles=320;game.maxEnemyProjectiles=100;game.maxParticles=180}
 result.lowEndCaps={enemies:game.maxEnemies,playerProjectiles:game.maxProjectiles,enemyProjectiles:game.maxEnemyProjectiles,particles:game.maxParticles};
 lastHealth=game.player.health;
 const totalFrames=90*30,chunk=180,drawEvery=6;
 function step(){
  if(cancelled){finish("Stopped manually");return}
  const stop=Math.min(result.frames+chunk,totalFrames);
  for(;result.frames<stop;result.frames++){
   if(!game.running)break;
   steerBot(game,input);
   const start=performance.now();
   game.update(1/30);
   const sampled=result.frames%drawEvery===0;
   if(game.running&&sampled)game.draw();
   const ms=performance.now()-start;
   if(sampled){samples.push(ms);if(ms>16.7)result.framesOver16_7ms++;if(ms>33)result.framesOver33ms++;}
   if(lastHealth!==null&&game.player.health<lastHealth)result.damageTaken+=lastHealth-game.player.health;
   lastHealth=game.player.health;
   result.maxEnemies=Math.max(result.maxEnemies,game.enemies.length);
   result.maxPlayerProjectiles=Math.max(result.maxPlayerProjectiles,game.projectiles.length);
   result.maxEnemyProjectiles=Math.max(result.maxEnemyProjectiles,game.enemyProjectiles.length);
   result.maxParticles=Math.max(result.maxParticles,game.particles.length);
   const boss=game.enemies.some(e=>isBossType(e.type)&&!e.dead)||game.bossActive;
   if(boss&&!bossWasActive){result.bossesSeen++;result.bossSpawnSeconds.push(+game.elapsed.toFixed(1))}
   bossWasActive=boss;
   const sec=Math.floor(game.elapsed);
   if([30,60,90,110,120,150,180,240,300].includes(sec)&&sec!==lastCheckpoint){result.checkpoints.push({second:sec,kills:game.kills,level:game.level,enemies:game.enemies.length,enemyProjectiles:game.enemyProjectiles.length,health:Math.max(0,Math.round(game.player.health)),bossActive:boss,nearbyThreats:game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-game.player.x,e.y-game.player.y)<220).length});lastCheckpoint=sec}
  }
  result.simulatedSeconds=+game.elapsed.toFixed(1);
  status.textContent=mode+" · simulated "+result.simulatedSeconds+" / 90 s · "+result.frames+" frames";
  if(result.frames>=totalFrames||!game.running){finish(game.running?"Completed":"Run ended in game");return}
  setTimeout(step,0);
 }
 function finish(reason){
  result.finish=reason;result.simulatedSeconds=+game.elapsed.toFixed(1);result.kills=game.kills;result.level=game.level;result.score=game.score;result.health=Math.max(0,Math.round(game.player.health));result.survivalPct=+(100*result.simulatedSeconds/90).toFixed(1);
  const sorted=samples.slice().sort((a,b)=>a-b);result.avgFrameMs=+(samples.reduce((a,b)=>a+b,0)/Math.max(1,samples.length)).toFixed(2);result.p95FrameMs=+(sorted[Math.floor((sorted.length-1)*.95)]||0).toFixed(2);
  result.framesOver16_7Pct=+(100*result.framesOver16_7ms/Math.max(1,samples.length)).toFixed(2);result.framesOver33Pct=+(100*result.framesOver33ms/Math.max(1,samples.length)).toFixed(2);
  result.damageTaken=+result.damageTaken.toFixed(1);
  result.interpretation={survival:"bot survival is a repeatable pressure indicator, not a human difficulty rating",stackedBuild:mode==="stacked"?"stress probe only; upgrades are injected at every level-up":"normal progression; upgrades are not selected by a human",performance:"sampled update + canvas draw cost every 12th simulated frame; not display FPS"};
  Math.random=oldRandom;setBusy(false);status.textContent=mode+" · "+reason+" · "+result.simulatedSeconds+" simulated seconds";report.textContent=JSON.stringify(result,null,2);
 }
 setTimeout(step,0);
}
document.querySelector("#baseline").addEventListener("click",()=>runScenario("baseline"));
document.querySelector("#stacked").addEventListener("click",()=>runScenario("stacked"));
document.querySelector("#low").addEventListener("click",()=>runScenario("low-end"));
stopButton.addEventListener("click",()=>{cancelled=true});
