import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const music = readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("menu and combat music assets are committed and enabled", () => {
  assert.match(music, /MUSIC_ASSETS_READY = true/);
  assert.ok(existsSync(new URL("../assets/sounds/cosmic-pulse.mp3", import.meta.url)));
  assert.ok(existsSync(new URL("../assets/sounds/deep-space-assault.mp3", import.meta.url)));
  assert.match(music, /menu: "\.\/assets\/sounds\/cosmic-pulse\.mp3"/);
  assert.match(music, /combat: "\.\/assets\/sounds\/deep-space-assault\.mp3"/);
});

test("music respects user gesture, pause/resume, visibility, toggle and volume", () => {
  for (const token of ["#start, #retry", "#resume", "#pause", "#menu, #pause-menu", "visibilitychange", "setting-sound", "setting-volume"]) {
    assert.ok(music.includes(token), "missing music control: " + token);
  }
});

test("commander voice UI and loader are not shipped without voice assets", () => {
  assert.doesNotMatch(index, /setting-voice(?:-language|-gender)?/);
  assert.doesNotMatch(index, /VoiceAnnouncer\.js/);
});
