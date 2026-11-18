import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hub=fs.readFileSync(new URL("../js/online-hub.js",import.meta.url),"utf8");
const cloud=fs.readFileSync(new URL("../js/cloud-account.js",import.meta.url),"utf8");
const first=fs.readFileSync(new URL("../supabase/migrations/20261118160106_disable_unverified_casual_score_submissions.sql",import.meta.url),"utf8");
const second=fs.readFileSync(new URL("../supabase/migrations/20261118160201_disable_unverified_progress_and_legacy_room_scores.sql",import.meta.url),"utf8");
const docs=fs.readFileSync(new URL("../docs/CASUAL-ANTI-CHEAT.md",import.meta.url),"utf8");

test("unverified online score writes are disabled in the browser",()=>{
 assert.match(hub,/CASUAL_SCORE_SUBMISSIONS_ENABLED = false/);
 assert.match(hub,/casualPaused/);
 assert.ok(!hub.includes('callRpc("submit_run_record"'));
 assert.ok(!cloud.includes('rpc("record_player_run"'));
});

test("database migrations revoke legacy client score and career write RPCs",()=>{
 assert.match(first,/REVOKE EXECUTE ON FUNCTION public\.submit_run_record/);
 assert.match(second,/REVOKE EXECUTE ON FUNCTION public\.record_player_run/);
 assert.match(second,/REVOKE EXECUTE ON FUNCTION public\.submit_room_score/);
 assert.match(docs,/server-authoritative/);
});
