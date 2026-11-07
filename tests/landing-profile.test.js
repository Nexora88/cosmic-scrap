import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("intro is modern, credits the correct developer, and uses a clear play action", async () => {
  const html = await read("index.html");
  assert.match(html, /Ahmet Eymen Bakraç/);
  assert.match(html, /id="intro-continue"[^>]*>[\s\S]*?OYNA/);
  assert.match(html, /intro-emblem/);
  assert.doesNotMatch(html, /Atatürk|Ataturk1930s|Wikimedia/);
  assert.doesNotMatch(html, /Ahmet Eymen Başraç/);
});

test("player-facing avatar selectors no longer offer Atatürk", async () => {
  const [home, profile, account, profileJs, cloud, online] = await Promise.all([
    read("index.html"), read("profile.html"), read("js/cloud-account.js"),
    read("profile.js"), read("js/cloud-account.js"), read("js/online-hub.js")
  ]);
  for (const source of [home, profile, account, profileJs, cloud, online]) {
    assert.doesNotMatch(source, /Atatürk tribute|Atatürk ·|Ataturk1930s\.jpg/);
  }
  assert.doesNotMatch(profile, /value="ataturk"/);
});

test("online page has scoped leaderboards and limited friend connections, not live multiplayer", async () => {
  const [html, online, loader] = await Promise.all([
    read("index.html"), read("js/online-hub.js"), read("js/optional-online-loader.js")
  ]);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(html, /friend-add-form|friend-requests-list/);
  assert.doesNotMatch(html, /online-create-room|online-ranked-search|online-chat-form|online-matchmaking/);
  assert.match(online, /player_friends|send_friend_request|accept_friend_request|get_friends_leaderboard/);
  assert.doesNotMatch(online, /create_match_room|sendChat/);
  assert.match(online, /ranked_join|ranked_tick/);
  assert.match(online, /get_player_leaderboard/);
  assert.match(online, /submit_run_record/);
  assert.match(loader, /home-create-account/);
});

test("profile board link opens the shared leaderboard directly", async () => {
  const [profile, loader] = await Promise.all([read("profile.html"), read("js/optional-online-loader.js")]);
  assert.match(profile, /href="\.\/#leaderboard"/);
  assert.match(loader, /location\.hash === "#leaderboard"/);
});
