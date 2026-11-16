import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration=fs.readFileSync(new URL("../supabase/migrations/20261116201833_server_authoritative_seasonal_cosmetics.sql",import.meta.url),"utf8");
const account=fs.readFileSync(new URL("../js/cloud-account.js",import.meta.url),"utf8");
const capsule=fs.readFileSync(new URL("../js/ui/ScrapCapsules.js",import.meta.url),"utf8");
const cosmetics=fs.readFileSync(new URL("../js/systems/Cosmetics.js",import.meta.url),"utf8");

test("season rewards require server-maintained Ranked wins and an active season",()=>{
  assert.match(migration,/references public\.ranked_seasons\(id\)/);
  assert.match(migration,/from public\.player_season_rank_stats/);
  assert.match(migration,/v_stats\.wins\s*<\s*v_reward\.min_wins/);
  assert.match(migration,/v_stats\.matches\s*<\s*v_reward\.min_matches/);
  assert.match(migration,/s\.status\s*=\s*'active'/);
});
test("inventory is private and clients cannot write reward grants",()=>{
  assert.match(migration,/alter table public\.player_cosmetic_inventory enable row level security/i);
  assert.match(migration,/auth\.uid\(\)\)\s*=\s*user_id/);
  assert.match(migration,/revoke all on public\.player_cosmetic_inventory from anon, authenticated/i);
  assert.match(migration,/grant select on public\.player_cosmetic_inventory to authenticated/i);
  assert.ok(migration.includes("revoke all on function public.claim_season_cosmetic(text) from public, anon;"));
  assert.match(migration,/grant execute on function public\.claim_season_cosmetic\(text\) to authenticated/i);
});
test("reward claims are idempotent",()=>{
  assert.match(migration,/unique \(user_id, season_id, reward_key\)/);
  assert.match(migration,/on conflict \(user_id,\s*season_id,\s*reward_key\) do nothing/i);
  assert.match(migration,/already_owned/);
});
test("account UI reads server inventory and calls the authenticated claim RPC",()=>{
  assert.match(account,/from\("season_cosmetic_rewards"\)/);
  assert.match(account,/from\("player_season_rank_stats"\)/);
  assert.match(account,/from\("player_cosmetic_inventory"\)/);
  assert.match(account,/rpc\("claim_season_cosmetic"/);
  assert.match(account,/cosmic-scrap-server-cosmetics/);
  for(const locale of ["en:","tr:","\"pt-BR\":","es:","ru:","id:","de:","fr:","ja:"]) assert.ok(account.includes(locale),"missing seasonal locale "+locale);
});
test("server-owned cosmetics remain separate from the untrusted capsule save",()=>{
  assert.match(capsule,/SERVER_OWNED/);
  assert.match(capsule,/read\(SERVER_OWNED,\[\]\)/);
  assert.match(cosmetics,/cosmic-scrap-server-cosmetics/);
  const hydrate=account.slice(account.indexOf("function hydrateLocalCapsuleSave"),account.indexOf("function persistCloudCapsuleSave"));
  assert.doesNotMatch(hydrate,/cosmic-scrap-server-cosmetics/);
});
