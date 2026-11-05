import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { getNextPromo, PROMO_CAMPAIGNS } from "../js/systems/PromoCampaigns.js";

test("project promo campaigns reference real, non-empty video assets", () => {
  assert.equal(PROMO_CAMPAIGNS.length, 1, "only the Nexora AI introduction is enabled until ads are added later");
  assert.equal(PROMO_CAMPAIGNS[0].id, "nexora-ai");
  assert.ok(!PROMO_CAMPAIGNS.some(campaign => /quant/i.test(campaign.id + " " + campaign.title)));
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

test("project promo rotation never repeats the last campaign consecutively", () => {
  assert.equal(getNextPromo("nexora-ai").id, "nexora-ai");
  assert.equal(getNextPromo("unknown", PROMO_CAMPAIGNS, () => 0).id, "nexora-ai");
  assert.equal(getNextPromo("unknown", PROMO_CAMPAIGNS, () => 0.99).id, "nexora-ai");
  assert.equal(getNextPromo("anything", []), null);
});
