import test from "node:test";
import assert from "node:assert/strict";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";
import fs from "node:fs";

const privacy=fs.readFileSync(new URL("../privacy.html",import.meta.url),"utf8");
const support=fs.readFileSync(new URL("../support.html",import.meta.url),"utf8");
const disclosureKeys=[
"Account: email address and session information managed by Supabase Auth. Pilot profile: username, represented country and optional profile image, which may be public in shared rankings. Game progress: level, XP, achievements, run summaries and cosmetic inventory. First-release online features: account profile and cloud-save backup. New online casual score submissions are paused while server-side run validation is developed; previously stored scores remain unverified. Ranked competition is locked, and Co-op is not included in the first release. Device data: language, audio and accessibility preferences, offline save and local cosmetic preferences.",
"Information is used to authenticate accounts, sync supported profile data, back up supported game saves and manage cosmetic ownership. New online casual score submissions are paused until a server-authoritative solo simulation is ready. Previously stored scores remain client-reported and unverified; they are not eligible for verified competition. Ranked competition is locked and Co-op is not included in this release. TAVIRO does not sell personal data and this version does not include a third-party advertising network or advertising SDK. Public profile fields may be visible to other players.",
"Offline single-player mode can be used without an account. Optional account features and cloud-save backups require an internet connection. Online casual score submissions are paused while server-side validation is developed; previously stored scores are unverified. Co-op is not included in the first release and is planned for a future update. Native Android/iOS packages may be at a different verification stage from the web version."
];

test("privacy and support pages disclose paused score submissions in all nine languages",()=>{
 assert.match(privacy,/New online casual score submissions are paused/);
 assert.match(support,/Online casual score submissions are paused/);
 assert.deepEqual(LEGAL_LOCALES.slice().sort(),["de","en","es","fr","id","ja","pt-BR","ru","tr"].sort());
 for(const locale of LEGAL_LOCALES) for(const key of disclosureKeys){
  assert.ok(LEGAL_TRANSLATIONS[locale][key],"missing score privacy translation: "+locale);
  if(locale!=="en") assert.notEqual(LEGAL_TRANSLATIONS[locale][key],key,"untranslated score privacy copy: "+locale);
 }
});
