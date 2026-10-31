import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("each sector has a distinct cinematic planetary identity",()=>{
 const source=fs.readFileSync(new URL("../js/systems/RegionBackdrop.js",import.meta.url),"utf8");
 for(const id of ["debris","ember","cryo","rift","starforge"])assert.match(source,new RegExp("\\b"+id+":"));
 assert.match(source,/function drawPlanet/);
 assert.match(source,/function drawNebula/);
 assert.match(source,/Math\.sin\(t/);
 assert.match(source,/lowEnd\?5:10/);
 assert.match(source,/ctx\.createRadialGradient/);
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
