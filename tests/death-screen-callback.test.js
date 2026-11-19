import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("game-over callback passes the finished run into DeathScreen", () => {
  const source = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
  assert.match(source, /deathScreen\.show\(g,best,previousBest,earned,profile\.scrapCore,achievementResult\.unlocked\)/);
  assert.match(source, /achievementResult\.unlocked\.map\(a=>a\.name\)/);
  assert.doesNotMatch(source, /deathScreen\.show\(\)/);
});
