import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inflateSync } from "node:zlib";

const manifest = JSON.parse(readFileSync(resolve("manifest.webmanifest"), "utf8"));
const pngIcons = manifest.icons.filter(icon => icon.type === "image/png");
const svgIcons = manifest.icons.filter(icon => icon.type === "image/svg+xml");
assert.equal(pngIcons.length, 0, "PWA manifest must not keep the obsolete symbol-only PNG icons");
assert.ok(svgIcons.some(icon => icon.sizes === "512x512"), "PWA manifest must include the square TAVIRO wordmark SVG icon");
for (const icon of svgIcons) {
  const svg = readFileSync(resolve(icon.src), "utf8");
  assert.match(svg, /<title[^>]*>TAVIRO<\/title>/, `${icon.src} must identify the TAVIRO wordmark`);
  assert.match(svg, /<text[^>]*>TAVIRO<\/text>/, `${icon.src} must visibly contain the TAVIRO wordmark`);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

for (const icon of pngIcons) {
  const file = resolve(icon.src);
  const png = readFileSync(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${icon.src} must have a valid PNG signature`);
  let offset = 8;
  let width = 0;
  let height = 0;
  let foundEnd = false;
  const imageData = [];
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const end = offset + 12 + length;
    assert.ok(end <= png.length, `${icon.src} contains a truncated PNG chunk`);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const expectedCrc = png.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(png.subarray(offset + 4, offset + 8 + length));
    assert.equal(actualCrc, expectedCrc, `${icon.src} has an invalid ${type} chunk checksum`);
    if (type === "IDAT") imageData.push(png.subarray(offset + 8, offset + 8 + length));
    if (type === "IHDR") {
      width = png.readUInt32BE(offset + 8);
      height = png.readUInt32BE(offset + 12);
    }
    offset = end;
    if (type === "IEND") {
      foundEnd = true;
      break;
    }
  }
  assert.equal(foundEnd, true, `${icon.src} must end with an IEND chunk`);
  const decodedPixels = inflateSync(Buffer.concat(imageData));
  assert.equal(decodedPixels.length, height * (width + 1), `${icon.src} image data must decompress to complete rows`);
  assert.equal(offset, png.length, `${icon.src} must not contain trailing or truncated data`);
  assert.equal(`${width}x${height}`, icon.sizes, `${icon.src} dimensions must match the manifest`);
}
