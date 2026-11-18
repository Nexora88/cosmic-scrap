import test from "node:test";
import assert from "node:assert/strict";
import {CAPSULE_COPY} from "../js/systems/CapsuleLocale.js";
const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
test("the full cosmetic reward catalogue has localized headings and ownership states",()=>{
 for(const locale of locales){
  assert.ok(CAPSULE_COPY[locale].catalog,locale+" missing catalogue heading");
  assert.ok(CAPSULE_COPY[locale].catalogOwned,locale+" missing owned state");
  assert.ok(CAPSULE_COPY[locale].catalogPool,locale+" missing available state");
 }
});
