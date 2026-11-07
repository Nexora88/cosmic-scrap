import {Game} from "./core/Game.js";
import {Loop} from "./core/Loop.js";
import {Input} from "./core/Input.js";
import {UPGRADES} from "./config.js";
import {applyUpgradeChoice} from "./systems/UpgradeEffects.js";
import {HUD} from "./ui/HUD.js";
import {LevelUpScreen} from "./ui/LevelUpScreen.js";
import {DeathScreen} from "./ui/DeathScreen.js";
import {MainMenu} from "./ui/MainMenu.js";
import {UpgradeMenu} from "./ui/UpgradeMenu.js";
import {load,save,awardIdle,exportSave,resetSave} from "./utils/Storage.js";
import {META,buyMeta} from "./systems/MetaProgression.js";
import {CONTRACTS,getContract,contractProgressText} from "./systems/Contracts.js";
import {ACHIEVEMENTS,awardAchievements} from "./systems/Achievements.js";
import {FLAG_UNLOCKS,FLAG_PRICES,captureRegion,recordRaidWin,isFlagUnlocked,isSkinUnlocked,countryCodeForFlag,purchaseFlag} from "./systems/RegionProgress.js";
const $=id=>document.getElementById(id),canvas=$("game"),input=new Input(canvas),hud=new HUD(),levelScreen=new LevelUpScreen(),deathScreen=new DeathScreen(),mainMenu=new MainMenu(),metaMenu=new UpgradeMenu();
if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4)$("app").classList.add("low-end-device");
const initialLoadout=(()=>{try{return localStorage.getItem("cosmic-scrap-loadout")||"pulse"}catch{return"pulse"}})();
document.querySelectorAll("[data-loadout]").forEach(item=>{const active=item.dataset.loadout===initialLoadout;item.classList.toggle("selected",active);item.setAttribute("aria-pressed",String(active))});
document.querySelectorAll("[data-loadout]").forEach(button=>button.addEventListener("click",()=>{
 const chosen=button.dataset.loadout;
 try{localStorage.setItem("cosmic-scrap-loadout",chosen)}catch{}
 document.querySelectorAll("[data-loadout]").forEach(item=>{const active=item===button;item.classList.toggle("selected",active);item.setAttribute("aria-pressed",String(active))});
}));
let revivesUsedThisRun=0,lastRunAccounting=null,runEndTimer=null,pendingRunEndDetail=null;
let profile=load(),game=null,paused=false,settingsReturnToPause=false,focusBeforePause=null,selectedContract=getContract((!localStorage.getItem("cosmic-scrap-directive-choice"))?"none":profile.selectedContract).id;profile.selectedContract=selectedContract;save(profile);
if(!profile.firstPlayedAt){profile.firstPlayedAt=new Date().toISOString();save(profile)}
class AudioSystem{
 constructor(){
  this.ctx=null;
  this.enabled=localStorage.getItem("cosmic-scrap-audio")!=="off";
  this.vibration=localStorage.getItem("cosmic-scrap-vibration")==="on";
  const vol=Number(localStorage.getItem("cosmic-scrap-volume"));
  this.volume=Number.isFinite(vol)?Math.min(1,Math.max(0,vol)):0.7;
  this.lastHitAt=0;this.lastImpactAt=0;this.lastDamageAt=0;this.lastKillAt=0;this.lastLowHealthAt=0;this.lastUiAt=0;this.ambientNodes=null;this.ambientRegion=null;this.lastHapticAt=0;this.activeTones=0;this.maxActiveTones=16;
 }
 unlock(){if(!this.enabled)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!this.ctx)this.ctx=new C();if(this.ctx.state==="suspended")this.ctx.resume().catch(()=>{})}
 setEnabled(value){this.enabled=Boolean(value);try{localStorage.setItem("cosmic-scrap-audio",this.enabled?"on":"off")}catch{}if(this.enabled){this.unlock();if(game?.running&&!paused)this.startAmbience(game.region?.id)}else this.stopAmbience();return this.enabled}
 setVolume(value){this.volume=Math.min(1,Math.max(0,Number(value)||0));try{localStorage.setItem("cosmic-scrap-volume",String(this.volume))}catch{};if(this.ambientNodes&&this.ctx)this.ambientNodes.master.gain.setTargetAtTime(this.enabled ? .032*this.volume : 0,this.ctx.currentTime,.12);return this.volume}
 toggle(){return this.setEnabled(!this.enabled)}
 haptic(kind="tap"){
  if(!this.vibration||!navigator.vibrate)return;
  const now=performance.now();if(now-this.lastHapticAt<65)return;this.lastHapticAt=now;
  const patterns={tap:14,damage:[55,28,78],kill:24,boss:[48,32,72,28,115],sector:[28,24,28,24,90],level:[24,28,62],upgrade:[18,22,48],combo:[12,16,12],storm:[36,24,68]};
  try{navigator.vibrate(patterns[kind]||10)}catch{}
 }
 startAmbience(regionId="debris"){
  if(!this.enabled||this.volume<=0.001)return;this.unlock();if(!this.ctx)return;
  if(!this.ambientNodes){
   const master=this.ctx.createGain(),low=this.ctx.createOscillator(),high=this.ctx.createOscillator(),lowGain=this.ctx.createGain(),highGain=this.ctx.createGain();
   low.type="sine";high.type="triangle";low.frequency.value=54;high.frequency.value=108;
   lowGain.gain.value=.58;highGain.gain.value=.16;master.gain.value=0;
   low.connect(lowGain);high.connect(highGain);lowGain.connect(master);highGain.connect(master);master.connect(this.ctx.destination);
   low.start();high.start();this.ambientNodes={master,low,high};
  }
  this.ambientRegion=regionId;const tones={debris:[54,108],ember:[68,136],cryo:[46,92],rift:[61,122],starforge:[76,152]},pair=tones[regionId]||tones.debris,now=this.ctx.currentTime;
  this.ambientNodes.low.frequency.setTargetAtTime(pair[0],now,.8);this.ambientNodes.high.frequency.setTargetAtTime(pair[1],now,.8);
  this.ambientNodes.master.gain.setTargetAtTime(.032*this.volume,now,.65);
 }
 setRegion(regionId){if(regionId!==this.ambientRegion)this.startAmbience(regionId)}
 pauseAmbience(paused=true){if(!this.ambientNodes||!this.ctx)return;this.ambientNodes.master.gain.setTargetAtTime(paused?0:(this.enabled ? .032*this.volume : 0),this.ctx.currentTime,.12)}
 stopAmbience(){if(!this.ambientNodes||!this.ctx)return;this.ambientNodes.master.gain.setTargetAtTime(0,this.ctx.currentTime,.18)}
 tone(freq=440,duration=.1,type="sine",volume=.03,end=0){
  if(!this.enabled||this.volume<=0.001||this.activeTones>=this.maxActiveTones)return;this.unlock();if(!this.ctx)return;
  const n=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();this.activeTones++;o.onended=()=>{this.activeTones=Math.max(0,this.activeTones-1);o.disconnect();g.disconnect()};
  const v=Math.max(0.0001,Math.min(.12,volume*this.volume*1.35));
  o.type=type;o.frequency.setValueAtTime(freq,n);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),n+duration);
  g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+duration);
  o.connect(g);g.connect(this.ctx.destination);o.start(n);o.stop(n+duration);
 }
 ui(){const n=performance.now();if(n-this.lastUiAt<80)return;this.lastUiAt=n;this.tone(680,.04,"sine",.012,920)}
 shot(){const n=performance.now();if(n-this.lastHitAt<90)return;this.lastHitAt=n;this.tone(520,.045,"triangle",.009,330)}
 hit(crit=false){const now=performance.now();if(now-this.lastImpactAt<42)return;this.lastImpactAt=now;this.tone(crit?980:360,.045,crit?"triangle":"sine",crit?.022:.009,crit?1450:210)}
 kill(mult=1,count=0){const n=performance.now();if(n-this.lastKillAt<42)return;this.lastKillAt=n;this.tone(Math.min(1100,430+count*15),.075,"triangle",mult>=1.7?.032:.018,Math.min(1700,760+count*20));if(mult>=2.2)this.tone(880,.07,"sine",.012,1250);this.haptic("kill")}
 upgrade(rarity="common"){this.haptic("upgrade");if(rarity==="epic"){this.tone(430,.22,"sawtooth",.035,1100);setTimeout(()=>this.tone(850,.22,"triangle",.035,1500),90)}else if(rarity==="rare")this.tone(520,.12,"triangle",.03,880);else this.tone(440,.07,"sine",.02,620)}
 levelUp(){this.haptic("level");this.tone(500,.12,"triangle",.05,750);setTimeout(()=>this.tone(760,.15,"triangle",.03,1000),80)}
 combo(){this.haptic("combo");this.tone(640,.08,"sine",.032,900)}
 storm(){this.haptic("storm");this.tone(180,.4,"sawtooth",.045,48);setTimeout(()=>this.tone(115,.32,"triangle",.025,42),100)}
 bossWarning(){this.tone(240,.28,"sawtooth",.04,90);setTimeout(()=>this.tone(180,.32,"square",.035,70),220)}
 bossSpawn(){this.tone(82,.7,"sawtooth",.055,36);setTimeout(()=>this.tone(120,.35,"triangle",.045,52),160)}
 bossKill(){this.tone(220,.18,"triangle",.04,620);setTimeout(()=>this.tone(660,.22,"triangle",.045,1320),110);setTimeout(()=>this.tone(980,.3,"sine",.035,1600),230);this.haptic("boss")}
 damage(){const now=performance.now();if(now-this.lastDamageAt<90)return;this.lastDamageAt=now;this.tone(95,.12,"sawtooth",.04,40);this.haptic("damage")}
 lowHealth(){const n=performance.now();if(n-this.lastLowHealthAt<900)return;this.lastLowHealthAt=n;this.tone(140,.18,"triangle",.03,70)}
 death(){this.tone(60,.5,"sawtooth",.05,20);setTimeout(()=>this.tone(40,.6,"sine",.04,15),120)}
 contractComplete(){this.tone(520,.15,"triangle",.03,880);setTimeout(()=>this.tone(780,.2,"sine",.025,1200),90)}
 riftWarning(){this.tone(200,.25,"sawtooth",.035,60)}
 riftOpen(){this.tone(90,.4,"sawtooth",.04,30)}
 riftSeal(){this.tone(440,.12,"sine",.025,660)}
 riftEcho(){this.tone(300,.1,"triangle",.02,500)}
 sectorUnlock(){this.tone(420,.16,"triangle",.03,720);setTimeout(()=>this.tone(720,.2,"sine",.025,1120),100);this.haptic("sector")}
}
const audio=new AudioSystem();
const toast=(msg)=>{const el=$("toast");if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2200)};
function finalizePendingRunEnd(){if(!runEndTimer)return;clearTimeout(runEndTimer);runEndTimer=null;window.dispatchEvent(new CustomEvent("cosmic-scrap:run-ended",{detail:pendingRunEndDetail||{}}));pendingRunEndDetail=null;window.dispatchEvent(new Event("cosmic-scrap:run-finalized"))}
const pauseScreen=$("pause-screen");
const callbacks={toast,audio,regionCaptured:(regionId)=>{const reward=captureRegion(profile,regionId);if(!reward)return;save(profile);mainMenu.refresh(profile);refreshPilotIdentity();toast((localStorage.getItem("cosmic-scrap-language")==="tr"?"BÖLGE FETHEDİLDİ · YENİ BAYRAK: ":"REGION CAPTURED · NEW FLAG: ")+reward.flag);window.dispatchEvent(new CustomEvent("cosmic-scrap:region-captured",{detail:{regionId}}));window.dispatchEvent(new CustomEvent("cosmic-scrap:submit-region-capture",{detail:{regionId}}))},raidComplete:()=>{recordRaidWin(profile);save(profile);mainMenu.refresh(profile);refreshPilotIdentity()},getContract:()=>getContract(selectedContract),contractUpdate:(contract,progress,complete)=>{const node=$("contract-hud");node.hidden=false;$("contract-hud-title").textContent=contract.name;$("contract-hud-progress").textContent=contractProgressText(contract,progress);$("contract-hud-fill").style.width=(100*progress/contract.target)+"%";node.classList.toggle("contract-complete",complete)},levelUp:()=>{audio.levelUp();game.shake=5;game.shockwaves.push({x:game.player.x,y:game.player.y,r:8,max:165,life:.42,maxLife:.42,color:"#fff18a"});const pool=UPGRADES.filter(u=>!u.available||u.available(game.player)),choices=[];while(choices.length<Math.min(3,pool.length)&&pool.length)choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);if(!choices.length){game.player.health=Math.min(game.player.maxHealth,game.player.health+8);toast("MAX BUILD · CORE REINFORCED");game.levelUpPending=false;return}levelScreen.show(choices,(upgrade,rarity="common")=>{if(!upgrade){levelScreen.hide();game.resumeAfterUpgrade();return}audio.upgrade(rarity);applyUpgradeChoice(game.player,upgrade,rarity);game.lastUpgradeRarity=rarity;game.shockwaves.push({x:game.player.x,y:game.player.y,r:12,max:rarity==="epic"?220:rarity==="rare"?150:95,life:.55,maxLife:.55,color:rarity==="epic"?"#bd82ff":rarity==="rare"?"#40cfff":"#9cfff2"});game.shake=rarity==="epic"?8:rarity==="rare"?4:1.5;levelScreen.hide();game.resumeAfterUpgrade()})},gameOver:g=>{$("app").classList.remove("game-active","game-paused");audio.stopAmbience();paused=false;pauseScreen.hidden=true;const previousRuns=profile.runs||0,previousScrapCore=profile.scrapCore||0,previousTotalScrap=profile.totalScrap||0,previousTotalKills=profile.totalKills||0,previousCareerXp=profile.careerXp||0,previousCareerLevel=profile.careerLevel||1;const previousBest=profile.bestScore||0,best=g.score>previousBest;if(best)profile.bestScore=g.score;const achievementResult=awardAchievements(g,profile),baseEarned=Math.max(1,Math.floor(g.scrapCollected/10)),contractBonus=g.contractComplete? (g.contract?.reward||0):0,earned=baseEarned+contractBonus;profile.scrapCore=(profile.scrapCore||0)+earned;profile.totalScrap=(profile.totalScrap||0)+g.scrapCollected;profile.totalKills=(profile.totalKills||0)+g.kills;profile.runs=(profile.runs||0)+1;const runXpGain=Math.max(5,Math.floor(g.score/50)+g.bossesDefeated*15);profile.careerXp=(profile.careerXp||0)+runXpGain;lastRunAccounting={previousRuns,previousScrapCore,previousTotalScrap,previousTotalKills,previousCareerXp,previousCareerLevel};let lvl=1,need=100,xp=profile.careerXp;while(xp>=need){xp-=need;lvl++;need=Math.floor(need*1.35)}profile.careerLevel=lvl;save(profile);pendingRunEndDetail={score:g.score,level:g.level,survivalSeconds:Math.floor(g.elapsed),kills:g.kills,bossesDefeated:g.bossesDefeated,scrapCollected:g.scrapCollected,isNewRecord:best};if(runEndTimer)clearTimeout(runEndTimer);runEndTimer=setTimeout(()=>{runEndTimer=null;window.dispatchEvent(new CustomEvent("cosmic-scrap:run-ended",{detail:pendingRunEndDetail||{}}));pendingRunEndDetail=null;window.dispatchEvent(new Event("cosmic-scrap:run-finalized"))},1400);const stats=$("run-stats");if(stats){stats.innerHTML=`<div><small>TIME</small><strong>${Math.floor(g.elapsed/60).toString().padStart(2,"0")}:${Math.floor(g.elapsed%60).toString().padStart(2,"0")}</strong></div><div><small>SCORE</small><strong>${g.score}</strong></div><div><small>KILLS</small><strong>${g.kills}</strong></div><div><small>SCRAP</small><strong>${g.scrapCollected}</strong></div><div><small>LEVEL</small><strong>${g.level}</strong></div><div><small>CORE +</small><strong>${earned}</strong></div>`+(best?`<p class="new-best">NEW BEST SCORE</p>`:"")+(achievementResult.unlocked.length?`<p class="ach-unlock">${achievementResult.unlocked.map(a=>a.name).join(" · ")}</p>`:"")}deathScreen.show(g,best,previousBest,earned,profile.scrapCore,achievementResult.unlocked);hud.hide();try{const logs=JSON.parse(localStorage.getItem("cosmic-scrap-playtest-logs")||"[]");logs.push({at:new Date().toISOString(),elapsed:Math.round(g.elapsed),score:g.score,kills:g.kills,level:g.level,bosses:g.bossesDefeated,scrap:g.scrapCollected,reason:g.deathContext?.reason||"unknown"});localStorage.setItem("cosmic-scrap-playtest-logs",JSON.stringify(logs.slice(-40)))}catch{}}};
function startGame(){finalizePendingRunEnd();revivesUsedThisRun=0;lastRunAccounting=null;const joystickKnob=$("joystick-knob");if(joystickKnob)joystickKnob.style.transform="translate(0,0)";window.dispatchEvent(new Event("cosmic-scrap:run-restarted"));audio.unlock();$("app").classList.add("game-active");$("app").classList.remove("game-paused");$("overlay").hidden=true;$("death-screen").hidden=true;$("upgrade-screen").hidden=true;pauseScreen.hidden=true;hud.show();game=new Game(canvas,input,profile,callbacks);audio.startAmbience(game.region?.id);paused=false;loop.start()}
function returnToMenu(){$("app").classList.remove("game-active","game-paused");audio.stopAmbience();loop.stop();game=null;paused=false;pauseScreen.hidden=true;$("death-screen").hidden=true;$("upgrade-screen").hidden=true;$("overlay").hidden=false;hud.hide();mainMenu.navigate("home");mainMenu.refresh(profile);refreshPilotIdentity();window.dispatchEvent(new Event("cosmic-scrap:menu-return"))}
let frameWorkStarted=0;const loop=new Loop(dt=>{if(!game||!game.running||paused)return;if(!frameWorkStarted)frameWorkStarted=performance.now();game.update(dt)},()=>{if(!game)return;if(!frameWorkStarted)frameWorkStarted=performance.now();game.draw();hud.update(game);game.noteFrameCost(performance.now()-frameWorkStarted);frameWorkStarted=0},error=>{console.error("COSMIC_SCRAP_FRAME_ERROR",error);const node=document.createElement("div");node.id="runtime-error";node.setAttribute("role","alert");node.textContent="GAME ERROR: "+(error?.message||String(error));Object.assign(node.style,{position:"fixed",zIndex:"99",left:"12px",right:"12px",top:"72px",padding:"12px",background:"#4a1020",color:"#fff",font:"bold 12px system-ui",overflowWrap:"anywhere",border:"1px solid #ff5878"});document.getElementById("app")?.append(node);paused=true;$("app").classList.add("game-paused");$("app").classList.remove("game-active");pauseScreen.hidden=false;audio.pauseAmbience(true);$("resume").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"DEVAM ET":"RESUME RUN"});
loop.canResume=()=>Boolean(game?.running&&!paused);
window.addEventListener("cosmic-scrap:request-revive",()=>{if(!game||game.running||revivesUsedThisRun>=1){window.dispatchEvent(new CustomEvent("cosmic-scrap:revive-result",{detail:{ok:false,reason:"unavailable"}}));return}if(lastRunAccounting){profile.runs=lastRunAccounting.previousRuns;profile.scrapCore=lastRunAccounting.previousScrapCore;profile.totalScrap=lastRunAccounting.previousTotalScrap;profile.totalKills=lastRunAccounting.previousTotalKills;profile.careerXp=lastRunAccounting.previousCareerXp;profile.careerLevel=lastRunAccounting.previousCareerLevel;save(profile);mainMenu.refresh(profile);lastRunAccounting=null}if(runEndTimer)clearTimeout(runEndTimer);runEndTimer=null;pendingRunEndDetail=null;revivesUsedThisRun=1;game.running=true;game.deathContext=null;game.player.x=game.width/2;game.player.y=game.height/2;game.player.health=Math.max(1,Math.ceil(game.player.maxHealth*.4));game.player.invuln=4;game.enemyProjectiles.length=0;for(const enemy of game.enemies){if(!enemy.dead&&Math.hypot(enemy.x-game.player.x,enemy.y-game.player.y)<155)enemy.dead=true}game.hitFlash=0;game.shake=0;paused=false;$("app").classList.add("game-active");$("app").classList.remove("game-paused");deathScreen.hide();hud.show();audio.pauseAmbience(false);loop.start();toast(localStorage.getItem("cosmic-scrap-language")==="tr"?"KOZMİK KALKAN AKTİF · 1 CANLANMA KULLANILDI":"COSMIC SHIELD ACTIVE · 1 CONTINUE USED");window.dispatchEvent(new CustomEvent("cosmic-scrap:revive-result",{detail:{ok:true}}))});
$("start").addEventListener("click",()=>{audio.ui();startGame()});
$("retry").addEventListener("click",()=>{audio.ui();startGame()});
$("menu").addEventListener("click",()=>{audio.ui();returnToMenu()});
$("pause").addEventListener("click",()=>{if(!game||!game.running)return;paused=!paused;$("app").classList.toggle("game-paused",paused);pauseScreen.hidden=!paused;$("pause").setAttribute("aria-pressed",String(paused));if(paused){audio.pauseAmbience(true);$("resume").focus();const s=$("pause-summary");if(s)s.innerHTML=`Time ${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,"0")} · L${game.level} · ${game.kills} kills`}else{audio.pauseAmbience(false);loop.start();audio.ui()}});
$("resume").addEventListener("click",()=>{paused=false;$("app").classList.remove("game-paused");pauseScreen.hidden=true;$("pause").setAttribute("aria-pressed","false");audio.pauseAmbience(false);loop.start();audio.ui();$("pause").focus()});
$("pause-menu").addEventListener("click",()=>{audio.ui();returnToMenu()});
$("pause-settings")?.addEventListener("click",()=>{settingsReturnToPause=true;pauseScreen.hidden=true;$("settings-screen").hidden=false;audio.ui()});
document.querySelectorAll("[data-contract]").forEach(btn=>btn.addEventListener("click",()=>{selectedContract=btn.dataset.contract;profile.selectedContract=selectedContract;save(profile);try{localStorage.setItem("cosmic-scrap-directive-choice",selectedContract)}catch{};document.querySelectorAll("[data-contract]").forEach(b=>{const on=b===btn;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on))});audio.ui()}));
$("audio-toggle")?.addEventListener("click",()=>{const on=audio.toggle();$("audio-toggle").textContent="SOUND: "+(on?"ON":"OFF");audio.ui()});
$("settings-open")?.addEventListener("click",()=>{settingsReturnToPause=false;$("settings-screen").hidden=false;audio.ui()});
$("settings-close")?.addEventListener("click",()=>{$("settings-screen").hidden=true;if(settingsReturnToPause&&paused)pauseScreen.hidden=false;settingsReturnToPause=false;audio.ui()});
$("setting-sound")?.addEventListener("change",e=>{audio.setEnabled(e.target.checked);$("audio-toggle").textContent="SOUND: "+(audio.enabled?"ON":"OFF")});
$("setting-volume")?.addEventListener("input",e=>{audio.setVolume(Number(e.target.value)/100);$("setting-volume-value").textContent=Math.round(audio.volume*100)+"%"});
$("setting-vibration")?.addEventListener("change",e=>{audio.vibration=e.target.checked;try{localStorage.setItem("cosmic-scrap-vibration",e.target.checked?"on":"off")}catch{}});
$("setting-reduced-flash")?.addEventListener("change",e=>{try{localStorage.setItem("cosmic-scrap-reduced-flash",e.target.checked?"on":"off")}catch{}});
$("setting-reduced-effects")?.addEventListener("change",e=>{const mode=e.target.checked?"reduced":"auto";try{localStorage.setItem("cosmic-scrap-effects-mode",mode)}catch{}if(game)game.setReducedEffects(e.target.checked)});
$("setting-screen-shake")?.addEventListener("change",e=>{const enabled=e.target.checked;try{localStorage.setItem("cosmic-scrap-screen-shake",enabled?"on":"off")}catch{}if(game)game.screenShakeEnabled=enabled});
$("meta-open")?.addEventListener("click",()=>{metaMenu.show(profile,META,buyMeta,()=>{save(profile);mainMenu.refresh(profile)});audio.ui()});
$("meta-close")?.addEventListener("click",()=>{$("meta-screen").hidden=true;audio.ui()});
$("export-save")?.addEventListener("click",()=>{exportSave(profile);toast("SAVE EXPORTED")});
$("reset-save")?.addEventListener("click",()=>{if(confirm("Reset all progress on this device?")){profile=resetSave();save(profile);mainMenu.refresh(profile);refreshPilotIdentity();toast("SAVE RESET")}});
$("export-playtest-log")?.addEventListener("click",()=>{try{const logs=JSON.parse(localStorage.getItem("cosmic-scrap-playtest-logs")||"[]");const blob=new Blob([JSON.stringify(logs,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cosmic-scrap-playtest-log.json";a.click();toast(logs.length?"PLAYTEST LOG EXPORTED · "+logs.length+" RUNS":"NO RUNS LOGGED YET")}catch{toast("EXPORT FAILED")}});
window.addEventListener("resize",()=>game?.resize());
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&game?.running&&$("settings-screen").hidden){event.preventDefault();$("pause").click()}});
const soundSetting=$("setting-sound"),volumeSetting=$("setting-volume"),vibrationSetting=$("setting-vibration"),effectsSetting=$("setting-reduced-effects"),screenShakeSetting=$("setting-screen-shake"),controlSideSetting=$("setting-control-side"),joystick=$("joystick");
const applyControlSide=(side="right")=>{const value=side==="left"?"left":"right";joystick?.classList.toggle("joystick-left",value==="left");joystick?.classList.toggle("joystick-right",value==="right");if(controlSideSetting)controlSideSetting.value=value;try{localStorage.setItem("cosmic-scrap-control-side",value)}catch{}};
applyControlSide(localStorage.getItem("cosmic-scrap-control-side")||"right");
if(window.__COSMIC_SCRAP_TEST__===true){
 window.__COSMIC_SCRAP_TEST_API__={
  snapshot:()=>game?({running:game.running,elapsed:game.elapsed,kills:game.kills,level:game.level,health:game.player.health,player:{x:game.player.x,y:game.player.y},input:{x:input.x,y:input.y,stickActive:input.stick.active},enemies:game.enemies.length,projectiles:game.projectiles.length,levelUpPending:game.levelUpPending,profile:{runs:profile.runs,scrapCore:profile.scrapCore,careerXp:profile.careerXp,careerLevel:profile.careerLevel}}):null,
  forceLevelUp:()=>{if(!game?.running)throw new Error("No active run");game.levelUpPending=true;callbacks.levelUp()},
  forceDeath:()=>{if(!game?.running)throw new Error("No active run");game.endRun("qa-forced-death")}
 };
}
controlSideSetting?.addEventListener("change",event=>applyControlSide(event.target.value));
if(soundSetting)soundSetting.checked=audio.enabled;
if(volumeSetting){volumeSetting.value=String(Math.round(audio.volume*100));$("setting-volume-value").textContent=Math.round(audio.volume*100)+"%"}
if(vibrationSetting)vibrationSetting.checked=audio.vibration;
if(effectsSetting)effectsSetting.checked=localStorage.getItem("cosmic-scrap-effects-mode")==="reduced";
if(screenShakeSetting){const savedShake=localStorage.getItem("cosmic-scrap-screen-shake");screenShakeSetting.checked=savedShake==="on"||(savedShake!=="off"&&!matchMedia("(pointer: coarse)").matches)}
awardIdle(profile);save(profile);
mainMenu.refresh(profile);
$("audio-toggle")&&( $("audio-toggle").textContent="SOUND: "+(audio.enabled?"ON":"OFF") );


let pilotFlagGrid = null;
let flagShopCategory = "popular";
let flagShopSearch = "";
function applyFlagShopFilters() {
 if (!pilotFlagGrid) return;
 const query = flagShopSearch.trim().toLocaleLowerCase();
 pilotFlagGrid.querySelectorAll("[data-flag]").forEach(button => {
  const categoryMatch = flagShopCategory === "all"
   ? true
   : flagShopCategory === "popular"
    ? button.dataset.category === "popular"
    : flagShopCategory === "countries"
     ? button.dataset.countryCode !== ""
     : button.dataset.category === "special";
  const searchMatch = !query || button.dataset.search.includes(query);
  button.hidden = !(categoryMatch && searchMatch);
 });
}
function refreshPilotIdentity() {
 const regions = Array.isArray(profile.capturedRegions) ? profile.capturedRegions.length : 0;
 const raids = Number(profile.raidWins) || 0;
 const language = localStorage.getItem("cosmic-scrap-language") === "tr";
 const balance = Math.max(0, Number(profile.scrapCore) || 0);
 const collectionHeading = pilotFlagGrid?.parentElement?.querySelector(".flag-collection-balance");
 if (collectionHeading) collectionHeading.textContent = (language ? "KOLEKSİYON · HURDA ÇEKİRDEĞİ: " : "COLLECTION · SCRAP CORE: ") + balance.toLocaleString(language ? "tr-TR" : "en-US");
 const selectedSkin = localStorage.getItem("cosmic-scrap-skin") || "blue";
 document.querySelectorAll("[data-skin]").forEach(button => {
  const unlocked = isSkinUnlocked(profile, button.dataset.skin);
  const active = button.dataset.skin === selectedSkin && unlocked;
  button.disabled = !unlocked;
  button.classList.toggle("locked", !unlocked);
  button.classList.toggle("selected", active);
  button.setAttribute("aria-pressed", String(active));
  const small = button.querySelector("small");
  if (small && button.dataset.requiredRegions) small.textContent = regions >= Number(button.dataset.requiredRegions) ? "UNLOCKED" : (language ? "BÖLGE FETHET: " : "CAPTURE REGIONS: ") + button.dataset.requiredRegions;
  if (small && button.dataset.requiredRaids) small.textContent = raids >= Number(button.dataset.requiredRaids) ? "UNLOCKED" : (language ? "AKIN KAZAN: " : "WIN RAIDS: ") + button.dataset.requiredRaids;
 });
 let selectedFlag = profile.selectedFlag || localStorage.getItem("cosmic-scrap-flag") || "🇹🇷";
 if (!isFlagUnlocked(profile, selectedFlag)) {
  selectedFlag = "🇹🇷";
  profile.selectedFlag = selectedFlag;
  save(profile);
  try { localStorage.setItem("cosmic-scrap-flag", selectedFlag); } catch {}
 }
 if (pilotFlagGrid) pilotFlagGrid.querySelectorAll("[data-flag]").forEach(button => {
  const owned = isFlagUnlocked(profile, button.dataset.flag);
  const active = button.dataset.flag === selectedFlag;
  const small = button.querySelector("small");
  button.disabled = false;
  button.classList.toggle("locked", !owned);
  button.classList.toggle("selected", active);
  button.classList.toggle("owned", owned);
  button.classList.toggle("rarity-rare", button.dataset.rarity === "rare");
  button.classList.toggle("rarity-epic", button.dataset.rarity === "epic");
  button.classList.toggle("rarity-legendary", button.dataset.rarity === "legendary" || button.dataset.rarity === "mythic");
  button.setAttribute("aria-pressed", String(active));
  if (small) {
   const price = Number(button.dataset.price) || 0;
   small.textContent = active ? (language ? "TAKILI" : "EQUIPPED") : owned ? (language ? "KOLEKSİYONDA" : "OWNED") : price.toLocaleString(language ? "tr-TR" : "en-US") + " CORE";
  }
 });
 applyFlagShopFilters();
}
function mountPilotIdentity() {
 const host = document.getElementById("pilot-flag-picker");
 if (!host) return;
 host.replaceChildren();
 const heading = document.createElement("div");
 heading.className = "skin-picker-heading";
 const eyebrow = document.createElement("span");
 eyebrow.className = "eyebrow";
 eyebrow.textContent = localStorage.getItem("cosmic-scrap-language") === "tr" ? "PİLOT KOZMETİKLERİ" : "PILOT COSMETICS";
 const title = document.createElement("strong");
 title.textContent = localStorage.getItem("cosmic-scrap-language") === "tr" ? "BAYRAK MAĞAZASI" : "FLAG COLLECTION";
 heading.append(eyebrow, title);
 const balance = document.createElement("small");
 balance.className = "flag-collection-balance";
 heading.append(balance);
 const filters = document.createElement("div");
 filters.className = "flag-shop-filters";
 const filterLabels = [
  ["popular", "POPÜLER", "POPULAR"],
  ["countries", "ÜLKELER", "COUNTRIES"],
  ["special", "NADİR / ÖZEL", "RARE / SPECIAL"],
  ["all", "TÜMÜ", "ALL"]
 ];
 filterLabels.forEach(([key, tr, en]) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "flag-shop-filter";
  button.textContent = localStorage.getItem("cosmic-scrap-language") === "tr" ? tr : en;
  button.setAttribute("aria-pressed", String(key === flagShopCategory));
  button.addEventListener("click", () => {
   flagShopCategory = key;
   filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
   applyFlagShopFilters();
  });
  filters.append(button);
 });
 const search = document.createElement("input");
 search.className = "flag-shop-search";
 search.type = "search";
 search.maxLength = 40;
 search.placeholder = localStorage.getItem("cosmic-scrap-language") === "tr" ? "Bayrak veya ülke ara…" : "Search a flag or country…";
 search.setAttribute("aria-label", search.placeholder);
 search.addEventListener("input", () => { flagShopSearch = search.value; applyFlagShopFilters(); });
 pilotFlagGrid = document.createElement("div");
 pilotFlagGrid.className = "pilot-flag-options";
 for (const option of FLAG_UNLOCKS) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pilot-flag-option";
  button.dataset.flag = option.flag;
  button.dataset.category = option.category;
  button.dataset.countryCode = option.countryCode || "";
  button.dataset.rarity = option.rarity || "common";
  button.dataset.price = String(FLAG_PRICES[option.flag] || 0);
  button.dataset.search = [option.label, option.labelTR, option.countryCode || ""].join(" ").toLocaleLowerCase();
  button.setAttribute("aria-label", option.label);
  button.title = option.label + (option.countryCode ? " · " + option.countryCode : " · SPECIAL");
  const icon = document.createElement("span");
  icon.textContent = option.flag;
  const caption = document.createElement("small");
  caption.textContent = localStorage.getItem("cosmic-scrap-language") === "tr" ? (option.labelTR || option.label) : option.label;
  button.append(icon, caption);
  button.addEventListener("click", () => {
   if (!isFlagUnlocked(profile, option.flag)) {
    const result = purchaseFlag(profile, option.flag);
    if (!result.ok) {
     toast(result.reason === "funds"
      ? (localStorage.getItem("cosmic-scrap-language") === "tr" ? "YETERSİZ CORE · GEREKEN: " : "NOT ENOUGH CORE · COST: ") + result.cost
      : (localStorage.getItem("cosmic-scrap-language") === "tr" ? "BU BAYRAK SATIN ALINAMADI" : "FLAG PURCHASE UNAVAILABLE"));
     return;
    }
    toast((localStorage.getItem("cosmic-scrap-language") === "tr" ? "KOLEKSİYONA EKLENDİ: " : "ADDED TO COLLECTION: ") + option.flag);
   }
   profile.selectedFlag = option.flag;
   save(profile);
   try { localStorage.setItem("cosmic-scrap-flag", option.flag); } catch {}
   window.dispatchEvent(new CustomEvent("cosmic-scrap:flag-changed", { detail: { flag: option.flag, countryCode: countryCodeForFlag(option.flag) } }));
   refreshPilotIdentity();
   mainMenu.refresh(profile);
  });
  pilotFlagGrid.append(button);
 }
 host.append(heading, filters, search, pilotFlagGrid);
 document.querySelectorAll("[data-skin]").forEach(button => button.addEventListener("click", () => {
  if (!isSkinUnlocked(profile, button.dataset.skin)) return;
  try { localStorage.setItem("cosmic-scrap-skin", button.dataset.skin); } catch {}
  save(profile);
  refreshPilotIdentity();
 }));
 refreshPilotIdentity();
}
window.addEventListener("cosmic-scrap:cloud-save-applied",event=>{
 const incoming=event.detail;
 if(!incoming||typeof incoming!=="object")return;
 Object.assign(profile,incoming);
 if(["none","salvager","elite","storm"].includes(incoming.selectedContract)){
  selectedContract=incoming.selectedContract;
  try{localStorage.setItem("cosmic-scrap-directive-choice",selectedContract)}catch{}
  document.querySelectorAll("[data-contract]").forEach(button=>{
   const active=button.dataset.contract===selectedContract;
   button.classList.toggle("selected",active);
   button.setAttribute("aria-pressed",String(active));
  });
 }
 mainMenu.refresh(profile);
 refreshPilotIdentity();
});
mountPilotIdentity();
window.addEventListener("cosmic-scrap:capsule-reward",event=>{
 const flag=event.detail?.flag;
 if(!FLAG_UNLOCKS.some(item=>item.flag===flag))return;
 profile.ownedFlags=[...new Set([...(Array.isArray(profile.ownedFlags)?profile.ownedFlags:[]),flag])];
 profile.selectedFlag=flag;save(profile);
 try{localStorage.setItem("cosmic-scrap-flag",flag)}catch{}
 window.dispatchEvent(new CustomEvent("cosmic-scrap:flag-changed",{detail:{flag,countryCode:countryCodeForFlag(flag)}}));
 refreshPilotIdentity();mainMenu.refresh(profile);
 toast("ANADOLU ATEŞİ · "+(localStorage.getItem("cosmic-scrap-language")==="tr"?"KOLEKSİYONA EKLENDİ":"ADDED TO COLLECTION"));
});
const skinShopScreen=$("skin-shop-screen"),skinShopOpen=$("skin-shop-open"),skinShopClose=$("skin-shop-close");
skinShopOpen?.addEventListener("click",()=>{
 if(game?.running)return;
 audio.ui();
 $("overlay").hidden=true;
 if(skinShopScreen)skinShopScreen.hidden=false;
 refreshPilotIdentity();
 skinShopClose?.focus();
});
skinShopClose?.addEventListener("click",()=>{
 audio.ui();
 if(skinShopScreen)skinShopScreen.hidden=true;
 $("overlay").hidden=false;
 skinShopOpen?.focus();
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&skinShopScreen&&!skinShopScreen.hidden){
  event.preventDefault();
  skinShopScreen.hidden=true;
  $("overlay").hidden=false;
  skinShopOpen?.focus();
 }
});
