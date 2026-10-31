import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("space backdrop contains only a deep-black star field",()=>{
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(game,/this\.lowEnd\?150:280/);
 assert.match(game,/colors=\["#ffffff","#dceaff","#c9e4ff","#fff0d2"\]/);
 assert.match(game,/Deep black space: no planets, nebulae, clouds, or sector-tinted scenery/);
 assert.match(game,/c\.globalCompositeOperation="screen"/);
 assert.doesNotMatch(game,/drawRegionBackdrop|drawNebula|drawPlanet/);
 assert.doesNotMatch(game,/createRadialGradient/);
});
test("region backdrops are integrated before gameplay entities",()=>{
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(game,/drawRegionBackdrop\(c,this\.region,this\.elapsed/);
 const draw=game.slice(game.indexOf(" draw(){"));
 assert.ok(draw.indexOf("drawRegionBackdrop(c,this.region")<draw.indexOf("for(const e of this.enemies)"));
});
test("ambient audio is gated by sound preference and region changes",()=>{
 const main=fs.readFileSync(new URL("../js/main.js",import.meta.url),"utf8");
 assert.match(main,/startAmbience\(regionId="debris"\)/);
 assert.match(main,/setTargetAtTime\(\.032\*this\.volume/);
 assert.match(main,/audio\.startAmbience\(game\.region\?\.id\)/);
 assert.match(main,/audio\.pauseAmbience\(true\)/);
});
test("haptics are opt-in and cover damage, boss and sector events",()=>{
 const main=fs.readFileSync(new URL("../js/main.js",import.meta.url),"utf8");
 assert.match(main,/if\(!this\.vibration\|\|!navigator\.vibrate\)return/);
 for(const event of ["damage","boss","sector","kill","level","upgrade","combo","storm"])assert.match(main,new RegExp('haptic\\("'+event+'"\\)'));
 assert.match(main,/vibrationSetting\.checked=audio\.vibration/);
});
