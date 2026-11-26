import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {Player} from "../js/entities/Player.js";
import {Projectile} from "../js/entities/Projectile.js";

function mockContext(){
 const calls=[];
 const ctx=new Proxy({createLinearGradient(){calls.push("gradient");return{addColorStop(){}}}},{
  get(target,key){if(key in target)return target[key];return (...args)=>calls.push(String(key))}
 });
 return {ctx,calls};
}

test("equipped trail, ship, aura, symbol, banner and badge cosmetics render on the player",()=>{
 const player=new Player(100,100,{});
 for(let i=0;i<5;i++)player.update(.04,{x:1,y:0,pointer:{down:false,active:false}},500,500);
 const {ctx,calls}=mockContext();
 player.draw(ctx,"blue",{trail:"rainbow",ship:"frame-2",aura:"aura-1",symbol:"symbol-1",banner:"banner-1",badge:"badge-1",color:"cyan"});
 assert.ok(calls.includes("gradient"));
 assert.ok(calls.filter(x=>x==="stroke").length>=3);
 assert.ok(calls.includes("fillText"));
});

test("unsupported projectile cosmetic variants are not exposed or stored",()=>{
 const cosmetics=fs.readFileSync(new URL("../js/systems/Cosmetics.js",import.meta.url),"utf8");
 const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");
 const projectile=fs.readFileSync(new URL("../js/entities/Projectile.js",import.meta.url),"utf8");
 assert.doesNotMatch(cosmetics,/projectile:/);
 assert.doesNotMatch(game,/cosmic-scrap-equipped-projectile/);
 assert.doesNotMatch(projectile,/skin==="star"|skin==="plasma"/);
 const shot=new Projectile(100,100,{x:200,y:100},10,300);
 const {ctx,calls}=mockContext();
 shot.draw(ctx);
 assert.ok(calls.includes("stroke"));
});
