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
 riftWarning(){this.tone(390,.16,"sine",.025,190);setTimeout(()=>this.tone(300,.2,"triangle",.02,145),100)}
 riftOpen(){this.tone(175,.24,"sawtooth",.028,360);setTimeout(()=>this.tone(540,.12,"triangle",.018,280),150)}
 riftSeal(){this.tone(280,.14,"triangle",.025,560);setTimeout(()=>this.tone(620,.2,"sine",.025,1080),110)}
 riftEcho(){this.tone(320,.09,"triangle",.018,720)}
 contractComplete(){this.tone(500,.16,"triangle",.04,780);setTimeout(()=>this.tone(780,.18,"triangle",.04,1180),100);setTimeout(()=>this.tone(1180,.24,"sine",.03,1580),210)}
 lowHealth(){const n=performance.now();if(n-this.lastLowHealthAt<850)return;this.lastLowHealthAt=n;this.tone(95,.16,"sine",.025,72);if(this.vibration&&navigator.vibrate)navigator.vibrate(12)}
 damage(){this.tone(145,.12,"square",.035,75);if(this.vibration&&navigator.vibrate)navigator.vibrate(24)}
 death(){this.tone(260,.45,"triangle",.04,55)}
 menuOpen(){this.tone(360,.08,"triangle",.02,520)}
}
const audio=new AudioSystem(),toast=message=>{$("toast").textContent=message;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1400)};
const idleReward=awardIdle(profile);$("best").textContent=profile.bestScore||0;
function renderAchievementCount(){$("achievement-count").textContent=(profile.achievements||[]).length+"/"+ACHIEVEMENTS.length}
function careerXP(){return Math.max(0,Number(profile.totalScrap)||0)}
function careerLevelForXP(xp){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/100))+1)}
function careerLevel(){return careerLevelForXP(careerXP())}
function levelForSkin(skin){return ({blue:1,mint:2,violet:3,amber:5})[skin]||99}
function renderCareerProgress(){
  const xp=careerXP(),level=careerLevel(),floor=(level-1)*(level-1)*100,ceiling=level*level*100,within=Math.max(0,xp-floor),span=Math.max(1,ceiling-floor);
  const levelNode=$("career-level"),fill=$("career-xp-fill"),label=$("career-xp-label");
  if(levelNode)levelNode.textContent="LEVEL "+level;
  if(fill)fill.style.width=Math.min(100,within/span*100)+"%";
  if(label)label.textContent=within.toLocaleString()+" / "+span.toLocaleString()+" XP TO NEXT LEVEL";
  document.querySelectorAll("[data-skin]").forEach(button=>{
    const required=Number(button.dataset.requiredLevel)||1,locked=level<required;
    button.disabled=locked;button.classList.toggle("locked",locked);button.setAttribute("aria-disabled",String(locked));
    const label=button.querySelector("small");if(label)label.textContent=locked?"LOCKED · LVL "+required:(required===1?"LVL 1 · STARTER":"UNLOCKED · LVL "+required);
  });
}
function renderLocalPilot(){
  const card=$("local-pilot-card");if(!card)return;
  const runs=(()=>{try{return JSON.parse(localStorage.getItem("cosmic-scrap-playtest-log")||"[]").length}catch{return 0}})();
  const joined=profile.firstPlayedAt?new Date(profile.firstPlayedAt).toLocaleDateString():"—";
  const skin=(localStorage.getItem("cosmic-scrap-skin")||"blue").toUpperCase();
  $("local-pilot-core").textContent=String(profile.core||0);
  $("local-pilot-best").textContent=String(profile.bestScore||0);
  $("local-pilot-achievements").textContent=((profile.achievements||[]).length)+"/"+ACHIEVEMENTS.length;
  $("local-pilot-runs").textContent=String(runs);
  $("local-pilot-joined").textContent=joined;
  $("local-pilot-skin").textContent=skin;
  $("local-pilot-scrap").textContent=String(profile.totalScrap||0);
  renderCareerProgress();
}
renderAchievementCount();renderLocalPilot();
if(idleReward>0)toast("WELCOME BACK · +"+idleReward+" IDLE SCRAP");
const pauseScreen=$("pause-screen"),settingsScreen=$("settings-screen");
function openSettings(){
  $("setting-sound").checked=audio.enabled;
  $("setting-vibration").checked=localStorage.getItem("cosmic-scrap-vibration")==="on";
  $("setting-reduced-flash").checked=localStorage.getItem("cosmic-scrap-reduced-flash")==="on";
  const volEl=$("setting-volume");
  if(volEl){volEl.value=String(Math.round(audio.volume*100));$("setting-volume-value").textContent=Math.round(audio.volume*100)+"%";}
  settingsScreen.hidden=false;audio.menuOpen();$("settings-close").focus();
}
function closeSettings(){
  audio.enabled=$("setting-sound").checked;
  const volEl=$("setting-volume");
  if(volEl)audio.setVolume(Number(volEl.value)/100);
  try{
    localStorage.setItem("cosmic-scrap-audio",audio.enabled?"on":"off");
    localStorage.setItem("cosmic-scrap-vibration",$("setting-vibration").checked?"on":"off");
    localStorage.setItem("cosmic-scrap-reduced-flash",$("setting-reduced-flash").checked?"on":"off");
  }catch{}
  audio.vibration=$("setting-vibration").checked;
  if(game)game.reducedFlash=$("setting-reduced-flash").checked;
  settingsScreen.hidden=true;
  $("audio-toggle").textContent=audio.enabled?"SOUND: ON":"SOUND: OFF";
  if(audio.enabled)audio.ui();
  if(paused)$("resume").focus();else if(!game)$("settings-open").focus();
}
function setPaused(value){if(!game||!game.running)return;paused=value;pauseScreen.hidden=!paused;$("pause").setAttribute("aria-pressed",String(paused));if(paused){const p=game.player;$("pause-summary").innerHTML=[[ "TIME",Math.floor(game.elapsed)+"s" ],[ "SCORE",game.score ],[ "LEVEL",game.level ],[ "CORE",Math.ceil(p.health)+"/"+p.maxHealth ],[ "THREATS",game.enemies.length ],[ "SAFE ZONE",Math.round(game.danger)+" px" ]].map(([k,v])=>'<div><small>'+k+'</small><strong>'+v+'</strong></div>').join("");focusBeforePause=document.activeElement;$("resume").focus()}else if(focusBeforePause?.focus)focusBeforePause.focus()}
const callbacks={toast,audio,getContract:()=>getContract(selectedContract),contractUpdate:(contract,progress,complete)=>{const node=$("contract-hud");node.hidden=false;$("contract-hud-title").textContent=contract.name;$("contract-hud-progress").textContent=contractProgressText(contract,progress);$("contract-hud-fill").style.width=(100*progress/contract.target)+"%";node.classList.toggle("contract-complete",complete)},levelUp:()=>{audio.levelUp();game.shake=5;game.shockwaves.push({x:game.player.x,y:game.player.y,r:8,max:165,life:.42,maxLife:.42,color:"#fff18a"});const pool=UPGRADES.filter(u=>!u.available||u.available(game.player)),choices=[];while(choices.length<Math.min(3,pool.length)&&pool.length)choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);levelScreen.show(choices,(upgrade,rarity="common")=>{audio.upgrade(rarity);const applyScaled=(scale)=>{const before={...game.player};upgrade.apply(game.player);for(const key of Object.keys(before)){if(typeof before[key]==="number"&&typeof game.player[key]==="number"&&game.player[key]!==before[key])game.player[key]=before[key]+(game.player[key]-before[key])*scale}};if(rarity==="epic"){upgrade.apply(game.player);upgrade.apply(game.player)}else applyScaled(rarity==="rare"?1.25:1);game.lastUpgradeRarity=rarity;game.shockwaves.push({x:game.player.x,y:game.player.y,r:12,max:rarity==="epic"?220:rarity==="rare"?150:95,life:.55,maxLife:.55,color:rarity==="epic"?"#bd82ff":rarity==="rare"?"#40cfff":"#9cfff2"});game.shake=rarity==="epic"?8:rarity==="rare"?4:1.5;levelScreen.hide();game.resumeAfterUpgrade()})},gameOver:g=>{paused=false;pauseScreen.hidden=true;const previousBest=profile.bestScore||0,best=g.score>previousBest;if(best)profile.bestScore=g.score;const achievementResult=awardAchievements(g,profile),baseEarned=Math.max(1,Math.floor(g.scrapCollected/10)),contractBonus=g.contractComplete?g.contract.reward:0,earned=baseEarned+contractBonus+achievementResult.reward;profile.core=(profile.core||0)+earned;profile.totalScrap=(profile.totalScrap||0)+g.scrapCollected;if(g.contractComplete)profile.contractCompletions=(profile.contractCompletions||0)+1;save(profile);$("best").textContent=profile.bestScore;renderAchievementCount();renderLocalPilot();deathScreen.show(g,best,previousBest,earned,profile.core,achievementResult.unlocked);window.dispatchEvent(new CustomEvent("cosmic-scrap:run-ended",{detail:{score:g.score,level:g.level,survivalSeconds:Math.floor(g.elapsed),kills:g.kills,bossesDefeated:g.bossesDefeated,scrapCollected:g.scrapCollected,maxCombo:g.maxCombo,roomId:window.cosmicScrapActiveRoomId||null,isNewRecord:best,previousBest}}));window.cosmicScrapActiveRoomId=null;toast("+"+earned+" SCRAP CORE · BANKED")}};
const loop=new Loop(dt=>{if(game&&!paused){game.update(dt);hud.update(game)}},()=>{if(game)game.draw()});
function renderContracts(){document.querySelectorAll("[data-contract]").forEach(button=>{const chosen=button.dataset.contract===selectedContract;button.classList.toggle("selected",chosen);button.setAttribute("aria-pressed",String(chosen))})}
document.querySelectorAll("[data-contract]").forEach(button=>button.addEventListener("click",()=>{selectedContract=getContract(button.dataset.contract).id;profile.selectedContract=selectedContract;try{localStorage.setItem("cosmic-scrap-directive-choice","1")}catch{}save(profile);renderContracts();$("contract-hud").hidden=selectedContract==="none";audio.ui();toast("MODE SELECTED · "+getContract(selectedContract).name)}));renderContracts();
function startRun(){audio.unlock();settingsScreen.hidden=true;levelScreen.hide();deathScreen.hide();mainMenu.hide();metaMenu.hide();pauseScreen.hidden=true;paused=false;game=new Game(canvas,input,profile,callbacks);const hasDirective=Boolean(game.contract&&game.contract.metric!=="none");$("contract-hud").hidden=!hasDirective;if(hasDirective){$("contract-hud-title").textContent=game.contract.name;$("contract-hud-progress").textContent=contractProgressText(game.contract,0);$("contract-hud-fill").style.width="0%";$("contract-hud").classList.remove("contract-complete")}loop.start();canvas.focus({preventScroll:true})}
window.addEventListener("cosmic-scrap:start-room-run",async()=>{if(window.cosmicScrapCountdown)await window.cosmicScrapCountdown();startRun();toast("MATCH RUN STARTED · YOUR RESULT WILL SUBMIT AFTER THE RUN")});
function togglePause(){if(!game||!game.running||game.levelUpPending)return;if(!settingsScreen.hidden){settingsScreen.hidden=true;return}setPaused(!paused)}
function renderMeta(){$("meta-options").replaceChildren();META.forEach(item=>{const row=document.createElement("div");row.className="meta-option";const rank=profile.meta?.[item.id]||0;row.innerHTML='<div class="meta-copy"><strong>'+item.name+' · RANK '+rank+'/'+item.max+'</strong><small>'+item.description+'</small></div><button '+(profile.core<item.cost||rank>=item.max?"disabled":"")+'>'+"BUY · "+item.cost+'</button>';row.querySelector("button").addEventListener("click",()=>{if(buyMeta(profile,item.id)){save(profile);renderMeta();renderLocalPilot();audio.ui();toast("CORE UPGRADE INSTALLED")}else toast("NOT ENOUGH SCRAP CORE")});$("meta-options").append(row)});$("meta-screen").querySelector(".eyebrow").textContent="AVAILABLE SCRAP CORE · "+(profile.core||0)}
$("start").addEventListener("click",startRun);$("retry").addEventListener("click",startRun);$("pause").addEventListener("click",togglePause);$("pause-settings").addEventListener("click",openSettings);$("settings-open").addEventListener("click",openSettings);$("settings-close").addEventListener("click",closeSettings);$("resume").addEventListener("click",()=>setPaused(false));$("pause-menu").addEventListener("click",()=>{setPaused(false);game=null;$("contract-hud").hidden=true;mainMenu.show();$("start").focus()});$("menu").addEventListener("click",()=>{deathScreen.hide();$("contract-hud").hidden=true;mainMenu.show();renderLocalPilot();$("start").focus()});$("meta-open").addEventListener("click",()=>{renderMeta();mainMenu.hide();metaMenu.show();$("meta-close").focus()});$("meta-close").addEventListener("click",()=>{metaMenu.hide();mainMenu.show();$("meta-open").focus()});
$("audio-toggle").textContent=audio.enabled?"SOUND: ON":"SOUND: OFF";$("audio-toggle").addEventListener("click",()=>{$("audio-toggle").textContent=audio.toggle()?"SOUND: ON":"SOUND: OFF";if(audio.enabled)audio.tone(520,.06)});
$("setting-volume")?.addEventListener("input",e=>{const v=Number(e.target.value)/100;audio.setVolume(v);$("setting-volume-value").textContent=Math.round(v*100)+"%";if(audio.enabled)audio.ui()});
$("export-save").addEventListener("click",()=>{const blob=new Blob([exportSave(profile)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmic-scrap-save.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("SAVE EXPORTED")});
$("import-save").addEventListener("change",async e=>{try{const file=e.target.files?.[0];if(!file)return;const data=JSON.parse(await file.text());if(!data||typeof data!=="object"||!Number.isFinite(data.core)||!data.meta||!Number.isFinite(data.bestScore))throw Error("bad save");const base=load();profile={...base,...data,version:2,meta:{...base.meta,...data.meta}};profile.core=Math.max(0,profile.core);profile.bestScore=Math.max(0,profile.bestScore);if(!profile.firstPlayedAt)profile.firstPlayedAt=new Date().toISOString();save(profile);$("best").textContent=profile.bestScore;renderAchievementCount();renderLocalPilot();toast("SAVE IMPORTED")}catch{toast("INVALID SAVE FILE")}e.target.value=""});
$("reset-save").addEventListener("click",()=>{if(confirm("Reset all Cosmic Scrap progress? Export a backup first if you want to keep it.")){profile=resetSave();profile.firstPlayedAt=new Date().toISOString();save(profile);$("best").textContent="0";renderMeta();renderAchievementCount();renderLocalPilot();toast("SAVE RESET")}});
addEventListener("resize",()=>{if(game)game.resize()});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&game?.running&&!game.levelUpPending)setPaused(true);if(document.visibilityState==="visible"){$("best").textContent=profile.bestScore||0;renderLocalPilot()}});
addEventListener("keydown",e=>{if((e.key.toLowerCase()==="p"||e.key==="Escape")&&game&&!game.levelUpPending){e.preventDefault();togglePause()}if((e.key===" "||e.key==="Enter")&&game?.levelUpPending)$("upgrade-cards").querySelector("button")?.click();else if((e.key===" "||e.key==="Enter")&&!game&&!$("overlay").hidden)startRun()});
function renderSkins(){const level=careerLevel();document.querySelectorAll("[data-skin]").forEach(b=>{const active=b.dataset.skin===(localStorage.getItem("cosmic-scrap-skin")||"blue"),required=Number(b.dataset.requiredLevel)||levelForSkin(b.dataset.skin),locked=level<required;b.disabled=locked;b.setAttribute("aria-pressed",String(active));b.setAttribute("aria-disabled",String(locked));b.classList.toggle("selected",active);b.classList.toggle("locked",locked)})}document.querySelectorAll("[data-skin]").forEach(b=>b.addEventListener("click",()=>{if(careerLevel()<levelForSkin(b.dataset.skin)){toast("CORE LOCKED · REACH LEVEL "+levelForSkin(b.dataset.skin));return}localStorage.setItem("cosmic-scrap-skin",b.dataset.skin);renderSkins();renderLocalPilot();audio.ui();toast("CORE EQUIPPED · "+b.dataset.skin.toUpperCase())}));renderSkins();$("home-create-account")?.addEventListener("click",()=>window.dispatchEvent(new Event("cosmic-scrap:request-account")));$("app").addEventListener("pointerdown",()=>audio.unlock(),{once:true});const ctx=canvas.getContext("2d");ctx.fillStyle="#000";ctx.fillRect(0,0,innerWidth,innerHeight);

/* Local, privacy-friendly playtest telemetry. No account or network required. */
window.addEventListener("cosmic-scrap:run-ended",event=>{
  try{
    const detail=event.detail||{};
    // The game-over callback already banks Core and cumulative scrap; this event only refreshes career UI and logs the run.
    renderAchievementCount();renderLocalPilot();renderSkins();
    const key="cosmic-scrap-playtest-log";
    const logs=JSON.parse(localStorage.getItem(key)||"[]");
    logs.push({endedAt:new Date().toISOString(),score:detail.score||0,level:detail.level||1,survivalSeconds:detail.survivalSeconds||0,kills:detail.kills||0,bossesDefeated:detail.bossesDefeated||0,scrapCollected:detail.scrapCollected||0,maxCombo:detail.maxCombo||0,isNewRecord:Boolean(detail.isNewRecord)});
    localStorage.setItem(key,JSON.stringify(logs.slice(-200)));
    renderLocalPilot();
  }catch{}
});
$("export-playtest-log")?.addEventListener("click",()=>{
  let logs=[];try{logs=JSON.parse(localStorage.getItem("cosmic-scrap-playtest-log")||"[]")}catch{}
  const blob=new Blob([JSON.stringify({game:"Cosmic Scrap",exportedAt:new Date().toISOString(),runs:logs},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cosmic-scrap-playtest-log.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(logs.length?"PLAYTEST LOG EXPORTED · "+logs.length+" RUNS":"NO RUNS LOGGED YET");
});
