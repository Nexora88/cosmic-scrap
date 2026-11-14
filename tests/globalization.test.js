import test from "node:test";
import assert from "node:assert/strict";
import { translations, REQUIRED_LOCALE_KEYS, REQUIRED_UI_LOCALE_KEYS, REQUIRED_DYNAMIC_STATUS_KEYS, REQUIRED_INTRO_LOCALE_KEYS } from "../js/language.js";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const language = await readFile(new URL("../js/language.js", import.meta.url), "utf8");
const account = await readFile(new URL("../js/cloud-account.js", import.meta.url), "utf8");
const online = await readFile(new URL("../js/online-hub.js", import.meta.url), "utf8");
const migrations = await readFile(new URL("../supabase/migrations/202611140001_country_score_leaderboard.sql", import.meta.url), "utf8");
const taviroLogo = await readFile(new URL("../assets/taviro-logo.svg", import.meta.url), "utf8");
const taviroMark = await readFile(new URL("../assets/taviro-mark.svg", import.meta.url), "utf8");
const uiCss = await readFile(new URL("../css/ui.css", import.meta.url), "utf8");

test("TAVIRO brand assets are present and the game uses the mark as its favicon", () => {
  assert.match(html, /<title>TAVIRO/);
  assert.match(html, /assets\/taviro-mark\.svg/);
  assert.match(html, /class="logo-square taviro-logo-emblem"><img src="assets\/taviro-logo\.svg"/);
  assert.match(uiCss, /#overlay \.taviro-logo-emblem img\{display:block;width:min\(76vw,390px\)/);
  assert.match(taviroLogo, /<title id="title">TAVIRO<\/title>/);
  assert.match(taviroMark, /aria-label="TAVIRO emblem"/);
  assert.doesNotMatch(language, /NEXORA · INDEPENDENT GAME/);
});

test("all nine language choices are available in settings and first-run welcome", () => {
  for (const code of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    assert.match(html, new RegExp('option value="' + code + '"'));
    assert.ok(language.includes('code:"' + code + '"'), "missing locale metadata for " + code);
  }
  assert.match(language, /WELCOME, PILOT\./);
  assert.match(language, /cosmic-scrap-language-selected/);
  assert.match(html, /id="home-language-select"/);
  assert.match(language, /home-language-select/);
});

test("language preference is persistent and language switch cycles every supported locale", () => {
  assert.match(language, /localeMeta\.map\(item=>item\.code\)/);
  assert.match(language, /localStorage\.setItem\("cosmic-scrap-language"/);
  assert.match(language, /language-changed/);
});

test("representative country is chosen during signup and editable in the profile", () => {
  assert.match(html, /id="account-signup-country"/);
  assert.match(html, /id="account-country"/);
  assert.match(account, /country_code: \$\("account-signup-country"\)\?\.value/);
  assert.match(account, /country_code: \$\("account-country"\)\?\.value/);
  assert.match(account, /cosmic-scrap:flag-changed/);
  assert.match(account, /cosmic-scrap-flag/);
});

test("country selection supports the full ISO alpha-2 country set", () => {
  assert.match(account, /const ISO_COUNTRY_CODES=/);
  assert.match(account, /ISO_COUNTRY_CODES\.map\(code=>/);
  assert.match(account, /select\.replaceChildren\(\.\.\.options\)/);
  const codes = account.match(/const ISO_COUNTRY_CODES="([^"]+)"/)?.[1]?.split(" ") || [];
  assert.ok(codes.length >= 240, "country selector should cover the full international country set");
  assert.equal(new Set(codes).size, codes.length, "country codes must be unique");
});

test("global leaderboard has separate pilot and country tabs backed by country aggregate RPC", () => {
  assert.match(html, /id="global-ranking-players"/);
  assert.match(html, /id="global-ranking-countries"/);
  assert.match(online, /get_country_score_leaderboard/);
  assert.match(migrations, /create or replace function public\.get_country_score_leaderboard/);
  assert.match(migrations, /sum\(r\.best_score\)/);
});

test("all nine locales translate the complete primary menu and navigation copy", () => {
  for (const code of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    const dictionary = translations[code];
    assert.ok(dictionary, "missing translation dictionary for " + code);
    for (const key of REQUIRED_LOCALE_KEYS) {
      assert.ok(typeof dictionary[key] === "string" && dictionary[key].length > 0, code + " is missing translation: " + key);
      if (code !== "en") assert.notEqual(dictionary[key], key, code + " has untranslated copy: " + key);
    }
  }
});

test("all locales translate the live gameplay HUD labels", () => {
  for (const code of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    for (const key of ["TIME", "LEVEL", "SCORE", "CORE", "SCRAP", "COMBO", "ACTIVE DIRECTIVE", "STORM KILLS"]) {
      assert.ok(translations[code][key], code + " is missing HUD label: " + key);
    }
  }
});

test("mobile hangar and HUD have dedicated non-overflow layout rules", () => {
  assert.match(uiCss, /#overlay\{display:block;padding:8px;overflow-x:hidden;overflow-y:auto/);
  assert.match(uiCss, /\.bottom-hud\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(uiCss, /\.bottom-hud \.health-wrap,\.bottom-hud \.xp-wrap\{min-width:0;width:100%/);
});

test("old square tagline is removed and the core tagline is present", () => {
  assert.match(html, /One core\. Infinite void\./);
  assert.doesNotMatch(html, /One square\. Infinite void\./);
  assert.match(language, /One core\. Infinite void\./);
  assert.doesNotMatch(language, /One square\. Infinite void\./);
});

test("settings, account, career and all secondary navigation copy exists in every locale",()=>{
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  for(const key of REQUIRED_UI_LOCALE_KEYS){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing screen translation: "+key);
   if(code!=="en"&&code!=="id")assert.notEqual(translations[code][key],key,code+" left screen text untranslated: "+key);
  }
 }
});
test("full TAVIRO orbit wordmark is used in intro and gameplay HUD",()=>{
 assert.ok(html.includes('brand-mark taviro-brand-mark" src="assets/taviro-logo.svg"'));
 assert.ok(html.includes('taviro-intro-emblem" aria-hidden="true"><img src="assets/taviro-logo.svg"'));
});

test("dynamic account and cloud status copy is translated in every supported locale",()=>{
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  for(const key of REQUIRED_DYNAMIC_STATUS_KEYS){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing dynamic status: "+key);
   if(code!=="en")assert.notEqual(translations[code][key],key,code+" has untranslated status: "+key);
  }
 }
});

test("cinematic intro and match-entry copy is translated in all nine locales",()=>{
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  for(const key of REQUIRED_INTRO_LOCALE_KEYS){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing intro translation: "+key);
   if(code!=="en"&&code!=="tr")assert.notEqual(translations[code][key],key,code+" missing translated intro copy: "+key);
  }
 }
});

test("locale switching preserves text-node identity and original English source",()=>{
 assert.match(language,/node\.nodeValue=lang==="en"\?node\.__csEnglish/);
 assert.match(language,/node\.nodeValue=lead\+translated\+tail/);
 assert.match(language,/node\.__taviroOriginal=node\.__csEnglish\?\?node\.textContent/);
});
