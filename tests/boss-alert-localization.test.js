import test from "node:test";
import assert from "node:assert/strict";
import { translations } from "../js/language.js";
import { readFile } from "node:fs/promises";

const locales = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];
const keys = [
  "RED ALERT · ELITE INBOUND",
  "RED ALERT · ELITE SIGNATURE INBOUND",
  "BOSS WARNING · RIFT WEAVER",
  "BOSS WARNING · STARBREAKER",
  "BOSS WARNING · DEFAULT",
  "CONGRATULATIONS · BOSS DEFEATED",
  "THE NEXT WAVE WILL BE STRONGER",
  "RIFT SURGE DETECTED",
  "RIFT ZONES LIVE",
  "RIFT SEALED",
  "BOSS DEFEATED - NEXT WAVE",
  "BOSS DEFEATED - RUN CONTINUES",
  "GALAXY RAID · GET READY",
  "RAID · WAVE ",
  "RAID COMPLETE · +1 RAID TOKEN",
  "DIRECTIVE COMPLETE"
];

test("all in-game boss, rift and raid alerts are translated in all nine locales", () => {
  for (const locale of locales) {
    for (const key of keys) {
      const value = translations[locale]?.[key];
      assert.equal(typeof value, "string", locale + " is missing " + JSON.stringify(key));
      assert.ok(value.trim(), locale + " has an empty translation for " + JSON.stringify(key));
      if (locale !== "en") assert.notEqual(value, key, locale + " leaves " + JSON.stringify(key) + " untranslated");
    }
  }
});

test("game runtime routes boss and event notifications through the translation layer", async () => {
  const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
  for (const key of keys) {
    if (key === "RED ALERT · ELITE INBOUND") assert.ok(game.includes('translateText("RED ALERT · ELITE INBOUND")'));
    else if (key === "RAID · WAVE ") assert.ok(game.includes('translateText("RAID · WAVE ")'));
    else if (key === "DIRECTIVE COMPLETE") assert.ok(game.includes('translateText("DIRECTIVE COMPLETE")'));
    else if (key === "BOSS WARNING · RIFT WEAVER" || key === "BOSS WARNING · STARBREAKER" || key === "BOSS WARNING · DEFAULT") {
      assert.ok(game.includes('"'+key+'"'));
    } else assert.ok(game.includes('translateText("'+key+'")'), "runtime does not translate "+key);
  }
});
