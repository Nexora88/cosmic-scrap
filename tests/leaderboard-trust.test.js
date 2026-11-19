import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hub = fs.readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("all nine locales distinguish server-simulated Ranked from unverified casual scores", () => {
  for (const locale of ["en", "tr", '"pt-BR"', "es", "ru", "id", "de", "fr", "ja"]) {
    const start = hub.indexOf(locale + ":{");
    assert.notEqual(start, -1, "missing trust copy for " + locale);
    const ranked = hub.indexOf("rankedNote:", start);
    const casual = hub.indexOf("casualNote:", start);
    assert.ok(ranked > start && casual > ranked, "missing trust labels for " + locale);
  }
});

test("server-simulated Ranked leaderboard is separate from client-reported casual scores", () => {
  assert.match(hub, /get_ranked_leaderboard/);
  assert.match(hub, /scope==="ranked"/);
  assert.doesNotMatch(hub, /callRpc\("submit_run_record"/);
  assert.match(hub, /CASUAL \(UNVERIFIED\)/);
  assert.match(html, /id="global-ranking-ranked"/);
  assert.match(html, /id="global-ranking-players"/);
  assert.match(html, /id="leaderboard-trust-note"/);
});


test("first release keeps Co-op unavailable while retaining a translated coming-soon panel", () => {
  assert.doesNotMatch(hub, /import "\.\/ui\/CoopClient\.js"/);
  assert.match(html, /id="coop-coming-soon"/);
  assert.match(html, /CO-OP COMING SOON/);
  const language = fs.readFileSync(new URL("../js/language.js", import.meta.url), "utf8");
  for (const locale of ["en", "tr", '"pt-BR"', "es", "ru", "id", "de", "fr", "ja"]) {
    assert.ok(language.includes(locale + ":"), "missing locale " + locale);
  }
  assert.match(language, /Co-op is planned for a future update/);
});


test("Ranked remains hidden until trusted server simulation is available", () => {
  assert.match(html, /id="global-ranking-ranked"[^>]*hidden/);
  assert.match(hub, /if\(scope==="ranked"\)scope="players"/);
  assert.match(hub, /global-ranking-ranked"\)\.hidden=true/);
});
