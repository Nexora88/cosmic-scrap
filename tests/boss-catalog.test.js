import test from "node:test";
import assert from "node:assert/strict";
import {BOSS_CATALOG,BOSS_TYPES} from "../js/systems/Encounters.js";
import {Enemy} from "../js/entities/Enemy.js";

test("boss catalog covers every boss type used by the spawn cycle",()=>{
  assert.deepEqual(Object.keys(BOSS_CATALOG).sort(),[...BOSS_TYPES].sort());
});

test("scanner base stats are the same values used by live boss entities",()=>{
  for(const type of BOSS_TYPES){
    const base=BOSS_CATALOG[type];
    const enemy=new Enemy(100,120,type,0);
    assert.equal(enemy.size,base.size,type+" size");
    assert.equal(enemy.maxHealth,base.health,type+" base health");
    assert.equal(enemy.speed,base.speed*48,type+" base movement speed");
    assert.equal(enemy.xp,base.xp,type+" XP reward");
    assert.equal(enemy.damage,base.damage,type+" base contact damage");
    assert.equal(enemy.shootCooldown,base.interval,type+" attack interval");
  }
});

test("boss scanner provides both Turkish and English names and patterns",()=>{
  for(const type of BOSS_TYPES){
    const entry=BOSS_CATALOG[type];
    assert.ok(entry.name.en&&entry.name.tr,type+" localized name");
    assert.ok(entry.style.en&&entry.style.tr,type+" localized pattern");
  }
});
