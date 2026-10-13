import {Game} from "./core/Game.js";
import {Loop} from "./core/Loop.js";
import {Input} from "./core/Input.js";
import {UPGRADES} from "./config.js";
import {HUD} from "./ui/HUD.js";
import {LevelUpScreen} from "./ui/LevelUpScreen.js";
import {DeathScreen} from "./ui/DeathScreen.js";
import {MainMenu} from "./ui/MainMenu.js";
import {UpgradeMenu} from "./ui/UpgradeMenu.js";
import {load,save,awardIdle} from "./utils/Storage.js";
import {META,buyMeta} from "./systems/MetaProgression.js";

const $=id=>document.getElementById(id);
const canvas=$("game");
const input=new Input(canvas);
const hud=new HUD();
const levelScreen=new LevelUpScreen();
const deathScreen=new DeathScreen();
const mainMenu=new MainMenu();
const metaMenu=new UpgradeMenu();
const profile=load();
const idleReward=awardIdle(profile);
$("best").textContent=profile.bestScore||0;
const toast=message=>{
  $("toast").textContent=message;
  $("toast").classList.add("show");
  setTimeout(()=>$("toast").classList.remove("show"),1400);
};
if(idleReward>0)toast("WELCOME BACK · +"+idleReward+" IDLE SCRAP");

let game=null;
let paused=false;
const callbacks={
  toast,
  levelUp:()=>{
    const pool=[...UPGRADES];
    const choices=[];
    while(choices.length<3&&pool.length)choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    levelScreen.show(choices,upgrade=>{
      upgrade.apply(game.player);
      levelScreen.hide();
      game.resumeAfterUpgrade();
    });
  },
  gameOver:g=>{
    paused=false;
    const isBest=g.score>(profile.bestScore||0);
    if(isBest)profile.bestScore=g.score;
    const coreEarned=Math.max(1,Math.floor(g.scrapCollected/10));
    profile.core=(profile.core||0)+coreEarned;
    profile.totalScrap=(profile.totalScrap||0)+g.scrapCollected;
    save(profile);
    $("best").textContent=profile.bestScore;
    deathScreen.show(g,isBest);
    toast("+"+coreEarned+" SCRAP CORE");
  }
};

const loop=new Loop(dt=>{
  if(!game)return;
  if(!paused){game.update(dt);hud.update(game)}
},()=>{if(game)game.draw()});

function startRun(){
  levelScreen.hide();deathScreen.hide();mainMenu.hide();metaMenu.hide();
  paused=false;
  game=new Game(canvas,input,profile,callbacks);
  loop.start();
}
function togglePause(){
  if(!game||!game.running||game.levelUpPending)return;
  paused=!paused;
  toast(paused?"RUN PAUSED":"RUN RESUMED");
}
function renderMeta(){
  $("meta-options").replaceChildren();
  META.forEach(item=>{
    const row=document.createElement("div");
    row.className="meta-option";
    const rank=profile.meta?.[item.id]||0;
    row.innerHTML='<div class="meta-copy"><strong>'+item.name+' · RANK '+rank+'/'+item.max+'</strong><small>'+item.description+'</small></div><button '+(profile.core<item.cost||rank>=item.max?"disabled":"")+'>BUY · '+item.cost+'</button>';
    row.querySelector("button").addEventListener("click",()=>{
      if(buyMeta(profile,item.id)){save(profile);renderMeta();toast("CORE UPGRADE INSTALLED")}
      else toast("NOT ENOUGH SCRAP CORE");
    });
    $("meta-options").append(row);
  });
  $("meta-screen").querySelector(".eyebrow").textContent="AVAILABLE SCRAP CORE · "+(profile.core||0);
}
$("start").addEventListener("click",startRun);
$("retry").addEventListener("click",startRun);
$("pause").addEventListener("click",togglePause);
$("menu").addEventListener("click",()=>{deathScreen.hide();mainMenu.show()});
$("meta-open").addEventListener("click",()=>{renderMeta();mainMenu.hide();metaMenu.show()});
$("meta-close").addEventListener("click",()=>{metaMenu.hide();mainMenu.show()});
addEventListener("resize",()=>{if(game)game.resize()});
addEventListener("keydown",e=>{
  if((e.key.toLowerCase()==="p"||e.key==="Escape")&&game)togglePause();
  if((e.key===" "||e.key==="Enter")&&game?.levelUpPending)$("upgrade-cards").querySelector("button")?.click();
});
const ctx=canvas.getContext("2d");
ctx.fillStyle="#000";ctx.fillRect(0,0,innerWidth,innerHeight);
