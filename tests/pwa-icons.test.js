import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync(resolve("manifest.webmanifest"), "utf8"));
const appIcon = readFileSync(resolve("assets/taviro-app-icon.svg"), "utf8");

assert.equal(manifest.icons.length, 1, "Install manifest must not offer stale PNG or symbol-only fallback icons");
assert.deepEqual(manifest.icons[0], {
  src: "assets/taviro-app-icon.svg",
  sizes: "any",
  type: "image/svg+xml",
  purpose: "any"
});
assert.ok(appIcon.includes('<title id="title">TAVIRO</title>'));
assert.ok(appIcon.includes('>TAVIRO</text>'));
assert.ok(appIcon.includes('stroke="url(#orbit)"'));
