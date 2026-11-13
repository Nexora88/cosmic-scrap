import {Game} from "https://cdn.jsdelivr.net/gh/Nexora88/cosmic-scrap@3ac362672f90b4fa2a55ca5dedd2631a53d5c2a1/js/core/Game.js";
import {Loop} from "./core/Loop.js";
import {Input} from "./core/Input.js";
import {UPGRADES} from "./config.js";
import {applyUpgradeChoice} from "./systems/UpgradeEffects.js";
import {HUD} from "./ui/HUD.js";
import {LevelUpScreen} from "./ui/LevelUpScreen.js";
import {DeathScreen} from "./ui/DeathScreen.js";
import {load,save,awardIdle} from "./utils/Storage.js";
import {getContract,contractProgressText} from "./systems/Contracts.js";
import {awardAchievements} from "./systems/Achievements.js";

const $=id=>document.getElementById(id);
const canvas=$("game");
const input=new Input(canvas);
const hud=new HUD();
const levelScreen=new LevelUpScreen();
const deathScreen=new DeathScreen();

let profile=load()||{};
if(!profile.meta)profile.meta={};
if(!profile.scrapCore)profile.scrapCore=0;
save(profile);

let game=null,paused=false,selectedContract="none";
try{selectedContract=localStorage.getItem("cosmic-scrap-directive-choice")||"none"}catch{}

const toast=(msg)=>{const el=$("toast");if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2200)};

const audio={
  enabled:localStorage.getItem("cosmic-scrap-audio")!=="off",
  unlock(){},startAmbience(){},stopAmbience(){},pauseAmbience(){},setRegion(){},
  ui(){},shot(){},hit(){},kill(){},upgrade(){},levelUp(){},combo(){},storm(){},
  bossWarning(){},bossSpawn(){},bossKill(){},damage(){},lowHealth(){},death(){},
  contractComplete(){},riftWarning(){},riftOpen(){},riftSeal(){},riftEcho(){},sectorUnlock(){}
};

const callbacks={
  toast,audio,
  getContract:()=>getContract(selectedContract),
  contractUpdate:(contract,progress,complete)=>{
    const node=$("contract-hud");if(!node)return;
    node.hidden=false;
    const t=$("contract-hud-title"),p=$("contract-hud-progress"),f=$("contract-hud-fill");
    if(t)t.textContent=contract.name;
    if(p)p.textContent=contractProgressText(contract,progress);
    if(f)f.style.width=(100*progress/contract.target)+"%";
    node.classList.toggle("contract-complete",!!complete);
  },
  levelUp:()=>{
    if(!game)return;
    audio.levelUp();
    game.shake=5;
    const pool=UPGRADES.filter(u=>!u.available||u.available(game.player));
    const choices=[];
    while(choices.length<Math.min(3,pool.length)&&pool.length)
      choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    if(!choices.length){
      game.player.health=Math.min(game.player.maxHealth,game.player.health+8);
      toast("MAX BUILD · CORE REINFORCED");
      game.levelUpPending=false;
      return;
    }
    levelScreen.show(choices,(upgrade,rarity="common")=>{
      try {
        if(upgrade){
          audio.upgrade(rarity);
          applyUpgradeChoice(game.player,upgrade,rarity);
        }
      } catch(e) { console.error("upgrade apply", e); }
      try { levelScreen.hide(); } catch {}
      if(game) game.resumeAfterUpgrade();
    });
  },
  gameOver:g=>{
    audio.stopAmbience();
    paused=false;
    const pauseScreen=$("pause-screen");if(pauseScreen)pauseScreen.hidden=true;
    $("app")?.classList.remove("game-active","game-paused");
    const previousBest=profile.bestScore||0,best=g.score>previousBest;
    if(best)profile.bestScore=g.score;
    try{awardAchievements(g,profile)}catch{}
    const baseEarned=Math.max(1,Math.floor(g.scrapCollected/10));
    const earned=baseEarned+(g.contractComplete?(g.contract?.reward||0):0);
    profile.scrapCore=(profile.scrapCore||0)+earned;
    profile.totalScrap=(profile.totalScrap||0)+g.scrapCollected;
    profile.totalKills=(profile.totalKills||0)+g.kills;
    profile.runs=(profile.runs||0)+1;
    save(profile);
    const stats=$("run-stats");
    if(stats){
      const m=Math.floor(g.elapsed/60),s=Math.floor(g.elapsed%60);
      stats.innerHTML=`<div><small>TIME</small><strong>${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}</strong></div><div><small>SCORE</small><strong>${g.score}</strong></div><div><small>KILLS</small><strong>${g.kills}</strong></div><div><small>SCRAP</small><strong>${g.scrapCollected}</strong></div><div><small>LEVEL</small><strong>${g.level}</strong></div><div><small>CORE +</small><strong>${earned}</strong></div>`+(best?`<p class="new-best">NEW BEST SCORE</p>`:"");
    }
    deathScreen.show(g,best,previousBest,earned,profile.scrapCore,[]);
    hud.hide();
  }
};

function startGame(){
  try{
    audio.unlock();
    $("overlay").hidden=true;
    $("death-screen")&&($("death-screen").hidden=true);
    $("upgrade-screen")&&($("upgrade-screen").hidden=true);
    $("pause-screen")&&($("pause-screen").hidden=true);
    $("app").classList.add("game-active");
    $("app").classList.remove("game-paused");
    hud.show();
    game=new Game(canvas,input,profile,callbacks);
    window.__csGame=game;
    paused=false;
    loop.start();
  }catch(e){
    console.error("startGame failed",e);
    toast("START ERROR: "+(e.message||e));
  }
}

function returnToMenu(){
  loop.stop();
  game=null;
  paused=false;
  $("app")?.classList.remove("game-active","game-paused");
  $("death-screen")&&($("death-screen").hidden=true);
  $("upgrade-screen")&&($("upgrade-screen").hidden=true);
  $("pause-screen")&&($("pause-screen").hidden=true);
  $("overlay").hidden=false;
  hud.hide();
}

const loop=new Loop(
  dt=>{
    if(!game||!game.running||paused)return;
    // Safety: if upgrade UI is closed but game still pending, resume
    if(game.levelUpPending){
      const us=document.getElementById("upgrade-screen");
      if(us && us.hidden){ game.resumeAfterUpgrade(); }
    }
    game.update(dt);
  },
  ()=>{
    if(!game)return;
    game.draw();
    hud.update(game);
  },
  error=>{
    console.error("FRAME",error);
    toast("GAME ERROR: "+(error?.message||error));
  }
);

$("start")?.addEventListener("click",()=>{audio.ui();startGame()});
$("retry")?.addEventListener("click",()=>{audio.ui();startGame()});
$("menu")?.addEventListener("click",()=>{audio.ui();returnToMenu()});
$("pause")?.addEventListener("click",()=>{
  if(!game||!game.running)return;
  paused=!paused;
  $("app")?.classList.toggle("game-paused",paused);
  const ps=$("pause-screen");if(ps)ps.hidden=!paused;
  if(paused){
    const s=$("pause-summary");
    if(s)s.innerHTML=`Time ${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,"0")} · L${game.level} · ${game.kills} kills`;
  }
});
$("resume")?.addEventListener("click",()=>{
  paused=false;
  $("app")?.classList.remove("game-paused");
  $("pause-screen")&&($("pause-screen").hidden=true);
  loop.start();
});
$("pause-menu")?.addEventListener("click",()=>returnToMenu());

document.querySelectorAll("[data-loadout]").forEach(button=>button.addEventListener("click",()=>{
  const chosen=button.dataset.loadout;
  try{localStorage.setItem("cosmic-scrap-loadout",chosen)}catch{}
  document.querySelectorAll("[data-loadout]").forEach(item=>{
    const on=item===button;item.classList.toggle("selected",on);item.setAttribute("aria-pressed",String(on));
  });
}));
document.querySelectorAll("[data-contract]").forEach(btn=>btn.addEventListener("click",()=>{
  selectedContract=btn.dataset.contract;
  try{localStorage.setItem("cosmic-scrap-directive-choice",selectedContract)}catch{}
  document.querySelectorAll("[data-contract]").forEach(b=>{
    const on=b===btn;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on));
  });
}));

$("audio-toggle")?.addEventListener("click",()=>{
  audio.enabled=!audio.enabled;
  try{localStorage.setItem("cosmic-scrap-audio",audio.enabled?"on":"off")}catch{}
  $("audio-toggle").textContent="SOUND: "+(audio.enabled?"ON":"OFF");
});

window.addEventListener("resize",()=>game?.resize());
try{awardIdle(profile);save(profile)}catch{}
console.log("COSMIC SCRAP ready (3ac3626 core)");
