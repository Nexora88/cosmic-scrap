import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $ = (id) => document.getElementById(id);
const panel = $("online-screen");
const status = $("online-status");
let user = null, activeRoom = null, queueTimer = null, roomTimer = null, currentBoard = "global", pendingShareText = "";
const SITE_URL = "https://nexora88.github.io/cosmic-scrap/";

function message(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "info";
}
function errorText(error) { return error?.message || "Something went wrong. Check your connection and try again."; }
function unwrap(data) { return Array.isArray(data) ? data[0] : data; }
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
}
async function requireUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  user = data.session?.user || null;
  if (!user) {
    message("Online features are free, but require an account. Local play and saves still work without signing in.");
    $("online-needs-account").hidden = false;
    $("online-tools").hidden = true;
    return false;
  }
  $("online-needs-account").hidden = true;
  $("online-tools").hidden = false;
  return true;
}
async function callRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}
async function openOnline() {
  panel.hidden = false;
  $("online-close").focus();
  try {
    const ok = await requireUser();
    if (!ok) return;
    await Promise.all([loadBoard("global"), loadFriends(), loadRankStats()]);
    if (activeRoom?.id) { await refreshRoom(); if (!roomTimer) roomTimer = setInterval(refreshRoom, 3500); }
    const code = new URL(window.location.href).searchParams.get("invite");
    if (code && /^[A-Za-z0-9]{8}$/.test(code) && !activeRoom) {
      $("online-invite-code").value = code.toUpperCase();
      await joinRoom(code);
    }
  } catch (error) { message(errorText(error), true); }
}
function stopRoomPolling() {
  if (roomTimer) clearInterval(roomTimer);
  roomTimer = null;
}
function stopQueuePolling() {
  if (queueTimer) clearInterval(queueTimer);
  queueTimer = null;
}
async function closeOnline() {
  stopRoomPolling();
  if (queueTimer) {
    stopQueuePolling();
    try { await callRpc("leave_ranked_queue", {}); } catch {}
  }
  panel.hidden = true;
  $("online-open").focus();
}
async function loadRankStats() {
  try {
    const stats = await callRpc("get_rank_stats", {});
    $("online-rank-stats").textContent = "RATING " + Number(stats.rating || 1000).toLocaleString() +
      " · W " + (stats.wins || 0) + " / L " + (stats.losses || 0) + " / D " + (stats.draws || 0) +
      " · " + (stats.matches || 0) + " MATCHES";
  } catch (error) { $("online-rank-stats").textContent = "Ranked stats load when online services are ready."; }
}
async function loadBoard(which = currentBoard) {
  currentBoard = which;
  $("board-global").classList.toggle("selected", which === "global");
  $("board-friends").classList.toggle("selected", which === "friends");
  const list = $("leaderboard-list");
  list.replaceChildren(node("p", "empty-state", "Loading pilots…"));
  try {
    const data = await callRpc(which === "friends" ? "get_friends_leaderboard" : "get_player_leaderboard", { p_limit: 50 });
    list.replaceChildren();
    if (!data?.length) {
      list.append(node("p", "empty-state", which === "friends"
        ? "Your friend leaderboard starts when you add pilots and they set an online record."
        : "Be the first pilot on the board. Sign in and finish a run to post your record."));
      return;
    }
    data.forEach((record, index) => {
      const row = node("div", "leader-row");
      const rank = node("span", "leader-rank", String(index + 1).padStart(2, "0"));
      const identity = node("div", "leader-identity");
      const avatar = node("span", "leader-avatar avatar-" + (record.avatar_id || "core-blue"), "■");
      identity.append(node("strong", "", record.username), node("small", "", "LVL " + record.best_level + " · " + record.best_survival_seconds + "s survived"));
      const score = node("strong", "leader-score", Number(record.best_score).toLocaleString());
      row.append(rank, avatar, identity, score);
      list.append(row);
    });
  } catch (error) { list.replaceChildren(node("p", "empty-state error-text", errorText(error))); }
}
async function loadFriends() {
  const list = $("friend-list");
  list.replaceChildren(node("p", "empty-state", "Loading friend network…"));
  try {
    const { data, error } = await supabase.from("player_friends")
      .select("id,requester_user_id,target_user_id,status,created_at")
      .or("requester_user_id.eq." + user.id + ",target_user_id.eq." + user.id)
      .order("created_at", { ascending: false }).limit(60);
    if (error) throw error;
    const rows = data || [];
    const ids = [...new Set(rows.flatMap(row => [row.requester_user_id, row.target_user_id]).filter(id => id !== user.id))];
    const names = new Map();
    if (ids.length) {
      const { data: profiles, error: profileError } = await supabase.from("player_profiles").select("user_id,username,avatar_id").in("user_id", ids);
      if (profileError) throw profileError;
      (profiles || []).forEach(profile => names.set(profile.user_id, { username: profile.username, avatar_id: profile.avatar_id }));
    }
    list.replaceChildren();
    if (!rows.length) list.append(node("p", "empty-state", "No friends yet. Add a pilot by username or invite someone with an X post."));
    rows.forEach(row => {
      const incoming = row.target_user_id === user.id && row.status === "pending";
      const otherId = row.requester_user_id === user.id ? row.target_user_id : row.requester_user_id;
      const line = node("div", "friend-row");
      const label = node("div", "friend-label");
      const profile = names.get(otherId) || { username: "Pilot", avatar_id: "core-blue" };
      const avatar = node("span", "leader-avatar avatar-" + (profile.avatar_id || "core-blue"), "■");
      label.append(node("strong", "", profile.username), node("small", "", incoming ? "FRIEND REQUEST · PENDING" : row.status === "accepted" ? "FRIEND" : "REQUEST SENT"));
      line.append(avatar, label);
      if (incoming) {
        const accept = node("button", "mini-button", "ACCEPT");
        accept.type = "button";
        accept.addEventListener("click", async () => {
          try { await callRpc("accept_friend_request", { p_request_id: row.id }); message("Friend added."); await loadFriends(); if (currentBoard === "friends") await loadBoard("friends"); }
          catch (error) { message(errorText(error), true); }
        });
        line.append(accept);
      }
      list.append(line);
    });
  } catch (error) { list.replaceChildren(node("p", "empty-state error-text", errorText(error))); }
}
async function addFriend() {
  const name = $("friend-username").value.trim();
  if (!name) { message("Enter the exact pilot username first.", true); return; }
  try {
    const result = await callRpc("send_friend_request", { p_username: name });
    $("friend-username").value = "";
    message(result.status === "accepted" ? "You're now friends." : result.status === "pending" ? "A request is already pending." : "Friend request sent.");
    await loadFriends();
    if (currentBoard === "friends") await loadBoard("friends");
  } catch (error) { message(errorText(error), true); }
}
async function getRoom(roomId) {
  const data = await callRpc("get_room_state", { p_room_id: roomId });
  return data;
}
function shareX(text) {
  const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener,noreferrer");
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); message("Copied. Paste it into a chat or post."); }
  catch {
    const input = node("textarea", "share-fallback");
    input.value = text; panel.append(input); input.select();
    const ok = document.execCommand("copy"); input.remove();
    message(ok ? "Copied. Paste it into a chat or post." : "Copy this text manually: " + text, !ok);
  }
}
function inviteText(room) {
  const url = new URL(SITE_URL); url.searchParams.set("invite", room.invite_code);
  return "⚡ I opened a Cosmic Scrap " + (room.room_mode === "ranked" ? "ranked challenge" : "friendly match") +
    " for level bracket " + room.level_bracket + ". Join my room: " + url.href +
    " · Code: " + room.invite_code + " · Free to play. Can you beat my run?";
}
function renderRoom(room) {
  activeRoom = room;
  $("online-room").hidden = false;
  $("online-room-code").textContent = room.invite_code;
  $("online-room-mode").textContent = room.room_mode === "ranked" ? "RANKED MATCH" : "FRIEND CHALLENGE";
  $("online-room-tier").textContent = "LEVEL BRACKET " + room.level_bracket;
  const isHost = room.host_user_id === user.id;
  const ownSubmitted = isHost ? room.host_submitted : room.guest_submitted;
  $("online-room-status").textContent = room.status === "waiting" ? "Waiting for your friend…" :
    room.status === "ready" ? "Both pilots joined. Play your challenge run." :
    room.status === "playing" ? (room.host_submitted && room.guest_submitted ? "Calculating result…" : ownSubmitted ? "Your result is in. Waiting for the other pilot." : "Match is live — play your run.") :
    room.status === "finished" ? (room.winner_user_id ? (room.winner_user_id === user.id ? "VICTORY · YOU WON THIS MATCH" : "MATCH COMPLETE · YOUR RIVAL WON") : "DRAW · IDENTICAL SCORES") : "Room closed";
  $("online-host-score").textContent = room.host_submitted ? Number(room.host_score).toLocaleString() : "—";
  $("online-guest-score").textContent = room.guest_submitted ? Number(room.guest_score).toLocaleString() : "—";
  $("online-play-room").disabled = !["ready","playing"].includes(room.status) || ownSubmitted;
  $("online-play-room").textContent = ownSubmitted ? "RESULT SUBMITTED" : "PLAY MATCH RUN ↗";
  $("online-share-room").disabled = room.status === "finished";
}
async function refreshRoom() {
  if (!activeRoom?.id || panel.hidden) return;
  try { renderRoom(await getRoom(activeRoom.id)); }
  catch (error) { message(errorText(error), true); stopRoomPolling(); }
}
async function setRoom(room) {
  const roomData = unwrap(room);
  if (!roomData?.id) throw new Error("Room service returned no room ID.");
  stopRoomPolling();
  activeRoom = { ...roomData, host_submitted: roomData.host_submitted ?? false, guest_submitted: roomData.guest_submitted ?? false };
  renderRoom(await getRoom(roomData.id));
  roomTimer = setInterval(refreshRoom, 3500);
}
async function createRoom() {
  try {
    const bracket = Math.max(1, Math.min(10, Math.floor((Number($("online-level-bracket").value) || 1))));
    const room = await callRpc("create_invite_room", { p_level_bracket: bracket });
    await setRoom(room);
    message("Invite room created. Send the code or use the X invite button.");
  } catch (error) { message(errorText(error), true); }
}
async function joinRoom(code = $("online-invite-code").value.trim()) {
  try {
    const room = await callRpc("join_invite_room", { p_invite_code: code.toUpperCase() });
    await setRoom(room);
    message("Joined room. When both pilots are ready, play your challenge run.");
  } catch (error) { message(errorText(error), true); }
}
async function beginRankedSearch() {
  try {
    const { data: record } = await supabase.from("player_run_records").select("best_level").eq("user_id", user.id).maybeSingle();
    const bracket = Math.max(1, Math.min(10, Math.ceil((record?.best_level || 1) / 5)));
    $("online-level-bracket").value = String(bracket);
    const stats = await callRpc("get_rank_stats", {});
    const rating = stats.rating || 1000;
    const result = await callRpc("join_ranked_queue", { p_level_bracket: bracket, p_rating: rating });
    if (result.status === "matched") {
      stopQueuePolling();
      message("Opponent found. Your ranked challenge is ready.");
      await setRoom({ id: result.room_id });
      return;
    }
    message(result.message || "Searching for a similar-level pilot…");
    if (!queueTimer) queueTimer = setInterval(async () => {
      try {
        if (panel.hidden || !user) return;
        const next = await callRpc("join_ranked_queue", { p_level_bracket: bracket, p_rating: rating });
        if (next.status === "matched") {
          stopQueuePolling();
          message("Opponent found. Your ranked challenge is ready.");
          await setRoom({ id: next.room_id });
        }
      } catch (error) { stopQueuePolling(); message(errorText(error), true); }
    }, 4500);
  } catch (error) { message(errorText(error), true); }
}
async function cancelRankedSearch() {
  stopQueuePolling();
  try { await callRpc("leave_ranked_queue", {}); message("Matchmaking cancelled."); }
  catch (error) { message(errorText(error), true); }
}
window.addEventListener("cosmic-scrap:open-online", openOnline);
$("online-close").addEventListener("click", closeOnline);
$("online-refresh-board").addEventListener("click", () => loadBoard(currentBoard));
$("board-global").addEventListener("click", () => loadBoard("global"));
$("board-friends").addEventListener("click", () => loadBoard("friends"));
$("friend-add").addEventListener("click", addFriend);
$("friend-username").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addFriend(); } });
$("online-create-room").addEventListener("click", createRoom);
$("online-join-room").addEventListener("click", () => joinRoom());
$("online-ranked-search").addEventListener("click", beginRankedSearch);
$("online-ranked-cancel").addEventListener("click", cancelRankedSearch);
$("online-share-room").addEventListener("click", () => { if (activeRoom) shareX(inviteText(activeRoom)); });
$("online-copy-room").addEventListener("click", () => { if (activeRoom) copyText(inviteText(activeRoom)); });
$("online-play-room").addEventListener("click", () => {
  if (!activeRoom?.id) return;
  window.cosmicScrapActiveRoomId = activeRoom.id;
  panel.hidden = true;
  stopRoomPolling();
  window.dispatchEvent(new CustomEvent("cosmic-scrap:start-room-run", { detail: { roomId: activeRoom.id } }));
});
$("online-share-record").addEventListener("click", async () => {
  if (pendingShareText) { shareX(pendingShareText); return; }
  try {
    const { data } = await supabase.from("player_run_records").select("best_score,best_level,best_survival_seconds").eq("user_id", user.id).maybeSingle();
    const score = data?.best_score ?? 0;
    shareX("My Cosmic Scrap record is " + score.toLocaleString() + " points (level " + (data?.best_level || 1) +
      ", " + (data?.best_survival_seconds || 0) + "s survived). Your turn — can you beat it? Play free: " + SITE_URL);
  } catch (error) { message(errorText(error), true); }
});
$("online-share-welcome").addEventListener("click", () => shareX("Welcome to Cosmic Scrap ⚡ One square, infinite void. I'm playing too — come try a run and tell me your best score. Free to play: " + SITE_URL));
$("online-needs-account-button").addEventListener("click", () => { panel.hidden = true; window.dispatchEvent(new Event("cosmic-scrap:request-account")); });
$("online-needs-account").hidden = true;
$("online-tools").hidden = true;
$("online-room").hidden = true;
window.addEventListener("cosmic-scrap:run-ended", async event => {
  const result = event.detail || {};
  if (!user) {
    try { const { data } = await supabase.auth.getSession(); user = data.session?.user || null; } catch {}
  }
  if (!user) return;
  try {
    const { data: previousRecord } = await supabase.from("player_run_records").select("best_score").eq("user_id", user.id).maybeSingle();
    const runScore = Math.max(0, Math.floor(result.score || 0));
    const runLevel = Math.max(1, Math.floor(result.level || 1));
    const runSeconds = Math.max(0, Math.min(14400, Math.floor(result.survivalSeconds || 0)));
    const recordIsNew = runScore > (previousRecord?.best_score || 0);
    await callRpc("submit_run_record", { p_score: runScore, p_level: runLevel, p_survival_seconds: runSeconds });
    if (recordIsNew || result.isNewRecord) {
      pendingShareText = "NEW COSMIC SCRAP RECORD: " + runScore.toLocaleString() + " points · level " + runLevel +
        " · survived " + runSeconds + "s. I did it — can you beat my run? Play free: " + SITE_URL;
      $("online-share-record").textContent = "SHARE NEW RECORD ON X ↗";
      message("New record! Open the Online Hub and tap Share New Record on X.");
    } else {
      pendingShareText = "";
      $("online-share-record").textContent = "SHARE MY RECORD ON X ↗";
      message("Online record synced. Open the leaderboard to see where you rank.");
    }
    if (activeRoom && result.roomId) {
      const duel = await callRpc("submit_room_score", { p_room_id: result.roomId,
        p_score: Math.max(0, Math.floor(result.score || 0)), p_level: Math.max(1, Math.floor(result.level || 1)),
        p_survival_seconds: Math.max(0, Math.min(14400, Math.floor(result.survivalSeconds || 0))) });
      message(duel.status === "finished" ? "Match finished. Refresh the room to see the result." : "Score submitted. Waiting for your rival.");
      if (duel.status === "finished") await loadRankStats();
      if (!panel.hidden) { await refreshRoom(); await loadRankStats(); await loadBoard(currentBoard); }
    }
  } catch (error) { message("Run ended, but online result was not saved: " + errorText(error), true); }
});
supabase.auth.onAuthStateChange((_event, session) => { user = session?.user || null; });
