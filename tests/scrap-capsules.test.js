import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const capsule=fs.readFileSync(new URL("../js/ui/ScrapCapsules.js",import.meta.url),"utf8");
const region=fs.readFileSync(new URL("../js/systems/RegionProgress.js",import.meta.url),"utf8");
test("Scrap Capsule awards one free capsule every five finalized runs",()=>{
 assert.match(capsule,/runs%5===0/);
 assert.match(capsule,/cosmic-scrap:run-ended/);
});
test("boss region victories grant an additional capsule",()=>{
 assert.match(capsule,/cosmic-scrap:region-captured/);
});
test("Anadolu Ateşi is a special mythic Turkish collectible",()=>{
 assert.match(region,/🇹🇷🔥.*Anadolu Ateşi.*mythic/);
 assert.match(capsule,/anatolian-fire/);
});
test("capsule rewards stay non-combat cosmetics",()=>{
 for(const type of ["flag","trail","ship"])assert.match(capsule,new RegExp('type:"'+type+'"'));
 assert.doesNotMatch(capsule,/\{id:"[^"]+",type:"projectile"/);
});


test("signal capsule interface includes complete copy for all nine supported locales",()=>{
 const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
 for(const code of locales){
  assert.ok(capsule.includes(code+":{") || capsule.includes('"' + code + '":{'),"missing capsule locale: "+code);
 }
 for(const key of ["OPEN SIGNAL CAPSULE","SİNYAL KAPSÜLÜ AÇ","ABRIR CÁPSULA DE SINAL","ABRIR CÁPSULA DE SEÑAL","ОТКРЫТЬ СИГНАЛЬНУЮ КАПСУЛУ","BUKA KAPSUL SINYAL","SIGNALKAPSEL ÖFFNEN","OUVRIR LA CAPSULE SIGNAL","シグナルカプセルを開く"])assert.ok(capsule.includes(key),"missing localized capsule action: "+key);
});
test("capsule rewards are cosmetic and reveal UI is accessible",()=>{
 assert.match(capsule,/role","dialog"/);
 assert.match(capsule,/aria-modal","true"/);
 assert.match(capsule,/Cosmetic only · no gameplay advantage/);
 assert.doesNotMatch(capsule,/damageBoost|speedBoost|fireRate/);
});

test("capsules use a guaranteed Silver-to-Elite reward path without starting audio contexts",()=>{
 for(const rarity of ["silver","gold","platinum","elite"])assert.ok(capsule.includes(rarity),"missing rarity tier "+rarity);
 assert.match(capsule,/const rarityOrder=\{silver:0,gold:1,platinum:2,elite:3\}/);
 assert.doesNotMatch(capsule,/Math\.random\(\)/);
 assert.match(capsule,/GUARANTEED REWARD PATH/);
 assert.match(capsule,/capsulePhase===0/);
 assert.match(capsule,/capsulePhase===1/);
 assert.match(capsule,/THIRD TOUCH|TERCER TOQUE|TROISIÈME CONTACT|3回目/);
 assert.doesNotMatch(capsule,/new Audio\(\)|createOscillator\(\)/);
});
test("capsules include unique ship frames and country emblem rewards",()=>{
 for(const reward of ["comet-frame","eclipse-frame","usa-emblem","japan-emblem"])assert.ok(capsule.includes(reward),"missing collectible "+reward);
});

test("signal capsules award only non-weapon cosmetics, country emblems and ship frames",()=>{
 assert.doesNotMatch(capsule,/type:"projectile"/);
 assert.doesNotMatch(capsule,/projectile-reward/);
 assert.match(capsule,/type:"flag"/);
 assert.match(capsule,/type:"ship"/);
});

test("capsules are earned through play and contain no purchase or chance mechanic",()=>{
 assert.match(capsule,/five-runs/);
 assert.match(capsule,/region-victory/);
 assert.doesNotMatch(capsule,/purchase|real-money|buy-capsule|price:/i);
});

test("capsule reveal requires three taps and consumes a capsule only on final reveal",()=>{
 assert.match(capsule,/FIRST TOUCH · CHARGE CORE/);
 assert.match(capsule,/SECOND TOUCH · RELEASE SEALS/);
 assert.match(capsule,/THIRD TOUCH · REVEAL REWARD/);
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
  assert.match(capsule,new RegExp(id+":"));
 }
 for(const locale of locales)assert.ok(capsule.includes(locale==="pt-BR"?'"pt-BR":{':locale+":{"),"missing locale copy "+locale);
 assert.match(capsule,/title\.textContent=t\(reward\.id\)/);
});
