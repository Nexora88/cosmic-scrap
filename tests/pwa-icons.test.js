import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync(resolve("manifest.webmanifest"), "utf8"));
const appIcon = readFileSync(resolve("assets/taviro-app-icon.svg"), "utf8");

assert.deepEqual(
  manifest.icons.map(({ src, sizes, type, purpose }) => ({ src, sizes, type, purpose })),
  [
    { src: "assets/taviro-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "assets/taviro-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "assets/taviro-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
  ],
  "Android must receive standard raster install icons while browsers retain the vector TAVIRO icon"
);
assert.ok(appIcon.includes('<title id="title">TAVIRO</title>'));
assert.ok(appIcon.includes('>TAVIRO</text>'));
assert.ok(appIcon.includes('stroke="url(#orbit)"'));

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
