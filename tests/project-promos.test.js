import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { getNextPromo, PROMO_CAMPAIGNS } from "../js/systems/PromoCampaigns.js";
test("only the optional Nexora AI showcase remains and its video asset exists",()=>{assert.equal(PROMO_CAMPAIGNS.length,1);const [campaign]=PROMO_CAMPAIGNS;assert.equal(campaign.id,"nexora-ai");assert.ok(campaign.title&&campaign.titleTr&&campaign.description&&campaign.descriptionTr);const path=resolve(process.cwd(),campaign.src);assert.ok(existsSync(path),campaign.src+" must exist");assert.ok(statSync(path).size>100_000,campaign.src+" must not be an empty placeholder")});
test("the optional showcase never rotates to another project",()=>{assert.equal(getNextPromo("nexora-ai").id,"nexora-ai");assert.equal(getNextPromo("unknown").id,"nexora-ai");assert.equal(getNextPromo("anything",[]),null)});
