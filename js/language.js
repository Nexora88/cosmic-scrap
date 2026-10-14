const translations={
en:{
"PLAY ENDLESS":"PLAY ENDLESS","CREATE FREE PILOT ACCOUNT":"CREATE FREE PILOT ACCOUNT","Optional · keep local play free · unlock online features":"Optional · keep local play free · unlock online features","CORE ARMORY":"CORE ARMORY","CHOOSE YOUR CORE":"CHOOSE YOUR CORE","NEBULA":"NEBULA","PHOTON":"PHOTON","RIFT":"RIFT","SOLAR":"SOLAR","OPTIONAL CHALLENGES":"OPTIONAL CHALLENGES","PLAY YOUR WAY":"PLAY YOUR WAY","ENDLESS SURVIVAL":"ENDLESS SURVIVAL","No objective · play at your own pace":"No objective · play at your own pace","COLLECT 180 SCRAP":"COLLECT 180 SCRAP","Defeat an Elite · +3 Core":"Defeat an Elite · +3 Core","12 storm kills · +2 Core":"12 storm kills · +2 Core","FIELD GUIDE · FIRST RUN":"FIELD GUIDE · FIRST RUN","SURVIVE SMARTER":"SURVIVE SMARTER","Keep your escape lane":"Keep your escape lane","Let scrap come to you":"Let scrap come to you","Try a new combination":"Try a new combination","SCRAP CORE UPGRADES ↗":"SCRAP CORE UPGRADES ↗","SOUND: ON":"SOUND: ON","EXPORT SAVE":"EXPORT SAVE","IMPORT SAVE":"IMPORT SAVE","RESET SAVE":"RESET SAVE","ONLINE HUB ↗":"ONLINE HUB ↗","PLAYER ACCOUNT ↗":"PLAYER ACCOUNT ↗","SETTINGS ⚙":"SETTINGS ⚙","INITIALIZE RUN":"PLAY ENDLESS","EN":"EN / TR"
},
tr:{
"PLAY ENDLESS":"SINIRSIZ OYNA","CREATE FREE PILOT ACCOUNT":"ÜCRETSİZ HESAP OLUŞTUR","Optional · keep local play free · unlock online features":"İsteğe bağlı · oyun ücretsiz · çevrim içi özellikleri aç","CORE ARMORY":"ÇEKİRDEK KOLEKSİYONU","CHOOSE YOUR CORE":"ÇEKİRDEĞİNİ SEÇ","NEBULA":"BULUTSUSU","PHOTON":"FOTON","RIFT":"YARIK","SOLAR":"GÜNEŞ","OPTIONAL CHALLENGES":"İSTEĞE BAĞLI GÖREVLER","PLAY YOUR WAY":"KENDİ TARZINDA OYNA","ENDLESS SURVIVAL":"SINIRSIZ HAYATTA KAL","No objective · play at your own pace":"Görev yok · istediğin kadar oyna","COLLECT 180 SCRAP":"180 HURDA TOPLA","Defeat an Elite · +3 Core":"Bir Elit'i yen · +3 Çekirdek","12 storm kills · +2 Core":"Fırtınada 12 düşman yen · +2 Çekirdek","FIELD GUIDE · FIRST RUN":"SAHA REHBERİ · İLK OYUN","SURVIVE SMARTER":"DAHA AKILLI HAYATTA KAL","Keep your escape lane":"Kaçış yolunu açık tut","Let scrap come to you":"Hurdaları sana yaklaştır","Try a new combination":"Yeni bir kombinasyon dene","SCRAP CORE UPGRADES ↗":"KALICI ÇEKİRDEK GELİŞTİRMELERİ ↗","SOUND: ON":"SES: AÇIK","EXPORT SAVE":"KAYDI DIŞA AKTAR","IMPORT SAVE":"KAYDI İÇE AKTAR","RESET SAVE":"KAYDI SIFIRLA","ONLINE HUB ↗":"ÇEVRİM İÇİ MERKEZ ↗","PLAYER ACCOUNT ↗":"OYUNCU HESABI ↗","SETTINGS ⚙":"AYARLAR ⚙","INITIALIZE RUN":"SINIRSIZ OYNA","EN":"TR / EN"
}};
const leafSelectors={
".lead":"One square. Infinite void. Don't stop moving.",
".micro":"AUTO-FIRE ENABLED · SCRAP CORE PERSISTS BETWEEN RUNS",
".contract-select-heading .eyebrow":"OPTIONAL CHALLENGES",
".guide-footnote":"Collected run scrap is converted to permanent Scrap Core after the run. Banked Core survives death; progress is saved in this browser.",
".guide-index":"01 / MOVE",
".home-status":"ENDLESS · OFFLINE READY"
};
function language(){try{return localStorage.getItem("cosmic-scrap-language")==="tr"?"tr":"en"}catch{return"en"}}
function replaceText(el,value){if(!el)return;const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(node)node.textContent=value;else el.insertBefore(document.createTextNode(value),el.firstChild)}
function applyLanguage(lang=language()){
 const dict=translations[lang]||translations.en;document.documentElement.lang=lang;
 for(const [key,en] of Object.entries(translations.en)){const tr=translations.tr[key]||en;document.querySelectorAll("button,label,strong,small,span,p,h2,h3").forEach(el=>{if(el.children.length===0&&el.textContent.trim()===en)el.textContent=lang==="tr"?tr:en})}
 const btn=document.getElementById("language-toggle");if(btn){btn.textContent=lang==="tr"?"TR / EN":"EN / TR";btn.setAttribute("aria-label",lang==="tr"?"Dili İngilizceye çevir":"Switch language to Turkish")}
 document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const key=el.dataset.i18nPlaceholder;if(dict[key])el.placeholder=dict[key]});
 document.querySelectorAll("[data-i18n-en][data-i18n-tr]").forEach(el=>{const key=lang==="tr"?"i18nTr":"i18nEn";replaceText(el,el.dataset[key])});
 document.querySelectorAll("[data-contract]").forEach(b=>{const label=b.dataset.contract==="none"?(lang==="tr"?"SINIRSIZ HAYATTA KAL":"ENDLESS SURVIVAL"):b.dataset.contract==="salvager"?(lang==="tr"?"HURDA AVI":"SALVAGE RUN"):b.dataset.contract==="elite"?(lang==="tr"?"ELİT AVCISI":"ELITE HUNTER"):(lang==="tr"?"FIRTINA KIRICI":"STORMBREAKER");const strong=b.querySelector("strong");if(strong)strong.textContent=label});
 document.querySelectorAll("[data-skin]").forEach(b=>{const names={blue:["NEBULA","BULUTSUSU"],mint:["PHOTON","FOTON"],violet:["RIFT","YARIK"],amber:["SOLAR","GÜNEŞ"]};b.querySelector("span").textContent=names[b.dataset.skin][lang==="tr"?1:0]});
}
document.getElementById("language-toggle")?.addEventListener("click",()=>{const next=language()==="tr"?"en":"tr";try{localStorage.setItem("cosmic-scrap-language",next)}catch{}applyLanguage(next)});
applyLanguage();
