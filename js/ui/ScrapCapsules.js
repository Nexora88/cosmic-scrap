import {CAPSULE_COPY} from "../systems/CapsuleLocale.js";
import {CAPSULE_TIMING} from "../systems/CapsuleTiming.js";
import {createCapsuleStarfield} from "./CapsuleStarfield.js";
import {equipOwnedCosmetic,normalizeOwnedCosmetics,COSMETIC_STORAGE_KEYS} from "../systems/Cosmetics.js";
import {CAPSULE_DUPLICATE_COMPENSATION,CAPSULE_COLLECTION_COPY,getCapsuleCollectionProgress,appendCapsuleHistory,getCapsuleSellValue,isCapsuleCosmeticSellable} from "../systems/CapsuleCollection.js";
import {COSMETIC_REWARDS} from "../systems/CosmeticCatalog.js";
import {isFlagUnlocked} from "../systems/RegionProgress.js";

const KEY="cosmic-scrap-capsules";
const RUNS="cosmic-scrap-capsule-runs";
const OWNED="cosmic-scrap-capsule-cosmetics";
const SERVER_OWNED="cosmic-scrap-server-cosmetics";
const HISTORY="cosmic-scrap-capsule-history";
const collectionCopy=()=>CAPSULE_COLLECTION_COPY[locale()]||CAPSULE_COLLECTION_COPY.en;
const $=id=>document.getElementById(id);
const locale=()=>{try{return localStorage.getItem("cosmic-scrap-language")||"en"}catch{return"en"}};
const copy=CAPSULE_COPY;
const t=key=>(copy[locale()]||copy.en)[key]||copy.en[key]||key;
const rewards=COSMETIC_REWARDS;
// Warm the capsule mark before the full-screen scene is shown, including repeat openings.
const capsuleLogoPreload=new Image();capsuleLogoPreload.decoding="sync";capsuleLogoPreload.fetchPriority="high";capsuleLogoPreload.src="assets/taviro-logo.svg";
function localizedRewardName(reward){
 if(reward.id==="anatolian-fire")return t("anatolian-fire");
 if(reward.type==="flag"&&reward.id!=="anatolian-fire"){
  const points=Array.from(String(reward.value||"")).map(char=>char.codePointAt(0)).filter(point=>point>=127462&&point<=127487);
  if(points.length>=2){
   const code=String.fromCharCode(points[0]-127397,points[1]-127397);
   try{const country=new Intl.DisplayNames([locale()],{type:"region"}).of(code);if(country)return country+" · "+t("flag")}catch{}
  }
 }
 return reward.name;
}
const rarityColor={copper:"#806044",iron:"#8998a8",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",titanium:"#b7c7d8",obsidian:"#9b70dc",elite:"#ff4f78"};
let capsulePhase=0;
let openingUnlockTimer=null;
let lastRevealedReward=null;
let capsuleStarfield=null;
let rewardRevealTimer=null;
let pressTimer=null;
let rarityGlitchTimer=null;
let holdTriggered=false;
let pendingCapsuleReward=null;
let skipNextReveal=false;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"")}catch{return fallback}}
function notifyCloudSave(){window.dispatchEvent(new Event("cosmic-scrap:save-changed"))}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));notifyCloudSave()}catch{}}
function count(){return Math.max(0,Number(localStorage.getItem(KEY))||0)}
function setCount(value){
 const previous=count(),next=Math.max(0,Math.floor(Number(value)||0));
 try{
  let earned=Math.max(0,Number(localStorage.getItem("cosmic-scrap-capsules-earned"))||previous);
  let spent=Math.max(0,Number(localStorage.getItem("cosmic-scrap-capsules-spent"))||0);
  const delta=next-previous;
  if(delta>0)earned+=delta;else if(delta<0)spent+=Math.abs(delta);
  localStorage.setItem("cosmic-scrap-capsules-earned",String(earned));
  localStorage.setItem("cosmic-scrap-capsules-spent",String(spent));
  localStorage.setItem(KEY,String(Math.max(0,earned-spent)));
 }catch{}
 refreshButton();notifyCloudSave();
}
function owned(){return normalizeOwnedCosmetics([...read(OWNED,[]),...read(SERVER_OWNED,[])])}
function flagImage(value){
 if(value==="🇹🇷🔥"){const elite=document.createElement("span");elite.className="capsule-elite-flag";elite.textContent=value;return elite;}
 const points=Array.from(String(value||"")).map(char=>char.codePointAt(0)).filter(point=>point>=127462&&point<=127487);
 const code=value==="🇹🇷🔥"?"TR":points.length>=2?String.fromCharCode(points[0]-127397,points[1]-127397):"";
 if(!code)return value;
 const img=document.createElement("img");img.className="capsule-flag-image";img.alt=code;img.src="https://flagcdn.com/w80/"+code.toLowerCase()+".png";img.loading="eager";img.fetchPriority="high";img.decoding="sync";img.onerror=()=>{img.replaceWith(document.createTextNode(code))};return img;
}
function refreshButton(){
 const button=$("scrap-capsule-open");if(!button)return;
 button.textContent=t("open")+" · "+count();
 const hint=$("scrap-capsule-count");if(hint)hint.textContent=t("earned")+": "+count();
}
function renderEquipment(){
 const section=$("scrap-capsule-equipment");if(!section)return;
 section.replaceChildren();
 const heading=document.createElement("strong");heading.textContent=t("collection");section.append(heading);
 const inventory=owned(),progress=getCapsuleCollectionProgress(rewards,inventory);
 const progressLabel=document.createElement("small");progressLabel.className="capsule-progress-label";progressLabel.textContent=collectionCopy().progress+" · "+progress.owned+"/"+progress.total+" · "+progress.percent+"%";section.append(progressLabel);
 const progressTrack=document.createElement("div");progressTrack.className="capsule-progress-track";progressTrack.setAttribute("role","progressbar");progressTrack.setAttribute("aria-valuemin","0");progressTrack.setAttribute("aria-valuemax",String(progress.total));progressTrack.setAttribute("aria-valuenow",String(progress.owned));progressTrack.setAttribute("aria-label",collectionCopy().progress);
 const progressFill=document.createElement("span");progressFill.style.width=progress.percent+"%";progressTrack.append(progressFill);section.append(progressTrack);
 const catalogTitle=document.createElement("strong");catalogTitle.className="capsule-catalog-heading";catalogTitle.textContent=t("catalog");section.append(catalogTitle);
 const catalog=document.createElement("div");catalog.className="capsule-reward-catalog";
 for(const reward of rewards){
  const isOwned=inventory.some(item=>item.id===reward.id);
  const card=document.createElement("article");card.className="capsule-catalog-card"+(isOwned?" is-owned":"");card.dataset.rarity=reward.rarity;
  const tier=document.createElement("small");tier.className="capsule-catalog-rarity";tier.style.color=rarityColor[reward.rarity];tier.textContent=t(reward.rarity);
  const visual=document.createElement("span");visual.className="capsule-catalog-visual";
  if(reward.type==="flag")visual.append(flagImage(reward.value));else visual.textContent=({trail:"〰",ship:"⬡",banner:"⚑",color:"◉",symbol:"✦",aura:"✧",badge:"★"})[reward.type]||"◇";
  const name=document.createElement("strong");name.textContent=localizedRewardName(reward);
  const status=document.createElement("small");status.className="capsule-catalog-status";status.textContent=isOwned?t("catalogOwned"):t("catalogPool");
  card.append(tier,visual,name,status);catalog.append(card);
 }
 section.append(catalog);
 const items=inventory;
 if(!items.length){const note=document.createElement("p");note.textContent=t("noItems");section.append(note)}
 for(const item of items){
  const row=document.createElement("div");row.className="capsule-collection-item";
  const name=document.createElement("span");name.textContent=localizedRewardName(item)+" · "+t(item.type);row.append(name);
  {
   const button=document.createElement("button");button.type="button";button.className="mini-button";
   const key=COSMETIC_STORAGE_KEYS[item.type];button.textContent=localStorage.getItem(key)===item.value?t("equipped"):t("equip");
   button.addEventListener("click",()=>{if(!equipOwnedCosmetic(item,localStorage))return;notifyCloudSave();window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));renderEquipment()});row.append(button);
  }
  const sell=document.createElement("button");sell.type="button";sell.className="mini-button capsule-sell-button";
  const sellValue=getCapsuleSellValue(item),freeFlag=!isCapsuleCosmeticSellable(item);
  const equipped=localStorage.getItem(COSMETIC_STORAGE_KEYS[item.type])===item.value;
  sell.textContent=freeFlag?t("notSellable"):equipped?t("unequipToSell"):t("sell")+" · +"+sellValue+" CORE";
  sell.disabled=freeFlag||equipped||sellValue<=0;
  sell.addEventListener("click",()=>window.dispatchEvent(new CustomEvent("cosmic-scrap:sell-cosmetic",{detail:{id:item.id}})));
  row.append(sell);section.append(row);
 }
 const history=read(HISTORY,[]);
 const historyTitle=document.createElement("strong");historyTitle.className="capsule-history-title";historyTitle.textContent=collectionCopy().history;section.append(historyTitle);
 if(!history.length){const note=document.createElement("p");note.textContent=collectionCopy().emptyHistory;section.append(note)}
 else{
  const list=document.createElement("ol");list.className="capsule-reward-history";
  for(const entry of history.slice(-5).reverse()){
   const line=document.createElement("li");
   const reward=rewards.find(item=>item.id===entry.rewardId);
   const name=document.createElement("span");name.textContent=(reward?localizedRewardName(reward):entry.rewardId)+" · "+t(entry.rarity)+(entry.duplicate?" · "+collectionCopy().duplicate+" +"+entry.compensation+" CORE":"");
   const date=document.createElement("time");date.dateTime=entry.earnedAt;date.textContent=new Intl.DateTimeFormat(locale(),{dateStyle:"short"}).format(new Date(entry.earnedAt));
   line.append(name,date);list.append(line);
  }
  section.append(list);
 }
}
function mount(){
 const host=$("skin-shop-content");if(!host)return;
 if(!$("scrap-capsule-open")){
  const button=document.createElement("button");button.id="scrap-capsule-open";button.className="hub-page-action capsule-shop-button";button.type="button";button.addEventListener("click",openCapsule);host.append(button);
  const oddsLabel=document.createElement("small");oddsLabel.id="scrap-capsule-odds";oddsLabel.className="capsule-footnote";oddsLabel.textContent=t("odds");host.append(oddsLabel);
  const countLabel=document.createElement("small");countLabel.id="scrap-capsule-count";countLabel.className="capsule-count";host.append(countLabel);
 }
 if(!$("scrap-capsule-equipment")){const equipment=document.createElement("section");equipment.id="scrap-capsule-equipment";equipment.className="capsule-equipment";host.append(equipment)}
 renderEquipment();
 if(!$("scrap-capsule-layer")){
  const layer=document.createElement("div");layer.id="scrap-capsule-layer";layer.className="scrap-capsule-layer";layer.hidden=true;
  const starCanvas=document.createElement("canvas");starCanvas.className="scrap-capsule-starfield";starCanvas.setAttribute("aria-hidden","true");
  const panel=document.createElement("section");panel.className="scrap-capsule-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-labelledby","scrap-capsule-title");
  const skip=document.createElement("button");skip.id="scrap-capsule-skip";skip.className="mini-button capsule-skip-button";skip.type="button";skip.addEventListener("click",skipCapsuleAnimation);
  const close=document.createElement("button");close.id="scrap-capsule-close";close.className="scrap-capsule-close";close.type="button";close.setAttribute("aria-label",t("close"));close.textContent="×";close.addEventListener("click",()=>{layer.hidden=true;clearTimeout(rewardRevealTimer);clearTimeout(pressTimer);capsuleStarfield?.stop();window.dispatchEvent(new Event("cosmic-scrap:capsule-close"))});
  const beam=document.createElement("span");beam.className="capsule-elite-beam";beam.setAttribute("aria-hidden","true");
  const protocol=document.createElement("p");protocol.className="eyebrow";protocol.id="scrap-capsule-protocol";
  const title=document.createElement("h2");title.id="scrap-capsule-title";
  const art=document.createElement("div");art.className="scrap-capsule-art";art.id="scrap-capsule-art";art.setAttribute("role","button");art.setAttribute("tabindex","0");art.setAttribute("aria-label",t("reveal"));art.addEventListener("pointerdown",()=>{if(capsulePhase!==0||!count())return;holdTriggered=false;art.classList.add("press-charging");clearTimeout(pressTimer);pressTimer=setTimeout(()=>{pressTimer=null;holdTriggered=true;art.classList.remove("press-charging");openReveal()},520)});["pointerup","pointercancel","pointerleave"].forEach(type=>art.addEventListener(type,()=>{clearTimeout(pressTimer);pressTimer=null;art.classList.remove("press-charging")}));art.addEventListener("click",()=>{if(holdTriggered){holdTriggered=false;return}if(capsulePhase!==2||!$("scrap-capsule-reveal").disabled)openReveal()});art.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&(capsulePhase!==2||!$("scrap-capsule-reveal").disabled)){event.preventDefault();openReveal()}});art.innerHTML='<span class="capsule-ground-ring"></span><span class="capsule-orbit"></span><span class="capsule-particles"></span><span class="capsule-reveal-beam"></span><img class="capsule-taviro-logo" src="assets/taviro-logo.svg" alt=""><span class="capsule-scan"></span>';
  const hint=document.createElement("p");hint.id="scrap-capsule-hint";
  const reveal=document.createElement("button");reveal.id="scrap-capsule-reveal";reveal.className="primary-button";reveal.type="button";reveal.hidden=true;reveal.addEventListener("click",openReveal);
  const reward=document.createElement("div");reward.id="scrap-capsule-reward";reward.className="scrap-capsule-reward";reward.hidden=true;
  const foot=document.createElement("small");foot.className="capsule-footnote";foot.id="scrap-capsule-footnote";
  panel.append(close,protocol,title,beam,art,hint,reveal,skip,reward,foot);layer.append(starCanvas,panel);document.body.append(layer);capsuleStarfield=createCapsuleStarfield(starCanvas);
 }
 refreshButton();localizeModal();
}
function localizeModal(){
 const layer=$("scrap-capsule-layer");if(!layer)return;
 $("scrap-capsule-protocol").textContent=t("protocol");$("scrap-capsule-title").textContent=t("capsule");
 $("scrap-capsule-hint").textContent=t("ready");$("scrap-capsule-reveal").textContent=t("reveal");$("scrap-capsule-skip").textContent=t("skip");$("scrap-capsule-close").setAttribute("aria-label",t("close"));
 $("scrap-capsule-footnote").textContent=t("progress");refreshButton();renderEquipment();
}
function openCapsule(){
 const layer=$("scrap-capsule-layer");if(!layer)return;
 layer.hidden=false;clearTimeout(rewardRevealTimer);clearTimeout(pressTimer);clearTimeout(rarityGlitchTimer);pendingCapsuleReward=null;holdTriggered=false;skipNextReveal=false;layer.classList.remove("elite-reveal-scene","capsule-warp-shake","capsule-supernova","capsule-warp-active","rarity-glitch","capsule-reward-stage");capsuleStarfield?.start();capsuleStarfield?.setPhase("idle");layer.classList.toggle("reduced-flash",localStorage.getItem("cosmic-scrap-reduced-flash")==="on"||window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);layer.classList.toggle("low-particle-mode",(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||localStorage.getItem("cosmic-scrap-effects-mode")==="reduced"||localStorage.getItem("cosmic-scrap-performance-mode")==="low");window.dispatchEvent(new Event("cosmic-scrap:capsule-open"));localizeModal();capsulePhase=0;clearTimeout(openingUnlockTimer);openingUnlockTimer=null;
 const button=$("scrap-capsule-reveal");button.hidden=true;button.disabled=false;button.textContent=t("stage1");$("scrap-capsule-skip").hidden=false;
 const art=$("scrap-capsule-art");art.classList.remove("charging","opening","revealed","arrival","elite-reveal","capsule-core-vanish");art.removeAttribute("data-rarity");art.classList.add("arrival");
 const box=$("scrap-capsule-reward");box.hidden=true;box.removeAttribute("data-rarity");
 if(!count()){button.disabled=true;$("scrap-capsule-hint").textContent=t("empty")}else $("scrap-capsule-hint").textContent=t("ready");
}

function layerIsOpen(){const layer=$("scrap-capsule-layer");return Boolean(layer&&!layer.hidden)}
function selectCapsuleReward(){
 const inventory=owned(),profileSnapshot=read("cosmic-scrap-save-v2",{}),available=rewards.filter(item=>!inventory.some(entry=>entry.id===item.id)&&!(item.type==="flag"&&isFlagUnlocked(profileSnapshot,item.value)));
 const rarityOrder={copper:0,iron:1,silver:2,gold:3,platinum:4,titanium:5,obsidian:6,elite:7};
 return available.slice().sort((a,b)=>(rarityOrder[a.rarity]??99)-(rarityOrder[b.rarity]??99))[0]||rewards.find(item=>item.type!=="flag"||!isFlagUnlocked(profileSnapshot,item.value))||rewards[0];
}
function skipCapsuleAnimation(){
 if(!count()||!layerIsOpen()||capsulePhase>2)return;
 clearTimeout(openingUnlockTimer);clearTimeout(rewardRevealTimer);clearTimeout(rarityGlitchTimer);openingUnlockTimer=null;skipNextReveal=true;
 capsulePhase=2;
 const button=$("scrap-capsule-reveal");button.disabled=false;
 const art=$("scrap-capsule-art");art.classList.remove("charging","opening");
 $("scrap-capsule-hint").textContent=t("reveal");
 openReveal();
}
function openReveal(){
 if(!count())return;
 const art=$("scrap-capsule-art"),button=$("scrap-capsule-reveal"),box=$("scrap-capsule-reward");
 if(capsulePhase===0){
  capsulePhase=1;capsuleStarfield?.setPhase("charge");art.classList.remove("opening","revealed");art.classList.add("charging");window.dispatchEvent(new Event("cosmic-scrap:capsule-charge"));
  button.textContent=t("stage2");$("scrap-capsule-hint").textContent=t("charging");openingUnlockTimer=setTimeout(()=>{openingUnlockTimer=null;if(capsulePhase===1&&layerIsOpen())openReveal()},CAPSULE_TIMING.charge);return;
 }
 if(capsulePhase===1){
  capsulePhase=2;pendingCapsuleReward=selectCapsuleReward();const tierColor=rarityColor[pendingCapsuleReward.rarity]||"#7de7f4";capsuleStarfield?.setPhase("warp",pendingCapsuleReward.rarity);$("scrap-capsule-layer").style.setProperty("--capsule-rarity",tierColor);art.dataset.rarity=pendingCapsuleReward.rarity;art.classList.remove("charging");art.classList.add("opening");$("scrap-capsule-layer").classList.add("capsule-warp-active");window.dispatchEvent(new Event("cosmic-scrap:capsule-release"));
  // The reward tier colors the warp immediately; a short spacetime crack reinforces the reveal.
  rarityGlitchTimer=setTimeout(()=>{rarityGlitchTimer=null;if(capsulePhase!==2||!layerIsOpen()||!pendingCapsuleReward)return;capsuleStarfield?.setPhase("warp",pendingCapsuleReward.rarity);const layer=$("scrap-capsule-layer");layer.style.setProperty("--capsule-rarity",rarityColor[pendingCapsuleReward.rarity]||"#7de7f4");art.classList.add("rarity-glitch");layer.classList.add("rarity-glitch");window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-glitch",{detail:{rarity:pendingCapsuleReward.rarity}}));setTimeout(()=>{art.classList.remove("rarity-glitch");$("scrap-capsule-layer").classList.remove("rarity-glitch")},CAPSULE_TIMING.rarityGlitch)},CAPSULE_TIMING.rarityGlitchDelay);
  button.textContent=t("stage3");button.disabled=true;$("scrap-capsule-hint").textContent=t("opening");
  // Let the shell-opening transition finish before the third touch can reveal the reward.
  // The timeout also covers reduced-motion mode, where CSS transitions are disabled.
  clearTimeout(openingUnlockTimer);openingUnlockTimer=setTimeout(()=>{openingUnlockTimer=null;if(capsulePhase===2&&layerIsOpen())openReveal()},CAPSULE_TIMING.shellOpen);return;
 }
 if(capsulePhase!==2)return;
 button.disabled=true;button.hidden=true;setCount(count()-1);
 const skipCinematic=skipNextReveal;skipNextReveal=false;
 const inventory=owned(),profileSnapshot=read("cosmic-scrap-save-v2",{}),available=rewards.filter(item=>!inventory.some(entry=>entry.id===item.id)&&!(item.type==="flag"&&isFlagUnlocked(profileSnapshot,item.value)));
 const rarityOrder={copper:0,iron:1,silver:2,gold:3,platinum:4,titanium:5,obsidian:6,elite:7};
 const reward=available.slice().sort((a,b)=>(rarityOrder[a.rarity]??99)-(rarityOrder[b.rarity]??99))[0]||rewards.find(item=>item.type!=="flag"||!isFlagUnlocked(profileSnapshot,item.value))||rewards[0];
 pendingCapsuleReward=null;$("scrap-capsule-layer").classList.remove("capsule-warp-active","rarity-glitch");$("scrap-capsule-layer").classList.add("capsule-reward-stage");art.classList.add("capsule-core-vanish");const duplicate=inventory.some(item=>item.id===reward.id)||(reward.type==="flag"&&isFlagUnlocked(profileSnapshot,reward.value)),compensation=duplicate?CAPSULE_DUPLICATE_COMPENSATION:0;
 const history=appendCapsuleHistory(read(HISTORY,[]),{rewardId:reward.id,rarity:reward.rarity,duplicate,compensation,earnedAt:new Date().toISOString()},20);write(HISTORY,history);
 if(duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-duplicate",{detail:{amount:compensation}}));
 if(!duplicate){inventory.push(reward);write(OWNED,normalizeOwnedCosmetics(inventory))}
 if(reward.type==="flag"&&!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward",{detail:{flag:reward.value,name:reward.name}}));
 if(!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetic-reward",{detail:reward}));
 capsuleStarfield?.setPhase("reveal",reward.rarity,skipCinematic);art.classList.remove("charging","opening","elite-reveal");art.classList.add("revealed");if(!skipCinematic){art.classList.add("supernova");const scene=$("scrap-capsule-layer");scene.classList.add("capsule-warp-shake","capsule-supernova");window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-implosion",{detail:{rarity:reward.rarity}}));setTimeout(()=>{if(layerIsOpen())window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-supernova",{detail:{rarity:reward.rarity}}))},CAPSULE_TIMING.implosion);setTimeout(()=>{art.classList.remove("supernova");scene.classList.remove("capsule-warp-shake","capsule-supernova")},CAPSULE_TIMING.finaleCleanup)}if(reward.rarity==="elite"){art.classList.add("elite-reveal");$("scrap-capsule-layer").classList.add("elite-reveal-scene")}art.dataset.rarity=reward.rarity;window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reveal",{detail:{rarity:reward.rarity}}));
 box.replaceChildren();box.dataset.rarity=reward.rarity;box.style.setProperty("--capsule-rarity",rarityColor[reward.rarity]||"#7de7f4");box.classList.remove("capsule-card-enter");void box.offsetWidth;lastRevealedReward=reward;
 const tier=document.createElement("small");tier.className="capsule-rarity";tier.style.color=rarityColor[reward.rarity];tier.textContent=t(reward.rarity);
 const title=document.createElement("strong");title.textContent=localizedRewardName(reward);
 const visual=document.createElement("span");visual.className="capsule-reward-visual";
 if(reward.type==="flag")visual.append(flagImage(reward.value));else visual.textContent=({trail:"〰",ship:"⬡",banner:"⚑",color:"◉",symbol:"✦",aura:"✧",badge:"★"})[reward.type]||"◇";
 const type=document.createElement("small");type.className="capsule-reward-type";type.textContent=t(reward.type);
 const detail=document.createElement("p");detail.className="capsule-reward-status";detail.textContent=duplicate?t("duplicate")+" · +"+CAPSULE_DUPLICATE_COMPENSATION+" SCRAP CORE":t("owned");
 const persistedInventory=owned();
 const progress=getCapsuleCollectionProgress(rewards,persistedInventory);
 const progressLabel=document.createElement("small");progressLabel.className="capsule-reward-progress";progressLabel.textContent=collectionCopy().progress+" · "+progress.owned+"/"+progress.total;
 const actions=document.createElement("div");actions.className="capsule-reward-actions";
 const equip=document.createElement("button");equip.type="button";equip.className="mini-button capsule-equip-button";equip.textContent=t("equip");equip.disabled=duplicate;
 equip.addEventListener("click",()=>{if(!lastRevealedReward||duplicate)return;if(!equipOwnedCosmetic(lastRevealedReward,localStorage))return;notifyCloudSave();window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:lastRevealedReward.type,value:lastRevealedReward.value}}));equip.textContent=t("equipped");equip.disabled=true});
 const done=document.createElement("button");done.type="button";done.className="mini-button capsule-done-button";done.textContent=t("collect");done.addEventListener("click",()=>{if(layerIsOpen()){$("scrap-capsule-layer").hidden=true;clearTimeout(rewardRevealTimer);capsuleStarfield?.stop();window.dispatchEvent(new Event("cosmic-scrap:capsule-close"))}});
 actions.append(equip,done);
 box.append(tier,title,type,visual,detail,progressLabel,actions);box.hidden=!skipCinematic;if(skipCinematic)box.classList.add("capsule-card-enter");button.hidden=true;$("scrap-capsule-skip").hidden=true;if(!skipCinematic){rewardRevealTimer=setTimeout(()=>{rewardRevealTimer=null;if(!layerIsOpen())return;box.hidden=false;box.classList.add("capsule-card-enter");window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward-arrival",{detail:{rarity:reward.rarity,rewardId:reward.id}}));if(reward.rarity==="elite")window.dispatchEvent(new CustomEvent("cosmic-scrap:elite-reveal",{detail:{rewardId:reward.id}}))},CAPSULE_TIMING.rewardArrival)}
 if(reward.rarity==="elite"){const signature=document.createElement("small");signature.className="capsule-elite-signature";signature.textContent=t("eliteSignature");box.append(signature)}
 if(skipCinematic){$("scrap-capsule-hint").textContent=t("owned");window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward-arrival",{detail:{rarity:reward.rarity,rewardId:reward.id}}));if(reward.rarity==="elite")window.dispatchEvent(new CustomEvent("cosmic-scrap:elite-reveal",{detail:{rewardId:reward.id}}))}else setTimeout(()=>{if(layerIsOpen())$("scrap-capsule-hint").textContent=t("owned")},CAPSULE_TIMING.rewardArrival);renderEquipment();
}
window.addEventListener("cosmic-scrap:run-ended",()=>{
 let runs=Math.max(0,Number(localStorage.getItem(RUNS))||0)+1;try{localStorage.setItem(RUNS,String(runs));notifyCloudSave()}catch{}
 if(runs%5===0){setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"five-runs"}}))}
});
window.addEventListener("cosmic-scrap:daily-capsule-earned",()=>{setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"daily-streak"}}))});
window.addEventListener("cosmic-scrap:region-captured",()=>{
 setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"region-victory"}}));
});
window.addEventListener("cosmic-scrap:language-changed",localizeModal);
window.addEventListener("cosmic-scrap:capsules-restored",()=>{refreshButton();renderEquipment()});
window.addEventListener("cosmic-scrap:server-cosmetics-restored",renderEquipment);
window.addEventListener("cosmic-scrap:cosmetics-sold",renderEquipment);
window.addEventListener("cosmic-scrap:cosmetic-reward",renderEquipment);
window.addEventListener("cosmic-scrap:capsule-reward",renderEquipment);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
