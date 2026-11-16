import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const registration = fs.readFileSync(new URL("../js/pwa.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("TAVIRO has a relative, installable web-app manifest for GitHub Pages subpaths", () => {
  assert.equal(manifest.name, "TAVIRO — One core. Infinite void.");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some(icon => icon.src === "assets/taviro-mark.svg" && icon.sizes === "any"));
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
});

test("offline worker precaches the shell and falls back to the cached app on navigation", () => {
  for (const asset of ["./index.html","./manifest.webmanifest","./css/style.css","./css/ui.css","./js/main.js","./assets/taviro-logo.svg"]) {
    assert.ok(worker.includes('"'+asset+'"'), "missing shell asset "+asset);
  }
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /caches\.match\("\.\/index\.html"\)/);
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /request\.method !== "GET"/);
});

test("service worker registration is secure-context only and scoped to the game directory", () => {
  assert.match(registration, /location\.protocol === "https:"/);
  assert.match(registration, /navigator\.serviceWorker\.register\("\.\/sw\.js", \{ scope: "\.\/" \}\)/);
  assert.match(registration, /catch\(error => console\.warn/);
});
