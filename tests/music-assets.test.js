import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const music = readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8");
const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("all seven TAVIRO music assets are committed and mapped to a scene", () => {
  const tracks = [
    ["cosmic-pulse.mp3", "menu"],
    ["deep-space-drift.mp3", "exploration"],
    ["unknown-planets.mp3", "discovery"],
    ["deep-space-assault.mp3", "combat"],
    ["pulse-of-conflict.mp3", "warning"],
    ["cosmic-confrontation.mp3", "boss"],
    ["taviro-rarity-reveal.mp3", "reveal"]
  ];
  for (const [file, scene] of tracks) {
    assert.ok(existsSync(new URL("../assets/sounds/" + file, import.meta.url)), "missing " + file);
    assert.match(music, new RegExp(scene + ': "\\./assets/sounds/' + file.replaceAll(".", "\\.") + '"'));
  }
});

test("music starts from user gestures and respects pause, resume, visibility, toggle and volume", () => {
  for (const token of ["#start, #retry", "#resume", "#pause", "#menu, #pause-menu", "visibilitychange", "setting-sound", "setting-volume"]) {
    assert.ok(music.includes(token), "missing music control: " + token);
  }
  assert.match(music, /this\.decks = \[new Audio\(\), new Audio\(\)\]/);
  assert.match(music, /crossfade\(oldAudio, nextAudio/);
});

test("Nexora showcase pauses and resumes the same music position", () => {
  assert.match(music, /cosmic-scrap:showcase-open/);
  assert.match(music, /cosmic-scrap:showcase-close/);
  assert.match(music, /showcasePaused/);
  assert.match(music, /this\.decks\.forEach\(audio => \{/);
  assert.match(music, /audio\.pause\(\)/);
});

test("planet discovery gets a short transition score and returns to the gameplay bed", () => {
  assert.match(main, /scene:"discovery",duration:9200/);
  assert.match(music, /duration: duration \|\| 9000/);
  assert.match(music, /this\.playScene\(this\.baseScene\)/);
});

test("boss warning music starts before the boss theme, then returns after defeat", () => {
  assert.match(main, /scene:"warning"/);
  assert.match(main, /scene:"boss"/);
  assert.match(main, /scene:"boss-end"/);
  assert.match(music, /name === "warning" \|\| name === "boss" \? 1500 : 2300/);
});

test("combat intensity and rift events can temporarily raise the soundtrack", () => {
  assert.match(main, /scene:"combat",duration:28000/);
  assert.match(main, /scene:"combat",duration:36000/);
  assert.match(main, /scene:"combat",duration:18000/);
});

test("capsule rarity reveal uses its short dedicated stinger", () => {
  assert.match(main, /scene:"reveal"/);
  assert.match(music, /oneShot = false/);
  assert.match(music, /nextAudio\.loop = !oneShot/);
});

test("the music module is loaded once and the synthesized capsule cues remain available", () => {
  assert.match(index, /src="js\/systems\/Music\.js"/);
  for (const event of ["capsule-charge", "capsule-release", "capsule-reveal"]) {
    assert.ok(main.includes("cosmic-scrap:" + event), "missing capsule cue " + event);
  }
  assert.match(main, /capsuleReveal\(rarity="silver"\)/);
});
