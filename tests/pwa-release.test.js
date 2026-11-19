import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const registration = fs.readFileSync(new URL("../js/pwa.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const language = fs.readFileSync(new URL("../js/language.js", import.meta.url), "utf8");

test("TAVIRO has a relative, installable web-app manifest for GitHub Pages subpaths", () => {
  assert.equal(manifest.name, "TAVIRO — One core. Infinite void.");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.display_override.includes("standalone"));
  assert.ok(manifest.icons.some(icon => icon.purpose.includes("maskable")));
  assert.ok(manifest.icons.some(icon => icon.src === "assets/taviro-mark.svg" && icon.sizes === "any"));
  assert.ok(html.includes('rel="manifest" href="./manifest.webmanifest"'));
  assert.ok(html.includes("apple-mobile-web-app-capable"));
});

test("offline worker precaches the shell and falls back to the cached app on navigation", () => {
  for (const asset of ["./index.html","./profile.html","./privacy.html","./support.html","./about.html","./manifest.webmanifest","./css/style.css","./css/ui.css","./css/coop.css","./css/legal.css","./profile.css","./profile.js","./js/main.js","./js/systems/Loadouts.js","./js/systems/CapsuleLocale.js","./js/legal-pages.js","./js/legal-translations.js","./js/about-translations.js","./assets/taviro-logo.svg"]) {
    assert.ok(worker.includes('"'+asset+'"'), "missing shell asset "+asset);
  }
  assert.ok(worker.includes('const CACHE_NAME = CACHE_PREFIX + "v10";'));
  for (const track of ["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"]) assert.ok(worker.includes(track), "offline music missing: " + track);
  assert.ok(worker.includes("Promise.allSettled(MUSIC_ASSETS.map(asset => cache.add(asset)))"));
  assert.ok(worker.includes("mp3|ogg|wav|m4a"));
  assert.ok(worker.includes('request.mode === "navigate"'));
  assert.ok(worker.includes('caches.match("./index.html")'));
  assert.ok(worker.includes("url.origin !== self.location.origin"));
  assert.ok(worker.includes('request.method !== "GET"'));
});

test("service worker registration is secure-context only and scoped to the game directory", () => {
  assert.ok(registration.includes('location.protocol === "https:"'));
  assert.ok(registration.includes('navigator.serviceWorker.register("./sw.js", { scope: "./" })'));
  assert.ok(registration.includes("catch(error => console.warn"));
  assert.ok(registration.includes("beforeinstallprompt"));
  assert.ok(registration.includes("appinstalled"));
  assert.ok(html.includes('id="pwa-install"'));
  assert.ok(html.includes('id="pwa-install-settings"'));
  assert.ok(html.includes('src="js/pwa.js"'));
  for (const locale of ['en','tr','pt-BR','es','ru','id','de','fr','ja']) {
    const present = locale === "en" || locale === "tr"
      ? language.includes(locale + ":{")
      : language.includes("translations[" + JSON.stringify(locale) + "]");
    assert.ok(present, "missing PWA locale: " + locale);
  }
  for (const key of ["PWA_INSTALL_IOS","PWA_INSTALL_BROWSER","PWA_INSTALLING","PWA_INSTALL_CANCELLED","PWA_INSTALL_FAILED","PWA_INSTALLED"]) {
    assert.ok(language.includes(key), "missing localized PWA message: " + key);
  }
});
