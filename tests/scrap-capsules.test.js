import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
 assert.match(capsule,/const rarityOrder=\\{copper:0,iron:1,silver:2,gold:3,platinum:4,titanium:5,obsidian:6,elite:7\\}/);
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
test("capsule opening animation can be skipped by the final tap and supports reduced motion",()=>{
 assert.match(capsule,/capsulePhase!==2/);
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
 assert.match(capsule,/title\.textContent=t\(reward\.id\)/);
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
