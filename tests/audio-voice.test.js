import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const announcer = readFileSync(new URL("../js/systems/VoiceAnnouncer.js", import.meta.url), "utf8");
const audioReadme = readFileSync(new URL("../assets/sounds/README.md", import.meta.url), "utf8");

test("commander announcements are wired to core game events", () => {
  for (const key of ["missionStart", "enemiesApproaching", "bossStart", "bossDefeated", "levelUp", "sectorSecured"]) {
    assert.ok(main.includes(`announce("${key}")`), `missing event: ${key}`);
    assert.ok(announcer.includes(`${key}:`), `missing voice mapping: ${key}`);
  }
});

test("commander voice supports auto, Turkish, English and Brazilian Portuguese", () => {
  assert.match(announcer, /cosmic-scrap-language/);
  assert.match(announcer, /cosmic-scrap-voice-language/);
  assert.match(index, /id="setting-voice"/);
  assert.match(index, /id="setting-voice-language"/);
  assert.match(index, /value="pt-BR"/);
  assert.match(audioReadme, /voice\/male\/pt-BR\//);
  assert.match(index, /js\/systems\/VoiceAnnouncer\.js/);
});

test("commander voice supports male and female selection with persisted preference", () => {
  assert.match(index, /id="setting-voice-gender"/);
  assert.match(index, /option value="male"/);
  assert.match(index, /option value="female"/);
  assert.match(announcer, /cosmic-scrap-voice-gender/);
  assert.match(announcer, /voice\/\$\{gender\}\/\$\{language\}/);
  assert.match(audioReadme, /voice\/female\/tr\//);
});

test("audio systems default to an audible master volume when no preference is stored", () => {
  assert.match(main, /storedVolume===null\?0\.7:Number\(storedVolume\)/);
  assert.match(readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8"), /storedVolume === null \? 0\.7/);
});

test("committed music assets are enabled while incomplete voice packs remain gated", () => {
  const music = readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8");
  assert.match(music, /MUSIC_ASSETS_READY = true/);
  assert.ok(existsSync(new URL("../assets/sounds/cosmic-pulse.mp3", import.meta.url)));
  assert.ok(existsSync(new URL("../assets/sounds/deep-space-assault.mp3", import.meta.url)));
  assert.match(announcer, /VOICE_ASSETS_READY = false/);
});

test("audio announcements do not change combat or movement code paths", () => {
  assert.match(main, /audio\.announce\("missionStart"\)/);
  assert.match(main, /this\.tone\(640,\.055,"sawtooth",\.012,260\)/);
  assert.match(main, /this\.haptic\("boss"\)/);
});
