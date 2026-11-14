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
test("capsule rewards stay cosmetic",()=>{
 for(const type of ["flag","trail","projectile","ship"])assert.match(capsule,new RegExp('type:"'+type+'"'));
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
