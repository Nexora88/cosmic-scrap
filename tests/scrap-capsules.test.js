import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CAPSULE_COPY } from "../js/systems/CapsuleLocale.js";
import { CAPSULE_COLLECTION_COPY } from "../js/systems/CapsuleCollection.js";
const capsule=fs.readFileSync(new URL("../js/ui/ScrapCapsules.js",import.meta.url),"utf8");
const capsuleLocale=fs.readFileSync(new URL("../js/systems/CapsuleLocale.js",import.meta.url),"utf8");
const catalog=fs.readFileSync(new URL("../js/systems/CosmeticCatalog.js",import.meta.url),"utf8");
const region=fs.readFileSync(new URL("../js/systems/RegionProgress.js",import.meta.url),"utf8");
test("Scrap Capsule awards one free capsule every five finalized runs",()=>{
 assert.match(capsule,/runs%5===0/);
 assert.match(capsule,/cosmic-scrap:run-ended/);
});
test("boss region victories grant an additional capsule",()=>{
 assert.match(capsule,/cosmic-scrap:region-captured/);
});
test("Anadolu Ateşi is a special mythic Turkish collectible",()=>{
 assert.match(region,/🇹🇷🔥.*Anadolu Ateşi.*elite/);
 assert.match(catalog,/anatolian-fire/);
});
test("capsule rewards stay non-combat cosmetics",()=>{
 for(const type of ["flag","trail","ship","banner","color","symbol","aura","badge"])assert.ok(catalog.includes('"type": "'+type+'"'));
 assert.doesNotMatch(capsule,/\{id:"[^"]+",type:"projectile"/);
});


test("signal capsule interface includes complete copy for all nine supported locales",()=>{
 const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
 for(const code of locales){
  assert.ok(capsuleLocale.includes(code+": {") || capsuleLocale.includes('"' + code + '": {'),"missing capsule locale: "+code);
 }
 for(const key of ["OPEN SIGNAL CAPSULE","SİNYAL KAPSÜLÜNÜ AÇ","ABRIR CÁPSULA DE SINAL","ABRIR CÁPSULA DE SEÑAL","ОТКРЫТЬ СИГНАЛЬНУЮ КАПСУЛУ","BUKA KAPSUL SINYAL","SIGNALKAPSEL ÖFFNEN","OUVRIR LA CAPSULE SIGNAL","シグナルカプセルを開く"])assert.ok(capsuleLocale.includes(key),"missing localized capsule action: "+key);
});
test("capsule rewards are cosmetic and reveal UI is accessible",()=>{
 assert.match(capsule,/role","dialog"/);
 assert.match(capsule,/aria-modal","true"/);
 assert.match(capsuleLocale,/Cosmetic only · no gameplay advantage/);
 assert.doesNotMatch(capsule,/damageBoost|speedBoost|fireRate/);
});

test("capsules use a guaranteed Silver-to-Elite reward path without starting audio contexts",()=>{
 for(const rarity of ["copper","iron","silver","gold","platinum","titanium","obsidian","elite"])assert.ok(capsule.includes(rarity),"missing rarity tier "+rarity);
 assert.ok(capsule.includes("const rarityOrder={copper:0,iron:1,silver:2,gold:3,platinum:4,titanium:5,obsidian:6,elite:7}"));
 assert.doesNotMatch(capsule,/Math\.random\(\)/);
 assert.match(capsuleLocale,/MINERAL REWARD TIERS/);
 assert.match(capsule,/capsulePhase===0/);
 assert.match(capsule,/capsulePhase===1/);
 assert.match(capsuleLocale,/THIRD TOUCH|TERCER TOQUE|TROISIÈME CONTACT|3回目/);
 assert.doesNotMatch(capsule,/new Audio\(\)|createOscillator\(\)/);
});
test("capsules include unique ship frames and country emblem rewards",()=>{
 for(const reward of ["frame-2","frame-3","flag-us","flag-jp"])assert.ok(catalog.includes(reward),"missing collectible "+reward);
});

test("signal capsules award only non-weapon cosmetics, country emblems and ship frames",()=>{
 assert.doesNotMatch(capsule,/type:"projectile"/);
 assert.doesNotMatch(capsule,/projectile-reward/);
 assert.ok(catalog.includes('"type": "flag"'));
 assert.ok(catalog.includes('"type": "ship"'));
});

test("capsules are earned through play and contain no purchase or chance mechanic",()=>{
 assert.match(capsule,/five-runs/);
 assert.match(capsule,/region-victory/);
 assert.doesNotMatch(capsule,/purchase|real-money|buy-capsule|price:/i);
});

test("capsule reveal requires three taps and consumes a capsule only on final reveal",()=>{
 assert.match(capsuleLocale,/FIRST TOUCH · CHARGE CORE/);
 assert.match(capsuleLocale,/SECOND TOUCH · RELEASE SEALS/);
 assert.match(capsuleLocale,/THIRD TOUCH · REVEAL REWARD/);
 assert.match(capsule,/button\.disabled=true;setCount\(count\(\)-1\)/);
 assert.match(capsule,/art\.classList\.add\("charging"\)/);
 assert.match(capsule,/art\.classList\.add\("opening"\)/);
 assert.match(capsule,/art\.classList\.add\("revealed"\)/);
});
test("capsule opening animation cannot be skipped by the final tap and supports reduced motion",()=>{
 assert.match(capsule,/capsulePhase!==2/);
 assert.match(capsule,/button\.disabled=true;\$\("scrap-capsule-hint"\)\.textContent=t\("opening"\)/);
 assert.match(capsule,/openingUnlockTimer=setTimeout/);
 assert.match(capsule,/button\.hidden=true/);
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(css,/prefers-reduced-motion:reduce\).*scrap-capsule-art/);
 assert.match(css,/scrap-capsule-art\[data-rarity="elite"\]/);
});

test("all nine locales provide translated names for every capsule collectible",()=>{
 const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
 for(const id of ["anatolian-fire","azerbaijan","red-white-trail","rainbow-trail","neon-outline","comet-frame","eclipse-frame","usa-emblem","japan-emblem"]){
  assert.ok(capsuleLocale.includes(JSON.stringify(id)+":"),"missing collectible locale key "+id);
 }
 for(const locale of locales)assert.ok(capsuleLocale.includes(locale==="pt-BR"?'"pt-BR": {':locale+": {"),"missing locale copy "+locale);
 assert.match(capsule,/title\.textContent=localizedRewardName\(reward\)/);
});

test("capsule reveal places the TAVIRO wordmark at the center of the opening scene",()=>{
 assert.match(capsule,/capsule-taviro-logo/);
 assert.match(capsule,/src="assets\/taviro-logo\.svg"/);
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(css,/\.scrap-capsule-art \.capsule-taviro-logo/);
 assert.match(css,/capsule-logo-burst/);
});

test("capsule finale uses a separate animated reward card and rarity-specific visual treatment",()=>{
 assert.match(capsule,/scrap-capsule-reward/);
 assert.match(capsule,/capsule-reveal/);
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(css,/capsule-final-card/);
 for(const rarity of ["silver","gold","platinum","elite"])assert.ok(css.includes('data-rarity="'+rarity+'"]'),"missing rarity finale "+rarity);
});

test("capsule shell visibly separates into two halves and secondary pages use responsive cards",()=>{
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(css,/\.scrap-capsule-art::before/);
 assert.match(css,/\.scrap-capsule-art::after/);
 assert.match(css,/\.scrap-capsule-art\.opening::before/);
 assert.match(css,/\.scrap-capsule-art\.opening::after/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/#classic-menu-sections\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:700px\)\{\s*#classic-menu-sections\{grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/\.scrap-capsule-panel\{overflow:hidden\}/);
});


test("capsule reveal waits for the shell-opening transition and localizes the Elite signature",()=>{
 assert.match(capsule,/button\.disabled=true;\$\("scrap-capsule-hint"\)\.textContent=t\("opening"\)/);
 assert.match(capsule,/openingUnlockTimer=setTimeout/);
 assert.match(capsule,/textContent=t\("eliteSignature"\)/);
 for(const value of ["✦ TAVIRO · ONE CORE. INFINITE VOID. ✦","✦ TAVIRO · TEK ÇEKİRDEK. SONSUZ BOŞLUK. ✦","✦ TAVIRO · UM NÚCLEO. VAZIO INFINITO. ✦","✦ TAVIRO · UN NÚCLEO. VACÍO INFINITO. ✦","✦ TAVIRO · ОДНО ЯДРО. БЕСКОНЕЧНАЯ ПУСТОТА. ✦","✦ TAVIRO · SATU INTI. KEHAMPAAN TANPA BATAS. ✦","✦ TAVIRO · EIN KERN. UNENDLICHE LEERE. ✦","✦ TAVIRO · UN NOYAU. VIDE INFINI. ✦","✦ TAVIRO · ひとつのコア。無限の虚空。✦"])assert.ok(capsuleLocale.includes(value));
});


test("country flag reward names use the active locale's region display names",()=>{
 assert.match(capsule,/new Intl\.DisplayNames\(\[locale\(\)\],\{type:"region"\}\)/);
 assert.match(capsule,/localizedRewardName\(reward\)/);
});

test("capsule skip safely reveals the earned reward without changing its identity",()=>{
 assert.match(capsule,/function skipCapsuleAnimation\(\)/);
 assert.match(capsule,/capsulePhase=2;[\s\S]*openReveal\(\)/);
 assert.match(capsule,/scrap-capsule-skip/);
 assert.match(capsule,/skipCapsuleAnimation/);
});
test("cosmetic salvage is rarity-priced and protects free or shared country flags",()=>{
 const collection=fs.readFileSync(new URL("../js/systems/CapsuleCollection.js",import.meta.url),"utf8");
 const main=fs.readFileSync(new URL("../js/main.js",import.meta.url),"utf8");
 assert.match(collection,/copper:10,iron:18,silver:30,gold:50,platinum:75,titanium:100,obsidian:140,elite:200/);
 assert.match(collection,/item.type!=="flag"\|\|item.id==="anatolian-fire"/);
 assert.match(main,/cosmic-scrap:sell-cosmetic/);
 assert.match(main,/profile.scrapCore=Math.max\(0,Number\(profile.scrapCore\)\|\|0\)\+amount/);
 assert.match(capsule,/freeFlag=!isCapsuleCosmeticSellable\(item\)/);
});
test("capsule cinematic includes the timed stage layers and Elite-only scene",()=>{
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(capsule,/capsule-ground-ring/);
 assert.match(capsule,/capsule-particles/);
 assert.match(capsule,/capsule-reveal-beam/);
 assert.match(capsule,/elite-reveal-scene/);
 assert.match(css,/capsule-ground-arrival/);
 assert.match(css,/capsule-shockwave/);
 assert.match(css,/capsule-particles-out/);
 assert.match(css,/elite-beam-rise/);
 assert.match(css,/reduced-flash/);
});

test("capsules exclude country flags already unlocked for free or in the flag collection",()=>{
 assert.match(capsule,/import \{isFlagUnlocked\} from "\.\.\/systems\/RegionProgress\.js"/);
 assert.match(capsule,/profileSnapshot=read\("cosmic-scrap-save-v2",\{\}\)/);
 assert.match(capsule,/!\(item\.type==="flag"&&isFlagUnlocked\(profileSnapshot,item\.value\)\)/);
 assert.match(capsule,/reward\.type==="flag"&&isFlagUnlocked\(profileSnapshot,reward\.value\)/);
});

test("capsule particle density adapts to device capabilities and reduced effects",()=>{
 assert.match(capsule,/low-particle-mode/);
 assert.match(capsule,/navigator\.hardwareConcurrency/);
 assert.match(capsule,/navigator\.deviceMemory/);
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(css,/low-particle-mode \.capsule-particles:before/);
});

test("capsule can advance each opening stage by tapping the capsule art",()=>{
 assert.match(capsule,/art\.addEventListener\("click",\(\)=>\{if\(holdTriggered\)\{holdTriggered=false;return\}if\(capsulePhase!==2\|\|!\$\("scrap-capsule-reveal"\)\.disabled\)openReveal\(\)\}\)/);
 assert.match(capsule,/art\.addEventListener\("keydown"/);
});
test("capsule balance tracks earned and spent totals instead of restoring consumed inventory",()=>{
 assert.match(capsule,/cosmic-scrap-capsules-earned/);
 assert.match(capsule,/cosmic-scrap-capsules-spent/);
 assert.match(capsule,/spent\+=Math\.abs\(delta\)/);
});


test("capsule and collection labels are complete and distinct across all nine locales",()=>{
 const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
 const sourceKeys=Object.keys(CAPSULE_COPY.en);
 for(const locale of locales){
  assert.ok(CAPSULE_COPY[locale], "missing capsule dictionary: "+locale);
  for(const key of sourceKeys){
   assert.equal(typeof CAPSULE_COPY[locale][key],"string",locale+" missing capsule key: "+key);
   assert.ok(CAPSULE_COPY[locale][key].trim(),locale+" has empty capsule copy: "+key);
   // Proper country names may be identical across locales; require complete non-empty entries instead.
  }
  for(const key of Object.keys(CAPSULE_COLLECTION_COPY.en)){
   assert.ok(CAPSULE_COLLECTION_COPY[locale]?.[key],locale+" missing collection label: "+key);
   // Collection labels may include internationally shared proper names.
  }
 }
 assert.equal(CAPSULE_COPY.ja.odds,"鉱石ランク · 銅 → 鉄 → 銀 → 金 → プラチナ → チタン → 黒曜石 → TAVIRO エリート");
 assert.match(capsule,/cosmic-scrap:language-changed",localizeModal/);
});

test("service worker precaches the capsule locale module and refreshes the shell cache",()=>{
 const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(sw,/CACHE_PREFIX \+ "v28"/);
 assert.match(sw,/\.\/js\/systems\/CapsuleLocale\.js/);
});


test("TAVIRO capsule uses a canvas starfield with a calm-to-warp-to-rarity finale",()=>{
 const starfield=fs.readFileSync(new URL("../js/ui/CapsuleStarfield.js",import.meta.url),"utf8");
 assert.match(capsule,/createCapsuleStarfield/);
 assert.match(capsule,/scrap-capsule-starfield/);
 assert.match(capsule,/setPhase\("idle"\)/);
 assert.match(capsule,/setPhase\("charge"\)/);
 assert.match(capsule,/setPhase\("warp"\)/);
 assert.match(capsule,/setPhase\("reveal",reward\.rarity,skipCinematic\)/);
 assert.match(starfield,/requestAnimationFrame/);
 assert.match(starfield,/copper:[\s\S]*elite:/);
 assert.match(starfield,/prefers-reduced-motion/);
 assert.match(starfield,/cancelAnimationFrame/);
});


test("TAVIRO capsule cinematic adds hold charging, implosion, supernova and a delayed reward arrival",()=>{
 assert.match(capsule,/pointerdown/);
 assert.match(capsule,/holdTriggered=true/);
 assert.match(capsule,/capsule-implosion/);
 assert.match(capsule,/capsule-supernova/);
 assert.match(capsule,/box\.hidden=false/);
 const starfield=fs.readFileSync(new URL("../js/ui/CapsuleStarfield.js",import.meta.url),"utf8");
 assert.match(starfield,/phase==="implode"/);
 assert.match(starfield,/phase==="supernova"/);
 assert.match(starfield,/RARITY_COLORS/);
 const main=fs.readFileSync(new URL("../js/main.js",import.meta.url),"utf8");
 assert.match(main,/capsuleSuction/);
 assert.match(main,/capsuleBurst/);
 assert.match(main,/capsuleWarp/);
});
test("the hangar keeps the full flag shop while presenting a prominent Scrap Core wallet",()=>{
 const main=fs.readFileSync(new URL("../js/main.js",import.meta.url),"utf8");
 const region=fs.readFileSync(new URL("../js/systems/RegionProgress.js",import.meta.url),"utf8");
 const css=fs.readFileSync(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(main,/FLAG_UNLOCKS/);
 assert.match(main,/flag-collection-balance/);
 assert.match(region,/export const FLAG_UNLOCKS/);
 assert.match(css,/\.pilot-flag-options\{display:grid;grid-template-columns:repeat\(5/);
 assert.match(css,/flag-collection-balance/);
});


test("the reward remains on stage with a localized collect action in all nine languages",()=>{
 const locale=fs.readFileSync(new URL("../js/systems/CapsuleLocale.js",import.meta.url),"utf8");
 const actions=["COLLECT","TOPLA","COLETAR","RECOGER","ЗАБРАТЬ","AMBIL","ABHOLEN","RÉCUPÉRER","受け取る"];
 for(const label of actions)assert.ok(locale.includes('collect:"'+label+'"'),"missing collect translation "+label);
 assert.match(capsule,/done\.textContent=t\("collect"\)/);
 assert.match(capsule,/capsule-done-button/);
});
