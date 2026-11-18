import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";
import { ABOUT_TRANSLATIONS } from "../js/about-translations.js";

const privacy = await readFile(new URL("../privacy.html", import.meta.url), "utf8");
const support = await readFile(new URL("../support.html", import.meta.url), "utf8");
const about = await readFile(new URL("../about.html", import.meta.url), "utf8");
const runtime = await readFile(new URL("../js/legal-pages.js", import.meta.url), "utf8");
const localeNames = ["English","Türkçe","Português (Brasil)","Español","Русский","Bahasa Indonesia","Deutsch","Français","日本語"];

test("privacy and support pages expose a shared nine-language selector", () => {
  assert.deepEqual(LEGAL_LOCALES, ["en","tr","pt-BR","es","ru","id","de","fr","ja"]);
  for (const page of [privacy, support, about]) {
    assert.match(page, /id="legal-language"/);
    assert.match(page, /js\/legal-pages\.js/);
    assert.match(page, /data-i18n="Language"/);
    assert.match(page, /data-i18n="BACK TO GAME ↗"/);
  }
  for (const label of localeNames) assert.ok(runtime.includes(label), "missing locale label " + label);
});

test("every visible privacy page text key is translated in all nine locales", () => {
  const keys = [...privacy.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
  for (const locale of LEGAL_LOCALES) {
    const dictionary = LEGAL_TRANSLATIONS[locale];
    assert.ok(dictionary, "missing privacy locale " + locale);
    for (const key of keys) {
      assert.ok(typeof dictionary[key] === "string" && dictionary[key].trim(), locale + " missing privacy copy: " + key);
      if (locale !== "en") assert.notEqual(dictionary[key], key, locale + " has untranslated privacy copy: " + key);
    }
  }
});

test("every visible support page text key is translated in all nine locales", () => {
  const keys = [...support.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
  for (const locale of LEGAL_LOCALES) {
    const dictionary = LEGAL_TRANSLATIONS[locale];
    assert.ok(dictionary, "missing support locale " + locale);
    for (const key of keys) {
      assert.ok(typeof dictionary[key] === "string" && dictionary[key].trim(), locale + " missing support copy: " + key);
      if (locale !== "en") assert.notEqual(dictionary[key], key, locale + " has untranslated support copy: " + key);
    }
  }
});

test("legal page language changes persist and update the document language and metadata", () => {
  assert.match(runtime, /localStorage\.getItem\("cosmic-scrap-language"\)/);
  assert.match(runtime, /localStorage\.setItem\("cosmic-scrap-language",select\.value\)/);
  assert.match(runtime, /document\.documentElement\.lang=code/);
  assert.match(runtime, /meta\[name="description"\]/);
  assert.match(runtime, /LEGAL_TRANSLATIONS\[code\]/);
});

test("every visible About page text key is translated in all nine locales", () => {
  const keys = [...about.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
  for (const locale of LEGAL_LOCALES) {
    const dictionary = ABOUT_TRANSLATIONS[locale];
    assert.ok(dictionary, "missing About locale " + locale);
    for (const key of keys) {
      assert.ok(typeof dictionary[key] === "string" && dictionary[key].trim(), locale + " missing About copy: " + key);
      if (locale !== "en") assert.notEqual(dictionary[key], key, locale + " has untranslated About copy: " + key);
    }
  }
});
