import test from "node:test";
import assert from "node:assert/strict";
import {Enemy} from "../js/entities/Enemy.js";

test("phase stalker gives a one-second warning before teleporting",()=>{
 const enemy=new Enemy(0,0,"phaseStalker",90);
 const player={x:300,y:0,slowAura:0};
 enemy.blinkClock=.01;
 enemy.update(.02,player);
 assert.ok(enemy.blinkWarning>.9&&enemy.blinkWarning<=1);
 const before=Math.hypot(enemy.x-player.x,enemy.y-player.y);
 enemy.update(1.01,player);
 const after=Math.hypot(enemy.x-player.x,enemy.y-player.y);
 assert.ok(before>0);
 assert.ok(after>=175&&after<=230);
 assert.equal(enemy.blinkWarning,0);
 assert.ok(enemy.blinkClock>3);
});

test("fast enemies use a higher movement speed than the baseline normal enemy",()=>{
 const fast=new Enemy(0,0,"fast",90);
 const normal=new Enemy(0,0,"normal",90);
 assert.ok(fast.speed>normal.speed);
});
