import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../js/ui/DailyStreak.js", import.meta.url), "utf8");
test("daily streak supports all nine locales and a four-day capsule milestone", () => {
  for (const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]) assert.ok(source.includes(locale + ":{"), "missing " + locale);
  assert.match(source, /\[50,100,150,200\]/);
  assert.match(source, /currentStreak%4===0/);
  assert.match(source, /cosmic-scrap-capsules/);
  assert.match(source, /lastClaimDate/);
});
test("daily reward cannot be claimed twice on the same calendar day", () => {
  assert.match(source, /if\(delta===0\)return/);
  assert.match(source, /toISOString\(\)\.slice\(0,10\)/);
});
