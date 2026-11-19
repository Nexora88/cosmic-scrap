import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const registration = fs.readFileSync(new URL("../js/pwa.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("TAVIRO has a relative, installable web-app manifest for GitHub Pages subpaths", () => {
  assert.equal(manifest.name, "TAVIRO — One core. Infinite void.");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some(icon => icon.src === "assets/taviro-mark.svg" && icon.sizes === "any"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192" && icon.purpose === "any maskable"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512" && icon.purpose === "any maskable"));
  assert.ok(html.includes('rel="manifest" href="./manifest.webmanifest"'));
  assert.ok(html.includes("apple-mobile-web-app-capable"));
});

test("offline worker precaches the shell and falls back to the cached app on navigation", () => {
  for (const asset of ["./index.html","./profile.html","./privacy.html","./support.html","./about.html","./manifest.webmanifest","./css/style.css","./css/ui.css","./css/coop.css","./css/legal.css","./profile.css","./profile.js","./js/main.js","./js/legal-pages.js","./js/legal-translations.js","./js/about-translations.js","./assets/taviro-logo.svg"]) {
    assert.ok(worker.includes('"'+asset+'"'), "missing shell asset "+asset);
  }
  assert.ok(worker.includes('const CACHE_NAME = CACHE_PREFIX + "v10";'));
  for (const track of ["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"]) assert.ok(worker.includes('"./assets/sounds/'+track+'"'),"missing cached track "+track);
  assert.ok(worker.includes("Promise.allSettled(MUSIC_ASSETS.map"));
  assert.ok(worker.includes("audio"));
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
  assert.ok(registration.includes("Capacitor?.isNativePlatform"));
  assert.ok(registration.includes("capacitor:"));
  assert.ok(html.includes("id=\"install-app\""));
});

test("PWA install copy exists in every supported locale", async () => {
  const { translations } = await import("../js/language.js");
  for (const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]) {
    for (const key of ["INSTALL TAVIRO","Install TAVIRO on this device for offline play.","On iPhone or iPad, tap Share, then choose Add to Home Screen.","On Android, open the browser menu ⋮ and choose Install app or Add to Home screen.","On desktop, use the install icon in the address bar or your browser menu."]) {
      assert.ok(translations[locale]?.[key], locale+" missing translation: "+key);
    }
  }
});
