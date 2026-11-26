import test from "node:test";
import assert from "node:assert/strict";
import {Player} from "../js/entities/Player.js";
import {Projectile} from "../js/entities/Projectile.js";

function mockContext(){
 const calls=[];
 const ctx=new Proxy({createLinearGradient(){calls.push("gradient");return{addColorStop(){}}}},{
  get(target,key){if(key in target)return target[key];return (...args)=>calls.push(String(key))}
 });
 return {ctx,calls};
}

test("equipped trail and ship cosmetics render on the player",()=>{
 const player=new Player(100,100,{});
 for(let i=0;i<5;i++)player.update(.04,{x:1,y:0,pointer:{down:false,active:false}},500,500);
 const {ctx,calls}=mockContext();
 player.draw(ctx,"blue",{trail:"rainbow",ship:"neon-outline"});
 assert.ok(calls.includes("gradient"));
 assert.ok(calls.filter(x=>x==="stroke").length>=2);
});

test("projectile skin variants are not exposed as player cosmetics",()=>{\n const cosmetics=fs.readFileSync(new URL("../js/systems/Cosmetics.js",import.meta.url),"utf8");\n const game=fs.readFileSync(new URL("../js/core/Game.js",import.meta.url),"utf8");\n const projectile=fs.readFileSync(new URL("../js/entities/Projectile.js",import.meta.url),"utf8");\n assert.doesNotMatch(cosmetics,/projectile:/);\n assert.doesNotMatch(game,/cosmic-scrap-equipped-projectile/);\n assert.doesNotMatch(projectile,/skin==="star"|skin==="plasma"/);\n const shot=new Projectile(100,100,{x:200,y:100},10,300);\n const {ctx,calls}=mockContext();\n shot.draw(ctx);\n assert.ok(calls.includes("stroke"));\n});
