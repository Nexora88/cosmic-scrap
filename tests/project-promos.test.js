import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { getNextPromo, PROMO_CAMPAIGNS } from "../js/systems/PromoCampaigns.js";

test("project promo campaigns reference real, non-empty video assets", () => {
  assert.equal(PROMO_CAMPAIGNS.length, 1, "only the Turkish Nexora AI house campaign remains");
  assert.equal(PROMO_CAMPAIGNS[0].id, "nexora-ai");
  assert.deepEqual(PROMO_CAMPAIGNS[0].locales, ["tr"]);
  assert.equal(PROMO_CAMPAIGNS.some(campaign => campaign.id === "nexora-quant"), false);
  for (const campaign of PROMO_CAMPAIGNS) {
    assert.match(campaign.id, /^[a-z0-9-]+$/);
    assert.ok(campaign.title);
    assert.ok(campaign.titleTr);
    assert.ok(campaign.description);
    assert.ok(campaign.descriptionTr);
    const path = resolve(process.cwd(), campaign.src);
    assert.ok(existsSync(path), campaign.src + " must exist");
    assert.ok(statSync(path).size > 100_000, campaign.src + " must not be an empty placeholder");
  }
});

test("the single Turkish house campaign is stable and safe when no other campaign is approved", () => {
  assert.equal(getNextPromo("nexora-ai").id, "nexora-ai");
  assert.equal(getNextPromo("unknown", PROMO_CAMPAIGNS, () => 0).id, "nexora-ai");
  assert.equal(getNextPromo("anything", []), null);
});

test("X account promotion links and forced opens are removed", async () => {
 const {readFile} = await import("node:fs/promises");
 const source = await readFile(new URL("../js/ui/HousePromos.js", import.meta.url), "utf8");
 assert.doesNotMatch(source, /https:\/\/x\.com\/nexora88team/);
 assert.doesNotMatch(source, /window\.open\(/);
});

test("Nexora showcase controls and descriptions have all nine locale entries", async () => {
 const {readFile} = await import("node:fs/promises");
 const source = await readFile(new URL("../js/ui/HousePromos.js", import.meta.url), "utf8");
 for (const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"]) {
  assert.ok(source.includes(locale), "missing showcase locale " + locale);
 }
 assert.match(source,/cosmic-scrap:showcase-open/);
 assert.match(source,/cosmic-scrap:showcase-close/);
 assert.match(source,/cosmic-scrap:language-changed/);
 assert.match(source,/showcaseLocale\(\) === "tr"/);
 assert.match(source,/trigger\.hidden = lang !== "tr"/);
});

test("death continue and developer spotlight are fully localized and independent of third-party ad networks", async () => {
 const {readFile}=await import("node:fs/promises");
 const source=await readFile(new URL("../js/ui/HousePromoOverlay.js",import.meta.url),"utf8");
 for(const locale of ["en","tr","pt-BR","es","ru","id","de","fr","ja"])assert.ok(source.includes(locale+":{")||source.includes('"'+locale+'":{'),"missing locale "+locale);
 assert.match(source,/INDEPENDENT GAME DEVELOPMENT · TÜRKİYE/);
 assert.match(source,/BAĞIMSIZ OYUN GELİŞTİRME · TÜRKİYE/);
 assert.doesNotMatch(source,/Poki|CrazyGames|crazygames/i);
 assert.match(source,/cosmic-scrap:language-changed/);
 assert.match(source,/cosmic-scrap:revive-result/);
 assert.match(source,/cosmic-scrap:run-finalized/);
 assert.match(source,/cosmic-scrap:run-restarted/);
});
