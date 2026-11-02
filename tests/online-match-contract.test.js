import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "supabase/functions/online-match/index.ts"), "utf8");

test("online-match authenticates the bearer token before accepting actions", () => {
  assert.match(source, /Authorization/);
  assert.match(source, /caller\.auth\.getUser\(token\)/);
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("online-match CORS is restricted to the game origin and local development", () => {
  assert.match(source, /https:\/\/nexora88\.github\.io/);
  assert.match(source, /allowedOrigins\.has\(origin\)/);
  assert.doesNotMatch(source, /Access-Control-Allow-Origin["']:\s*["']\*["']/);
});

test("request bodies are byte-bounded while streaming", () => {
  assert.match(source, /size > 8192/);
  assert.match(source, /reader\.cancel\(\)/);
});

test("player movement inputs are clamped to the server's accepted range", () => {
  assert.match(source, /clamp\(Number\(inputBody\.dx\),-1,1\)/);
  assert.match(source, /clamp\(Number\(inputBody\.dy\),-1,1\)/);
});

test("Co-op actions require a live friend room and participant membership", () => {
  assert.match(source, /room\.room_mode!==\"friend\"/);
  assert.match(source, /!\[room\.host_user_id,room\.guest_user_id\]\.includes\(userId\)/);
  assert.match(source, /room\.guest_user_id/);
  assert.match(source, /\[\"ready\",\"playing\"\]\.includes\(room\.status\)/);
});

test("Ranked ticks require a real match and one of its two participants", () => {
  assert.match(source, /ranked_match_id/);
  assert.match(source, /!\[match\.player_a_id,match\.player_b_id\]\.includes\(userId\)/);
  assert.match(source, /claim_ranked_opponent/);
});

test("server timestamps throttle inputs and state writes use optimistic versions", () => {
  assert.match(source, /now-player\.lastSeenAt<60/);
  assert.match(source, /\.eq\(\"version\",row\.version\)/);
  assert.match(source, /row\.version\+1/);
});

test("Co-op results and Ranked ratings are finalized by server-side database operations", () => {
  assert.match(source, /saveCoopResult/);
  assert.match(source, /finalize_ranked_duel/);
  assert.match(source, /p_match_id:matchId/);
});
