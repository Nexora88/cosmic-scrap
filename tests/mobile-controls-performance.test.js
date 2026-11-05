import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=(path)=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("index.html"),main=read("js/main.js"),css=read("css/premium-ui.css"),game=read("js/core/Game.js"),enemy=read("js/entities/Enemy.js"),promos=read("js/ui/HousePromos.js"),backdrop=read("js/systems/RegionBackdrop.js");
test("mobile joystick is visible and side is configurable with right as default",()=>{assert.match(html,/id="setting-control-side"/);assert.match(main,/cosmic-scrap-control-side.*"right"/);assert.match(main,/joystick-left/);assert.match(css,/#joystick\{[^}]*opacity:\.72/);assert.match(css,/#joystick\.joystick-left\{left:16px;right:auto\}/)});
test("performance fallback reduces pixel ratio, entity caps and canvas blur",()=>{assert.match(game,/coarsePointer\?1\.1:1\.5/);assert.match(game,/this\.lowEnd\|\|this\.adaptiveEffects\)\?0\.85/);assert.match(game,/this\.maxEnemies=this\.lowEnd\?140:220/);assert.match(game,/this\.maxParticles=this\.lowEnd\?70:140/);assert.match(game,/frameCostHighFrames>=24/);assert.match(enemy,/draw\(ctx,reduced=false\)/);assert.match(enemy,/ctx\.shadowBlur=reduced\?0/)});
test("static starfield is cached and full-width HUD filters are disabled",()=>{assert.match(backdrop,/cachedCanvas/);assert.match(backdrop,/ctx\.drawImage\(cachedCanvas/);assert.match(css,/.hud\{background:none!important;filter:none\}/)});
test("menu returns do not launch interstitial promotions and only Nexora AI remains",()=>{assert.doesNotMatch(promos,/menu-return|house-interstitial|house-revive|nexora-quant|x\.com/);assert.match(promos,/nexora-ai/)});
