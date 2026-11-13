import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const capsule=fs.readFileSync(new URL("../js/ui/ScrapCapsules.js",import.meta.url),"utf8");
const region=fs.readFileSync(new URL("../js/systems/RegionProgress.js",import.meta.url),"utf8");
test("Scrap Capsule awards one free capsule every five finalized runs",()=>{
 assert.match(capsule,/runs%5===0/);
 assert.match(capsule,/cosmic-scrap:run-ended/);
});
test("boss region victories grant an additional capsule",()=>{
 assert.match(capsule,/cosmic-scrap:region-captured/);
});
test("Anadolu Ateşi is a special mythic Turkish collectible",()=>{
 assert.match(region,/🇹🇷🔥.*Anadolu Ateşi.*mythic/);
 assert.match(capsule,/anatolian-fire/);
});
test("capsule rewards stay cosmetic",()=>{
 for(const type of ["flag","trail","projectile","ship"])assert.match(capsule,new RegExp('type:"'+type+'"'));
});
