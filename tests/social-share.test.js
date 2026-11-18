import test from "node:test";
import assert from "node:assert/strict";
import {SOCIAL_COPY,SOCIAL_PANEL_COPY,buildInviteEmail,buildScoreShareText} from "../js/systems/SocialShare.js";
const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
test("social sharing and invitation copy is available in all nine locales",()=>{
 for(const locale of locales){assert.ok(SOCIAL_COPY[locale].share);assert.ok(SOCIAL_COPY[locale].invite);assert.ok(SOCIAL_COPY[locale].note);assert.ok(SOCIAL_PANEL_COPY[locale].heading);assert.ok(SOCIAL_PANEL_COPY[locale].description);}
});
test("score share text includes a normalized score and TAVIRO identity",()=>{
 assert.match(buildScoreShareText(12345,"Pilot","en"),/Pilot/);\n assert.match(buildScoreShareText(12345,"Pilot","en"),/12,345/);
 assert.match(buildScoreShareText(12345,"Pilot","tr"),/12\.345/);
 assert.match(buildScoreShareText(-4),/0/);
});
test("email invitation contains the supplied game URL and localized subject",()=>{
 const invite=buildInviteEmail("https://example.test/game","tr");
 assert.equal(invite.subject,SOCIAL_COPY.tr.subject);
 assert.match(invite.body,/https:\/\/example\.test\/game/);
});
