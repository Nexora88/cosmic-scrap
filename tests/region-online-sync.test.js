import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const onlineHub = readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");

test("conquering a region emits the event consumed by the online conquest board", () => {
  assert.match(main, /cosmic-scrap:submit-region-capture/);
  assert.match(onlineHub, /addEventListener\("cosmic-scrap:submit-region-capture",\s*submitRegionCapture\)/);
});

test("region capture sync keeps the region identifier in the event payload", () => {
  assert.match(main, /cosmic-scrap:submit-region-capture",\{detail:\{regionId\}\}/);
  assert.match(onlineHub, /callRpc\("capture_pilot_region",\{p_region_id:regionId\}\)/);
});
