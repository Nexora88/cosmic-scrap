import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ABOUT_TRANSLATIONS } from "../js/about-translations.js";

const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
const page=fs.readFileSync(new URL("../about.html",import.meta.url),"utf8");
const home=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const language=fs.readFileSync(new URL("../js/language.js",import.meta.url),"utf8");

test("About page has complete matching copy in all nine locales",()=>{
 const keys=Object.keys(ABOUT_TRANSLATIONS.en).sort();
 for(const locale of locales){
  assert.ok(ABOUT_TRANSLATIONS[locale], "missing locale "+locale);
  assert.deepEqual(Object.keys(ABOUT_TRANSLATIONS[locale]).sort(),keys,"incomplete About copy for "+locale);
  for(const key of keys) assert.ok(ABOUT_TRANSLATIONS[locale][key],"empty About translation "+locale+": "+key);
 }
 assert.match(page,/data-i18n="Science, curiosity and the sky"/);
 assert.match(page,/data-i18n="Created by Ahmet Eymen Bakraç · Independent Turkish Developer"/);
});

test("home page links About beside Privacy and Support and includes the creator credit",()=>{
 assert.match(home,/href="\.\/about\.html"/);
 assert.match(home,/href="\.\/privacy\.html"/);
 assert.match(home,/href="\.\/support\.html"/);
 assert.match(home,/Created by Ahmet Eymen Bakraç · Independent Turkish Developer/);
 assert.match(home,/Atatürk's vision for the Republic placed science, education and progress/);
 for(const locale of locales) {
  const marker = locale==="pt-BR" ? 'Object.assign(translations["pt-BR"]' : 'Object.assign(translations.'+locale;
  assert.ok(language.includes(marker),"missing footer locale "+locale);
 }
});
