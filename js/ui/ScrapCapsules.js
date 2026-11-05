import {equipOwnedCosmetic,normalizeOwnedCosmetics,COSMETIC_STORAGE_KEYS} from "../systems/Cosmetics.js";
const KEY="cosmic-scrap-capsules";
const RUNS="cosmic-scrap-capsule-runs";
const OWNED="cosmic-scrap-capsule-cosmetics";
const tr=()=>localStorage.getItem("cosmic-scrap-language")==="tr";
const $=id=>document.getElementById(id);
const rewards=[
 {id:"anatolian-fire",type:"flag",value:"🇹🇷🔥",name:"Anadolu Ateşi",rarity:"mythic",label:"Özel Türk Bayrağı"},
 {id:"azerbaijan",type:"flag",value:"🇦🇿",name:"Azerbaycan",rarity:"rare",label:"Ülke bayrağı"},
 {id:"red-white-trail",type:"trail",value:"red-white",name:"Anadolu İzi",rarity:"epic",label:"Kırmızı-beyaz itki izi"},
 {id:"rainbow-trail",type:"trail",value:"rainbow",name:"Aurora Trail",rarity:"rare",label:"Gökkuşağı itki izi"},
 {id:"star-projectile",type:"projectile",value:"star",name:"Star Lance",rarity:"rare",label:"Yıldız mermi görünümü"},
 {id:"plasma-projectile",type:"projectile",value:"plasma",name:"Plasma Core",rarity:"epic",label:"Plazma mermi görünümü"},
 {id:"neon-outline",type:"ship",value:"neon-outline",name:"Neon Frame",rarity:"common",label:"Neon gemi çerçevesi"}
];
const rarityColor={common:"#62d6a0",rare:"#9b83ff",epic:"#d38aff",mythic:"#ffd166"};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"")}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function count(){return Math.max(0,Number(localStorage.getItem(KEY))||0)}
function setCount(value){localStorage.setItem(KEY,String(Math.max(0,value)));refreshButton()}
function owned(){return normalizeOwnedCosmetics(read(OWNED,[]))}
function refreshButton(){const label=(tr()?"HURDA KAPSÜLÜ":"SCRAP CAPSULE")+" · "+count();for(const id of ["scrap-capsule-open","scrap-capsule-menu-open"]){const b=$(id);if(b){const strong=b.querySelector("strong");if(strong)strong.textContent=label;else b.textContent=label}}}
function mount(){
 const host=$("skin-shop-content");if(!host)return;
 $("scrap-capsule-menu-open")?.addEventListener("click",openCapsule);
 const button=document.createElement("button");button.id="scrap-capsule-open";button.className="hub-page-action";button.type="button";button.style.marginTop="12px";
 button.addEventListener("click",openCapsule);host.append(button);
 const equipment=document.createElement("section");equipment.id="scrap-capsule-equipment";equipment.className="capsule-equipment";equipment.style.cssText="display:grid;gap:8px;margin-top:16px;text-align:left";
 host.append(equipment);
 function renderEquipment(){
  equipment.replaceChildren();const heading=document.createElement("strong");heading.textContent=tr()?"KAZANILAN GÖRÜNÜMLER · KUŞAN":"EARNED COSMETICS · EQUIP";equipment.append(heading);
  const keys=COSMETIC_STORAGE_KEYS;
  const labels={trail:tr()?"İtki izi":"Engine trail",projectile:tr()?"Mermi":"Projectile",ship:tr()?"Gemi":"Ship"};
  const ownedCosmetics=owned().filter(item=>keys[item.type]);
  if(!ownedCosmetics.length){const note=document.createElement("p");note.textContent=tr()?"Kapsüllerden kazandığın iz, mermi ve gemi görünümleri burada görünecek.":"Trail, projectile and ship cosmetics from capsules will appear here.";equipment.append(note);return}
  for(const item of ownedCosmetics){const button=document.createElement("button");button.type="button";button.className="text-button";button.style.cssText="display:block;width:100%;text-align:left;border:1px solid #31536d;border-radius:8px;background:#0b1722;padding:11px";button.textContent=labels[item.type]+" · "+item.name+(localStorage.getItem(keys[item.type])===item.value?" · "+(tr()?"TAKILI":"EQUIPPED"):"");button.addEventListener("click",()=>{if(!equipOwnedCosmetic(item,localStorage))return;window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));renderEquipment()});equipment.append(button)}
 }
 renderEquipment();
 const layer=document.createElement("div");layer.id="scrap-capsule-layer";layer.className="scrap-capsule-layer";layer.hidden=true;
 layer.innerHTML='<section class="scrap-capsule-panel" role="dialog" aria-modal="true" aria-labelledby="scrap-capsule-title"><button class="scrap-capsule-close" id="scrap-capsule-close" type="button" aria-label="Close">×</button><p class="eyebrow">RIFT CORE · LOOT PROTOCOL</p><h2 id="scrap-capsule-title">SCRAP CAPSULE</h2><div class="scrap-capsule-art" id="scrap-capsule-art"><span>✦</span></div><p id="scrap-capsule-hint">A capsule is ready to open.</p><button id="scrap-capsule-reveal" class="primary-button" type="button">OPEN CAPSULE</button><div id="scrap-capsule-reward" class="scrap-capsule-reward" hidden></div></section>';
 document.body.append(layer);
 $("scrap-capsule-close").addEventListener("click",()=>layer.hidden=true);
 $("scrap-capsule-reveal").addEventListener("click",reveal);
 refreshButton();
}
function openCapsule(){if(!count()){const hint=$("scrap-capsule-hint");if(hint)hint.textContent=tr()?"Henüz kapsülün yok. Her 5 tamamlanan koşuda veya bölge zaferinde bir kapsül kazanırsın.":"No capsule yet. Earn one every 5 completed runs or after a region victory.";return}
 $("scrap-capsule-layer").hidden=false;$("scrap-capsule-art").classList.remove("opening");$("scrap-capsule-reward").hidden=true;$("scrap-capsule-reveal").hidden=false;$("scrap-capsule-hint").textContent=tr()?"Ödülünü almak için kapsülü aç.":"Open the capsule to reveal your reward."}
function reveal(){
 if(!count())return;
 setCount(count()-1);
 const art=$("scrap-capsule-art"),button=$("scrap-capsule-reveal"),rewardBox=$("scrap-capsule-reward");
 button.disabled=true;art.classList.remove("opening");void art.offsetWidth;art.classList.add("opening");
 const currentOwned=owned();const available=rewards.filter(item=>!currentOwned.some(x=>x.id===item.id));
 const reward=available[Math.floor(Math.random()*available.length)]||rewards[0];
 const items=owned(),duplicate=items.some(item=>item.id===reward.id);
 if(!duplicate){items.push(reward);write(OWNED,normalizeOwnedCosmetics(items))}
 if(reward.type==="flag"&&!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward",{detail:{flag:reward.value,name:reward.name}}));
 if(!duplicate&&["trail","projectile","ship"].includes(reward.type))window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetic-reward",{detail:reward}));
 setTimeout(()=>{
  art.classList.remove("opening");
  rewardBox.hidden=false;
  const label=tr()?({common:"YAYGIN",rare:"NADİR",epic:"EPİK",mythic:"EFSANEVİ"}[reward.rarity]):reward.rarity.toUpperCase();
  rewardBox.innerHTML='<small style="color:'+rarityColor[reward.rarity]+'">'+label+'</small><strong>'+reward.name+'</strong><span>'+reward.value+'</span><p>'+(duplicate?(tr()?"Tekrar ödül · koleksiyonda zaten var":"Duplicate · already in collection"):(tr()?"Koleksiyona eklendi":"Added to collection"))+'</p>';
  button.hidden=true;button.disabled=false;$("scrap-capsule-hint").textContent=tr()?"Ödül açıldı. Kapsül koleksiyonunu kapatabilirsin.":"Reward revealed. You can close the capsule.";
 },850);
}
window.addEventListener("cosmic-scrap:run-ended",()=>{
 const runs=Math.max(0,Number(localStorage.getItem(RUNS))||0)+1;localStorage.setItem(RUNS,String(runs));
 if(runs%3===0){setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"three-runs"}}))}
});
window.addEventListener("cosmic-scrap:region-captured",()=>{
 setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"boss-victory"}}));
});
window.addEventListener("cosmic-scrap:language-changed",refreshButton);
window.addEventListener("cosmic-scrap:capsule-earned",refreshButton);
window.addEventListener("cosmic-scrap:capsule-reward",()=>setTimeout(()=>{const host=$("skin-shop-content"),section=$("scrap-capsule-equipment");if(host&&section){const keys=["trail","projectile","ship"];section.replaceChildren();const heading=document.createElement("strong");heading.textContent=tr()?"KAZANILAN GÖRÜNÜMLER · KUŞAN":"EARNED COSMETICS · EQUIP";section.append(heading);for(const item of owned().filter(x=>keys.includes(x.type))){const button=document.createElement("button");button.type="button";button.className="text-button";button.style.cssText="display:block;width:100%;text-align:left;border:1px solid #31536d;border-radius:8px;background:#0b1722;padding:11px";button.textContent=item.name+" · "+item.type;button.addEventListener("click",()=>{localStorage.setItem("cosmic-scrap-equipped-"+item.type,item.value);window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));button.textContent=item.name+" · "+item.type+" · "+(tr()?"TAKILI":"EQUIPPED")});section.append(button)}}},0));
window.addEventListener("cosmic-scrap:cosmetic-reward",()=>setTimeout(()=>{const host=$("skin-shop-content"),section=$("scrap-capsule-equipment");if(host&&section){section.replaceChildren();const heading=document.createElement("strong");heading.textContent=tr()?"KAZANILAN GÖRÜNÜMLER · KUŞAN":"EARNED COSMETICS · EQUIP";section.append(heading);for(const item of owned().filter(x=>["trail","projectile","ship"].includes(x.type))){const button=document.createElement("button");button.type="button";button.className="text-button";button.style.cssText="display:block;width:100%;text-align:left;border:1px solid #31536d;border-radius:8px;background:#0b1722;padding:11px";button.textContent=item.name+" · "+item.type;button.addEventListener("click",()=>{localStorage.setItem("cosmic-scrap-equipped-"+item.type,item.value);window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));button.textContent=item.name+" · "+item.type+" · "+(tr()?"TAKILI":"EQUIPPED")});section.append(button)}}},0));
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
