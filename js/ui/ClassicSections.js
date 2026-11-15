import { getMissionView } from "../systems/DailyMissions.js";
const $=id=>document.getElementById(id);
let currentMissionProfile={};
function renderMissionPanel(profile=currentMissionProfile){
 currentMissionProfile=profile||{};
 const host=$("career-missions");
 if(!host)return;
 const language=localStorage.getItem("cosmic-scrap-language")||"en";
 const view=getMissionView(currentMissionProfile,new Date(),language);
 host.replaceChildren();
 const renderGroup=(period,tasks,label)=>{
  const group=document.createElement("section");group.className="mission-group";
  const heading=document.createElement("h3");heading.textContent=label;group.append(heading);
  const note=document.createElement("small");note.className="mission-reset";note.textContent=view.copy.reset;group.append(note);
  for(const task of tasks){
   const card=document.createElement("article");card.className="mission-card";
   const head=document.createElement("div");head.className="mission-card-head";
   const name=document.createElement("strong");name.textContent=task.name;head.append(name);
   const description=document.createElement("p");description.textContent=task.description;
   const line=document.createElement("div");line.className="mission-progress-line";
   const labelNode=document.createElement("span");labelNode.textContent=view.copy.progress;
   const value=document.createElement("span");value.textContent=task.progress.toLocaleString()+" / "+task.target.toLocaleString();
   line.append(labelNode,value);
   const track=document.createElement("div");track.className="mission-progress-track";track.setAttribute("role","progressbar");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax",String(task.target));track.setAttribute("aria-valuenow",String(task.progress));
   const fill=document.createElement("i");fill.style.width=(100*task.progress/task.target)+"%";track.append(fill);
   const foot=document.createElement("div");foot.className="mission-card-foot";
   const rewardLabel=document.createElement("small");rewardLabel.className="mission-reward";rewardLabel.textContent=view.copy.reward+" · "+task.reward+" "+view.copy.core;
   const button=document.createElement("button");button.type="button";button.className="mission-claim";button.textContent=task.claimed?view.copy.claimed:view.copy.claim;button.disabled=task.claimed||!task.complete;button.title=button.disabled&&!task.claimed?view.copy.locked:"";
   button.addEventListener("click",()=>window.dispatchEvent(new CustomEvent("taviro:mission-claim",{detail:{period,id:task.id}})));
   foot.append(rewardLabel,button);card.append(head,description,line,track,foot);group.append(card);
  }
  host.append(group);
 };
 renderGroup("daily",view.daily,view.copy.daily);
 renderGroup("weekly",view.weekly,view.copy.weekly);
}
function mount(){
 const panel=$("panel");
 if(!panel||$("classic-menu-sections"))return;
 const anchor=panel.querySelector(".menu-footer");
 if(!anchor)return;
 const sections=document.createElement("div");
 sections.id="classic-menu-sections";
 sections.className="classic-menu-sections";
 sections.innerHTML=`
 <section class="classic-section" id="classic-game"><div class="classic-section-heading"><span>01 · HANGAR</span><h2>GAME</h2><p>Join the battle whenever you're ready.</p></div><div class="classic-section-card"><strong>SOLO SURVIVAL</strong><p>An endless survival run. Collect scrap, upgrade and explore the galaxy.</p><button type="button" data-open="start" class="primary-button">START GAME ↗</button></div></section>
 <section class="classic-section" id="classic-scores"><div class="classic-section-heading"><span>02 · RECORDS</span><h2>SCORES</h2><p>Your best performance on this device.</p></div><div class="classic-section-stats"><article><small>BEST SCORE</small><strong data-stat="best">0</strong></article><article><small>TOTAL RUNS</small><strong data-stat="runs">0</strong></article><article><small>ACHIEVEMENTS</small><strong data-stat="achievements">0/6</strong></article></div><button type="button" data-open="online-open" class="classic-secondary-button">OPEN LEADERBOARD</button></section>
 <section class="classic-section" id="classic-galaxy"><div class="classic-section-heading"><span>03 · EXPLORATION</span><h2>GALAXY</h2><p>Explore regions and complete boss battles.</p></div><div class="classic-section-stats"><article><small>REGION CAPTURED</small><strong data-stat="regions">0/7</strong></article><article><small>RAID WINS</small><strong data-stat="raids">0</strong></article><article><small>SECTOR</small><strong data-stat="sector">DEBRIS BELT</strong></article></div><button type="button" data-open="start" class="classic-secondary-button">ENTER GALAXY</button></section>
 <section class="classic-section" id="classic-ranking"><div class="classic-section-heading"><span>04 · LEADERBOARD</span><h2>RANKING</h2><p>Compare your score with other pilots.</p></div><div class="classic-section-card"><strong>GLOBAL PILOT BOARD</strong><p>Shared leaderboard and regional rankings.</p><button type="button" data-open="online-open" class="classic-secondary-button">VIEW RANKING ↗</button></div></section>
 <section class="classic-section" id="classic-shop"><div class="classic-section-heading"><span>05 · COLLECTION</span><h2>SHOP</h2><p>Customize your look and expand your collection.</p></div><div class="classic-section-card"><strong>SKIN & FLAG COLLECTION</strong><p>Ship skins, country flags and capsule rewards.</p><button type="button" data-open="skin-shop-open" class="classic-secondary-button">OPEN COLLECTION ↗</button></div></section>
 <section class="classic-section" id="classic-career"><div class="classic-section-heading"><span>06 · PILOT RECORD</span><h2>CAREER</h2><p>Track your level and permanent progress.</p></div><div class="classic-section-stats"><article><small>CAREER LEVEL</small><strong data-stat="career">1</strong></article><article><small>TOTAL SCRAP</small><strong data-stat="scrap">0</strong></article><article><small>SCRAP CORE</small><strong data-stat="core">0</strong></article></div><div id="career-missions" class="career-missions"></div><button type="button" data-open="meta-open" class="classic-secondary-button">OPEN PERMANENT UPGRADES</button></section>
 <section class="classic-section" id="classic-settings"><div class="classic-section-heading"><span>07 · CONFIGURATION</span><h2>SETTINGS</h2><p>Sound, controls and accessibility preferences.</p></div><div class="classic-section-card"><strong>GAME PREFERENCES</strong><p>Volume, vibration, reduced flash and performance options.</p><button type="button" data-open="settings-open" class="classic-secondary-button">OPEN SETTINGS ↗</button></div></section>`;
 const style=document.createElement("style");
 style.textContent=`
 .classic-menu-sections{display:grid;gap:13px;margin:20px 0 12px;text-align:left}
 .classic-section{padding:15px;border:1px solid #263b50;border-radius:13px;background:linear-gradient(145deg,rgba(13,28,43,.96),rgba(6,12,21,.96));}
 .classic-section-heading>span{font-size:9px;letter-spacing:.2em;color:#64dfff;font-weight:900}
 .classic-section-heading h2{font-size:22px;margin:5px 0 4px;text-align:left}
 .classic-section-heading p,.classic-section-card p{font-size:11px;line-height:1.5;color:#9aabc0;margin:4px 0 12px}
 .classic-section-card{padding:12px;border:1px solid #28465e;border-radius:9px;background:#0a1724}
 .classic-section-card strong{font-size:12px;letter-spacing:.08em}
 .classic-section-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}
 .classic-section-stats article{min-width:0;padding:10px 7px;border:1px solid #233b50;border-radius:8px;background:#091522}
 .classic-section-stats small{display:block;font-size:8px;color:#8ea5ba;line-height:1.4}
 .classic-section-stats strong{display:block;margin-top:5px;font-size:16px;overflow-wrap:anywhere;color:#e9f7ff}
 .classic-secondary-button{width:100%;padding:11px;border:1px solid #3b7898;border-radius:8px;background:#102b40;color:#dff8ff;font-weight:800;font-size:10px;letter-spacing:.08em;cursor:pointer}
 .classic-section .primary-button{margin:8px 0 0}
 .career-missions{display:grid;gap:10px;margin:14px 0}
 .mission-group{display:grid;gap:8px}
 .mission-group h3{margin:2px 0;font-size:11px;letter-spacing:.14em;color:#7de7f4}
 .mission-reset{font-size:9px;color:#8098ad}
 .mission-card{min-width:0;padding:10px;border:1px solid #29445b;border-radius:9px;background:#071421}
 .mission-card-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
 .mission-card strong{font-size:11px;line-height:1.35;color:#e8f8ff}
 .mission-card p{margin:5px 0 8px;color:#9aabc0;font-size:10px;line-height:1.45}
 .mission-progress-line{display:flex;justify-content:space-between;gap:8px;font-size:9px;color:#b8ccdc}
 .mission-progress-track{height:5px;margin:6px 0 8px;border-radius:9px;background:#142a3a;overflow:hidden}
 .mission-progress-track i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#35dfff,#7de7f4)}
 .mission-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
 .mission-reward{font-size:9px;color:#ffd166;font-weight:800}
 .mission-claim{padding:7px 10px;border:1px solid #347b98;border-radius:6px;background:#103248;color:#e4faff;font-size:9px;font-weight:900;letter-spacing:.06em}
 .mission-claim:disabled{opacity:.45;cursor:default}
 `;
 document.head.append(style);
 panel.insertBefore(sections,anchor);
 const sync=()=>{
  const map={best:"local-pilot-best",runs:"local-pilot-runs",achievements:"local-pilot-achievements",regions:"regions-captured",raids:"raid-wins",sector:"sector-label",career:"career-level",scrap:"local-pilot-scrap",core:"local-pilot-core"};
  for(const [key,id] of Object.entries(map)){const node=sections.querySelector('[data-stat="'+key+'"]'),source=$(id);if(node&&source){const original=source.firstChild?.__taviroOriginal??source.textContent.trim();node.textContent=original}}
 };
 sync();
 const observer=new MutationObserver(sync);
 for(const id of ["local-pilot-best","local-pilot-runs","local-pilot-achievements","regions-captured","raid-wins","sector-label","career-level","local-pilot-scrap","local-pilot-core"]){const node=$(id);if(node)observer.observe(node,{childList:true,subtree:true,characterData:true})}
 sections.addEventListener("click",event=>{const button=event.target.closest("[data-open]");if(!button)return;$(button.dataset.open)?.click()});
 window.addEventListener("taviro:profile-updated",event=>renderMissionPanel(event.detail?.profile||{}));
 window.addEventListener("cosmic-scrap:language-changed",()=>renderMissionPanel(currentMissionProfile));
 renderMissionPanel(currentMissionProfile);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
