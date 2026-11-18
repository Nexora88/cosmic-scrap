import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const music = readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8");
const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("all seven TAVIRO music assets are committed and mapped to a scene", () => {
  const tracks = [
    ["deep-space-drift.mp3", "menu"],
    ["cosmic-pulse.mp3", "storm"],
    ["unknown-planets.mp3", "discovery"],
    ["deep-space-assault.mp3", "gameplay"],
    ["pulse-of-conflict.mp3", "combat"],
    ["cosmic-confrontation.mp3", "boss"],
    ["taviro-rarity-reveal.mp3", "reveal"]
  ];
  for (const [file, scene] of tracks) {
    assert.ok(existsSync(new URL("../assets/sounds/" + file, import.meta.url)), "missing " + file);
    assert.match(music, new RegExp(scene + ': "\\./assets/sounds/' + file.replaceAll(".", "\\.") + '"'));
  }
  assert.ok(music.includes('combat: "./assets/sounds/pulse-of-conflict.mp3"'));
  assert.ok(music.includes('gameplay: "./assets/sounds/deep-space-assault.mp3"'));
  assert.ok(music.includes('storm: "./assets/sounds/cosmic-pulse.mp3"'));
  assert.match(music, /this\.setBaseScene\("gameplay"\)/);
  assert.match(music, /scene === "storm-end"/);
  assert.match(music, /scene === "death"/);
  assert.match(music, /scene === "respawn"/);
  assert.match(music, /this\.playScene\(this\.stormActive \? "storm" : this\.baseScene\)/);
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
  assert.match(music, /this\.pause\(true\)/);
  assert.match(music, /suspendSceneReturn\(\)/);
  assert.match(music, /resumeSceneReturn\(\)/);
  assert.match(music, /this\.decks\.forEach\(audio => \{/);
  assert.match(music, /audio\.pause\(\)/);
});

test("sector unlock keeps the energetic gameplay bed and plays a short bright sting", () => {
  const sectorUnlock = main.match(/sectorUnlock\(\)\{([^}]+)\}/)?.[1] || "";
  assert.ok(sectorUnlock, "sector unlock audio handler must exist");
  assert.doesNotMatch(sectorUnlock, /scene:\\?"discovery/);
  assert.match(sectorUnlock, /this\.tone\(520/);
  assert.match(sectorUnlock, /this\.tone\(880/);
  assert.match(sectorUnlock, /this\.haptic\("sector"\)/);
  assert.match(music, /this\.playScene\(this\.baseScene\)/);
});

test("boss warning music starts before the boss theme, then returns after defeat", () => {
  assert.match(main, /scene:"warning"/);
  assert.match(main, /scene:"boss"/);
  assert.match(main, /scene:"boss-end"/);
  assert.match(music, /name === "warning" \|\| name === "boss" \? 1500 : 2300/);
});

test("combat intensity and rift events can temporarily raise the soundtrack", () => {
  assert.match(main, /scene:"storm"/);
  assert.match(main, /scene:"storm-end"/);
  assert.match(main, /scene:"combat",duration:36000/);
  assert.match(main, /scene:"combat",duration:18000/);
});

test("boss and post-boss music cannot be interrupted by lower-priority ambient events", () => {
  assert.match(music, /const SCENE_PRIORITY = \{/);
  assert.match(music, /warning: 90/);
  assert.match(music, /boss: 100/);
  assert.match(music, /storm: 45/);
  assert.match(music, /if \(temporary && \(SCENE_PRIORITY\[this\.scene\] \|\| 0\) > \(SCENE_PRIORITY\[name\] \|\| 0\)\) \{/);
  assert.match(music, /boss-end/);
});

test("capsule rarity reveal uses its short dedicated stinger", () => {
  assert.match(main, /scene:"reveal"/);
  assert.match(music, /oneShot = false/);
  assert.match(music, /nextAudio\.loop = !oneShot/);
  assert.match(music, /oneShot: true, duration: 7200/);
  assert.match(music, /clearTimeout\(this\.sceneTimer\);[\s\S]*this\.playScene\(this\.stormActive \? "storm" : this\.baseScene\)/);
});

test("the music module is loaded once and the synthesized capsule cues remain available", () => {
  assert.match(index, /src="js\/systems\/Music\.js"/);
  for (const event of ["capsule-charge", "capsule-release", "capsule-reveal"]) {
    assert.ok(main.includes("cosmic-scrap:" + event), "missing capsule cue " + event);
  }
  assert.match(main, /capsuleReveal\(rarity="silver"\)/);
});
