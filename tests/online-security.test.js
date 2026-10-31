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
  assert.ok(migration.includes("if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then"));
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


test("account signup captures a pilot handle and password visibility is accessible", () => {
  const account = fs.readFileSync(new URL("../js/cloud-account.js", import.meta.url), "utf8");
  assert.match(html, /id="account-signup-username"/);
  assert.match(html, /id="account-password-toggle"[^>]*aria-controls="account-auth-password"/);
  assert.match(account, /data: \{ username \}/);
  assert.match(account, /account-signup-name-wrap/);
  assert.match(account, /setAttribute\("aria-pressed", String\(!showing\)\)/);
});

test("level-up cards localize names, descriptions and rarity labels", () => {
  const levelUp = fs.readFileSync(new URL("../js/ui/LevelUpScreen.js", import.meta.url), "utf8");
  assert.match(levelUp, /Hızlı Atış Protokolü/);
  assert.match(levelUp, /currentLanguage\(\)/);
  assert.match(levelUp, /DESTANSI/);
  assert.match(levelUp, /SIRADAN/);
});
test("cloud pilot progression has per-user access and bounded run history", () => {
  const migration = fs.readFileSync(new URL("../supabase/migrations/202610170002_player_progress_sync.sql", import.meta.url), "utf8");
  const account = fs.readFileSync(new URL("../js/cloud-account.js", import.meta.url), "utf8");
  assert.match(migration, /create table if not exists public\.player_game_progress/i);
  assert.match(migration, /auth\.uid\(\)/i);
  assert.match(migration, /limit 50/i);
  assert.match(account, /record_player_run/);
  assert.match(account, /account-run-history/);
});

test("career-level cosmetics are gated by current local UI logic and a database trigger", () => {
  const cosmeticMigration = fs.readFileSync(new URL("../supabase/migrations/202610170003_cosmetic_unlocks.sql", import.meta.url), "utf8");
  const main = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
  const account = fs.readFileSync(new URL("../js/cloud-account.js", import.meta.url), "utf8");
  assert.match(html, /data-required-level="5"/);
  assert.match(html, /id="career-xp-fill"/);
  assert.match(main, /profile\.careerXp=\(profile\.careerXp\|\|0\)\+/);
  assert.match(main, /profile\.careerLevel=lvl/);
  assert.match(account, /function localCareerLevel\(\)/);
  assert.match(account, /function applyCosmeticLocks\(\)/);
  assert.match(account, /option\.disabled = locked/);
  assert.match(account, /const requirements = \{[^}]*"core-amber": 5[^}]*ataturk: 8/);
  assert.match(cosmeticMigration, /before insert or update of avatar_id, rocket_id/i);
  assert.match(cosmeticMigration, /Avatar locked: reach career level % first/i);
  assert.match(cosmeticMigration, /Rocket locked: reach career level % first/i);
});

test("friend invitation creates a room and sends its link in a direct message", () => {
  assert.match(onlineHub, /async function inviteFriend/);
  assert.match(onlineHub, /create_invite_room/);
  assert.match(onlineHub, /recipient_user_id: userId/);
  assert.match(onlineHub, /actions\.append\(chat, invite, block, report\)/);
});

test("classic arena removes decorative speed-momentum atmosphere while retaining reduced-motion support", () => {
  const game = fs.readFileSync(new URL("../js/core/Game.js", import.meta.url), "utf8");
  const ui = fs.readFileSync(new URL("../css/ui.css", import.meta.url), "utf8");
  assert.doesNotMatch(game, /speedDrive|comboDrive|spaceTint/);
  assert.match(game, /globalAlpha=s\.alpha/);
  assert.match(ui, /prefers-reduced-motion:reduce/);
});


test("chat safety controls are prominent, inline, and keyboard/mobile friendly", () => {
  const ui = fs.readFileSync(new URL("../css/ui.css", import.meta.url), "utf8");
  assert.match(html, /id="online-chat-rules-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="online-chat-rules"[^>]*hidden/);
  assert.match(html, /id="online-report-details"/);
  assert.match(html, /id="online-report-status"[^>]*aria-live="polite"/);
  assert.match(html, /Taciz, tehdit, nefret söylemi, spam ve kişisel bilgi paylaşımı yasaktır/);
  assert.match(onlineHub, /blockedUserIds\.has\(row\.sender_user_id\)/);
  assert.match(onlineHub, /async function reportPlayer/);
  assert.match(onlineHub, /online-chat-rules-toggle/);
  assert.match(onlineHub, /online-report-details/);
  assert.match(ui, /@media\(max-width:520px\).*chat-safety-actions/s);
  assert.match(ui, /\.chat-compose input\{[^}]*font-size:16px/s);
});

test("blocking refreshes the block list and report submission has explicit status feedback", () => {
  assert.match(onlineHub, /await loadBlockedPlayers\(\);\s*message\("Player blocked/);
  assert.match(onlineHub, /reportStatus\.textContent = "Şikâyetin güvenli şekilde kaydedildi/);
  assert.match(onlineHub, /reportStatus\.dataset\.state = "error"/);
  assert.match(onlineHub, /blockedUserIds\.has\(activeChat\.userId\)/);
});


test("moderator actions require an active, non-suspended moderator", () => {
  const migration = fs.readFileSync(new URL("../supabase/migrations/202610170004_harden_moderation_actions.sql", import.meta.url), "utf8");
  assert.match(migration, /m\.is_moderator = true/);
  assert.match(migration, /m\.status = 'active'/);
  assert.match(migration, /m\.banned_until is null or m\.banned_until <= now\(\)/i);
  assert.match(migration, /revoke all on function public\.moderate_player\(uuid,text,integer,text\) from public, anon/i);
});
