import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
const ui = await readFile(new URL("../css/ui.css", import.meta.url), "utf8");
const style = await readFile(new URL("../css/style.css", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("classic game no longer initializes the command center or planetary travel", () => {
  assert.doesNotMatch(main, /initFrontierCommand|initFrontierMap|initPlanetaryTravel|frontierCommand/);
  assert.match(packageJson.scripts.check, /js\/core\/Game\.js/);
});

test("arena keeps the classic 2D starfield with subtle background animation", () => {
  assert.match(game, /createRadialGradient/);
  assert.match(game, /Math\.sin\(this\.elapsed\*s\.rate\+s\.phase\)/);
  assert.doesNotMatch(game, /WebGLRenderer|THREE\.WebGLRenderer|spaceTint|speedDrive|comboDrive/);
  assert.doesNotMatch(style, /space-drift|#app::before/);
});

test("movement joystick is visible on desktop and mobile", () => {
  assert.match(ui, /#joystick\{display:flex;/);
  assert.match(ui, /\.hud\{gap:9px;padding:12px\}/);
});

test("run XP gain is increased while scrap accounting stays separate", () => {
  assert.match(game, /this\.xp\+=o\.value\*this\.combo\.multiplier\*1\.8;/);
  assert.match(game, /this\.scrapCollected\+=o\.value;/);
});
