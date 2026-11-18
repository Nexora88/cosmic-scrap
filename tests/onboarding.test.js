import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

test("first-run tutorial is not mounted or triggered after language selection", () => {
  assert.doesNotMatch(main, /Onboarding|onboarding/);
  assert.match(main, /\$\("start"\)\.addEventListener\("click",\(\)=>\{audio\.ui\(\);startGame\(\)\}\)/);
  assert.doesNotMatch(html, /onboarding|field-guide/);
});

test("removed guide assets are not part of the offline PWA shell", () => {
  assert.doesNotMatch(worker, /onboarding\.css|Onboarding\.js/);
  assert.ok(worker.includes('"./css/coop.css"'));
  assert.ok(worker.includes('"./js/ui/CoopClient.js"'));
  assert.match(worker, /CACHE_NAME = CACHE_PREFIX \+ "v5"/);
});
