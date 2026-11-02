import test from "node:test";
import assert from "node:assert/strict";
import { flagStyle } from "../js/entities/Player.js";

test("Turkish pilot flag uses a deterministic vector design",()=>{
 assert.equal(flagStyle("🇹🇷"),"turkey");
});
test("Azerbaijani pilot flag uses its own vector design",()=>{
 assert.equal(flagStyle("🇦🇿"),"azerbaijan");
});
test("other flags use the safe generic vector fallback",()=>{
 assert.equal(flagStyle("🇺🇸"),"generic");
 assert.equal(flagStyle(""),"generic");
});
