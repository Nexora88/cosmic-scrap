import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync(resolve("manifest.webmanifest"), "utf8"));
const tabIcon = readFileSync(resolve("assets/icon.svg"), "utf8");
const homePage = readFileSync(resolve("index.html"), "utf8");
const profilePage = readFileSync(resolve("profile.html"), "utf8");

assert.deepEqual(
  manifest.icons,
  [
    { src: "assets/taviro-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "assets/file_000000006ab48210ad25f9ce34cd5632.png", sizes: "512x512", type: "image/png", purpose: "any" }
  ],
  "Chrome installability requires declared 192px and 512px raster icons; keep the supplied TAVIRO app icon for the 512px install asset"
);
assert.ok(tabIcon.includes("<svg"), "the browser tab must keep the original bright-star icon.svg");
assert.ok(homePage.includes('rel="icon" type="image/svg+xml" href="assets/icon.svg"'), "keep the bright-star tab icon unchanged");
assert.ok(homePage.includes('rel="apple-touch-icon" href="assets/taviro-icon-180.png"'), "iOS home-screen installs use the original TAVIRO icon");
assert.ok(profilePage.includes('rel="apple-touch-icon" href="./assets/taviro-icon-180.png"'), "profile page uses the same iOS icon");

for (const [path, size] of [
  ["assets/taviro-icon.png", 512],
  ["assets/taviro-icon-192.png", 192],
  ["assets/taviro-icon-180.png", 180]
]) {
  const png = readFileSync(resolve(path));
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", path + " must be a PNG");
  assert.equal(png.readUInt32BE(16), size, path + " width");
  assert.equal(png.readUInt32BE(20), size, path + " height");
}
