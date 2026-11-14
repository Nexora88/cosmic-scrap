import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const announcer = readFileSync(new URL("../js/systems/VoiceAnnouncer.js", import.meta.url), "utf8");

test("commander announcements are wired to core game events", () => {
  for (const key of ["missionStart", "enemiesApproaching", "bossStart", "bossDefeated", "levelUp", "sectorSecured"]) {
    assert.ok(main.includes(`announce("${key}")`), `missing event: ${key}`);
    assert.ok(announcer.includes(`${key}:`), `missing voice mapping: ${key}`);
  }
});

test("voice announcements follow the selected language and separate voice setting", () => {
  assert.match(announcer, /cosmic-scrap-language/);
  assert.match(announcer, /cosmic-scrap-voice/);
  assert.match(index, /id="setting-voice"/);\n  assert.match(index, /id="setting-voice-language"/);\n  assert.match(announcer, /pt-BR/);\n  assert.match(announcer, /cosmic-scrap-voice-language/);
  assert.match(index, /js\/systems\/VoiceAnnouncer\.js/);
});

test("audio systems default to an audible master volume when no preference is stored", () => {
  assert.match(main, /storedVolume===null\?0\.7:Number\(storedVolume\)/);
  assert.match(readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8"), /storedVolume === null \? 0\.7/);
});

test("audio assets stay silent and avoid broken network requests until uploaded", () => {
  assert.match(readFileSync(new URL("../js/systems/Music.js", import.meta.url), "utf8"), /MUSIC_ASSETS_READY = false/);
  assert.match(announcer, /VOICE_ASSETS_READY = false/);\n  assert.match(readFileSync(new URL("../assets/sounds/README.md", import.meta.url), "utf8"), /voice\\/pt-BR\\/sector-secured\\.mp3/);
});

test("audio announcements do not change combat or movement code paths", () => {
  assert.match(main, /audio\.announce\("missionStart"\)/);
  assert.match(main, /this\.tone\(640,\.055,"sawtooth",\.012,260\)/);
  assert.match(main, /this\.haptic\("boss"\)/);
});
