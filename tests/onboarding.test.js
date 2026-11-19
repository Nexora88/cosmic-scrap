import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

test("first-run onboarding is absent and Start launches the game directly", () => {
  assert.doesNotMatch(html, /onboarding|field-guide/i);
  assert.doesNotMatch(main, /Onboarding|onboarding/);
  assert.match(main, /\$\("start"\)\.addEventListener\("click",\(\)=>\{audio\.ui\(\);startGame\(\)\}\);/);
});

test("offline shell no longer precaches removed onboarding assets", () => {
  assert.doesNotMatch(worker, /onboarding/i);
  assert.match(worker, /CACHE_NAME = CACHE_PREFIX \+ "v16"/);
  assert.ok(!worker.includes('"./js/ui/CoopClient.js"'));
});
