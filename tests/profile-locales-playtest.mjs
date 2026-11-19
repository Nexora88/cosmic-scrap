import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { PROFILE_LOCALES, PROFILE_NAMES, PROFILE_TRANSLATIONS, PROFILE_TRANSLATION_KEYS } from "../js/profile-translations.js";

const baseURL = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const html = await readFile(new URL("../profile.html", import.meta.url), "utf8");
const normalize = value => String(value || "").replace(/\\s+/g, " ").trim();

for (const locale of PROFILE_LOCALES) {
  assert.ok(PROFILE_NAMES[locale], "missing full language name for " + locale);
  for (const key of PROFILE_TRANSLATION_KEYS) {
    assert.ok(Object.hasOwn(PROFILE_TRANSLATIONS[locale] || {}, key), locale + " missing profile translation: " + key);
    assert.ok(PROFILE_TRANSLATIONS[locale][key], locale + " has empty profile translation: " + key);
  }
}
for (const match of html.matchAll(/data-en="([^"]+)"/g)) {
  for (const locale of PROFILE_LOCALES) assert.ok(Object.hasOwn(PROFILE_TRANSLATIONS[locale], match[1]), locale + " missing HTML copy: " + match[1]);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 900 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const page = await context.newPage();
    page.on("console", message => { if (message.type() === "error" && !message.text().includes("esm.sh")) throw new Error(message.text()); });
    await page.route("https://esm.sh/@supabase/supabase-js@2", route => route.fulfill({
      status: 200, contentType: "application/javascript",
      body: 'export function createClient(){return {auth:{getSession:async()=>({data:{session:null},error:null})}}}'
    }));
    for (const locale of PROFILE_LOCALES) {
      await page.goto(new URL("profile.html", baseURL).href, { waitUntil: "domcontentloaded" });
      await page.evaluate(code => localStorage.setItem("cosmic-scrap-language", code), locale);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#connection").waitFor();
      await page.waitForFunction(() => document.documentElement.lang === localStorage.getItem("cosmic-scrap-language"));
      await page.waitForFunction(expected => document.querySelector("#connection")?.textContent === expected,
        PROFILE_TRANSLATIONS[locale]["SIGN IN THROUGH THE GAME TO LOAD YOUR PROFILE."]);
      const rendered = await page.locator("[data-en]").evaluateAll(nodes => nodes
        .filter(node => !["connection","pilot-handle","form-status"].includes(node.id))
        .map(node => ({ source: node.dataset.en, text: node.textContent, level: node.dataset.level || null })));
      for (const item of rendered) {
        const expected = PROFILE_TRANSLATIONS[locale][item.source] + (item.level ? " · " + PROFILE_TRANSLATIONS[locale]["LEVEL"] + " " + item.level : "");
        assert.equal(normalize(item.text), normalize(expected),
          viewport.width + "px " + locale + " profile copy mismatch: " + item.source);
      }
      assert.equal(await page.locator("#connection").innerText(), PROFILE_TRANSLATIONS[locale]["SIGN IN THROUGH THE GAME TO LOAD YOUR PROFILE."]);
      assert.equal(await page.locator("#pilot-handle").innerText(), PROFILE_TRANSLATIONS[locale]["Sign in from the game first, then open this page again."]);
      assert.equal(await page.locator("#language-toggle").innerText(), PROFILE_NAMES[locale] + " ↻");
      assert.equal(await page.locator("#language-toggle").getAttribute("aria-label"), PROFILE_TRANSLATIONS[locale]["Language"] + ": " + PROFILE_NAMES[locale]);
      assert.equal(await page.locator("#score-card-image").getAttribute("alt"), PROFILE_TRANSLATIONS[locale]["TAVIRO score card preview"]);
      assert.equal(await page.title(), PROFILE_TRANSLATIONS[locale]["TAVIRO · Pilot Profile"]);
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), PROFILE_TRANSLATIONS[locale]["Customize your TAVIRO pilot profile, trophies and shared leaderboard progress."]);
      const options = await page.locator("#avatar option[data-en]").allTextContents();
      assert.ok(options.every(value => value.includes(PROFILE_TRANSLATIONS[locale]["LEVEL"])), locale + " cosmetic options were not translated");
      const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(width.scroll <= width.client + 1, viewport.width + "px " + locale + " profile horizontal overflow: " + JSON.stringify(width));
      await page.locator("#language-toggle").click();
      const next = PROFILE_LOCALES[(PROFILE_LOCALES.indexOf(locale) + 1) % PROFILE_LOCALES.length];
      assert.equal(await page.locator("html").getAttribute("lang"), next, "language switch did not advance from " + locale);
      assert.equal(await page.locator("#language-toggle").innerText(), PROFILE_NAMES[next] + " ↻");
    }
    await context.close();
  }

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.route("https://esm.sh/**", route => route.abort());
  await offlinePage.goto(new URL("profile.html", baseURL).href, { waitUntil: "domcontentloaded" });
  await offlinePage.evaluate(() => localStorage.setItem("cosmic-scrap-language", "ja"));
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  assert.equal(await offlinePage.locator("html").getAttribute("lang"), "ja");
  assert.equal(await offlinePage.locator("#social-heading").innerText(), PROFILE_TRANSLATIONS.ja["Share your flight record"],
    "profile localization must work even when the optional account CDN is unavailable");
  await offlinePage.waitForFunction(expected => document.querySelector("#connection")?.textContent === expected,
    PROFILE_TRANSLATIONS.ja["Could not load profile. Check your connection and try again."]);
  assert.equal(await offlinePage.locator("#pilot-handle").innerText(), PROFILE_TRANSLATIONS.ja["Sign in from the game first, then open this page again."]);
  await offlineContext.close();
  console.log("Profile localization passed: 9 locales × 2 viewports; full language names, persistence, options, overflow and offline locale UI verified.");
} finally {
  await browser.close();
}
