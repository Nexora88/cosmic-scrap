import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const registration = fs.readFileSync(new URL("../js/pwa.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const profileHtml = fs.readFileSync(new URL("../profile.html", import.meta.url), "utf8");
const userIconPath = new URL("../assets/file_000000006ab48210ad25f9ce34cd5632.png", import.meta.url);
const tabIconPath = new URL("../assets/icon.svg", import.meta.url);
const icon192Path = new URL("../assets/taviro-icon-192.png", import.meta.url);
const appleIconPath = new URL("../assets/taviro-icon-180.png", import.meta.url);

test("TAVIRO has a relative, installable web-app manifest for GitHub Pages subpaths", () => {
  assert.equal(manifest.name, "TAVIRO — One core. Infinite void.");
  assert.equal(manifest.short_name, "TAVIRO");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons, [
    { src: "assets/taviro-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "assets/file_000000006ab48210ad25f9ce34cd5632.png", sizes: "512x512", type: "image/png", purpose: "any" }
  ]);
  assert.ok(html.includes('rel="icon" type="image/svg+xml" href="assets/icon.svg"'));
  assert.ok(html.includes('rel="manifest" href="./manifest.webmanifest"'));
  assert.ok(html.includes("apple-mobile-web-app-capable"));
  assert.ok(html.includes('rel="apple-touch-icon" href="assets/taviro-icon-180.png"'));
  assert.equal(fs.readFileSync(userIconPath).subarray(0,8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(fs.readFileSync(tabIconPath, "utf8").includes("<svg"));
  assert.equal(fs.readFileSync(icon192Path).subarray(0,8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(fs.readFileSync(icon192Path).readUInt32BE(16), 192);
  assert.equal(fs.readFileSync(icon192Path).readUInt32BE(20), 192);
  assert.equal(fs.readFileSync(appleIconPath).subarray(0,8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(fs.readFileSync(appleIconPath).readUInt32BE(16), 180);
  assert.equal(fs.readFileSync(appleIconPath).readUInt32BE(20), 180);
  assert.ok(profileHtml.includes('rel="manifest" href="./manifest.webmanifest"'));
  assert.ok(profileHtml.includes('rel="apple-touch-icon" href="./assets/taviro-icon-180.png"'));
  assert.ok(profileHtml.includes("apple-mobile-web-app-capable"));
});

test("every precached shell and soundtrack asset exists in the release tree", () => {
  const assets = [...worker.matchAll(/^\s+"(\.\/[^"]+)",?$/gm)].map(match => match[1]);
  assert.ok(assets.length > 50, "expected a complete offline shell asset list");
  for (const asset of [...assets, "./assets/sounds/deep-space-drift.mp3","./assets/sounds/deep-space-assault.mp3","./assets/sounds/cosmic-pulse.mp3","./assets/sounds/unknown-planets.mp3","./assets/sounds/pulse-of-conflict.mp3","./assets/sounds/cosmic-confrontation.mp3","./assets/sounds/taviro-rarity-reveal.mp3"]) {
    assert.ok(fs.existsSync(new URL("../" + asset.slice(2), import.meta.url)), "missing precached asset " + asset);
  }
});

test("offline worker precaches the shell and falls back to the cached app on navigation", () => {
  for (const asset of ["./index.html","./profile.html","./privacy.html","./support.html","./about.html","./manifest.webmanifest","./css/style.css","./css/ui.css","./css/coop.css","./css/legal.css","./profile.css","./profile.js","./profile-i18n.js","./js/profile-translations.js","./assets/file_000000006ab48210ad25f9ce34cd5632.png","./assets/icon.svg","./assets/taviro-icon.png","./assets/taviro-icon-192.png","./assets/taviro-icon-180.png","./js/main.js","./js/legal-pages.js","./js/legal-translations.js","./js/about-translations.js","./assets/taviro-logo.svg","./assets/icon.svg"]) {
    assert.ok(worker.includes('"'+asset+'"'), "missing shell asset "+asset);
  }
  assert.ok(worker.includes('const CACHE_NAME = CACHE_PREFIX + "v28";'));
  for (const track of ["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"]) assert.ok(worker.includes('"./assets/sounds/'+track+'"'),"missing cached track "+track);
  assert.ok(worker.includes('event.data?.type !== "TAVIRO_CACHE_MUSIC"'));
  assert.ok(worker.includes("Promise.allSettled(MUSIC_ASSETS.map"));
  assert.ok(!worker.slice(worker.indexOf('self.addEventListener("install"'), worker.indexOf('self.addEventListener("activate"')).includes("MUSIC_ASSETS"), "optional music must not block service-worker installation");
  assert.ok(registration.includes('postMessage({ type: "TAVIRO_CACHE_MUSIC" })'));
  assert.ok(worker.includes("audio"));
  assert.ok(worker.includes("mp3|ogg|wav|m4a"));
  assert.ok(worker.includes('request.mode === "navigate"'));
  assert.ok(worker.includes('caches.match("./index.html")'));
  assert.ok(worker.includes("url.origin !== self.location.origin"));
  assert.ok(worker.includes('request.method !== "GET"'));
});

test("service worker and manifest leave installation to supported browsers, including Samsung Internet", () => {
  assert.ok(registration.includes('location.protocol === "https:"'));
  assert.ok(registration.includes('navigator.serviceWorker.register("./sw.js", { scope: "./" })'));
  assert.ok(registration.includes("catch(error => console.warn"));
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192" && icon.type === "image/png"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512" && icon.type === "image/png"));
  assert.doesNotMatch(registration, /beforeinstallprompt|preventDefault/);
  assert.doesNotMatch(html, /id="install-app"|pwa-quick-install/);
});
