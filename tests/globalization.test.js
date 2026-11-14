import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const language = await readFile(new URL("../js/language.js", import.meta.url), "utf8");
const account = await readFile(new URL("../js/cloud-account.js", import.meta.url), "utf8");
const online = await readFile(new URL("../js/online-hub.js", import.meta.url), "utf8");
const migrations = await readFile(new URL("../supabase/migrations/202611140001_country_score_leaderboard.sql", import.meta.url), "utf8");

test("all nine language choices are available in settings and first-run welcome", () => {
  for (const code of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    assert.match(html, new RegExp('option value="' + code + '"'));
    assert.ok(language.includes('code:"' + code + '"'), "missing locale metadata for " + code);
  }
  assert.match(language, /WELCOME, PILOT\./);
  assert.match(language, /cosmic-scrap-language-selected/);
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
  assert.doesNotMatch(account, /cosmic-scrap:flag-changed/);
});

test("global leaderboard has separate pilot and country tabs backed by country aggregate RPC", () => {
  assert.match(html, /id="global-ranking-players"/);
  assert.match(html, /id="global-ranking-countries"/);
  assert.match(online, /get_country_score_leaderboard/);
  assert.match(migrations, /create or replace function public\.get_country_score_leaderboard/);
  assert.match(migrations, /sum\(r\.best_score\)/);
});
