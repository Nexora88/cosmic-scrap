import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");

test("game shell keeps every interactive panel and entrypoint", () => {
  for (const id of [
    "game", "overlay", "start", "pause-screen", "settings-screen",
    "upgrade-screen", "death-screen", "meta-screen", "account-screen",
    "online-screen", "intro-screen", "match-countdown", "toast", "joystick",
    "local-pilot-card", "setting-volume"
  ]) {
    assert.match(html, new RegExp('\\bid="' + id + '"'), \`missing #\${id}\`);
  }

  for (const src of [
    "js/main.js", "js/language.js",
    "js/optional-online-loader.js", "js/intro-and-match.js"
  ]) {
    assert.ok(html.includes(\`src="\${src}"\`), \`missing script \${src}\`);
  }

  assert.match(html, /<\/body>\s*<\/html>\s*$/);
});

test("game shell contains unique IDs", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, "duplicate HTML IDs break DOM targeting");
});

test("core game DOM references resolve to markup", () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const references = [
    ...main.matchAll(/\$\(["']([^"']+)["']\)|getElementById\(["']([^"']+)["']\)/g)
  ].map((match) => match[1] || match[2]);
  const missing = [...new Set(references.filter((id) => !ids.has(id)))];
  assert.deepEqual(missing, [], \`unresolved DOM IDs: \${missing.join(", ")}\`);
});
