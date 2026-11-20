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
      if (locale !== "en") assert.notEqual(PROFILE_TRANSLATIONS[locale][key], key,
        locale + " leaves profile.html text untranslated: " + key);
    }
  }
});
