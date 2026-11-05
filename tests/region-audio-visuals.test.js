import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("sector backgrounds use a restrained realistic starfield with no planets or cartoon scenery",()=>{
 const source=fs.readFileSync(new URL("../js/systems/RegionBackdrop.js",import.meta.url),"utf8");
 for(const id of ["debris","ember","cryo","rift","starforge"])assert.match(source,new RegExp("\\b"+id+":"));
 assert.match(source,/const count=lowEnd\?140:620/);
 assert.match(source,/createRadialGradient/);
 assert.match(source,/physically-inspired galactic dust band/);
 assert.doesNotMatch(source,/drawPlanet|drawNebula|ellipse\(/);
 assert.doesNotMatch(source,/asteroid|crater|ringed|planet/);
});
test("starfield is rendered as the gameplay background before entities",()=>{
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 assert.match(game,/drawRegionBackdrop\(c,this\.region,this\.elapsed/);
 const draw=game.slice(game.indexOf(" draw(){"));
 assert.ok(draw.indexOf("drawRegionBackdrop(c,this.region")<draw.indexOf("for(const e of this.enemies)"));
 assert.doesNotMatch(draw,/for\(const s of this\.stars\)/);
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

test("pilot ship has animated movement and a compact flag badge",()=>{
 const player=fs.readFileSync(new URL("../js/entities/Player.js",import.meta.url),"utf8");
 assert.match(player,/this\.enginePhase\+=dt\*18/);
 assert.match(player,/ctx\.rotate\(this\.facing\|\|0\)/);
 assert.match(player,/function roundedRectPath\(ctx,x,y,w,h,r\)/);
 assert.match(player,/ctx\.translate\(this\.x,this\.y\);drawPilotFlag\(ctx,flag,colors\.edge\)/);
  assert.doesNotMatch(player,/fillText\(flag/);
});
test("raid events provide warning, wave and completion cues",()=>{
 const audio=fs.readFileSync(new URL("../js/utils/Audio.js",import.meta.url),"utf8");
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 for(const cue of ["raidWarning","raidWave","raidComplete"])assert.match(audio,new RegExp(cue+"\\("));
 for(const cue of ["raidWarning","raidWave","raidComplete"])assert.match(game,new RegExp("audio\\?\\."+cue));
});
