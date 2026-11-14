import {equipOwnedCosmetic,normalizeOwnedCosmetics,COSMETIC_STORAGE_KEYS} from "../systems/Cosmetics.js";

const KEY="cosmic-scrap-capsules";
const RUNS="cosmic-scrap-capsule-runs";
const OWNED="cosmic-scrap-capsule-cosmetics";
const $=id=>document.getElementById(id);
const locale=()=>{try{return localStorage.getItem("cosmic-scrap-language")||"en"}catch{return"en"}};
const copy={
 en:{
 anatolian-fire:"Anadolu Ateşi",azerbaijan:"Azerbaijan",red-white-trail:"Anatolian Wake",rainbow-trail:"Aurora Wake",neon-outline:"Neon Frame",comet-frame:"Comet Vanguard",eclipse-frame:"Eclipse Sovereign",usa-emblem:"United States",japan-emblem:"Japan",

 stage1:"FIRST TOUCH · CHARGE CORE",stage2:"SECOND TOUCH · RELEASE SEALS",stage3:"THIRD TOUCH · REVEAL REWARD",charging:"Core charged. Tap again to release the outer shell.",opening:"Outer shell released. Tap once more to reveal your reward.",reveal:"REVEAL REWARD",
odds:"GUARANTEED REWARD PATH · SILVER → GOLD → PLATINUM → ELITE",open:"OPEN SIGNAL CAPSULE",capsule:"SIGNAL CAPSULE",protocol:"TAVIRO · SIGNAL ARCHIVE",ready:"A signal capsule is ready. Reveal your cosmetic.",empty:"No capsule yet. Complete five runs or capture a region to earn one.",earned:"CAPSULES",collection:"YOUR COLLECTION",equip:"EQUIP",equipped:"EQUIPPED",owned:"Added to your collection",duplicate:"Already collected · duplicate signal",reveal:"REVEAL REWARD",close:"CLOSE",common:"COMMON",rare:"RARE",epic:"EPIC",mythic:"MYTHIC",silver:"SILVER",gold:"GOLD",platinum:"PLATINUM",elite:"ELITE",flag:"Pilot emblem",trail:"Engine trail",projectile:"Projectile style",ship:"Ship frame",noItems:"Your earned cosmetics will appear here.",progress:"Cosmetic only · no gameplay advantage"},
 tr:{
 anatolian-fire:"Anadolu Ateşi",azerbaijan:"Azerbaycan",red-white-trail:"Anadolu Esintisi",rainbow-trail:"Kutup Işığı İzi",neon-outline:"Neon Çerçeve",comet-frame:"Kuyruklu Yıldız Öncüsü",eclipse-frame:"Tutulma Hükümdarı",usa-emblem:"Amerika Birleşik Devletleri",japan-emblem:"Japonya",

 stage1:"İLK DOKUNUŞ · ÇEKİRDEĞİ ŞARJ ET",stage2:"İKİNCİ DOKUNUŞ · KİLİTLERİ AÇ",stage3:"ÜÇÜNCÜ DOKUNUŞ · ÖDÜLÜ GÖSTER",charging:"Çekirdek şarj oldu. Dış katmanı açmak için tekrar dokun.",opening:"Dış katman açıldı. Ödülünü görmek için bir kez daha dokun.",reveal:"ÖDÜLÜ GÖSTER",
odds:"GARANTİLİ ÖDÜL SIRASI · GÜMÜŞ → ALTIN → PLATİN → ELİT",open:"SİNYAL KAPSÜLÜ AÇ",capsule:"SİNYAL KAPSÜLÜ",protocol:"TAVIRO · SİNYAL ARŞİVİ",ready:"Bir sinyal kapsülün hazır. Kozmetik ödülünü keşfet.",empty:"Henüz kapsülün yok. Beş oyun tamamla veya bir bölge fethet.",earned:"KAPSÜL",collection:"KOLEKSİYONUN",equip:"KUŞAN",equipped:"TAKILI",owned:"Koleksiyonuna eklendi",duplicate:"Zaten koleksiyonunda · tekrar sinyal",reveal:"ÖDÜLÜ GÖSTER",close:"KAPAT",common:"YAYGIN",rare:"NADİR",epic:"EPİK",mythic:"EFSANEVİ",silver:"GÜMÜŞ",gold:"ALTIN",platinum:"PLATİN",elite:"ELİT",flag:"Pilot amblemi",trail:"İtki izi",projectile:"Mermi görünümü",ship:"Gemi çerçevesi",noItems:"Kazandığın kozmetikler burada görünecek.",progress:"Yalnızca kozmetik · oynanış avantajı sağlamaz"},
 "pt-BR":{
 anatolian-fire:"Fogo da Anatólia",azerbaijan:"Azerbaijão",red-white-trail:"Rastro da Anatólia",rainbow-trail:"Rastro Aurora",neon-outline:"Moldura Neon",comet-frame:"Vanguarda Cometa",eclipse-frame:"Soberano do Eclipse",usa-emblem:"Estados Unidos",japan-emblem:"Japão",

 stage1:"PRIMEIRO TOQUE · CARREGAR NÚCLEO",stage2:"SEGUNDO TOQUE · LIBERAR TRAVAS",stage3:"TERCEIRO TOQUE · REVELAR PRÊMIO",charging:"Núcleo carregado. Toque novamente para liberar a camada externa.",opening:"Camada externa liberada. Toque mais uma vez para revelar o prêmio.",reveal:"REVELAR PRÊMIO",
odds:"SEQUÊNCIA GARANTIDA · PRATA → OURO → PLATINA → ELITE",open:"ABRIR CÁPSULA DE SINAL",capsule:"CÁPSULA DE SINAL",protocol:"TAVIRO · ARQUIVO DE SINAIS",ready:"Uma cápsula está pronta. Revele seu item cosmético.",empty:"Ainda sem cápsulas. Complete cinco partidas ou conquiste uma região.",earned:"CÁPSULAS",collection:"SUA COLEÇÃO",equip:"EQUIPAR",equipped:"EQUIPADO",owned:"Adicionado à coleção",duplicate:"Já está na coleção · sinal repetido",reveal:"REVELAR PRÊMIO",close:"FECHAR",common:"COMUM",rare:"RARO",epic:"ÉPICO",mythic:"MÍTICO",silver:"PRATA",gold:"OURO",platinum:"PLATINA",elite:"ELITE",flag:"Emblema do piloto",trail:"Rastro do motor",projectile:"Visual do projétil",ship:"Estrutura da nave",noItems:"Seus cosméticos aparecerão aqui.",progress:"Apenas cosmético · sem vantagem de jogo"},
 es:{
 anatolian-fire:"Fuego de Anatolia",azerbaijan:"Azerbaiyán",red-white-trail:"Estela de Anatolia",rainbow-trail:"Estela Aurora",neon-outline:"Marco Neón",comet-frame:"Vanguardia Cometa",eclipse-frame:"Soberano del Eclipse",usa-emblem:"Estados Unidos",japan-emblem:"Japón",

 stage1:"PRIMER TOQUE · CARGAR NÚCLEO",stage2:"SEGUNDO TOQUE · LIBERAR SELLOS",stage3:"TERCER TOQUE · REVELAR PREMIO",charging:"Núcleo cargado. Toca otra vez para abrir la capa exterior.",opening:"Capa exterior abierta. Toca una vez más para revelar tu premio.",reveal:"REVELAR PREMIO",
odds:"RECOMPENSAS GARANTIZADAS · PLATA → ORO → PLATINO → ÉLITE",open:"ABRIR CÁPSULA DE SEÑAL",capsule:"CÁPSULA DE SEÑAL",protocol:"TAVIRO · ARCHIVO DE SEÑALES",ready:"Hay una cápsula lista. Descubre tu objeto cosmético.",empty:"Aún no tienes cápsulas. Completa cinco partidas o conquista una región.",earned:"CÁPSULAS",collection:"TU COLECCIÓN",equip:"EQUIPAR",equipped:"EQUIPADO",owned:"Añadido a tu colección",duplicate:"Ya está en tu colección · señal repetida",reveal:"REVELAR PREMIO",close:"CERRAR",common:"COMÚN",rare:"RARO",epic:"ÉPICO",mythic:"MÍTICO",silver:"PLATA",gold:"ORO",platinum:"PLATINO",elite:"ÉLITE",flag:"Emblema del piloto",trail:"Estela del motor",projectile:"Aspecto del proyectil",ship:"Marco de nave",noItems:"Tus cosméticos aparecerán aquí.",progress:"Solo cosmético · sin ventajas de juego"},
 ru:{
 anatolian-fire:"Анатолийский огонь",azerbaijan:"Азербайджан",red-white-trail:"Анатолийский след",rainbow-trail:"Аврора",neon-outline:"Неоновая рамка",comet-frame:"Кометный авангард",eclipse-frame:"Владыка затмения",usa-emblem:"США",japan-emblem:"Япония",

 stage1:"ПЕРВОЕ КАСАНИЕ · ЗАРЯДИТЬ ЯДРО",stage2:"ВТОРОЕ КАСАНИЕ · СНЯТЬ ЗАМКИ",stage3:"ТРЕТЬЕ КАСАНИЕ · ПОКАЗАТЬ НАГРАДУ",charging:"Ядро заряжено. Коснитесь ещё раз, чтобы открыть внешний слой.",opening:"Внешний слой открыт. Коснитесь ещё раз, чтобы увидеть награду.",reveal:"ПОКАЗАТЬ НАГРАДУ",
odds:"ГАРАНТИРОВАННЫЙ ПОРЯДОК · СЕРЕБРО → ЗОЛОТО → ПЛАТИНА → ЭЛИТА",open:"ОТКРЫТЬ СИГНАЛЬНУЮ КАПСУЛУ",capsule:"СИГНАЛЬНАЯ КАПСУЛА",protocol:"TAVIRO · АРХИВ СИГНАЛОВ",ready:"Капсула готова. Откройте косметическую награду.",empty:"Капсул пока нет. Завершите пять забегов или захватите регион.",earned:"КАПСУЛЫ",collection:"ВАША КОЛЛЕКЦИЯ",equip:"НАДЕТЬ",equipped:"НАДЕТО",owned:"Добавлено в коллекцию",duplicate:"Уже в коллекции · повторный сигнал",reveal:"ПОКАЗАТЬ НАГРАДУ",close:"ЗАКРЫТЬ",common:"ОБЫЧНЫЙ",rare:"РЕДКИЙ",epic:"ЭПИЧЕСКИЙ",mythic:"МИФИЧЕСКИЙ",silver:"СЕРЕБРО",gold:"ЗОЛОТО",platinum:"ПЛАТИНА",elite:"ЭЛИТА",flag:"Эмблема пилота",trail:"След двигателя",projectile:"Вид снаряда",ship:"Рамка корабля",noItems:"Здесь появятся ваши косметические предметы.",progress:"Только внешний вид · без игровых преимуществ"},
 id:{
 anatolian-fire:"Api Anatolia",azerbaijan:"Azerbaijan",red-white-trail:"Jejak Anatolia",rainbow-trail:"Jejak Aurora",neon-outline:"Bingkai Neon",comet-frame:"Pelopor Komet",eclipse-frame:"Penguasa Gerhana",usa-emblem:"Amerika Serikat",japan-emblem:"Jepang",

 stage1:"SENTUHAN PERTAMA · ISI INTI",stage2:"SENTUHAN KEDUA · BUKA SEGEL",stage3:"SENTUHAN KETIGA · LIHAT HADIAH",charging:"Inti terisi. Sentuh lagi untuk membuka lapisan luar.",opening:"Lapisan luar terbuka. Sentuh sekali lagi untuk melihat hadiah.",reveal:"BUKA HADIAH",
odds:"URUTAN HADIAH PASTI · PERAK → EMAS → PLATINUM → ELIT",open:"BUKA KAPSUL SINYAL",capsule:"KAPSUL SINYAL",protocol:"TAVIRO · ARSIP SINYAL",ready:"Kapsul siap dibuka. Temukan kosmetikmu.",empty:"Belum ada kapsul. Selesaikan lima permainan atau kuasai satu wilayah.",earned:"KAPSUL",collection:"KOLEKSIMU",equip:"PAKAI",equipped:"DIPAKAI",owned:"Ditambahkan ke koleksi",duplicate:"Sudah dikoleksi · sinyal duplikat",reveal:"BUKA HADIAH",close:"TUTUP",common:"UMUM",rare:"LANGKA",epic:"EPIK",mythic:"MITIS",silver:"PERAK",gold:"EMAS",platinum:"PLATINUM",elite:"ELIT",flag:"Lambang pilot",trail:"Jejak mesin",projectile:"Tampilan proyektil",ship:"Bingkai kapal",noItems:"Kosmetik yang kamu dapatkan akan muncul di sini.",progress:"Hanya kosmetik · tanpa keunggulan permainan"},
 de:{
 anatolian-fire:"Anatolisches Feuer",azerbaijan:"Aserbaidschan",red-white-trail:"Anatolische Spur",rainbow-trail:"Aurora-Spur",neon-outline:"Neonrahmen",comet-frame:"Kometen-Vorhut",eclipse-frame:"Herrscher der Finsternis",usa-emblem:"Vereinigte Staaten",japan-emblem:"Japan",

 stage1:"ERSTE BERÜHRUNG · KERN LADEN",stage2:"ZWEITE BERÜHRUNG · SIEGEL LÖSEN",stage3:"DRITTE BERÜHRUNG · BELOHNUNG ZEIGEN",charging:"Kern geladen. Erneut tippen, um die äußere Hülle zu öffnen.",opening:"Äußere Hülle geöffnet. Noch einmal tippen, um die Belohnung zu sehen.",reveal:"BELOHNUNG ZEIGEN",
odds:"GARANTIERTE REIHENFOLGE · SILBER → GOLD → PLATIN → ELITE",open:"SIGNALKAPSEL ÖFFNEN",capsule:"SIGNALKAPSEL",protocol:"TAVIRO · SIGNALARCHIV",ready:"Eine Kapsel ist bereit. Entdecke deinen kosmetischen Gegenstand.",empty:"Noch keine Kapsel. Schließe fünf Läufe ab oder erobere eine Region.",earned:"KAPSELN",collection:"DEINE SAMMLUNG",equip:"AUSRÜSTEN",equipped:"AUSGERÜSTET",owned:"Zur Sammlung hinzugefügt",duplicate:"Bereits gesammelt · doppeltes Signal",reveal:"BELOHNUNG ZEIGEN",close:"SCHLIESSEN",common:"HÄUFIG",rare:"SELTEN",epic:"EPISCH",mythic:"MYTHISCH",silver:"SILBER",gold:"GOLD",platinum:"PLATIN",elite:"ELITE",flag:"Pilotenemblem",trail:"Triebwerksspur",projectile:"Projektilstil",ship:"Schiffsrumpf",noItems:"Deine Kosmetikobjekte erscheinen hier.",progress:"Nur kosmetisch · kein Spielvorteil"},
 fr:{
 anatolian-fire:"Feu d’Anatolie",azerbaijan:"Azerbaïdjan",red-white-trail:"Trace d’Anatolie",rainbow-trail:"Trace Aurore",neon-outline:"Cadre Néon",comet-frame:"Avant-garde Comète",eclipse-frame:"Souverain de l’Éclipse",usa-emblem:"États-Unis",japan-emblem:"Japon",

 stage1:"PREMIER CONTACT · CHARGER LE CŒUR",stage2:"DEUXIÈME CONTACT · LIBÉRER LES VERROUS",stage3:"TROISIÈME CONTACT · RÉVÉLER LE PRIX",charging:"Cœur chargé. Touchez encore pour libérer la coque externe.",opening:"Coque externe ouverte. Touchez encore une fois pour révéler votre récompense.",reveal:"RÉVÉLER LA RÉCOMPENSE",
odds:"RÉCOMPENSES GARANTIES · ARGENT → OR → PLATINE → ÉLITE",open:"OUVRIR LA CAPSULE SIGNAL",capsule:"CAPSULE SIGNAL",protocol:"TAVIRO · ARCHIVE DES SIGNAUX",ready:"Une capsule est prête. Découvrez votre objet cosmétique.",empty:"Aucune capsule. Terminez cinq parties ou capturez une région.",earned:"CAPSULES",collection:"VOTRE COLLECTION",equip:"ÉQUIPER",equipped:"ÉQUIPÉ",owned:"Ajouté à votre collection",duplicate:"Déjà collectionné · signal en double",reveal:"RÉVÉLER LA RÉCOMPENSE",close:"FERMER",common:"COURANT",rare:"RARE",epic:"ÉPIQUE",mythic:"MYTHIQUE",silver:"ARGENT",gold:"OR",platinum:"PLATINE",elite:"ÉLITE",flag:"Emblème du pilote",trail:"Trace du moteur",projectile:"Style de projectile",ship:"Cadre du vaisseau",noItems:"Vos objets cosmétiques apparaîtront ici.",progress:"Cosmétique uniquement · aucun avantage de jeu"},
 ja:{
 anatolian-fire:"アナトリアの炎",azerbaijan:"アゼルバイジャン",red-white-trail:"アナトリアの航跡",rainbow-trail:"オーロラの航跡",neon-outline:"ネオンフレーム",comet-frame:"コメット・ヴァンガード",eclipse-frame:"エクリプス・ソブリン",usa-emblem:"アメリカ合衆国",japan-emblem:"日本",

 stage1:"1回目 · コアをチャージ",stage2:"2回目 · 外殻ロックを解除",stage3:"3回目 · 報酬を公開",charging:"コアが充電されました。もう一度タップして外殻を開きます。",opening:"外殻が開きました。もう一度タップして報酬を表示します。",reveal:"報酬を表示",
odds:"確定報酬順 · シルバー → ゴールド → プラチナ → エリート",open:"シグナルカプセルを開く",capsule:"シグナルカプセル",protocol:"TAVIRO · シグナルアーカイブ",ready:"カプセルの準備ができました。コスメ報酬を確認しましょう。",empty:"カプセルはまだありません。5回のプレイを完了するか、宙域を制圧しましょう。",earned:"カプセル",collection:"コレクション",equip:"装備",equipped:"装備中",owned:"コレクションに追加しました",duplicate:"入手済み · 重複シグナル",reveal:"報酬を表示",close:"閉じる",common:"コモン",rare:"レア",epic:"エピック",mythic:"ミシック",silver:"シルバー",gold:"ゴールド",platinum:"プラチナ",elite:"エリート",flag:"パイロットエンブレム",trail:"エンジントレイル",projectile:"弾のスタイル",ship:"機体フレーム",noItems:"獲得したコスメはここに表示されます。",progress:"見た目のみ · ゲーム上の優位性なし"}
};
const t=key=>(copy[locale()]||copy.en)[key]||copy.en[key]||key;
const rewards=[
 {id:"anatolian-fire",type:"flag",value:"🇹🇷🔥",name:"Anadolu Ateşi",rarity:"elite",label:"Special pilot emblem"},
 {id:"azerbaijan",type:"flag",value:"🇦🇿",name:"Azerbaijan",rarity:"gold",label:"Country emblem"},
 {id:"red-white-trail",type:"trail",value:"red-white",name:"Anatolian Wake",rarity:"platinum",label:"Red-white engine trail"},
 {id:"rainbow-trail",type:"trail",value:"rainbow",name:"Aurora Wake",rarity:"gold",label:"Aurora engine trail"},
 {id:"neon-outline",type:"ship",value:"neon-outline",name:"Neon Frame",rarity:"silver",label:"Neon ship frame"},
 {id:"comet-frame",type:"ship",value:"comet-frame",name:"Comet Vanguard",rarity:"gold",label:"Comet ship frame"},
 {id:"eclipse-frame",type:"ship",value:"eclipse-frame",name:"Eclipse Sovereign",rarity:"elite",label:"Eclipse ship frame"},
 {id:"usa-emblem",type:"flag",value:"🇺🇸",name:"United States",rarity:"silver",label:"Pilot country emblem"},
 {id:"japan-emblem",type:"flag",value:"🇯🇵",name:"Japan",rarity:"gold",label:"Pilot country emblem"}
];
const rarityColor={common:"#62d6a0",rare:"#42cfff",epic:"#bd82ff",mythic:"#ffd166",silver:"#c9d3df",gold:"#ffd166",platinum:"#7de7f4",elite:"#ff7bcb"};
let capsulePhase=0;
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
 const items=owned().filter(item=>item.type!=="projectile");
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
  const oddsLabel=document.createElement("small");oddsLabel.id="scrap-capsule-odds";oddsLabel.className="capsule-footnote";oddsLabel.textContent=t("odds");host.append(oddsLabel);
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
 layer.hidden=false;localizeModal();capsulePhase=0;
 const button=$("scrap-capsule-reveal");button.hidden=false;button.disabled=false;button.textContent=t("stage1");
 const art=$("scrap-capsule-art");art.classList.remove("charging","opening","revealed");art.removeAttribute("data-rarity");
 const box=$("scrap-capsule-reward");box.hidden=true;box.removeAttribute("data-rarity");
 if(!count()){button.disabled=true;$("scrap-capsule-hint").textContent=t("empty")}else $("scrap-capsule-hint").textContent=t("ready");
}

function openReveal(){
 if(!count())return;
 const art=$("scrap-capsule-art"),button=$("scrap-capsule-reveal"),box=$("scrap-capsule-reward");
 if(capsulePhase===0){
  capsulePhase=1;art.classList.remove("opening","revealed");art.classList.add("charging");
  button.textContent=t("stage2");$("scrap-capsule-hint").textContent=t("charging");return;
 }
 if(capsulePhase===1){
  capsulePhase=2;art.classList.remove("charging");art.classList.add("opening");
  button.textContent=t("stage3");$("scrap-capsule-hint").textContent=t("opening");return;
 }
 if(capsulePhase!==2)return;
 button.disabled=true;setCount(count()-1);
 const inventory=owned(),available=rewards.filter(item=>!inventory.some(entry=>entry.id===item.id));
 const rarityOrder={silver:0,gold:1,platinum:2,elite:3};
 const reward=available.slice().sort((a,b)=>(rarityOrder[a.rarity]??99)-(rarityOrder[b.rarity]??99))[0]||rewards[0];
 const duplicate=inventory.some(item=>item.id===reward.id);
 if(!duplicate){inventory.push(reward);write(OWNED,normalizeOwnedCosmetics(inventory))}
 if(reward.type==="flag"&&!duplicate)window.dispatchEvent(new CustomEvent("cosmic-scrap:capsule-reward",{detail:{flag:reward.value,name:reward.name}}));
 if(!duplicate&&["trail","ship"].includes(reward.type))window.dispatchEvent(new CustomEvent("cosmic-scrap:cosmetic-reward",{detail:reward}));
 art.classList.remove("charging","opening");art.classList.add("revealed");art.dataset.rarity=reward.rarity;
 box.replaceChildren();box.dataset.rarity=reward.rarity;
 const tier=document.createElement("small");tier.className="capsule-rarity";tier.style.color=rarityColor[reward.rarity];tier.textContent=t(reward.rarity);
 const title=document.createElement("strong");title.textContent=t(reward.id);
 const visual=document.createElement("span");visual.className="capsule-reward-visual";
 if(reward.type==="flag")visual.append(flagImage(reward.value));else visual.textContent=reward.type==="trail"?"〰":"◇";
 const detail=document.createElement("p");detail.textContent=duplicate?t("duplicate"):t("owned");
 box.append(tier,title,visual,detail);box.hidden=false;button.hidden=true;
 $("scrap-capsule-hint").textContent=t("owned");renderEquipment();
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
