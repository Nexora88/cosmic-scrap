import test from "node:test";
import assert from "node:assert/strict";
import { drawPilotFlag, flagStyle, flagCountryCode } from "../js/entities/Player.js";

test("Turkish pilot flag uses a deterministic vector design",()=>{
 assert.equal(flagStyle("🇹🇷"),"turkey");
 assert.equal(flagStyle("🇹🇷🔥"),"turkey");
});
test("Azerbaijani pilot flag uses its own vector design",()=>{
 assert.equal(flagStyle("🇦🇿"),"azerbaijan");
});
test("other flags use the safe generic vector fallback",()=>{
 assert.equal(flagStyle("🇺🇸"),"generic");
 assert.equal(flagStyle(""),"generic");
});
test("desktop flag renderer draws without Canvas roundRect support",()=>{
 const calls={fillRect:0,stroke:0,clip:0};
 const ctx={
  save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
  fill(){},clip(){calls.clip++},stroke(){calls.stroke++},arc(){},
  fillRect(){calls.fillRect++}
 };
 assert.doesNotThrow(()=>drawPilotFlag(ctx,"🇹🇷","#fff"));
 assert.ok(calls.fillRect>0,"flag color fields must be painted");
 assert.ok(calls.clip>0,"flag must be clipped to its badge");
 assert.ok(calls.stroke>0,"flag badge must receive a visible outline");
});
test("flag renderer handles non-Turkish flags with vector fallback",()=>{
 const calls={fillRect:0};
 const ctx={
  save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
  fill(){},clip(){},stroke(){},arc(){},fillRect(){calls.fillRect++}
 };
 assert.doesNotThrow(()=>drawPilotFlag(ctx,"🇺🇸","#fff"));
 assert.equal(calls.fillRect,3);
});

test("country flag emoji resolves to an ISO code for image-backed rendering",()=>{
 assert.equal(flagCountryCode("🇹🇷"),"TR");
 assert.equal(flagCountryCode("🇺🇸"),"US");
 assert.equal(flagCountryCode("🇹🇷🔥"),"TR");
 assert.equal(flagCountryCode("🌌"),"");
});
