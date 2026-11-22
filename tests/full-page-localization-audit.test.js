import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { translations } from "../js/language.js";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";
import { ABOUT_TRANSLATIONS } from "../js/about-translations.js";
import { PROFILE_LOCALES, PROFILE_TRANSLATIONS } from "../js/profile-translations.js";

const locales = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];
const read = async (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const attrValues = (html, name) => [...html.matchAll(new RegExp(name + '="([^"]+)"', "g"))].map((match) => match[1]);

test("all public HTML pages declare a valid locale-aware translation entry point", async () => {
  const pages = ["index.html", "about.html", "privacy.html", "support.html", "profile.html", "community.html"];
  for (const path of pages) {
    const html = await read(path);
    assert.match(html, /<html[^>]*lang="en"/i, path + " must declare a fallback document language");
    assert.match(html, /<title[^>]*>[^<]+<\/title>/i, path + " must have a page title");
  }
  assert.match(await read("index.html"), /js\/language\.js/);
  for (const path of ["about.html", "privacy.html", "support.html"]) {
    assert.match(await read(path), /js\/legal-pages\.js/);
  }
  assert.match(await read("profile.html"), /profile-i18n\.js/);
  assert.match(await read("community.html"), /data-copy/);
});

test("every static data-i18n key used by the game shell exists in all nine game dictionaries", async () => {
  const html = await read("index.html");
  const keys = [...new Set(attrValues(html, "data-i18n"))];
  assert.ok(keys.length > 0, "game shell should expose translation keys");
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing index.html translation: " + key);
      if (locale !== "en") assert.notEqual(translations[locale][key], key,
        locale + " leaves index.html text untranslated: " + key);
    }
  }
});

test("every legal and about page translation key exists in all nine locale dictionaries", async () => {
  const pages = ["about.html", "privacy.html", "support.html"];
  const keys = new Set();
  for (const path of pages) for (const key of attrValues(await read(path), "data-i18n")) keys.add(key);
  assert.ok(keys.size > 0);
  assert.deepEqual(LEGAL_LOCALES, locales);
  for (const locale of locales) {
    const dict = { ...LEGAL_TRANSLATIONS[locale], ...ABOUT_TRANSLATIONS[locale] };
    for (const key of keys) {
      assert.ok(typeof dict[key] === "string" && dict[key].trim(),
        locale + " is missing legal/about page translation: " + key);
      if (locale !== "en") assert.notEqual(dict[key], key,
        locale + " leaves legal/about page text untranslated: " + key);
    }
  }
});

test("every profile page translation key exists in all nine profile dictionaries", async () => {
  const html = await read("profile.html");
  const keys = [...new Set(attrValues(html, "data-en"))];
  assert.deepEqual(PROFILE_LOCALES, locales);
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof PROFILE_TRANSLATIONS[locale]?.[key] === "string" && PROFILE_TRANSLATIONS[locale][key].trim(),
        locale + " is missing profile.html translation: " + key);
      const acceptedUnchanged = new Set(["Nebula", "Photon", "Rift", "Solar", "Nova"]);
      if (locale !== "en" && !acceptedUnchanged.has(key)) assert.notEqual(PROFILE_TRANSLATIONS[locale][key], key,
        locale + " leaves profile.html text untranslated: " + key);
    }
  }
});


test("installation stays entirely in the browser UI with no in-game install copy or panel", async () => {
  const html = await read("index.html");
  const pwa = await read("js/pwa.js");
  const language = await read("js/language.js");
  assert.match(html, /id="pwa-install-button"/, "the home screen must expose the install entry point");
  assert.match(html, /id="pwa-install-status"/, "install guidance must have an accessible status region");
  assert.match(html, /js\/pwa\.js/, "the PWA install controller must load on the game page");
  assert.match(pwa, /beforeinstallprompt/, "native install prompt should be captured when supported");
  assert.match(pwa, /appinstalled/, "successful installation should update the UI");
  assert.match(pwa, /SamsungBrowser/, "Samsung Internet must receive manual install guidance");
  assert.doesNotMatch(pwa, /innerHTML|createElement\(["'](?:button|section|aside)["']\)/i);
  assert.doesNotMatch(language, /PWA INSTALL|INSTALL TAVIRO|PLAY ANYWHERE|TAKE TAVIRO OFFLINE/);
  assert.match(pwa, /navigator\.serviceWorker\.register/);
});


test("dynamic main-menu social entry and its description are localized in every locale", () => {
  const locales = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];
  const key = "Share your flight record and invite another pilot.";
  for (const locale of locales) {
    assert.ok(translations[locale]?.SOCIAL, locale + " is missing the SOCIAL navigation label");
    assert.ok(translations[locale]?.[key], locale + " is missing the SOCIAL navigation description");
  }
});

test("English source labels do not contain accidental foreign-language values", () => {
  assert.equal(translations.en.EMAIL, "EMAIL");
  assert.equal(translations.en.Vibration, "Vibration");
});


test("every bilingual game-shell label has a complete translation in all nine locales", async () => {
  const html = await read("index.html");
  const keys = [...new Set([
    ...attrValues(html, "data-i18n"),
    ...attrValues(html, "data-i18n-en")
  ])];
  assert.ok(keys.length >= 30, "the home screen should expose its full bilingual label inventory");
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing a home-screen translation: " + key);
      const acceptedUnchanged = new Set(["PULSE", "ORBIT", "CHAIN", "LVL 2"]);
      if (locale !== "en" && !acceptedUnchanged.has(key) && !(/^(?:LVL|LEVEL) \d+$/.test(key))) assert.notEqual(translations[locale][key], key,
        locale + " leaves home-screen text untranslated: " + key);
    }
  }
});


test("community page localizes its document metadata, language control and footer", async () => {
  const html = await read("community.html");
  for (const key of ["eyebrow","title","intro","gamesEyebrow","gamesTitle","gamesBody","gamesAction","sponsorEyebrow","sponsorTitle","sponsorBody","sponsorAction","moderation","languageLabel","back","privacy","footer"]) {
    assert.ok(html.includes('data-copy="' + key + '"'), "community page is missing " + key);
  }
  for (const locale of locales) {
    const localeRef = locale === "pt-BR" ? '\\["pt-BR"\\]' : '\\.' + locale;
    assert.match(html, new RegExp('Object\\.assign\\(copy' + localeRef + ','));
  }
  assert.match(html, /document\.title=dict\.pageTitle/);
  assert.match(html, /description\.content=dict\.metaDescription/);
  assert.doesNotMatch(html, /import \{translations\}/);
});


test("galaxy, sector, save, settings and loadout feedback is translated in all nine locales", async () => {
  const keys = [
    "GALAXY","SECTOR","NEW SECTOR: ","REGION CAPTURED · NEW FLAG: ",
    "VIBRATION NOT SUPPORTED BY THIS BROWSER","VIBRATION TEST SENT",
    "VIBRATION BLOCKED BY DEVICE OR BROWSER","SAVE EXPORTED",
    "Reset all progress on this device?","SAVE RESET","PLAYTEST LOG EXPORTED · ",
    "RUNS","NO RUNS LOGGED YET","EXPORT FAILED","MAX BUILD · CORE REINFORCED",
    "PULSE · BALANCED STRIKER","ORBIT · GUARDIAN / TWO SHARDS + ARMORED CORE",
    "CHAIN · ARC HUNTER / CRITICAL LIGHTNING","RAID · WAVE "
  ];
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing gameplay event translation: " + key);
      const unchangedCognate = locale === "es" && key === "SECTOR";
      if (locale !== "en" && !unchangedCognate) assert.notEqual(translations[locale][key], key,
        locale + " leaves gameplay event untranslated: " + key);
    }
  }
});

test("galaxy transitions use localized sector labels and only trigger discovery music on a galaxy change", async () => {
  const game = await read("js/core/Game.js");
  const music = await read("js/systems/Music.js");
  const tracks = await read("assets/sounds/README.md");
  assert.match(game, /translateText\("GALAXY"\)[\s\S]*translateText\("SECTOR"\)/);
  assert.match(game, /translateText\("NEW SECTOR: "\)\+translateText\(nextRegion\.name\.en\)/);
  assert.match(game, /if\(galaxyChanged\)this\.callbacks\.audio\?\.galaxyDiscovery\?\.\(\)/);
  assert.match(music, /discovery: "\.\/assets\/sounds\/unknown-planets\.mp3"/);
  assert.match(tracks, /Beyond the Belt is reserved for actual galaxy discoveries/);
  assert.match(music, /this\.playScene\("discovery", \{ temporary: true, duration: duration \|\| 8500 \}\)/);
});


test("loadout and flag collection UI copy is complete in every supported locale", () => {
  const keys = [
    "Balanced fire · steady damage · no major weakness",
    "GUARDIAN · 2 orbit blades · +20 core health · slower movement and lighter shots",
    "ARC HUNTER · 28% chain chance · +18% critical chance · lighter direct hits",
    "FREE FLIGHT · No objective or contract reward. Focus on survival and exploration.",
    "SALVAGE RUN · Collect 180 scrap during this run to earn +2 Scrap Core.",
    "ELITE HUNTER · Defeat an Elite boss in this run to earn +3 Scrap Core.",
    "STORMBREAKER · Eliminate 12 threats during a cosmic storm to earn +2 Scrap Core.",
    "COLLECTION · SCRAP CORE: ","UNLOCKED","EQUIPPED","OWNED","PILOT COSMETICS",
    "FLAG COLLECTION","POPULAR","COUNTRIES","RARE / SPECIAL","ALL",
    "Search a flag or country…","NOT ENOUGH CORE · COST: ","FLAG PURCHASE UNAVAILABLE",
    "ADDED TO COLLECTION: ","SPECIAL"
  ];
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing menu/flag-shop translation: " + key);
      const unchangedCognate = (locale === "pt-BR" || locale === "es") && key === "POPULAR";
      if (locale !== "en" && !unchangedCognate) assert.notEqual(translations[locale][key], key,
        locale + " leaves menu/flag-shop text untranslated: " + key);
    }
  }
});


test("run summary and capsule reward feedback have nine complete translations", () => {
  for (const locale of locales) {
    for (const key of ["DUPLICATE REWARD · ","SCRAP CORE","ANADOLU ATEŞİ · ","ADDED TO COLLECTION","KILLS","CORE +","NEW BEST SCORE"]) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing run summary translation: " + key);
      const unchangedProperName = locale === "tr" && key === "ANADOLU ATEŞİ · ";
      if (locale !== "en" && !unchangedProperName) assert.notEqual(translations[locale][key], key,
        locale + " leaves run summary text untranslated: " + key);
    }
  }
});


test("special banner names, contract progress and region hints have nine complete translations", async () => {
  const specialNames = [
    "Anadolu Ateşi","Pirate Fleet","Void Skull","Nebula","Comet","Arcade Invader",
    "UFO Squadron","Corsair","Dragon Banner","Deep Space Raider","Pioneer","Trident Guard",
    "Starfall","Solar Raiders","Explorer Guild","Phantom Fleet","Star Kraken","Void Serpent",
    "Solar Eagle","Lunar Wolves","Corsair Parrot","Frost Banner","Celestial Crown","Astral Eye",
    "Aurora Fleet","Ringworld","Blackout","Whiteout"
  ];
  const contractKeys = ["ENDLESS · NO OBJECTIVE","ELITE DEFEATED","ELITE NOT YET DEFEATED","SCRAP","STORM KILLS"];
  const regionHints = [
    "Keep moving. Learn the drift.","Fast threats cross your path.","Watch for long-range shots.",
    "Unstable enemies move in groups.","Hold steady through the final forge.",
    "A brighter frontier. Keep your rhythm.","The last frontier rewards calm movement."
  ];
  for (const locale of locales) {
    for (const key of [...specialNames, ...contractKeys, ...regionHints]) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing runtime translation: " + key);
      const unchangedProperName = (locale === "tr" || locale === "id") && key === "Nebula" || locale === "tr" && key === "Anadolu Ateşi";
      if (locale !== "en" && !unchangedProperName) assert.notEqual(translations[locale][key], key,
        locale + " leaves runtime text untranslated: " + key);
    }
  }
  const main = await read("js/main.js");
  const regions = await read("js/systems/Regions.js");
  assert.match(main, /translateText\(option\.label\)/);
  assert.match(main, /translateText\("ENDLESS · NO OBJECTIVE"\)/);
  for (const hint of regionHints) assert.ok(regions.includes(hint), "region source hint changed unexpectedly");
});


test("boss, rift and raid alerts plus boss victory banners are localized in all nine languages", async () => {
  const keys = [
    "RED ALERT · ELITE INBOUND","RED ALERT · ELITE SIGNATURE INBOUND",
    "BOSS WARNING · RIFT WEAVER","BOSS WARNING · STARBREAKER","BOSS WARNING · DEFAULT",
    "CONGRATULATIONS · BOSS DEFEATED","THE NEXT WAVE WILL BE STRONGER",
    "RIFT SURGE DETECTED","RIFT ZONES LIVE","RIFT SEALED",
    "BOSS DEFEATED - NEXT WAVE","BOSS DEFEATED - RUN CONTINUES",
    "GALAXY RAID · GET READY","RAID · WAVE ","RAID COMPLETE · +1 RAID TOKEN",
    "DIRECTIVE COMPLETE"
  ];
  for (const locale of locales) {
    for (const key of keys) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing combat alert translation: " + key);
      if (locale !== "en") assert.notEqual(translations[locale][key], key,
        locale + " leaves combat alert untranslated: " + key);
    }
  }
  const game = await read("js/core/Game.js");
  assert.match(game, /translateText\("CONGRATULATIONS · BOSS DEFEATED"\)/);
  assert.match(game, /translateText\("THE NEXT WAVE WILL BE STRONGER"\)/);
  assert.doesNotMatch(game, /localStorage\.getItem\("cosmic-scrap-language"\)==="tr"/);
});


test("boss alerts resolve through the selected locale and core-skin names stay localized when the equipped color changes", async () => {
  const game = await read("js/core/Game.js");
  const menu = await read("js/ui/MainMenu.js");
  const language = await read("js/language.js");
  for (const key of [
    "RED ALERT · ELITE SIGNATURE INBOUND",
    "BOSS WARNING · RIFT WEAVER",
    "BOSS WARNING · STARBREAKER",
    "BOSS WARNING · DEFAULT",
    "BOSS DEFEATED - NEXT WAVE",
    "BOSS DEFEATED - RUN CONTINUES",
    "CONGRATULATIONS · BOSS DEFEATED"
  ]) {
    assert.ok(game.includes('translateText("' + key + '")') || game.includes('translateText(bossMessageKey)'),
      "runtime boss alert must pass through translateText: " + key);
    for (const locale of locales) {
      assert.ok(typeof translations[locale]?.[key] === "string" && translations[locale][key].trim(),
        locale + " is missing boss alert: " + key);
      if (locale !== "en") assert.notEqual(translations[locale][key], key,
        locale + " leaves boss alert untranslated: " + key);
    }
  }
  assert.match(menu, /local-pilot-skin/);
  assert.match(menu, /translateText\(skinLabel\)/);
  for (const locale of locales) {
    for (const key of ["BLUE","MINT","VIOLET","AMBER","RED","GOLD"]) {
      assert.ok(translations[locale]?.[key], locale + " is missing localized core-skin name: " + key);
      const unchangedColorWord = (locale === "de" && key === "GOLD") || (locale === "fr" && key === "VIOLET");
      if (locale !== "en" && !unchangedColorWord) assert.notEqual(translations[locale][key], key,
        locale + " leaves core-skin name untranslated: " + key);
    }
  }
  assert.match(language, /cosmic-scrap:language-changed/);
});

test("reduced-flash accessibility setting does not disable haptic feedback", async () => {
  const main = await read("js/main.js");
  const start = main.indexOf("haptic(kind=");
  const end = main.indexOf("\n }", start);
  assert.ok(start >= 0 && end > start, "AudioSystem.haptic must exist");
  const haptic = main.slice(start, end);
  assert.doesNotMatch(haptic, /cosmic-scrap-reduced-flash/);
  assert.match(haptic, /navigator\.vibrate/);
  assert.match(main, /damage\(\)[\s\S]*this\.haptic\("damage"\)/);
});

test("service worker shell cache is bumped so updated localized game modules replace stale cached modules", async () => {
  const sw = await read("sw.js");
  assert.match(sw, /const CACHE_NAME = CACHE_PREFIX \+ "v22"/);
  assert.match(sw, /key !== CACHE_NAME/);
});
