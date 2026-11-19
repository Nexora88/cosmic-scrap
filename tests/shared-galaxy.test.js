import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shared galaxy migration has authenticated state RPCs and ownership checks", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20261018000000_shared_galaxy.sql", import.meta.url), "utf8");
  assert.match(sql, /create table if not exists public\.galaxy_sectors/i);
  assert.match(sql, /create unique index if not exists galaxy_one_home_per_player/i);
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /Expand only to an adjacent sector/i);
  assert.match(sql, /Build only in your own sector/i);
  assert.match(sql, /grant execute on function public\.galaxy_get_state\(\) to authenticated/i);
  assert.match(sql, /alter publication supabase_realtime add table public\.galaxy_sectors/i);
  assert.match(sql, /revoke insert,update,delete on public\.galaxy_sectors/i);
});

test("shared galaxy UI uses canvas only for the map and keeps accessible HTML actions", async () => {
  const source = await readFile(new URL("../js/systems/SharedGalaxy.js", import.meta.url), "utf8");
  assert.match(source, /getContext\("2d"\)/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /galaxy_claim_sector/);
  assert.match(source, /galaxy_alliance_request/);
  assert.match(source, /postgres_changes/);
});
