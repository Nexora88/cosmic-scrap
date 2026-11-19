import test from "node:test";
import assert from "node:assert/strict";
import {CAPSULE_COPY} from "../js/systems/CapsuleLocale.js";
import {COSMETIC_REWARDS,COSMETIC_TIER_ORDER,COSMETIC_ALLOWED_VALUES} from "../js/systems/CosmeticCatalog.js";
const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
test("the launch cosmetic catalogue contains at least 150 unique visual-only rewards",()=>{
 assert.ok(COSMETIC_REWARDS.length>=150);
 assert.equal(new Set(COSMETIC_REWARDS.map(item=>item.id)).size,COSMETIC_REWARDS.length);
 for(const item of COSMETIC_REWARDS){assert.ok(COSMETIC_TIER_ORDER.includes(item.rarity));assert.ok(COSMETIC_ALLOWED_VALUES[item.type]?.has(item.value));}
});
test("the eight mineral rarity tiers are ordered and localized in all nine locales",()=>{
 assert.deepEqual(COSMETIC_TIER_ORDER,["copper","iron","silver","gold","platinum","titanium","obsidian","elite"]);
 for(const locale of locales){for(const tier of COSMETIC_TIER_ORDER)assert.ok(CAPSULE_COPY[locale][tier],locale+" missing "+tier);}
});
test("all catalogue pages have localized category and ownership labels",()=>{
 for(const locale of locales){for(const key of ["catalog","catalogOwned","catalogPool","flag","banner","ship","color","trail","symbol","aura","badge"])assert.ok(CAPSULE_COPY[locale][key],locale+" missing "+key);}
});
