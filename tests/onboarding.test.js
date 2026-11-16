import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../js/ui/Onboarding.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

test("first-flight onboarding contains five complete steps in all nine locales", () => {
  const locales = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];
  for (let index = 0; index < locales.length; index++) {
    const locale = locales[index];
    const key = locale === "pt-BR" ? '"pt-BR"' : locale;
    const start = source.indexOf(`  ${key}:`);
    assert.notEqual(start, -1, `missing locale ${locale}`);
    const nextLocale = locales[index + 1];
    const nextKey = nextLocale === "pt-BR" ? '"pt-BR"' : nextLocale;
    const next = nextLocale ? source.indexOf(`  ${nextKey}:`, start + 1) : source.indexOf("\n};", start);
    const block = source.slice(start, next === -1 ? source.length : next);
    assert.equal((block.match(/\["0[1-5] · /g) || []).length, 5, `${locale} must have five steps`);
    for (const keyName of ["back:", "next:", "skip:", "finish:", "replay:"]) assert.ok(block.includes(keyName), `${locale} missing ${keyName}`);
  }
});

test("onboarding is first-run gated, skippable, replayable and does not change game mechanics", () => {
  assert.match(source, /taviro-onboarding-complete/);
  assert.match(source, /this\.dismiss\(true\)/);
  assert.match(source, /this\.dismiss\(false\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /returnFocus/);
  assert.match(source, /\.field-guide/);
  assert.match(main, /onboarding\.shouldShow\(\)/);
  assert.match(main, /onboarding\.show\(startGame\)/);
  assert.match(main, /retry.*startGame/s);
  assert.doesNotMatch(source, /new Game|applyUpgradeChoice|damage|score\s*=/);
});

test("the onboarding stylesheet and module are included in the offline PWA shell", () => {
  assert.match(html, /css\/onboarding\.css/);
  assert.ok(worker.includes('"./css/onboarding.css"'));
  assert.ok(worker.includes('"./js/ui/Onboarding.js"'));
  assert.ok(worker.includes('"./css/coop.css"'));
  assert.ok(worker.includes('"./js/ui/CoopClient.js"'));
  assert.match(worker, /CACHE_NAME = CACHE_PREFIX \+ "v3"/);
});
