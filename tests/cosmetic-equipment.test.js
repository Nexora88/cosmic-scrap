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

test("equipped star and plasma projectile skins render",()=>{
 const target={x:200,y:100};
 const star=new Projectile(100,100,target,10,300);
 const plasma=new Projectile(100,100,target,10,300);
 const a=mockContext(),b=mockContext();
 star.draw(a.ctx,"star");
 plasma.draw(b.ctx,"plasma");
 assert.ok(a.calls.includes("fill"));
 assert.ok(b.calls.includes("arc"));
});
