import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../js/ui/CoopClient.js", import.meta.url), "utf8");
const hub = fs.readFileSync(new URL("../js/online-hub.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

test("Co-op UI is localized in all nine supported languages", () => {
  for (const locale of ["en", "tr", '"pt-BR"', "es", "ru", "id", "de", "fr", "ja"]) {
    assert.ok(source.includes("  " + locale + ": {"), "missing Co-op locale " + locale);
  }
});

test("Co-op uses authenticated room RPCs and the server simulation rather than client scores", () => {
  for (const action of ["create_invite_room", "join_invite_room", "get_room_state", "heartbeat_coop_room"]) assert.ok(source.includes(action));
  for (const action of ["coop_start", "coop_tick"]) assert.ok(source.includes(action));
  assert.match(source, /supabase\.functions\.invoke\("online-match"/);
  assert.match(source, /taviro-coop-room-id/);
  assert.match(source, /restoreRoom\(\)/);
  assert.match(source, /copy\(\)\.reconnect/);
  assert.match(source, /this\.failures \* 120/);
  assert.match(source, /data-coop-key/);
  assert.doesNotMatch(source, /submit_run_record|player_run_records|score\s*=/);
});

test("Co-op is excluded from first-release loading and precache while future presentation styles remain", () => {
  assert.ok(!hub.includes("./ui/CoopClient.js"));
  assert.match(html, /id="coop-coming-soon"/);
  assert.ok(html.includes("css/coop.css"));
  assert.ok(worker.includes('"./css/coop.css"'));
  assert.ok(!worker.includes('"./js/ui/CoopClient.js"'));
  assert.ok(worker.includes('const CACHE_NAME = CACHE_PREFIX + "v6";'));
});

test("Co-op presentation remains separate from the solo game simulation", () => {
  assert.doesNotMatch(source, /from ["']\.\.\/core\/Game|from ["']\.\.\/entities\/Player/);
  assert.match(source, /coop-arena/);
  assert.match(source, /renderSnapshot\(\)/);
  assert.match(source, /pointerdown/);
});
