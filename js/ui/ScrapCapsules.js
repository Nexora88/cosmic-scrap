import {equipOwnedCosmetic,normalizeOwnedCosmetics,COSMETIC_STORAGE_KEYS} from "../systems/Cosmetics.js";

const KEY="cosmic-scrap-capsules";
const RUNS="cosmic-scrap-capsule-runs";
const OWNED="cosmic-scrap-capsule-cosmetics";
const $=id=>document.getElementById(id);
const locale=()=>{try{return localStorage.getItem("cosmic-scrap-language")||"en"}catch{return"en"}};
const copy={
 en:{open:"OPEN SIGNAL CAPSULE",capsule:"SIGNAL CAPSULE",protocol:"TAVIRO · SIGNAL ARCHIVE",ready:"A signal capsule is ready. Reveal your cosmetic.",empty:"No capsule yet. Complete five runs or capture a region to earn one.",earned:"CAPSULES",collection:"YOUR COLLECTION",equip:"EQUIP",equipped:"EQUIPPED",owned:"Added to your collection",duplicate:"Already collected · duplicate signal",reveal:"REVEAL REWARD",close:"CLOSE",common:"COMMON",rare:"RARE",epic:"EPIC",mythic:"MYTHIC",silver:"SILVER",gold:"GOLD",platinum:"PLATINUM",elite:"ELITE",flag:"Pilot emblem",trail:"Engine trail",projectile:"Projectile style",ship:"Ship frame",noItems:"Your earned cosmetics will appear here.",progress:"Cosmetic only · no gameplay advantage"},
 tr:{open:"SİNYAL KAPSÜLÜ AÇ",capsule:"SİNYAL KAPSÜLÜ",protocol:"TAVIRO · SİNYAL ARŞİVİ",ready:"Bir sinyal kapsülün hazır. Kozmetik ödülünü keşfet.",empty:"Henüz kapsülün yok. Beş oyun tamamla veya bir bölge fethet.",earned:"KAPSÜL",collection:"KOLEKSİYONUN",equip:"KUŞAN",equipped:"TAKILI",owned:"Koleksiyonuna eklendi",duplicate:"Zaten koleksiyonunda · tekrar sinyal",reveal:"ÖDÜLÜ GÖSTER",close:"KAPAT",common:"YAYGIN",rare:"NADİR",epic:"EPİK",mythic:"EFSANEVİ",silver:"GÜMÜŞ",gold:"ALTIN",platinum:"PLATİN",elite:"ELİT",flag:"Pilot amblemi",trail:"İtki izi",projectile:"Mermi görünümü",ship:"Gemi çerçevesi",noItems:"Kazandığın kozmetikler burada görünecek.",progress:"Yalnızca kozmetik · oynanış avantajı sağlamaz"},
 "pt-BR":{open:"ABRIR CÁPSULA DE SINAL",capsule:"CÁPSULA DE SINAL",protocol:"TAVIRO · ARQUIVO DE SINAIS",ready:"Uma cápsula está pronta. Revele seu item cosmético.",empty:"Ainda sem cápsulas. Complete cinco partidas ou conquiste uma região.",earned:"CÁPSULAS",collection:"SUA COLEÇÃO",equip:"EQUIPAR",equipped:"EQUIPADO",owned:"Adicionado à coleção",duplicate:"Já está na coleção · sinal repetido",reveal:"REVELAR PRÊMIO",close:"FECHAR",common:"COMUM",rare:"RARO",epic:"ÉPICO",mythic:"MÍTICO",silver:"PRATA",gold:"OURO",platinum:"PLATINA",elite:"ELITE",flag:"Emblema do piloto",trail:"Rastro do motor",projectile:"Visual do projétil",ship:"Estrutura da nave",noItems:"Seus cosméticos aparecerão aqui.",progress:"Apenas cosmético · sem vantagem de jogo"},
 es:{open:"ABRIR CÁPSULA DE SEÑAL",capsule:"CÁPSULA DE SEÑAL",protocol:"TAVIRO · ARCHIVO DE SEÑALES",ready:"Hay una cápsula lista. Descubre tu objeto cosmético.",empty:"Aún no tienes cápsulas. Completa cinco partidas o conquista una región.",earned:"CÁPSULAS",collection:"TU COLECCIÓN",equip:"EQUIPAR",equipped:"EQUIPADO",owned:"Añadido a tu colección",duplicate:"Ya está en tu colección · señal repetida",reveal:"REVELAR PREMIO",close:"CERRAR",common:"COMÚN",rare:"RARO",epic:"ÉPICO",mythic:"MÍTICO",silver:"PLATA",gold:"ORO",platinum:"PLATINO",elite:"ÉLITE",flag:"Emblema del piloto",trail:"Estela del motor",projectile:"Aspecto del proyectil",ship:"Marco de nave",noItems:"Tus cosméticos aparecerán aquí.",progress:"Solo cosmético · sin ventajas de juego"},
 ru:{open:"ОТКРЫТЬ СИГНАЛЬНУЮ КАПСУЛУ",capsule:"СИГНАЛЬНАЯ КАПСУЛА",protocol:"TAVIRO · АРХИВ СИГНАЛОВ",ready:"Капсула готова. Откройте косметическую награду.",empty:"Капсул пока нет. Завершите пять забегов или захватите регион.",earned:"КАПСУЛЫ",collection:"ВАША КОЛЛЕКЦИЯ",equip:"НАДЕТЬ",equipped:"НАДЕТО",owned:"Добавлено в коллекцию",duplicate:"Уже в коллекции · повторный сигнал",reveal:"ПОКАЗАТЬ НАГРАДУ",close:"ЗАКРЫТЬ",common:"ОБЫЧНЫЙ",rare:"РЕДКИЙ",epic:"ЭПИЧЕСКИЙ",mythic:"МИФИЧЕСКИЙ",silver:"СЕРЕБРО",gold:"ЗОЛОТО",platinum:"ПЛАТИНА",elite:"ЭЛИТА",flag:"Эмблема пилота",trail:"След двигателя",projectile:"Вид снаряда",ship:"Рамка корабля",noItems:"Здесь появятся ваши косметические предметы.",progress:"Только внешний вид · без игровых преимуществ"},
 id:{open:"BUKA KAPSUL SINYAL",capsule:"KAPSUL SINYAL",protocol:"TAVIRO · ARSIP SINYAL",ready:"Kapsul siap dibuka. Temukan kosmetikmu.",empty:"Belum ada kapsul. Selesaikan lima permainan atau kuasai satu wilayah.",earned:"KAPSUL",collection:"KOLEKSIMU",equip:"PAKAI",equipped:"DIPAKAI",owned:"Ditambahkan ke koleksi",duplicate:"Sudah dikoleksi · sinyal duplikat",reveal:"BUKA HADIAH",close:"TUTUP",common:"UMUM",rare:"LANGKA",epic:"EPIK",mythic:"MITIS",silver:"PERAK",gold:"EMAS",platinum:"PLATINUM",elite:"ELIT",flag:"Lambang pilot",trail:"Jejak mesin",projectile:"Tampilan proyektil",ship:"Bingkai kapal",noItems:"Kosmetik yang kamu dapatkan akan muncul di sini.",progress:"Hanya kosmetik · tanpa keunggulan permainan"},
 de:{open:"SIGNALKAPSEL ÖFFNEN",capsule:"SIGNALKAPSEL",protocol:"TAVIRO · SIGNALARCHIV",ready:"Eine Kapsel ist bereit. Entdecke deinen kosmetischen Gegenstand.",empty:"Noch keine Kapsel. Schließe fünf Läufe ab oder erobere eine Region.",earned:"KAPSELN",collection:"DEINE SAMMLUNG",equip:"AUSRÜSTEN",equipped:"AUSGERÜSTET",owned:"Zur Sammlung hinzugefügt",duplicate:"Bereits gesammelt · doppeltes Signal",reveal:"BELOHNUNG ZEIGEN",close:"SCHLIESSEN",common:"HÄUFIG",rare:"SELTEN",epic:"EPISCH",mythic:"MYTHISCH",silver:"SILBER",gold:"GOLD",platinum:"PLATIN",elite:"ELITE",flag:"Pilotenemblem",trail:"Triebwerksspur",projectile:"Projektilstil",ship:"Schiffsrumpf",noItems:"Deine Kosmetikobjekte erscheinen hier.",progress:"Nur kosmetisch · kein Spielvorteil"},
 fr:{open:"OUVRIR LA CAPSULE SIGNAL",capsule:"CAPSULE SIGNAL",protocol:"TAVIRO · ARCHIVE DES SIGNAUX",ready:"Une capsule est prête. Découvrez votre objet cosmétique.",empty:"Aucune capsule. Terminez cinq parties ou capturez une région.",earned:"CAPSULES",collection:"VOTRE COLLECTION",equip:"ÉQUIPER",equipped:"ÉQUIPÉ",owned:"Ajouté à votre collection",duplicate:"Déjà collectionné · signal en double",reveal:"RÉVÉLER LA RÉCOMPENSE",close:"FERMER",common:"COURANT",rare:"RARE",epic:"ÉPIQUE",mythic:"MYTHIQUE",silver:"ARGENT",gold:"OR",platinum:"PLATINE",elite:"ÉLITE",flag:"Emblème du pilote",trail:"Trace du moteur",projectile:"Style de projectile",ship:"Cadre du vaisseau",noItems:"Vos objets cosmétiques apparaîtront ici.",progress:"Cosmétique uniquement · aucun avantage de jeu"},
 ja:{open:"シグナルカプセルを開く",capsule:"シグナルカプセル",protocol:"TAVIRO · シグナルアーカイブ",ready:"カプセルの準備ができました。コスメ報酬を確認しましょう。",empty:"カプセルはまだありません。5回のプレイを完了するか、宙域を制圧しましょう。",earned:"カプセル",collection:"コレクション",equip:"装備",equipped:"装備中",owned:"コレクションに追加しました",duplicate:"入手済み · 重複シグナル",reveal:"報酬を表示",close:"閉じる",common:"コモン",rare:"レア",epic:"エピック",mythic:"ミシック",silver:"シルバー",gold:"ゴールド",platinum:"プラチナ",elite:"エリート",flag:"パイロットエンブレム",trail:"エンジントレイル",projectile:"弾のスタイル",ship:"機体フレーム",noItems:"獲得したコスメはここに表示されます。",progress:"見た目のみ · ゲーム上の優位性なし"}
};
const t=key=>(copy[locale()]||copy.en)[key]||copy.en[key]||key;
const rewards=[
 {id:"anatolian-fire",type:"flag",value:"🇹🇷🔥",name:"Anadolu Ateşi",rarity:"elite",label:"Special pilot emblem"},
 {id:"azerbaijan",type:"flag",value:"🇦🇿",name:"Azerbaijan",rarity:"gold",label:"Country emblem"},
 {id:"red-white-trail",type:"trail",value:"red-white",name:"Anatolian Wake",rarity:"platinum",label:"Red-white engine trail"},
 {id:"rainbow-trail",type:"trail",value:"rainbow",name:"Aurora Wake",rarity:"gold",label:"Aurora engine trail"},
 {id:"star-projectile",type:"projectile",value:"star",name:"Star Lance",rarity:"silver",label:"Star projectile"},
 {id:"plasma-projectile",type:"projectile",value:"plasma",name:"Plasma Core",rarity:"platinum",label:"Plasma projectile"},
 {id:"neon-outline",type:"ship",value:"neon-outline",name:"Neon Frame",rarity:"silver",label:"Neon ship frame"},
 {id:"comet-frame",type:"ship",value:"comet-frame",name:"Comet Vanguard",rarity:"gold",label:"Comet ship frame"},
 {id:"eclipse-frame",type:"ship",value:"eclipse-frame",name:"Eclipse Sovereign",rarity:"elite",label:"Eclipse ship frame"},
 {id:"usa-emblem",type:"flag",value:"🇺🇸",name:"United States",rarity:"silver",label:"Pilot country emblem"},
 {id:"japan-emblem",type:"flag",value:"🇯🇵",name:"Japan",rarity:"gold",label:"Pilot country emblem"}
];
const rarityColor={common:"#62d6a0",rare:"#42cfff",epic:"#bd82ff",mythic:"#ffd166",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",elite:"#ff7bcb"};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"")}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function count(){return Math.max(0,Number(localStorage.getItem(KEY))||0)}
function setCount(value){try{localStorage.setItem(KEY,String(Math.max(0,value)))}catch{}refreshButton()}
function owned(){return normalizeOwnedCosmetics(read(OWNED,[]))}
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
 const items=owned();
 if(!items.length){const note=document.createElement("p");note.textContent=t("noItems");section.append(note);return}
 for(const item of items){
  const row=document.createElement("div");row.className="capsule-collection-item";
  const name=document.createElement("span");name.textContent=item.name+" · "+t(item.type);row.append(name);
  {
   const button=document.createElement("button");button.type="button";button.className="mini-button";
   const key=COSMETIC_STORAGE_KEYS[item.type];button.textContent=localStorage.getItem(key)===item.value?t("equipped"):t("equip");
   button.addEventListener("click",()=>{if(!equipOwnedCosmetic(item,localStorage))return;window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetics-changed",{detail:{type:item.type,value:item.value}}));renderEquipment()});row.append(button);
  }
  section.append(row);
 }
}
function mount(){
 const host=$("skin-shop-content");if(!host)return;
 if(!$("scrap-capsule-open")){
  const button=document.createElement("button");button.id="scrap-capsule-open";button.className="hub-page-action capsule-shop-button";button.type="button";button.addEventListener("click",openCapsule);host.append(button);
  const countLabel=document.createElement("small");countLabel.id="scrap-capsule-count";countLabel.className="capsule-count";host.append(countLabel);
 }
 if(!$("scrap-capsule-equipment")){const equipment=document.createElement("section");equipment.id="scrap-capsule-equipment";equipment.className="capsule-equipment";host.append(equipment)}
 renderEquipment();
 if(!$("scrap-capsule-layer")){
  const layer=document.createElement("div");layer.id="scrap-capsule-layer";layer.className="scrap-capsule-layer";layer.hidden=true;
  const panel=document.createElement("section");panel.className="scrap-capsule-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-labelledby","scrap-capsule-title");
  const close=document.createElement("button");close.id="scrap-capsule-close";close.className="scrap-capsule-close";close.type="button";close.setAttribute("aria-label",t("close"));close.textContent="×";close.addEventListener("click",()=>{layer.hidden=true});
  const protocol=document.createElement("p");protocol.className="eyebrow";protocol.id="scrap-capsule-protocol";
  const title=document.createElement("h2");title.id="scrap-capsule-title";
  const art=document.createElement("div");art.className="scrap-capsule-art";art.id="scrap-capsule-art";art.setAttribute("aria-hidden","true");art.innerHTML='<span class="capsule-orbit"></span><span class="capsule-core">✦</span><span class="capsule-scan"></span>';
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
 layer.hidden=false;localizeModal();
 const button=$("scrap-capsule-reveal");button.hidden=false;button.disabled=false;
 $("scrap-capsule-art").classList.remove("opening","revealed");$("scrap-capsule-reward").hidden=true;
 if(!count()){button.disabled=true;$("scrap-capsule-hint").textContent=t("empty")}else $("scrap-capsule-hint").textContent=t("ready");
}

function playRevealSound(rarity){
 if(localStorage.getItem("cosmic-scrap-audio")==="off")return;
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
 try{
  const ctx=new Audio(),now=ctx.currentTime,notes={silver:[520,780],gold:[520,780,1040],platinum:[440,660,880,1320],elite:[392,587,880,1175,1568]}[rarity]||[520,780];
  notes.forEach((hz,index)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=now+index*.105;osc.type=rarity==="elite"?"triangle":"sine";osc.frequency.setValueAtTime(hz,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.045,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+.24);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.25)});
  setTimeout(()=>ctx.close().catch(()=>{}),1100);
 }catch{}
}

function openReveal(){
 if(!count())return;
 setCount(count()-1);
 const art=$("scrap-capsule-art"),button=$("scrap-capsule-reveal"),box=$("scrap-capsule-reward");
 button.disabled=true;art.classList.remove("opening","revealed");void art.offsetWidth;art.classList.add("opening");
 const inventory=owned(),available=rewards.filter(item=>!inventory.some(entry=>entry.id===item.id));
 const pool=available.length?available:rewards;
 const reward=pool[Math.floor(Math.random()*pool.length)];
 const duplicate=inventory.some(item=>item.id===reward.id);
 if(!duplicate){inventory.push(reward);write(OWNED,normalizeOwnedCosmetics(inventory))}
 if(reward.type==="flag"&&!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward",{detail:{flag:reward.value,name:reward.name}}));
 if(!duplicate&&["trail","projectile","ship"].includes(reward.type))window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetic-reward",{detail:reward}));
 const finish=()=>{
  art.classList.remove("opening");art.classList.add("revealed");box.replaceChildren();
  const tier=document.createElement("small");tier.className="capsule-rarity";tier.style.color=rarityColor[reward.rarity];tier.textContent=t(reward.rarity);
  const title=document.createElement("strong");title.textContent=reward.name;
  const visual=document.createElement("span");visual.className="capsule-reward-visual";
  if(reward.type==="flag")visual.append(flagImage(reward.value));else visual.textContent=reward.type==="trail"?"〰":reward.type==="projectile"?"✦":"◇";
  const detail=document.createElement("p");detail.textContent=duplicate?t("duplicate"):t("owned");
  box.append(tier,title,visual,detail);box.hidden=false;button.hidden=true;$("scrap-capsule-hint").textContent=t("owned");renderEquipment();
 };
 art.addEventListener("animationend",finish,{once:true});setTimeout(()=>{if(!art.classList.contains("revealed"))finish()},1100);
}
window.addEventListener("cosmic-scrap:run-ended",()=>{
 let runs=Math.max(0,Number(localStorage.getItem(RUNS))||0)+1;try{localStorage.setItem(RUNS,String(runs))}catch{}
 if(runs%5===0){setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"five-runs"}}))}
});
window.addEventListener("cosmic-scrap:region-captured",()=>{
 setCount(count()+1);window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-earned",{detail:{reason:"region-victory"}}));
});
window.addEventListener("cosmic-scrap:language-changed",localizeModal);
window.addEventListener("cosmic-scrap:cosmetic-reward",renderEquipment);
window.addEventListener("cosmic-scrap:capsule-reward",renderEquipment);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
