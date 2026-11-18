import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { translations } from "../js/language.js";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");
const LOCALES = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];

test("first-release announcement and leaderboard trust copy exist in all nine locales", () => {
  const keys = [
    "FUTURE UPDATE",
    "CO-OP · COMING SOON",
    "Co-op is planned for a future update. The first release focuses on solo survival.",
    "Ranked results are server-simulated. Casual records are player-reported and are not replay-verified.",
    "YENİLE ↻"
  ];
  for (const locale of LOCALES) {
    assert.ok(translations[locale], "missing locale " + locale);
    for (const key of keys) {
      assert.equal(typeof translations[locale][key], "string", locale + " missing " + key);
      assert.ok(translations[locale][key].trim(), locale + " has empty " + key);
      if (locale !== "en") assert.notEqual(translations[locale][key], key, locale + " has untranslated " + key);
    }
  }
});

test("first release exposes a Co-op announcement but does not load the inactive client", async () => {
  const html = await read("index.html");
  const hub = await read("js/online-hub.js");
  assert.match(html, /class="coop-coming-soon"/);
  assert.match(html, /CO-OP · COMING SOON/);
  assert.doesNotMatch(html, /css\/coop\.css/);
  assert.doesNotMatch(html, /Sign in to use Co-op/);
  assert.doesNotMatch(hub, /import ["']\.\/ui\/CoopClient\.js["']/);
  // The implementation is retained for a later release, not deleted from the repository.
  assert.ok((await read("js/ui/CoopClient.js")).includes("CO-OP WITH A FRIEND"));
});

test("privacy and support describe Co-op as unavailable in the first release in all nine locales", async () => {
  const privacy = await read("privacy.html");
  const support = await read("support.html");
  const oldPrivacyKey = "Account: email address and session information managed by Supabase Auth. Pilot profile: username, represented country and optional profile image, which may be public in shared rankings. Game progress: level, XP, achievements, run summaries, scores and cosmetic inventory. Online features: Ranked results and Co-op room, participant and match-result details. Device data: language, audio and accessibility preferences, offline save and local cosmetic preferences.";
  const oldSupportKey = "Offline single-player mode can be used without an account. Cloud saves and Co-op require an internet connection and a signed-in account. Co-op beta features depend on connection and server status. The web version and native Android/iOS packages are not at the same verification stage.";
  assert.ok(privacy.includes(oldPrivacyKey));
  assert.ok(support.includes(oldSupportKey));
  assert.deepEqual(LEGAL_LOCALES, LOCALES);
  for (const locale of LOCALES) {
    assert.ok(LEGAL_TRANSLATIONS[locale][oldPrivacyKey], locale + " missing privacy scope translation");
    assert.ok(LEGAL_TRANSLATIONS[locale][oldSupportKey], locale + " missing support scope translation");
    if (locale !== "en") {
      assert.notEqual(LEGAL_TRANSLATIONS[locale][oldPrivacyKey], oldPrivacyKey);
      assert.notEqual(LEGAL_TRANSLATIONS[locale][oldSupportKey], oldSupportKey);
    }
  }
  assert.doesNotMatch(support, /Co-op beta features depend on connection/);
});

test("profile page and profile runtime support all nine locale choices", async () => {
  const profile = await read("profile.js");
  assert.match(profile, /const LOCALES=\["en","tr","pt-BR","es","ru","id","de","fr","ja"\]/);
  assert.match(profile, /function localized\(source,lang=language\(\)\)/);
  assert.match(profile, /translations\[lang\]/);
});

test("music and mobile automation are correctly described as browser checks, not device certification", async () => {
  const music = await read("js/systems/Music.js");
  const musicTest = await read("tests/music-playtest.mjs");
  const mobileTest = await read("tests/mobile-playtest.mjs");
  const status = await read("docs/RELEASE-VALIDATION-STATUS.md");
  assert.match(music, /audio\.loop = true/);
  assert.match(music, /nextAudio\.loop = !oneShot/);
  assert.match(musicTest, /waitForAudibleTrack/);
  assert.match(mobileTest, /Chromium emulation; not physical Android hardware/);
  assert.match(status, /Physical-device sign-off/);
  assert.match(status, /30-minute session/);
});

test("README states the organic launch plan and score-integrity limits", async () => {
  const readme = await read("README.md");
  assert.match(readme, /community and word of mouth/i);
  assert.match(readme, /No custom domain has been purchased/);
  assert.match(readme, /not replay-verified/);
  assert.match(readme, /must never be described as cheat-proof/);
  assert.match(readme, /Co-op is intentionally outside the first-release scope/);
});

test("live galaxy HUD and document metadata are localized in all nine locales", async () => {
  const hud = await read("js/ui/HUD.js");
  const profile = await read("profile.js");
  const regionKeys = ["GALAXY","DEBRIS BELT","EMBER NEBULA","CRYO EXPANSE","RIFT FIELDS","STARFORGE","NOVA REACH","ECLIPSE VEIL","BLACK HOLE TRANSIT"];
  for (const locale of LOCALES) {
    for (const key of regionKeys) {
      assert.ok(translations[locale][key], locale + " missing region label " + key);
      if (locale !== "en") assert.notEqual(translations[locale][key], key);
    }
    assert.ok(translations[locale]["TAVIRO — Endless Space Survival"]);
    assert.ok(translations[locale]["Pilot Profile"]);
  }
  assert.match(hud, /translateText\("GALAXY"\)/);
  assert.match(hud, /translateText\(g\.region\.name\.en\)/);
  assert.match(profile, /localized\("Pilot Profile",lang\)/);
});
