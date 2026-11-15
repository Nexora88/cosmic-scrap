import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { serverDailyRewardMessage } from "../js/systems/DailyStreak.js";
import { translations, REQUIRED_PROFILE_LOCALE_KEYS } from "../js/language.js";

const migration = await readFile(new URL("../supabase/migrations/20261115190421_authoritative_daily_rewards_and_career_badges.sql", import.meta.url), "utf8");
const account = await readFile(new URL("../js/cloud-account.js", import.meta.url), "utf8");
const main = await readFile(new URL("../js/main.js", import.meta.url), "utf8");
const loader = await readFile(new URL("../js/optional-online-loader.js", import.meta.url), "utf8");
const profile = await readFile(new URL("../profile.js", import.meta.url), "utf8");
const profileHtml = await readFile(new URL("../profile.html", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const profileCss = await readFile(new URL("../profile.css", import.meta.url), "utf8");

test("daily reward claim is UTC-based, row-locked and idempotent across devices", () => {
  assert.match(migration, /create or replace function public\.get_daily_reward_status\(\)/i);
  assert.match(migration, /now\(\) at time zone 'UTC'/i);
  assert.match(migration, /for update/i);
  assert.match(migration, /last_claim_date = v_today/i);
  assert.match(migration, /on conflict \(user_id\) do nothing/i);
  assert.match(migration, /reward_points = reward_points \+ v_reward/i);
  assert.match(migration, /revoke all on function public\.claim_daily_reward\(\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.claim_daily_reward\(\) to authenticated/i);
  assert.doesNotMatch(migration, /p_user_id|p_reward_points/i);
});

test("account badges are private to their owner and only readable through an authenticated query", () => {
  assert.match(migration, /create table if not exists public\.player_badges/i);
  assert.match(migration, /alter table public\.player_badges enable row level security/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(migration, /revoke all on public\.player_badges from anon, authenticated/i);
  assert.match(migration, /grant select on public\.player_badges to authenticated/i);
  assert.match(migration, /create or replace function public\.get_player_badges\(\)/i);
  assert.match(migration, /language sql\s+stable\s+set search_path = ''/i);
  assert.match(migration, /signal-streak-7/);
  assert.match(migration, /signal-streak-30/);
  assert.match(migration, /on conflict \(user_id, badge_id\) do nothing/i);
});

test("career progression records cumulative playtime and best level without entering Ranked evidence", () => {
  assert.match(migration, /add column if not exists total_playtime_seconds bigint/i);
  assert.match(migration, /add column if not exists best_level integer/i);
  assert.match(migration, /total_playtime_seconds = total_playtime_seconds \+ p_survival_seconds/i);
  assert.match(migration, /best_level = greatest\(best_level, p_level\)/i);
  assert.match(migration, /separate from Ranked match evidence/i);
  assert.match(account, /total_playtime_seconds/);
  assert.match(account, /account-playtime/);
  assert.match(index, /id="account-playtime"/);
});

test("signed-in pilots claim through Supabase while offline guests retain local streak rewards", () => {
  assert.match(account, /supabase\.rpc\("claim_daily_reward"\)/);
  assert.match(account, /supabase\.rpc\("get_daily_reward_status"\)/);
  assert.match(account, /supabase\.rpc\("get_player_badges"\)/);
  assert.match(account, /dailyRewardAttemptedUser/);
  assert.match(main, /if\(!hasSavedAccountSession\(\)\)claimLocalDailyLoginReward\(\)/);
  assert.match(loader, /if \(hasSavedAccountSession\) loadAccount\(\)/);
});

test("profile page renders playtime, daily streak points and server-earned badges", () => {
  assert.match(profileHtml, /id="playtime"/);
  assert.match(profileHtml, /id="best-level"/);
  assert.match(profile, /best-level/);
  assert.match(profileHtml, /id="daily-current-streak"/);
  assert.match(profileHtml, /id="daily-signal-points"/);
  assert.match(profileHtml, /id="badge-shelf"/);
  assert.match(profile, /loadDailyRewardsAndBadges/);
  assert.match(profile, /renderBadges/);
  assert.match(profileCss, /\.badge-card\.earned/);
  assert.match(profileCss, /\.daily-reward-grid/);
});

test("all nine profile locales include every new daily-reward and badge label", () => {
  const newKeys = [
    "DAILY REWARDS","CURRENT STREAK","BEST STREAK","SIGNAL POINTS","CLAIMED TODAY",
    "NOT CLAIMED TODAY","BADGE COLLECTION","SIGNAL STREAK I","SIGNAL VETERAN",
    "Earn 7 consecutive daily rewards.","Earn 30 consecutive daily rewards.",
    "No badges earned yet.","Daily reward status unavailable.",
    "Signal Points are account-bound and can be spent on future event cosmetics.",
    "TOTAL PLAYTIME","Time across completed runs","ACCOUNT REWARDS","Daily rewards","PILOT LEGACY","Badge collection",
    "BEST RUN LEVEL","Highest level reached in one run"
  ];
  for (const locale of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    for (const key of newKeys) {
      assert.ok(typeof translations[locale][key] === "string" && translations[locale][key].trim(), locale + " missing profile copy: " + key);
    }
  }
});

test("daily reward toast and streak badge names are localized in all nine languages", () => {
  for (const locale of ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"]) {
    const message = serverDailyRewardMessage({ status: "claimed", current_streak: 7, earned_points: 250, badge_awarded: ["signal-streak-7"] }, locale);
    assert.ok(message.length > 12, locale + " has an empty reward toast");
    assert.ok(!message.includes("signal-streak-7"), locale + " leaked an internal badge ID");
  }
});
