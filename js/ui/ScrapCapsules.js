import {CAPSULE_COPY} from "../systems/CapsuleLocale.js";
import {equipOwnedCosmetic,normalizeOwnedCosmetics,COSMETIC_STORAGE_KEYS} from "../systems/Cosmetics.js";
import {CAPSULE_DUPLICATE_COMPENSATION,CAPSULE_COLLECTION_COPY,getCapsuleCollectionProgress,appendCapsuleHistory} from "../systems/CapsuleCollection.js";

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
const rarityColor={copper:"#b87333",iron:"#9aa4ad",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",titanium:"#a8b7c8",obsidian:"#9a8abf",elite:"#ff7bcb"};
let capsulePhase=0;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"")}catch{return fallback}}
function notifyCloudSave(){window.dispatchEvent(new Event("cosmic-scrap:save-changed"))}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));notifyCloudSave()}catch{}}
function count(){return Math.max(0,Number(localStorage.getItem(KEY))||0)}
function setCount(value){try{localStorage.setItem(KEY,String(Math.max(0,value)))}catch{}refreshButton();notifyCloudSave()}
function owned(){return normalizeOwnedCosmetics([...read(OWNED,[]),...read(SERVER_OWNED,[])])}
function flagImage(value){
 const points=Array.from(String(value||"")).map(char=>char.codePointAt(0)).filter(point=>point>=127462&&point<=127487);
 const code=value==="🇹🇷🔥"?"TR":points.length>=2?String.fromCharCode(points[0]-127397,points[1]-127397):"";
 if(!code)return value;
 const img=document.createElement("img");img.className="capsule-flag-image";img.alt=code;img.src="https://flagcdn.com/w80/"+code.toLowerCase()+".png";img.loading="lazy";img.onerror=()=>{img.replaceWith(document.createTextNode(code))};return img;
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
  const name=document.createElement("strong");name.textContent=reward.name;
  const status=document.createElement("small");status.className="capsule-catalog-status";status.textContent=isOwned?t("catalogOwned"):t("catalogPool");
  card.append(tier,visual,name,status);catalog.append(card);
 }
 section.append(catalog);
 const items=inventory;
 if(!items.length){const note=document.createElement("p");note.textContent=t("noItems");section.append(note)}
 for(const item of items){
  const row=document.createElement("div");row.className="capsule-collection-item";
  const name=document.createElement("span");name.textContent=item.name+" · "+t(item.type);row.append(name);
  {
   const button=document.createElement("button");button.type="button";button.className="mini-button";
   const key=COSMETIC_STORAGE_KEYS[item.type];button.textContent=localStorage.getItem(key)===item.value?t("equipped"):t("equip");
   button.addEventListener("click",()=>{if(!equipOwnedCosmetic(item,localStorage))return;notifyCloudSave();window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));renderEquipment()});row.append(button);
  }
  section.append(row);
 }
 const history=read(HISTORY,[]);
 const historyTitle=document.createElement("strong");historyTitle.className="capsule-history-title";historyTitle.textContent=collectionCopy().history;section.append(historyTitle);
 if(!history.length){const note=document.createElement("p");note.textContent=collectionCopy().emptyHistory;section.append(note)}
 else{
  const list=document.createElement("ol");list.className="capsule-reward-history";
  for(const entry of history.slice(-5).reverse()){
   const line=document.createElement("li");
   const reward=rewards.find(item=>item.id===entry.rewardId);
   const name=document.createElement("span");name.textContent=(reward?.name||entry.rewardId)+" · "+t(entry.rarity)+(entry.duplicate?" · "+collectionCopy().duplicate+" +"+entry.compensation+" CORE":"");
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
  const panel=document.createElement("section");panel.className="scrap-capsule-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-labelledby","scrap-capsule-title");
  const close=document.createElement("button");close.id="scrap-capsule-close";close.className="scrap-capsule-close";close.type="button";close.setAttribute("aria-label",t("close"));close.textContent="×";close.addEventListener("click",()=>{layer.hidden=true;window.dispatchEvent(new Event("cosmic-scrap:capsule-close"))});
  const protocol=document.createElement("p");protocol.className="eyebrow";protocol.id="scrap-capsule-protocol";
  const title=document.createElement("h2");title.id="scrap-capsule-title";
  const art=document.createElement("div");art.className="scrap-capsule-art";art.id="scrap-capsule-art";art.setAttribute("aria-hidden","true");art.innerHTML='<span class="capsule-orbit"></span><img class="capsule-taviro-logo" src="assets/taviro-logo.svg" alt=""><span class="capsule-scan"></span>';
  const hint=document.createElement("p");hint.id="scrap-capsule-hint";
  const reveal=document.createElement("button");reveal.id="scrap-capsule-reveal";reveal.className="primary-button";reveal.type="button";reveal.addEventListener("click",openReveal);
  const reward=document.createElement("div");reward.id="scrap-capsule-reward";reward.className="scrap-capsule-reward";reward.hidden=true;
  const foot=document.createElement("small");foot.className="capsule-footnote";foot.id="scrap-capsule-footnote";
  panel.append(close,protocol,title,art,hint,reveal,reward,foot);layer.append(panel);document.body.append(layer);
 }
 refreshButton();localizeModal();
}
function localizeModal(){
 const layer=$("scrap-capsule-layer");if(!layer)return;
 $("scrap-capsule-protocol").textContent=t("protocol");$("scrap-capsule-title").textContent=t("capsule");
 $("scrap-capsule-hint").textContent=t("ready");$("scrap-capsule-reveal").textContent=t("reveal");$("scrap-capsule-close").setAttribute("aria-label",t("close"));
 $("scrap-capsule-footnote").textContent=t("progress");refreshButton();renderEquipment();
}
function openCapsule(){
 const layer=$("scrap-capsule-layer");if(!layer)return;
 layer.hidden=false;window.dispatchEvent(new Event("cosmic-scrap:capsule-open"));localizeModal();capsulePhase=0;
 const button=$("scrap-capsule-reveal");button.hidden=false;button.disabled=false;button.textContent=t("stage1");
 const art=$("scrap-capsule-art");art.classList.remove("charging","opening","revealed");art.removeAttribute("data-rarity");
 const box=$("scrap-capsule-reward");box.hidden=true;box.removeAttribute("data-rarity");
 if(!count()){button.disabled=true;$("scrap-capsule-hint").textContent=t("empty")}else $("scrap-capsule-hint").textContent=t("ready");
}

function openReveal(){
 if(!count())return;
 const art=$("scrap-capsule-art"),button=$("scrap-capsule-reveal"),box=$("scrap-capsule-reward");
 if(capsulePhase===0){
  capsulePhase=1;art.classList.remove("opening","revealed");art.classList.add("charging");window.dispatchEvent(new Event("cosmic-scrap:capsule-charge"));
  button.textContent=t("stage2");$("scrap-capsule-hint").textContent=t("charging");return;
 }
 if(capsulePhase===1){
  capsulePhase=2;art.classList.remove("charging");art.classList.add("opening");window.dispatchEvent(new Event("cosmic-scrap:capsule-release"));
  button.textContent=t("stage3");$("scrap-capsule-hint").textContent=t("opening");return;
 }
 if(capsulePhase!==2)return;
 button.disabled=true;setCount(count()-1);
 const inventory=owned(),available=rewards.filter(item=>!inventory.some(entry=>entry.id===item.id));
 const rarityOrder={silver:0,gold:1,platinum:2,elite:3};
 const reward=available.slice().sort((a,b)=>(rarityOrder[a.rarity]??99)-(rarityOrder[b.rarity]??99))[0]||rewards[0];
 const duplicate=inventory.some(item=>item.id===reward.id),compensation=duplicate?CAPSULE_DUPLICATE_COMPENSATION:0;
 const history=appendCapsuleHistory(read(HISTORY,[]),{rewardId:reward.id,rarity:reward.rarity,duplicate,compensation,earnedAt:new Date().toISOString()},20);write(HISTORY,history);
 if(duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-duplicate",{detail:{amount:compensation}}));
 if(!duplicate){inventory.push(reward);write(OWNED,normalizeOwnedCosmetics(inventory))}
 if(reward.type==="flag"&&!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward",{detail:{flag:reward.value,name:reward.name}}));
 if(!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetic-reward",{detail:reward}));
 art.classList.remove("charging","opening","elite-reveal");art.classList.add("revealed");if(reward.rarity==="elite")art.classList.add("elite-reveal");art.dataset.rarity=reward.rarity;window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reveal",{detail:{rarity:reward.rarity}}));
 box.replaceChildren();box.dataset.rarity=reward.rarity;
 const tier=document.createElement("small");tier.className="capsule-rarity";tier.style.color=rarityColor[reward.rarity];tier.textContent=t(reward.rarity);
 const title=document.createElement("strong");title.textContent=t(reward.id);
 const visual=document.createElement("span");visual.className="capsule-reward-visual";
 if(reward.type==="flag")visual.append(flagImage(reward.value));else visual.textContent=reward.type==="trail"?"〰":"◇";
 const detail=document.createElement("p");detail.textContent=duplicate?t("duplicate")+" · +"+CAPSULE_DUPLICATE_COMPENSATION+" SCRAP CORE":t("owned");
 box.append(tier,title,visual,detail);box.hidden=false;button.hidden=true;
 if(reward.rarity==="elite"){const signature=document.createElement("small");signature.className="capsule-elite-signature";signature.textContent="✦ TAVIRO · ONE CORE. INFINITE VOID. ✦";box.append(signature);window.dispatchEvent(new CustomEvent("cosmic-scrap:elite-reveal",{detail:{rewardId:reward.id}}))}
 $("scrap-capsule-hint").textContent=t("owned");renderEquipment();
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
window.addEventListener("cosmic-scrap:cosmetic-reward",renderEquipment);
window.addEventListener("cosmic-scrap:capsule-reward",renderEquipment);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
