import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
const game = await readFile(new URL("../js/core/Game.js", import.meta.url), "utf8");
const backdrop = await readFile(new URL("../js/systems/RegionBackdrop.js", import.meta.url), "utf8");
const ui = await readFile(new URL("../css/ui.css", import.meta.url), "utf8");
const style = await readFile(new URL("../css/style.css", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("classic game no longer initializes the command center or planetary travel", () => {
  assert.doesNotMatch(main, /initFrontierCommand|initFrontierMap|initPlanetaryTravel|frontierCommand/);
  assert.match(packageJson.scripts.check, /js\/core\/Game\.js/);
});

test("arena keeps the classic 2D starfield with subtle background animation", () => {
  assert.match(game, /drawRegionBackdrop/);
  assert.match(backdrop, /createRadialGradient/);
  assert.match(backdrop, /Math\.sin\(t\*/);
  assert.doesNotMatch(backdrop, /drawPlanet|drawNebula|ellipse/);
  assert.doesNotMatch(game, /WebGLRenderer|THREE\.WebGLRenderer|spaceTint|speedDrive|comboDrive/);
  assert.doesNotMatch(style, /space-drift|#app::before/);
});

test("movement joystick is shown only during active gameplay", () => {
  assert.ok(ui.includes("#joystick{display:none;"), "joystick should be hidden outside a run");
  assert.ok(ui.includes("#app.game-active:not(.game-paused):not(:has(#upgrade-screen:not([hidden]))) #joystick{display:flex}"), "joystick should appear only during active play");
  assert.match(ui, /\.hud\{gap:9px;padding:12px\}/);
});

test("run XP gain is increased while scrap accounting stays separate", () => {
  assert.match(game, /this\.xp\+=o\.value\*this\.combo\.multiplier\*2;/);
  assert.match(game, /this\.scrapCollected\+=o\.value;/);
});

test("game loop keeps scheduling frames when the optional render callback is omitted", async () => {
  const loop = await readFile(new URL("../js/core/Loop.js", import.meta.url), "utf8");
  assert.match(loop, /this\.render\?\.\(\)/);
  assert.match(loop, /requestAnimationFrame\(timestamp => this\.frame\(generation, timestamp\)\)/);
});

test("player has a visible 2D pilot craft renderer used by Game.draw", async () => {
  const player = await readFile(new URL("../js/entities/Player.js", import.meta.url), "utf8");
  assert.match(player, /draw\(ctx,skin="blue",cosmeticsOverride,reduced=false\)/);
  assert.match(player, /ctx\.moveTo\(0,-15\*pulse\)/);
  assert.match(player, /ctx\.ellipse\(0,-1/);
  assert.match(game, /this\.player\.draw\?\.\(c,this\.skin,this\.cosmetics,this\.lowEnd\|\|this\.adaptiveEffects\)/);
});
