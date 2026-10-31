import {Game} from "./core/Game.js";
import {Loop} from "./core/Loop.js";
import {Input} from "./core/Input.js";
import {UPGRADES} from "./config.js";
import {HUD} from "./ui/HUD.js";
import {LevelUpScreen} from "./ui/LevelUpScreen.js";
import {DeathScreen} from "./ui/DeathScreen.js";
import {MainMenu} from "./ui/MainMenu.js";
import {UpgradeMenu} from "./ui/UpgradeMenu.js";
import {load,save,awardIdle,exportSave,resetSave} from "./utils/Storage.js";
import {META,buyMeta} from "./systems/MetaProgression.js";
import {CONTRACTS,getContract,contractProgressText} from "./systems/Contracts.js";
import {ACHIEVEMENTS,awardAchievements} from "./systems/Achievements.js";
const $=id=>document.getElementById(id),canvas=$("game"),input=new Input(canvas),hud=new HUD(),levelScreen=new LevelUpScreen(),deathScreen=new DeathScreen(),mainMenu=new MainMenu(),metaMenu=new UpgradeMenu();
if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4)$("app").classList.add("low-end-device");
const initialLoadout=(()=>{try{return localStorage.getItem("cosmic-scrap-loadout")||"pulse"}catch{return"pulse"}})();
document.querySelectorAll("[data-loadout]").forEach(item=>{const active=item.dataset.loadout===initialLoadout;item.classList.toggle("selected",active);item.setAttribute("aria-pressed",String(active))});
document.querySelectorAll("[data-loadout]").forEach(button=>button.addEventListener("click",()=>{
 const chosen=button.dataset.loadout;
 try{localStorage.setItem("cosmic-scrap-loadout",chosen)}catch{}
 document.querySelectorAll("[data-loadout]").forEach(item=>{const active=item===button;item.classList.toggle("selected",active);item.setAttribute("aria-pressed",String(active))});
}));
let profile=load(),game=null,paused=false,focusBeforePause=null,selectedContract=getContract((!localStorage.getItem("cosmic-scrap-directive-choice"))?"none":profile.selectedContract).id;profile.selectedContract=selectedContract;save(profile);
if(!profile.firstPlayedAt){profile.firstPlayedAt=new Date().toISOString();save(profile)}
class AudioSystem{
 constructor(){
  this.ctx=null;
  this.enabled=localStorage.getItem("cosmic-scrap-audio")!=="off";
  this.vibration=localStorage.getItem("cosmic-scrap-vibration")==="on";
  const vol=Number(localStorage.getItem("cosmic-scrap-volume"));
  this.volume=Number.isFinite(vol)?Math.min(1,Math.max(0,vol)):0.7;
  this.lastHitAt=0;this.lastKillAt=0;this.lastLowHealthAt=0;this.lastUiAt=0;
 }
 unlock(){if(!this.enabled)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!this.ctx)this.ctx=new C();if(this.ctx.state==="suspended")this.ctx.resume().catch(()=>{})}
 setEnabled(value){this.enabled=Boolean(value);try{localStorage.setItem("cosmic-scrap-audio",this.enabled?"on":"off")}catch{}if(this.enabled)this.unlock();return this.enabled}
 setVolume(value){this.volume=Math.min(1,Math.max(0,Number(value)||0));try{localStorage.setItem("cosmic-scrap-volume",String(this.volume))}catch{};return this.volume}
 toggle(){return this.setEnabled(!this.enabled)}
 tone(freq=440,duration=.1,type="sine",volume=.03,end=0){
  if(!this.enabled||this.volume<=0.001)return;this.unlock();if(!this.ctx)return;
  const n=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  const v=Math.max(0.0001,volume*this.volume);
  o.type=type;o.frequency.setValueAtTime(freq,n);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),n+duration);
  g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+duration);
  o.connect(g);g.connect(this.ctx.destination);o.start(n);o.stop(n+duration);
 }
 ui(){const n=performance.now();if(n-this.lastUiAt<80)return;this.lastUiAt=n;this.tone(680,.04,"sine",.012,920)}
 shot(){const n=performance.now();if(n-this.lastHitAt<90)return;this.lastHitAt=n;this.tone(520,.045,"triangle",.009,330)}
 hit(crit=false){this.tone(crit?980:360,.045,crit?"triangle":"sine",crit?.022:.009,crit?1450:210)}
 kill(mult=1,count=0){const n=performance.now();if(n-this.lastKillAt<42)return;this.lastKillAt=n;this.tone(Math.min(1100,430+count*15),.075,"triangle",mult>=1.7?.032:.018,Math.min(1700,760+count*20));if(mult>=2.2)this.tone(880,.07,"sine",.012,1250)}
 upgrade(rarity="common"){if(rarity==="epic"){this.tone(430,.22,"sawtooth",.035,1100);setTimeout(()=>this.tone(850,.22,"triangle",.035,1500),90)}else if(rarity==="rare")this.tone(520,.12,"triangle",.03,880);else this.tone(440,.07,"sine",.02,620)}
 levelUp(){this.tone(500,.12,"triangle",.04,750);setTimeout(()=>this.tone(760,.15,"triangle",.03,1000),80)}
 combo(){this.tone(640,.08,"sine",.025,900)}
 storm(){this.tone(180,.4,"sawtooth",.035,48);setTimeout(()=>this.tone(115,.32,"triangle",.025,42),100)}
 bossWarning(){this.tone(240,.28,"sawtooth",.04,90);setTimeout(()=>this.tone(180,.32,"square",.035,70),220)}
 bossSpawn(){this.tone(82,.7,"sawtooth",.055,36);setTimeout(()=>this.tone(120,.35,"triangle",.045,52),160)}
 bossKill(){this.tone(220,.18,"triangle",.04,620);setTimeout(()=>this.tone(660,.22,"triangle",.045,1320),110);setTimeout(()=>this.tone(980,.3,"sine",.035,1600),230)}
 damage(){this.tone(95,.12,"sawtooth",.04,40);if(this.vibration&&navigator.vibrate)try{navigator.vibrate(28)}catch{}}
 lowHealth(){const n=performance.now();if(n-this.lastLowHealthAt<900)return;this.lastLowHealthAt=n;this.tone(140,.18,"triangle",.03,70)}
 death(){this.tone(60,.5,"sawtooth",.05,20);setTimeout(()=>this.tone(40,.6,"sine",.04,15),120)}
 contractComplete(){this.tone(520,.15,"triangle",.03,880);setTimeout(()=>this.tone(780,.2,"sine",.025,1200),90)}
 riftWarning(){this.tone(200,.25,"sawtooth",.035,60)}
 riftOpen(){this.tone(90,.4,"sawtooth",.04,30)}
 riftSeal(){this.tone(440,.12,"sine",.025,660)}
 riftEcho(){this.tone(300,.1,"triangle",.02,500)}
}
const audio=new AudioSystem();
const toast=(msg)=>{const el=$("toast");if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2200)};
const pauseScreen=$("pause-screen");
const callbacks={toast,audio,getContract:()=>getContract(selectedContract),contractUpdate:(contract,progress,complete)=>{const node=$("contract-hud");node.hidden=false;$("contract-hud-title").textContent=contract.name;$("contract-hud-progress").textContent=contractProgressText(contract,progress);$("contract-hud-fill").style.width=(100*progress/contract.target)+"%";node.classList.toggle("contract-complete",complete)},levelUp:()=>{audio.levelUp();game.shake=5;game.shockwaves.push({x:game.player.x,y:game.player.y,r:8,max:165,life:.42,maxLife:.42,color:"#fff18a"});const pool=UPGRADES.filter(u=>!u.available||u.available(game.player)),choices=[];while(choices.length<Math.min(3,pool.length)&&pool.length)choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);if(!choices.length){game.player.health=Math.min(game.player.maxHealth,game.player.health+8);toast("MAX BUILD · CORE REINFORCED");game.levelUpPending=false;return}levelScreen.show(choices,(upgrade,rarity="common")=>{if(!upgrade){levelScreen.hide();game.resumeAfterUpgrade();return}audio.upgrade(rarity);const applyScaled=(scale)=>{const before={...game.player};upgrade.apply(game.player);for(const key of Object.keys(before)){if(typeof before[key]==="number"&&typeof game.player[key]==="number"&&game.player[key]!==before[key])game.player[key]=before[key]+(game.player[key]-before[key])*scale}};if(rarity==="epic"){upgrade.apply(game.player);upgrade.apply(game.player)}else applyScaled(rarity==="rare"?1.25:1);game.lastUpgradeRarity=rarity;game.shockwaves.push({x:game.player.x,y:game.player.y,r:12,max:rarity==="epic"?220:rarity==="rare"?150:95,life:.55,maxLife:.55,color:rarity==="epic"?"#bd82ff":rarity==="rare"?"#40cfff":"#9cfff2"});game.shake=rarity==="epic"?8:rarity==="rare"?4:1.5;levelScreen.hide();game.resumeAfterUpgrade()})},gameOver:g=>{paused=false;pauseScreen.hidden=true;const previousBest=profile.bestScore||0,best=g.score>previousBest;if(best)profile.bestScore=g.score;const achievementResult=awardAchievements(g,profile),baseEarned=Math.max(1,Math.floor(g.scrapCollected/10)),contractBonus=g.contractComplete? (g.contract?.reward||0):0,earned=baseEarned+contractBonus;profile.scrapCore=(profile.scrapCore||0)+earned;profile.totalScrap=(profile.totalScrap||0)+g.scrapCollected;profile.totalKills=(profile.totalKills||0)+g.kills;profile.runs=(profile.runs||0)+1;profile.careerXp=(profile.careerXp||0)+Math.max(5,Math.floor(g.score/50)+g.bossesDefeated*15);let lvl=1,need=100,xp=profile.careerXp;while(xp>=need){xp-=need;lvl++;need=Math.floor(need*1.35)}profile.careerLevel=lvl;save(profile);const stats=$("run-stats");if(stats){stats.innerHTML=`<div><small>TIME</small><strong>${Math.floor(g.elapsed/60).toString().padStart(2,"0")}:${Math.floor(g.elapsed%60).toString().padStart(2,"0")}</strong></div><div><small>SCORE</small><strong>${g.score}</strong></div><div><small>KILLS</small><strong>${g.kills}</strong></div><div><small>SCRAP</small><strong>${g.scrapCollected}</strong></div><div><small>LEVEL</small><strong>${g.level}</strong></div><div><small>CORE +</small><strong>${earned}</strong></div>`+(best?`<p class="new-best">NEW BEST SCORE</p>`:"")+(achievementResult.unlocked.length?`<p class="ach-unlock">${achievementResult.unlocked.map(a=>a.name).join(" · ")}</p>`:"")}deathScreen.show(g,best,previousBest,earned,profile.scrapCore,achievementResult.unlocked);hud.hide();try{const logs=JSON.parse(localStorage.getItem("cosmic-scrap-playtest-logs")||"[]");logs.push({at:new Date().toISOString(),elapsed:Math.round(g.elapsed),score:g.score,kills:g.kills,level:g.level,bosses:g.bossesDefeated,scrap:g.scrapCollected,reason:g.deathContext?.reason||"unknown"});localStorage.setItem("cosmic-scrap-playtest-logs",JSON.stringify(logs.slice(-40)))}catch{}}};
function startGame(){audio.unlock();$("overlay").hidden=true;$("death-screen").hidden=true;$("upgrade-screen").hidden=true;pauseScreen.hidden=true;hud.show();game=new Game(canvas,input,profile,callbacks);paused=false;loop.start()}
function returnToMenu(){loop.stop();game=null;paused=false;pauseScreen.hidden=true;$("death-screen").hidden=true;$("upgrade-screen").hidden=true;$("overlay").hidden=false;hud.hide();mainMenu.refresh(profile)}
const loop=new Loop(dt=>{if(!game||!game.running||paused)return;game.update(dt);game.draw();hud.update(game)},null,error=>{console.error("COSMIC_SCRAP_FRAME_ERROR",error);const node=document.createElement("div");node.id="runtime-error";node.setAttribute("role","alert");node.textContent="GAME ERROR: "+(error?.message||String(error));Object.assign(node.style,{position:"fixed",zIndex:"99",left:"12px",right:"12px",top:"72px",padding:"12px",background:"#4a1020",color:"#fff",font:"bold 12px system-ui",overflowWrap:"anywhere",border:"1px solid #ff5878"});document.getElementById("app")?.append(node)});
$("start").addEventListener("click",()=>{audio.ui();startGame()});
$("retry").addEventListener("click",()=>{audio.ui();startGame()});
$("menu").addEventListener("click",()=>{audio.ui();returnToMenu()});
$("pause").addEventListener("click",()=>{if(!game||!game.running)return;paused=!paused;pauseScreen.hidden=!paused;$("pause").setAttribute("aria-pressed",String(paused));if(paused){const s=$("pause-summary");if(s)s.innerHTML=`Time ${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,"0")} · L${game.level} · ${game.kills} kills`}else audio.ui()});
$("resume").addEventListener("click",()=>{paused=false;pauseScreen.hidden=true;$("pause").setAttribute("aria-pressed","false");audio.ui()});
$("pause-menu").addEventListener("click",()=>{audio.ui();returnToMenu()});
document.querySelectorAll("[data-contract]").forEach(btn=>btn.addEventListener("click",()=>{selectedContract=btn.dataset.contract;profile.selectedContract=selectedContract;save(profile);try{localStorage.setItem("cosmic-scrap-directive-choice",selectedContract)}catch{};document.querySelectorAll("[data-contract]").forEach(b=>{const on=b===btn;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on))});audio.ui()}));
$("audio-toggle")?.addEventListener("click",()=>{const on=audio.toggle();$("audio-toggle").textContent="SOUND: "+(on?"ON":"OFF");audio.ui()});
$("settings-open")?.addEventListener("click",()=>{$("settings-screen").hidden=false;audio.ui()});
$("settings-close")?.addEventListener("click",()=>{$("settings-screen").hidden=true;audio.ui()});
$("setting-sound")?.addEventListener("change",e=>{audio.setEnabled(e.target.checked);$("audio-toggle").textContent="SOUND: "+(audio.enabled?"ON":"OFF")});
$("setting-volume")?.addEventListener("input",e=>{audio.setVolume(Number(e.target.value)/100);$("setting-volume-value").textContent=Math.round(audio.volume*100)+"%"});
$("setting-vibration")?.addEventListener("change",e=>{audio.vibration=e.target.checked;try{localStorage.setItem("cosmic-scrap-vibration",e.target.checked?"on":"off")}catch{}});
$("setting-reduced-flash")?.addEventListener("change",e=>{try{localStorage.setItem("cosmic-scrap-reduced-flash",e.target.checked?"on":"off")}catch{}});
$("meta-open")?.addEventListener("click",()=>{metaMenu.show(profile,META,buyMeta,()=>{save(profile);mainMenu.refresh(profile)});audio.ui()});
$("meta-close")?.addEventListener("click",()=>{$("meta-screen").hidden=true;audio.ui()});
$("export-save")?.addEventListener("click",()=>{exportSave(profile);toast("SAVE EXPORTED")});
$("reset-save")?.addEventListener("click",()=>{if(confirm("Reset all progress on this device?")){profile=resetSave();save(profile);mainMenu.refresh(profile);toast("SAVE RESET")}});
$("export-playtest-log")?.addEventListener("click",()=>{try{const logs=JSON.parse(localStorage.getItem("cosmic-scrap-playtest-logs")||"[]");const blob=new Blob([JSON.stringify(logs,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cosmic-scrap-playtest-log.json";a.click();toast(logs.length?"PLAYTEST LOG EXPORTED · "+logs.length+" RUNS":"NO RUNS LOGGED YET")}catch{toast("EXPORT FAILED")}});
window.addEventListener("resize",()=>game?.resize());
mainMenu.refresh(profile);
awardIdle(profile);save(profile);
$("audio-toggle")&&( $("audio-toggle").textContent="SOUND: "+(audio.enabled?"ON":"OFF") );
