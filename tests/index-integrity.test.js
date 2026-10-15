import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("game shell includes its module entry points and closes the document", () => {
  for (const src of [
    "js/main.js",
    "js/language.js",
    "js/optional-online-loader.js",
    "js/intro-and-match.js",
  ]) {
    assert.match(html, new RegExp('<script\\s+type="module"\\s+src="' + src.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&") + '"'));
  }
  assert.match(html, /<main\\b[\\s\\S]*<\\/main>/);
  assert.match(html, /<\\/body>\\s*<\\/html>\\s*$/);
});

test("every static main.js element lookup exists in index.html", async () => {
  const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
  const ids = new Set([...html.matchAll(/\\bid="([^"]+)"/g)].map((match) => match[1]));
  const lookups = new Set([...main.matchAll(/\\$\\(["']([^"']+)["']\\)/g)].map((match) => match[1]));
  assert.deepEqual([...lookups].filter((id) => !ids.has(id)), []);
});

test("game shell has no duplicate IDs", () => {
  const all = [...html.matchAll(/\\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = all.filter((id, index) => all.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

test("core interactive panels are present", () => {
  const ids = new Set([...html.matchAll(/\\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const id of [
    "start",
    "pause",
    "upgrade-cards",
    "death-screen",
    "meta-screen",
    "meta-close",
    "settings-screen",
    "settings-close",
    "local-pilot-card",
    "toast",
    "joystick",
  ]) {
    assert.ok(ids.has(id), `Missing required game element: ${id}`);
  }
});
