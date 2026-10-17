import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const security = read("../supabase/migrations/202610170001_authoritative_online_security.sql");
const seasonAccess = read("../supabase/migrations/202610170002_harden_seasonal_access.sql");
const simulation = read("../supabase/migrations/202610170003_server_simulation_matchmaking.sql");
const coopStats = read("../supabase/migrations/202610170004_coop_match_stats.sql");
const queueExpiry = read("../supabase/migrations/202610170005_expire_queue_and_limits.sql");
const serviceGrants = read("../supabase/migrations/202610170006_grant_online_service_privileges.sql");
const provisionalRating = read("../supabase/migrations/202610170007_provisional_rating_multiplier.sql");
const onlineHub = read("../js/online-hub.js");
const arena = read("../js/online-arena.js");
const edge = read("../supabase/functions/online-match/index.ts");
const html = read("../index.html");

test("legacy browser-score Ranked path stays closed", () => {
  assert.match(security, /Ranked is temporarily locked until trusted server simulation is deployed/i);
  assert.match(security, /block_legacy_ranked_completion/);
  assert.match(security, /Legacy client-score Ranked results are disabled/i);
  assert.match(onlineHub, /functions\.invoke\("online-match"/);
  assert.doesNotMatch(onlineHub, /callRpc\("join_ranked_queue"/);
  assert.match(html, /id="online-ranked-search"[^>]*>FIND RANKED DUEL/);
  assert.match(edge, /finalize_ranked_duel/);
});

test("trusted simulation state and matchmaking queue reject direct client access", () => {
  assert.match(simulation, /create table if not exists public\.online_simulations/i);
  assert.match(simulation, /create table if not exists public\.ranked_matchmaking_queue/i);
  assert.match(simulation, /using \(false\) with check \(false\)/);
  assert.match(simulation, /claim_ranked_opponent/);
  assert.match(queueExpiry, /queued_at < now\(\) - interval '60 seconds'/);
  assert.match(serviceGrants, /grant select, insert, update, delete on public\.online_simulations to service_role/i);
  assert.match(serviceGrants, /grant select, insert on public\.coop_match_stats to service_role/i);
});

test("ranked rating can only be finalized by the trusted service role", () => {
  assert.match(security, /if coalesce\(auth\.jwt\(\) ->> 'role', ''\) <> 'service_role' then/i);
  assert.match(security, /revoke all on function public\.finalize_ranked_duel\([^;]+ from public, anon, authenticated;/i);
  assert.match(security, /grant execute on function public\.finalize_ranked_duel\([^;]+ to service_role;/i);
  assert.match(security, /status <> 'playing'/i);
  assert.match(security, /round\(\(rating - 1000\) \* 0\.70\)/i);
  assert.match(provisionalRating, /v_a\.matches < 10 then 1\.5/);
  assert.match(provisionalRating, /v_b\.matches < 10 then 1\.5/);
});

test("same-seed server arena supports co-op and ranked result finalization", () => {
  assert.match(edge, /action==="coop_start"/);
  assert.match(edge, /action==="ranked_join"/);
  assert.match(edge, /action==="ranked_tick"/);
  assert.match(edge, /p_score_a:a\.score,p_score_b:b\.score,p_damage_a:a\.damage,p_damage_b:b\.damage/);
  assert.match(edge, /saveCoopResult/);
  assert.match(arena, /functions\.invoke\("online-match"/);
  assert.match(arena, /WASD \/ arrows/);
  assert.match(arena, /shared_health/);
});

test("country/friends/global seasonal leaderboards and optional flag are wired", () => {
  assert.match(security, /get_ranked_leaderboard/);
  assert.match(seasonAccess, /security invoker/i);
  assert.match(onlineHub, /p_scope:which/);
  assert.match(onlineHub, /saveCountry/);
  assert.match(onlineHub, /countryFlag/);
  assert.match(html, /id="board-country"/);
  assert.match(html, /id="online-country-code"/);
});

test("co-op history is visible only to room participants and has no rating fields", () => {
  assert.match(coopStats, /Room participants can read co-op stats/);
  assert.match(coopStats, /auth\.uid\(\).*host_user_id/s);
  assert.match(coopStats, /shared_score/);
  assert.doesNotMatch(coopStats, /rating_delta|player_season_rank_stats/i);
});

test("room reconnect and arena controls are wired", () => {
  assert.match(security, /heartbeat_coop_room/);
  assert.match(onlineHub, /ACTIVE_ROOM_STORAGE_KEY/);
  assert.match(onlineHub, /Keep polling after transient failures/);
  assert.match(html, /id="online-start-coop"/);
  assert.match(arena, /pointerdown/);
  assert.match(arena, /this\.fireHeld \|\| this\.keys\.has\(" "\)/);
});
