import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = (process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/").replace(/\/+$/, "") + "/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem("cosmic-scrap-language-selected", "1");
  localStorage.setItem("cosmic-scrap-capsules", "1");
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
const assetResponses = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
page.on("response", response => {
  if (response.url().includes("/assets/sounds/")) assetResponses.push({ url: response.url(), status: response.status() });
});

async function waitForTrack(file, timeout = 12000) {
  try {
    await page.waitForFunction(name => window.__taviroAudioDecks.some(audio =>
      audio.src.endsWith(name) && !audio.paused
    ), file, { timeout });
  } catch (error) {
    console.error("AUDIO_DECK_DIAGNOSTIC", await page.evaluate(() => window.__taviroAudioDecks.map(audio => ({
      src: audio.src, paused: audio.paused, loop: audio.loop, time: audio.currentTime,
      duration: audio.duration, volume: audio.volume, readyState: audio.readyState,
      error: audio.error?.code || null
    }))));
    throw error;
  }
}

async function waitForAudibleTrack(file, timeout = 12000) {
  await page.waitForFunction(name => window.__taviroAudioDecks.some(audio =>
    audio.src.endsWith(name) && !audio.paused && audio.volume > 0.4
  ), file, { timeout });
}

try {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  if (await page.locator("#intro-screen").isVisible()) await page.locator("#intro-continue").click();
  await waitForTrack("cosmic-pulse.mp3");
  await waitForAudibleTrack("cosmic-pulse.mp3");
  await page.locator("#start").click();
  await waitForTrack("deep-space-drift.mp3");
  await waitForAudibleTrack("deep-space-drift.mp3");

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "combat", duration: 8000 } })));
  await waitForTrack("deep-space-drift.mp3");
  await waitForAudibleTrack("deep-space-assault.mp3");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "warning" } })));
  const crossfade = await page.waitForFunction(() => {
    const playing = window.__taviroAudioDecks.filter(audio => !audio.paused && audio.volume > 0.02);
    return playing.length >= 2;
  }, null, { timeout: 5000 }).then(() => true);
  assert.equal(crossfade, true, "old and new tracks should overlap during crossfade");
  await waitForAudibleTrack("pulse-of-conflict.mp3");

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss" } })));
  await waitForTrack("cosmic-confrontation.mp3");
  await waitForAudibleTrack("cosmic-confrontation.mp3");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss-end" } })));
  await waitForAudibleTrack("deep-space-drift.mp3");
  await waitForAudibleTrack("deep-space-drift.mp3", 12000);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "discovery", duration: 9200 } })));
  await waitForTrack("unknown-planets.mp3");
  await waitForAudibleTrack("deep-space-drift.mp3", 14000);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "reveal" } })));
  await waitForTrack("taviro-rarity-reveal.mp3");
  await page.waitForFunction(() => window.__taviroAudioDecks.some(audio =>
    audio.src.endsWith("taviro-rarity-reveal.mp3") && audio.loop === false
  ));
  await waitForAudibleTrack("deep-space-drift.mp3", 11000);

  await page.locator("#pause").click();
  await page.waitForFunction(() => window.__taviroAudioDecks.every(audio => audio.paused), null, { timeout: 3000 });
  const pausedAt = await page.evaluate(() => Math.max(...window.__taviroAudioDecks.map(audio => audio.currentTime)));
  await page.waitForTimeout(350);
  await page.locator("#resume").click();
  await waitForTrack("deep-space-assault.mp3");
  const resumedAt = await page.evaluate(() => Math.max(...window.__taviroAudioDecks.map(audio => audio.currentTime)));
  assert.ok(resumedAt >= pausedAt - 0.5, "resume should keep the track position");

  const failedAssets = assetResponses.filter(item => ![200, 206].includes(item.status));
  assert.deepEqual(failedAssets, [], "all requested music files should load successfully");
  assert.deepEqual(errors, [], "browser should not report music or runtime errors");
  console.log(JSON.stringify({
    browser: "Playwright Chromium",
    scenes: ["menu", "normal gameplay", "intense combat", "boss warning", "boss fight", "boss defeat return", "planet discovery (9.2s)", "capsule reveal", "pause/resume"],
    crossfadeOverlap: crossfade,
    musicAssetResponses: assetResponses.length,
    failedAssets,
    errors
  }, null, 2));
} finally {
  await browser.close();
}
