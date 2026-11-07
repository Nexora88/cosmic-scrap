import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const online = fs.readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/hangar-redesign.css", import.meta.url), "utf8");

test("competitive board exposes four scopes and server-ranked season data", () => {
  for (const scope of ["global", "turkey", "friends", "season"]) assert.match(online, new RegExp('"' + scope + '"'));
  assert.match(online, /get_ranked_leaderboard/);
  assert.match(online, /get_friends_leaderboard/);
  assert.match(online, /countryFlag\(record\.country_code\)/);
  assert.match(online, /leader-podium-card/);
  assert.match(css, /leader-podium-card\.podium-1/);
});

test("ranked duel uses the trusted server simulation and does not submit client ratings", () => {
  assert.match(online, /functions\.invoke\("online-match"/);
  assert.match(online, /ranked_join/);
  assert.match(online, /ranked_tick/);
  assert.match(online, /ranked_cancel/);
  assert.match(online, /ranked_duel_matches/);
  assert.doesNotMatch(online, /update\(\{[^}]*rating:/);
  assert.match(css, /ranked-arena-canvas/);
});

test("daily streak rewards are server-claimed, account-bound and idempotent", () => {
  const migration = fs.readFileSync(new URL("../supabase/migrations/20261107080336_cosmic_scrap_daily_streak_rewards.sql", import.meta.url), "utf8");
  assert.match(migration, /create table if not exists public\\.player_daily_streaks/i);
  assert.match(migration, /auth\\.uid\\(\\)/i);
  assert.match(migration, /for update/i);
  assert.match(migration, /last_claim_date=v_today/i);
  assert.match(migration, /v_streak%7=0 then 250/i);
  assert.match(migration, /grant execute on function public\\.claim_daily_reward\\(\\) to authenticated/i);
  assert.match(online, /claim_daily_reward/);
  assert.match(online, /get_daily_reward_status/);
});
