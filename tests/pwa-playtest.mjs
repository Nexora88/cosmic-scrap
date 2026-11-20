import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "allow" });
await context.addInitScript(() => {
  const NativeAudio = window.Audio;
  window.__taviroAudioDecks = [];
  window.Audio = function (...args) {
    const audio = new NativeAudio(...args);
    window.__taviroAudioDecks.push(audio);
    return audio;
  };
  window.Audio.prototype = NativeAudio.prototype;
});
const page = await context.newPage();
const errors = [];
const origin = new URL(baseURL).origin;
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text()); });
page.on("requestfailed", request => {
  const expectedUnsatisfiableRange = request.headers().range === "bytes=999999999-";
  if (new URL(request.url()).origin === origin && !expectedUnsatisfiableRange) errors.push("same-origin request failed: " + request.url());
});
page.on("response", response => {
  const expectedUnsatisfiableRange = response.request().headers().range === "bytes=999999999-" && response.status() === 416;
  if (new URL(response.url()).origin === origin && response.status() >= 400 && !expectedUnsatisfiableRange) errors.push("same-origin HTTP " + response.status() + ": " + response.url());
});

try {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.locator(".language-welcome-option").first().click();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 45000 }).catch(async () => {
    const diagnostic = await page.evaluate(async errors => ({ isSecureContext, supported: "serviceWorker" in navigator, registrations: (await navigator.serviceWorker.getRegistrations()).map(reg => ({ scope: reg.scope, active: reg.active?.state, installing: reg.installing?.state, waiting: reg.waiting?.state })), errors }), errors);
    throw new Error("Service worker did not control the page: " + JSON.stringify(diagnostic));
  });
  const registration = await page.evaluate(() => ({
    scope: navigator.serviceWorker.controller?.scriptURL || "",
    cacheNames: []
  }));
  assert.ok(registration.scope.endsWith("/sw.js"), "the active controller must be TAVIRO's service worker");
  // Reload once under service-worker control so runtime-imported modules are cached too.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#start").waitFor({ state: "attached", timeout: 10000 });
  // Unlock the menu soundtrack with a real user gesture while the browser is offline.
  await page.evaluate(() => { const intro = document.getElementById("intro-screen"); if (intro) intro.hidden = true; });
  await page.mouse.click(5, 5);
  await page.waitForFunction(() => window.__taviroAudioDecks?.some(audio =>
    audio.src.endsWith("deep-space-drift.mp3") && !audio.paused && audio.currentTime > 0
  ), null, { timeout: 15000 });


  await page.waitForFunction(async () => {
    const files = ["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"];
    const matches = await Promise.all(files.map(file => caches.match(new URL("./assets/sounds/" + file, location.href).href)));
    return matches.every(Boolean);
  }, null, { timeout: 120000 });

  const cachedShell = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys.find(key => key.startsWith("taviro-shell-")) || "");
    return {
      keys,
      index: Boolean(await cache.match(new URL("./index.html", location.href).href)),
      main: Boolean(await cache.match(new URL("./js/main.js", location.href).href)),
      manifest: Boolean(await cache.match(new URL("./manifest.webmanifest", location.href).href)),
      installUiPresent: Boolean(document.querySelector("#pwa-install-panel, #pwa-install-button")),
      music: await Promise.all(["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"].map(async file => Boolean(await caches.match(new URL("./assets/sounds/"+file, location.href).href))))
    };
  });
  assert.ok(cachedShell.keys.some(key => key.startsWith("taviro-shell-")), "the app shell cache must exist");
  assert.equal(cachedShell.index, true);
  assert.equal(cachedShell.main, true);
  assert.equal(cachedShell.manifest, true);
  assert.equal(cachedShell.installUiPresent, true, "the game page must render the install entry point");
  assert.deepEqual(cachedShell.music, Array(7).fill(true), "all soundtrack files should be cached");



  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#start").waitFor({ state: "attached", timeout: 10000 });
  // Re-unlock media after a true offline navigation and verify the menu theme advances.
  await page.mouse.click(5, 5);
  await page.waitForFunction(() => window.__taviroAudioDecks?.some(audio =>
    audio.src.endsWith("deep-space-drift.mp3") && !audio.paused && audio.currentTime > 0
  ), null, { timeout: 15000 });
  const offline = await page.evaluate(async () => ({
    title: document.title,
    startButton: Boolean(document.querySelector("#start")),
    serviceWorkerControlled: Boolean(navigator.serviceWorker.controller),
    installUiAbsent: !document.querySelector("#pwa-quick-install, #install-app, #install-app-status"),
    cachedMusic: await Promise.all(["deep-space-drift.mp3","deep-space-assault.mp3","cosmic-pulse.mp3","unknown-planets.mp3","pulse-of-conflict.mp3","cosmic-confrontation.mp3","taviro-rarity-reveal.mp3"].map(async file => (await fetch("./assets/sounds/"+file)).ok)),
    musicRange: await fetch("./assets/sounds/deep-space-drift.mp3", { headers: { Range: "bytes=0-1023" } }).then(async response => ({ status: response.status, contentRange: response.headers.get("content-range"), bytes: (await response.arrayBuffer()).byteLength })),
    musicSuffixRange: await fetch("./assets/sounds/deep-space-drift.mp3", { headers: { Range: "bytes=-128" } }).then(async response => ({ status: response.status, contentRange: response.headers.get("content-range"), bytes: (await response.arrayBuffer()).byteLength })),
    invalidMusicRange: await fetch("./assets/sounds/deep-space-drift.mp3", { headers: { Range: "bytes=999999999-" } }).then(async response => ({ status: response.status, contentRange: response.headers.get("content-range") }))
  }));
  assert.equal(offline.startButton, true);
  assert.equal(offline.serviceWorkerControlled, true);
  assert.equal(offline.installUiPresent, true, "offline game page must retain the install entry point");
  assert.deepEqual(offline.cachedMusic, Array(7).fill(true), "all soundtrack files should remain available offline");
  assert.equal(offline.musicRange.status, 206, "offline audio must support byte-range requests");
  assert.equal(offline.musicRange.bytes, 1024);
  assert.match(offline.musicRange.contentRange || "", /^bytes 0-1023\//);
  assert.equal(offline.musicSuffixRange.status, 206, "offline audio must support suffix byte ranges");
  assert.equal(offline.musicSuffixRange.bytes, 128);
  assert.match(offline.musicSuffixRange.contentRange || "", /^bytes \d+-\d+\//);
  assert.equal(offline.invalidMusicRange.status, 416, "unsatisfiable audio ranges must return 416");
  assert.match(offline.invalidMusicRange.contentRange || "", /^bytes \*\//);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: "Chromium", manifest: "loaded", serviceWorker: "active", cachedShell: "present", offlineReload: "passed", errors }, null, 2));
} finally {
  await context.setOffline(false).catch(() => {});
  await browser.close();
}
