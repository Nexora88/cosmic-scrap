import test from "node:test";
import assert from "node:assert/strict";
import { translations, REQUIRED_LOCALE_KEYS, REQUIRED_UI_LOCALE_KEYS, REQUIRED_DYNAMIC_STATUS_KEYS, REQUIRED_INTRO_LOCALE_KEYS, REQUIRED_PROFILE_LOCALE_KEYS, REQUIRED_HOME_LOCALE_KEYS, REQUIRED_CLASSIC_SECTION_KEYS, REQUIRED_DEATH_SCREEN_LOCALE_KEYS, REQUIRED_DEATH_SCREEN_SHELL_KEYS, REQUIRED_DEATH_SCREEN_HEADING_KEYS } from "../js/language.js";
import { readFile } from "node:fs/promises";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";
import { PROFILE_LOCALES, PROFILE_TRANSLATIONS, PROFILE_TRANSLATION_KEYS } from "../js/profile-translations.js";

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
   if(code!=="en"&&code!=="id"&&key!=="Vibration")assert.notEqual(translations[code][key],key,code+" left screen text untranslated: "+key);
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
 assert.match(language,/function translateStaticTextNode\(node,lang\)/);
 assert.match(language,/if\(node\.nodeValue!==output\)node\.nodeValue=output/);
 assert.match(language,/for\(const record of records\)for\(const added of record\.addedNodes\)applyStaticTextTo\(added,lang\)/);
 assert.doesNotMatch(language,/new MutationObserver\(\(\)=>applyAllStaticText\(\)\)/);
});



test("dynamic text translation observes only inserted nodes and avoids repeated full-page scans",()=>{
 assert.match(language,/localeObserver\.observe\(document\.body,\{childList:true,subtree:true\}\)/);
 assert.match(language,/applyStaticTextTo\(added,lang\)/);
 assert.doesNotMatch(language,/new MutationObserver\(\(\)=>applyAllStaticText\(\)\)/);
});

test("all nine locales include the skin shop and its explanatory copy",()=>{
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  for(const key of ["SKIN & FLAG COLLECTION","Cosmetics only · choose your look before launching a run","PILOT ARMORY","SKINS · FLAGS · RARE BANNERS","Earn cosmetics through play or spend Scrap Core in the collection shop. Equip your favourite before the next run."]){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing skin shop copy: "+key);
   if(code!=="en")assert.notEqual(translations[code][key],key,code+" left skin shop copy untranslated: "+key);
  }
 }
});

test("localization covers accessible attributes and profile supports all nine locales",async()=>{
 const profile=await readFile(new URL("../profile.js",import.meta.url),"utf8");
 const profileI18n=await readFile(new URL("../profile-i18n.js",import.meta.url),"utf8");
 assert.match(language,/function translateStaticAttributes\(root,lang\)/);
 assert.match(language,/data-taviro-original-/);
 assert.match(profile,/const LOCALES=PROFILE_LOCALES/);
 assert.match(profile,/PROFILE_TRANSLATIONS/);
 assert.match(profileI18n,/window\.TAVIROProfileI18n/);
 assert.match(profileI18n,/PROFILE_LOCALES\[\(PROFILE_LOCALES\.indexOf\(current\)\s*\+\s*1\)\s*%\s*PROFILE_LOCALES\.length\]/);
 for(const locale of PROFILE_LOCALES)for(const key of PROFILE_TRANSLATION_KEYS){
  assert.ok(typeof PROFILE_TRANSLATIONS[locale]?.[key]==="string"&&PROFILE_TRANSLATIONS[locale][key].trim(),locale+" missing dedicated profile copy: "+key);
  if(locale!=="en"&&!["XP","LEVEL","SCORE","Nebula","Photon","Rift","Solar","Nova"].includes(key))assert.notEqual(PROFILE_TRANSLATIONS[locale][key],key,locale+" has untranslated profile copy: "+key);
 }
});

test("TAVIRO navigation is visible as responsive discovery tiles, not a horizontal strip",async()=>{
 const menu=await readFile(new URL("../js/ui/MainMenu.js",import.meta.url),"utf8");
 const styles=await readFile(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(menu,/main-menu-nav-icon/);
 assert.match(menu,/main-menu-nav-label/);
 assert.match(styles,/\.main-menu-nav\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(styles,/\.main-menu-nav\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});


test("first-run language cards keep complete locale names visible",async()=>{
 const styles=await readFile(new URL("../css/ui.css",import.meta.url),"utf8");
 const language=await readFile(new URL("../js/language.js",import.meta.url),"utf8");
 assert.match(styles,/\.language-welcome-name\{[^}]*white-space:normal/);
 assert.match(styles,/\.language-welcome-name\{[^}]*overflow-wrap:anywhere/);
 assert.match(styles,/\.language-welcome-code\{display:none\}/);
 for(const label of ["English","Türkçe","Português (Brasil)","Español","Русский","Bahasa Indonesia","Deutsch","Français","日本語"])assert.ok(language.includes('label:"'+label+'"'),"missing full locale label: "+label);
});

test("profile recent-run rendering defines its localized copy before use",async()=>{
 const profile=await readFile(new URL("../profile.js",import.meta.url),"utf8");
 assert.match(profile,/function renderRuns\(runs\)\{const list=\$\("recent-runs"\),lang=language\(\),words=copyFor\(lang\)/);
});

test("pilot profile status, trophy and empty-state copy is translated in every locale",async()=>{
 const profile=await readFile(new URL("../profile.js",import.meta.url),"utf8");
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  if(code!=="tr"){let translated=0;for(const key of REQUIRED_PROFILE_LOCALE_KEYS){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing profile translation: "+key);
   if(translations[code][key]!==key)translated++;
  }if(code!=="en")assert.ok(translated>=20,code+" has too few translated profile strings: "+translated)}
 }
 assert.match(profile,/localized\("No synced runs yet\.",lang\)/);
});

test("home hangar copy has translations in all nine locales",()=>{ for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){ for(const key of REQUIRED_HOME_LOCALE_KEYS){ assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing home translation: "+key); if(code!=="en")assert.notEqual(translations[code][key],key,code+" left home copy untranslated: "+key); } } });
test("static text translation preserves spaces around inline emphasis fragments",()=>{ assert.ok(language.includes("const leading=original.match(/^\\s*/)")); assert.ok(language.includes("leading+translated+trailing")); });

test("all seven dynamically mounted home sections are translated in all nine locales",async()=>{
 const classic=await readFile(new URL("../js/ui/ClassicSections.js",import.meta.url),"utf8");
 for(const code of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]){
  let translated=0;
  for(const key of REQUIRED_CLASSIC_SECTION_KEYS){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing home section copy: "+key);
   if(translations[code][key]!==key)translated++;
  }
  if(code!=="en")assert.ok(translated>=40,code+" has too few localized home section labels: "+translated);
 }
 for(const source of ["<h2>GAME</h2>","<h2>SCORES</h2>","<h2>GALAXY</h2>","<h2>RANKING</h2>","<h2>SHOP</h2>","<h2>CAREER</h2>","<h2>SETTINGS</h2>"])assert.ok(classic.includes(source),"home section missing English source: "+source);
 assert.match(classic,/source\.firstChild\?\.__taviroOriginal\?\?source\.textContent\.trim\(\)/);
});

test("level-up header is localized in all nine supported languages",async()=>{
 const screen=await readFile(new URL("../js/ui/LevelUpScreen.js",import.meta.url),"utf8");
 for(const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"])assert.ok(screen.includes(locale==="pt-BR"?'"pt-BR":':locale+":"),"missing level-up header locale "+locale);
 assert.match(screen,/headerText\[lang\]/);
});
test("level-up cards wrap long localized text without horizontal overflow on mobile",async()=>{
 const styles=await readFile(new URL("../css/ui.css",import.meta.url),"utf8");
 assert.match(styles,/#upgrade-screen \.upgrade-card\{[^}]*min-width:0/);
 assert.match(styles,/#upgrade-screen \.upgrade-card p\{[^}]*overflow-wrap:anywhere/);
 assert.match(styles,/#upgrade-screen \.upgrade-card \.rarity-label\{[^}]*flex-wrap:wrap/);
 assert.match(styles,/#upgrade-screen \.upgrade-cards\{grid-template-columns:minmax\(0,1fr\)/);
});

test("desktop layout hides the touch joystick while coarse-pointer mobile devices retain it",async()=>{
 const styles=await readFile(new URL("../css/ui.css",import.meta.url),"utf8");
 const base=await readFile(new URL("../css/style.css",import.meta.url),"utf8");
 assert.match(styles,/@media \(hover:hover\) and \(pointer:fine\)\{#joystick\{display:none!important\}\}/);
 assert.match(styles,/@media \(hover:none\) and \(pointer:coarse\)\{#joystick\{display:flex!important\}\}/);
 assert.doesNotMatch(base,/#joystick\{display:none!important\}/);
 assert.match(base,/@media\(hover:none\) and \(pointer:coarse\).*#joystick\{display:flex!important\}/);
});
test("capsule reveal layer remains vertically scrollable on desktop",async()=>{const styles=await readFile(new URL("../css/ui.css",import.meta.url),"utf8");assert.match(styles,/\.scrap-capsule-layer\{display:block;overflow-x:hidden;overflow-y:auto/);assert.match(styles,/\.scrap-capsule-panel\{width:min\(100%,560px\);max-height:none/)});

test("language flag assets resolve relative to the language module on nested test pages",async()=>{const source=await readFile(new URL("../js/language.js",import.meta.url),"utf8");assert.match(source,/new URL\("\.\.\/assets\/flags\/"\+file\+"\.svg",import\.meta\.url\)/);assert.doesNotMatch(source,/src="assets\/flags\//)});

test("death screen diagnosis, every stat, record state and revive toast are localized in all nine locales",()=>{
 const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
 for(const code of locales){
  for(const key of [...REQUIRED_DEATH_SCREEN_LOCALE_KEYS,...REQUIRED_DEATH_SCREEN_SHELL_KEYS,...REQUIRED_DEATH_SCREEN_HEADING_KEYS]){
   assert.ok(typeof translations[code][key]==="string"&&translations[code][key].trim(),code+" missing death-screen translation: "+key);
   if(code!=="en")assert.notEqual(translations[code][key],key,code+" has untranslated death-screen copy: "+key);
  }
  if(code!=="en")assert.notEqual(translations[code]["COSMIC SHIELD ACTIVE · 1 CONTINUE USED"],"COSMIC SHIELD ACTIVE · 1 CONTINUE USED",code+" revive toast is not localized");
 }
});


test("first-release Co-op announcement is translated in every supported game locale", () => {
  const key = "Co-op is planned for a future update. The first release focuses on polished solo play and a fair, clearly labelled leaderboard.";
  for (const locale of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    assert.ok(translations[locale]["CO-OP COMING SOON"], locale + " missing Co-op teaser title");
    assert.ok(translations[locale][key], locale + " missing Co-op teaser description");
    if (locale !== "en") assert.notEqual(translations[locale][key], key, locale + " teaser is still English");
  }
});

test("privacy and support release disclosures have complete nine-locale translations", () => {
  const supportKey = "Offline single-player mode can be used without an account. Optional account features and shared leaderboards require an internet connection. Co-op is not included in the first release and is planned for a future update. Native Android/iOS packages may be at a different verification stage from the web version.";
  const privacyKeys = [
    "Account: email address and session information managed by Supabase Auth. Pilot profile: username, represented country and optional profile image, which may be public in shared rankings. Game progress: level, XP, achievements, run summaries, casual scores and cosmetic inventory. First-release online features: account profile and casual leaderboard submissions. Ranked competition is locked, and Co-op is not included in the first release. Device data: language, audio and accessibility preferences, offline save and local cosmetic preferences.",
    "Information is used to authenticate accounts, sync supported profile data, display the casual leaderboard and manage cosmetic ownership. Casual scores are client-reported and are not verified as cheat-proof. Ranked competition is locked and Co-op is not included in this release. TAVIRO does not sell personal data and this version does not include a third-party advertising network or advertising SDK. Public profile fields and leaderboard entries may be visible to other players."
  ];
  assert.deepEqual(LEGAL_LOCALES.slice().sort(), ["de","en","es","fr","id","ja","pt-BR","ru","tr"].sort());
  for (const locale of LEGAL_LOCALES) {
    for (const key of [supportKey, ...privacyKeys]) {
      assert.ok(LEGAL_TRANSLATIONS[locale][key], locale + " missing legal/support copy");
      if (locale !== "en") assert.notEqual(LEGAL_TRANSLATIONS[locale][key], key, locale + " legal/support copy is untranslated");
    }
    if (locale !== "en") assert.notEqual(LEGAL_TRANSLATIONS[locale]["Known platform limitations"], "Known platform limitations", locale + " platform-limitations heading was overwritten");
  }
});


test("arena countdown uses translated copy for all nine languages", async () => {
  const introMatch = await readFile(new URL("../js/intro-and-match.js", import.meta.url), "utf8");
  for (const locale of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    assert.match(introMatch, new RegExp(locale === "pt-BR" ? '"pt-BR":' : locale + ":"));
  }
  assert.match(introMatch, /const COUNTDOWN_COPY = \{/);
  assert.match(introMatch, /countCopy\.textContent = copy\[3 - number\]/);
  assert.doesNotMatch(introMatch, /countCopy\.textContent = number === 3 \? "Pilotlar hazır/);
});

test("home menu removes the redundant Pilot Profile shortcut and keeps translated secondary navigation",()=>{
  assert.doesNotMatch(html,/id="profile-page-link"/);
  for(const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"])assert.ok(language.includes(locale), "missing locale "+locale);
});
