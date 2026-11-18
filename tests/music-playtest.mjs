import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = (process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/").replace(/\/+$/, "") + "/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem("cosmic-scrap-language-selected", "1");
  localStorage.setItem("cosmic-scrap-capsules", "1");
  localStorage.setItem("taviro-onboarding-complete", "1");
  const NativeAudio = window.Audio;
  window.__taviroAudioDecks = [];
  window.__vibrationCalls = [];
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: pattern => { window.__vibrationCalls.push(pattern); return true; }
  });
  window.__delayNextDiscoveryPlay = false;
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    const result = nativePlay.apply(this, args);
    if (window.__delayNextDiscoveryPlay && this.src.endsWith("unknown-planets.mp3")) {
      window.__delayNextDiscoveryPlay = false;
      return result.then(() => new Promise(resolve => setTimeout(resolve, 900)));
    }
    return result;
  };
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
  try {
    await page.waitForFunction(name => window.__taviroAudioDecks.some(audio =>
      audio.src.endsWith(name) && !audio.paused && audio.volume > 0.4
    ), file, { timeout });
  } catch (error) {
    console.error("AUDIBLE_TRACK_DIAGNOSTIC", file, await page.evaluate(() => window.__taviroAudioDecks.map(audio => ({
      src: audio.src, paused: audio.paused, loop: audio.loop, time: audio.currentTime,
      duration: audio.duration, volume: audio.volume, readyState: audio.readyState,
      error: audio.error?.code || null
    }))));
    throw error;
  }
}

try {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  // A first tap on any usable control must unlock menu audio, even when the
  // cinematic intro was already dismissed on a previous visit.
  await page.evaluate(() => {
    localStorage.setItem("cosmic-scrap-language-selected", "1");
    const intro = document.getElementById("intro-screen");
    if (intro) intro.hidden = true;
  });
  await page.locator("#settings-open").click();
  await page.locator("#setting-vibration").check();
  await page.locator("#setting-vibration-test").click();
  assert.ok(await page.evaluate(() => window.__vibrationCalls.length > 0),
    "the vibration test control must invoke the browser vibration API when it is available");
  await waitForTrack("deep-space-drift.mp3");
  await waitForAudibleTrack("deep-space-drift.mp3");
  await page.locator("#settings-close").click();
  await waitForTrack("deep-space-drift.mp3");
  await waitForAudibleTrack("deep-space-drift.mp3");
  await page.locator("#start").click();
  await waitForTrack("deep-space-assault.mp3");
  await waitForAudibleTrack("deep-space-assault.mp3");

  // Reproduce a slow media play() resolution followed by a higher-priority scene.
  await page.evaluate(() => {
    window.__delayNextDiscoveryPlay = true;
    window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "discovery", duration: 8000 } }));
    window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss" } }));
  });
  await waitForAudibleTrack("cosmic-confrontation.mp3");
  await page.waitForTimeout(1100);
  const staleSceneDecks = await page.evaluate(() => window.__taviroAudioDecks
    .filter(audio => !audio.paused && audio.volume > 0.4)
    .map(audio => audio.src.split("/").pop()));
  assert.deepEqual(staleSceneDecks, ["cosmic-confrontation.mp3"],
    "a delayed discovery play promise must not revive or crossfade over the newer boss scene");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss-end" } })));
  await waitForAudibleTrack("deep-space-assault.mp3");

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "combat", duration: 8000 } })));
  await waitForTrack("pulse-of-conflict.mp3");
  await waitForAudibleTrack("pulse-of-conflict.mp3");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "warning" } })));
  await waitForAudibleTrack("pulse-of-conflict.mp3");

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss" } })));
  const crossfade = await page.waitForFunction(() => {
    const playing = window.__taviroAudioDecks.filter(audio => !audio.paused && audio.volume > 0.02);
    return playing.length >= 2;
  }, null, { timeout: 5000 }).then(() => true);
  assert.equal(crossfade, true, "boss transition should crossfade from Combat Drive");
  await waitForTrack("cosmic-confrontation.mp3");
  await waitForAudibleTrack("cosmic-confrontation.mp3");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "combat", duration: 18000 } })));
  await page.waitForTimeout(250);
  const bossProtected = await page.evaluate(() => window.__taviroAudioDecks.filter(audio => !audio.paused && audio.volume > 0.4).map(audio => audio.src.split("/").pop()));
  assert.deepEqual(bossProtected, ["cosmic-confrontation.mp3"], "ambient combat events must not replace the active boss theme");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "boss-end" } })));
  await waitForAudibleTrack("deep-space-assault.mp3");
  // After boss defeat, a discovery cue may play temporarily, then return to the gameplay bed.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "discovery", duration: 9200 } })));
  await waitForTrack("unknown-planets.mp3");
  await waitForAudibleTrack("unknown-planets.mp3");
  await waitForAudibleTrack("deep-space-assault.mp3", 14000);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "storm" } })));
  await waitForAudibleTrack("cosmic-pulse.mp3");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "storm-end" } })));
  await waitForAudibleTrack("deep-space-assault.mp3");

  // A real gameplay run may naturally open and close an upgrade picker while this
  // long browser scenario is running. Explicitly release that state before testing
  // the independent discovery timer so this check cannot inherit a stale level-up lock.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "level-up-end" } })));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "discovery", duration: 9200 } })));
  await waitForTrack("unknown-planets.mp3");
  await waitForAudibleTrack("deep-space-assault.mp3", 14000);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "reveal" } })));
  await waitForTrack("taviro-rarity-reveal.mp3");
  await page.waitForFunction(() => window.__taviroAudioDecks.some(audio =>
    audio.src.endsWith("taviro-rarity-reveal.mp3") && audio.loop === false
  ));
  await waitForAudibleTrack("deep-space-assault.mp3", 11000);

  // A temporary discovery cue must remain paused for the entire optional project showcase.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("taviro:music-scene", { detail: { scene: "discovery", duration: 5000 } })));
  await waitForTrack("unknown-planets.mp3");
  await page.evaluate(() => window.dispatchEvent(new Event("cosmic-scrap:showcase-open")));
  await page.waitForFunction(() => window.__taviroAudioDecks.every(audio => audio.paused), null, { timeout: 3000 });
  await page.waitForTimeout(5500);
  assert.equal(await page.evaluate(() => window.__taviroAudioDecks.every(audio => audio.paused)), true,
    "temporary scene timer must not restart game music while the showcase video is open");
  await page.evaluate(() => window.dispatchEvent(new Event("cosmic-scrap:showcase-close")));
  await waitForTrack("unknown-planets.mp3");
  await waitForAudibleTrack("deep-space-assault.mp3", 12000);

  // Trigger the pause controls programmatically so a naturally earned level-up
  // overlay cannot intercept this audio-only regression check.
  await page.evaluate(() => document.getElementById("pause").click());
  await page.waitForFunction(() => window.__taviroAudioDecks.every(audio => audio.paused), null, { timeout: 3000 });
  const pausedAt = await page.evaluate(() => Math.max(...window.__taviroAudioDecks.map(audio => audio.currentTime)));
  await page.waitForTimeout(350);
  await page.evaluate(() => document.getElementById("resume").click());
  await waitForTrack("deep-space-assault.mp3");
  const resumedAt = await page.evaluate(() => Math.max(...window.__taviroAudioDecks.map(audio => audio.currentTime)));
  assert.ok(resumedAt >= pausedAt - 0.5, "resume should keep the track position");

  const failedAssets = assetResponses.filter(item => ![200, 206].includes(item.status));
  assert.deepEqual(failedAssets, [], "all requested music files should load successfully");
  assert.deepEqual(errors, [], "browser should not report music or runtime errors");
  console.log(JSON.stringify({
    browser: "Playwright Chromium",
    scenes: ["Deep Space menu", "Deep Space Assault gameplay", "Combat Drive combat", "Cosmic Pulse storm", "boss warning", "boss fight", "boss defeat returns to the current gameplay or storm bed", "planet discovery (9.2s)", "capsule reveal", "showcase pause/timer resume", "pause/resume"],
    crossfadeOverlap: crossfade,
    musicAssetResponses: assetResponses.length,
    failedAssets,
    errors
  }, null, 2));
} finally {
  await browser.close();
}
