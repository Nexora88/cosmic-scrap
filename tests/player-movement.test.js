import test from "node:test";
import assert from "node:assert/strict";
import {Player} from "../js/entities/Player.js";
import {CONFIG,UPGRADES} from "../js/config.js";

const input=(x=0,y=0)=>({x,y,pointer:{down:false,active:false}});

test("ship movement keeps analog joystick strength instead of forcing full speed",()=>{
 const player=new Player(200,200);
 player.update(1/60,input(.2,0),400,400);
 assert.ok(Math.abs((player.x-200)-player.speed*.2/60)<1e-9);
 assert.equal(player.y,200);
});

test("tiny joystick noise is ignored by the movement deadzone",()=>{
 const player=new Player(200,200);
 player.update(1/60,input(.05,.02),400,400);
 assert.equal(player.x,200);
 assert.equal(player.y,200);
 assert.equal(player.vx,0);
 assert.equal(player.vy,0);
});

test("diagonal keyboard movement is capped to the same total speed",()=>{
 const player=new Player(200,200);
 player.update(1/60,input(1,1),400,400);
 const distance=Math.hypot(player.x-200,player.y-200);
 assert.ok(Math.abs(distance-player.speed/60)<1e-9);
});

test("ship keeps its last heading after movement stops",()=>{
 const player=new Player(200,200);
 player.update(1/60,input(.7,0),400,400);
 const heading=player.facing;
 assert.notEqual(heading,0);
 player.update(1/60,input(0,0),400,400);
 assert.equal(player.facing,heading);
});

test("player speed uses the shared balanced configuration",()=>{
 assert.equal(new Player(0,0).speed,CONFIG.player.speed);
 assert.equal(CONFIG.player.speed,165);
 const speedUpgrade=UPGRADES.find(item=>item.id==="speed");
 const boosted={speed:235};
 speedUpgrade.apply(boosted,2);
 assert.equal(boosted.speed,240);
});
