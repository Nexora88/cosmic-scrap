import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/202610170001_authoritative_online_security.sql", import.meta.url),
  "utf8"
);
const onlineHub = fs.readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("legacy client-score Ranked matchmaking fails closed", () => {
  assert.match(migration, /create or replace function public\.join_ranked_queue/i);
  assert.match(migration, /Ranked is temporarily locked until trusted server simulation is deployed/i);
  assert.match(migration, /block_legacy_ranked_completion/);
  assert.match(migration, /Legacy client-score Ranked results are disabled/i);
  assert.match(onlineHub, /Ranked Duel is locked until trusted server simulation and result validation are deployed/i);
  assert.match(html, /id="online-ranked-search"[^>]*disabled/);
});

test("ranked finalization is service-role-only and idempotent by match status", () => {
  assert.match(migration, /if coalesce\\(auth\\.jwt\\(\\) ->> 'role', ''\\) <> 'service_role' then/i);
  assert.match(migration, /status <> 'playing'/i);
  assert.match(migration, /status = 'finished', finished_at = now\(\)/i);
  assert.match(migration, /revoke all on function public\.finalize_ranked_duel\([^;]+ from public, anon, authenticated;/i);
  assert.match(migration, /grant execute on function public\.finalize_ranked_duel\([^;]+ to service_role;/i);
});

test("seasonal rating and leaderboard data are separate from legacy async scores", () => {
  assert.match(migration, /create table if not exists public\.ranked_seasons/i);
  assert.match(migration, /create table if not exists public\.player_season_rank_stats/i);
  assert.match(migration, /create table if not exists public\.ranked_duel_matches/i);
  assert.match(migration, /round\(\(rating - 1000\) \* 0\.70\)/i);
  assert.match(migration, /create or replace function public\.get_ranked_leaderboard/i);
  assert.match(migration, /'Void'.*'Gold'.*'Silver'.*'Bronze'/s);
});

test("room reconnect state is membership-gated and browser retries after temporary failures", () => {
  assert.match(migration, /create table if not exists public\.coop_room_presence/i);
  assert.match(migration, /create or replace function public\.heartbeat_coop_room/i);
  assert.match(migration, /host_connected/);
  assert.match(migration, /guest_connected/);
  assert.match(onlineHub, /ACTIVE_ROOM_STORAGE_KEY/);
  assert.match(onlineHub, /heartbeat_coop_room/);
  assert.match(onlineHub, /Keep polling after transient failures/);
});
