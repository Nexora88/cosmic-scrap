import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $ = (id) => document.getElementById(id);
const panel = $("online-screen");
const status = $("online-status");
let user = null, activeRoom = null, queueTimer = null, roomTimer = null, matchmakingClock = null, matchmakingStartedAt = 0, chatChannel = null, presenceChannel = null, inviteNotificationChannel = null, activeChat = null, activeChatTarget = null, currentBoard = "global", pendingShareText = "", myUsername = "Pilot";
const onlineUserIds = new Set();
const seenInviteMessages = new Set();
const blockedUserIds = new Set();
const ACTIVE_ROOM_STORAGE_KEY = "cosmic-scrap-active-room-v1";
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
function showIncomingInvite(row, senderName = "A pilot") {
  const container = $("online-incoming-invites");
  if (!container || !row?.body || blockedUserIds.has(row.sender_user_id)) return;
  const match = /cosmic scrap/i.test(row.body) && /friendly match|match challenge|challenge room/i.test(row.body)
    ? row.body.match(/Code:\s*([A-Za-z0-9]{8})/i) : null;
  if (!match || seenInviteMessages.has(row.id)) return;
  seenInviteMessages.add(row.id);
  container.hidden = false;
  const card = node("article", "incoming-invite-card");
  const copy = node("div", "incoming-invite-copy");
  copy.append(node("strong", "", "MATCH INVITE · " + senderName), node("small", "", "A pilot challenged you to a Cosmic Scrap score duel."));
  const join = node("button", "mini-button chat-accept-invite", "ACCEPT & JOIN ↗");
  join.type = "button";
  join.addEventListener("click", async () => {
    $("online-invite-code").value = match[1].toUpperCase();
    try { await joinRoom(match[1]); card.remove(); if (!container.children.length) container.hidden = true; }
    catch (error) { message(errorText(error), true); }
  });
  const dismiss = node("button", "mini-button", "DISMISS");
  dismiss.type = "button";
  dismiss.addEventListener("click", () => { card.remove(); if (!container.children.length) container.hidden = true; });
  card.append(copy, join, dismiss);
  container.prepend(card);
}
function startInviteNotifications() {
  if (!user || inviteNotificationChannel) return;
  inviteNotificationChannel = supabase.channel("cosmic-invite-notifications-" + user.id)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "player_messages", filter: "recipient_user_id=eq." + user.id }, async payload => {
      const row = payload.new;
      if (!row || row.sender_user_id === user?.id || blockedUserIds.has(row.sender_user_id)) return;
      if (!/cosmic scrap/i.test(row.body || "") || !/friendly match|match challenge|challenge room/i.test(row.body || "")) return;
      let senderName = "A pilot";
      try {
        const { data } = await supabase.from("player_profiles").select("username").eq("user_id", row.sender_user_id).maybeSingle();
        senderName = data?.username || senderName;
      } catch {}
      showIncomingInvite(row, senderName);
      if (!panel.hidden) message("New match invitation from " + senderName + ".");
    }).subscribe();
}
async function startPresence() {
  if (!user || presenceChannel) return;
  try {
    const { data } = await supabase.from("player_profiles").select("username").eq("user_id", user.id).maybeSingle();
    myUsername = data?.username || user.user_metadata?.username || "Pilot";
  } catch { myUsername = user.user_metadata?.username || "Pilot"; }
  startInviteNotifications();
  presenceChannel = supabase.channel("cosmic-online-pilots-v1", { config: { presence: { key: user.id } } });
  presenceChannel.on("presence", { event: "sync" }, () => {
    onlineUserIds.clear();
    const state = presenceChannel.presenceState();
    Object.values(state).flat().forEach(pilot => { if (pilot?.user_id) onlineUserIds.add(pilot.user_id); });
    if (!panel.hidden && user) loadFriends();
  });
  presenceChannel.subscribe(async state => {
    if (state === "SUBSCRIBED" && user) {
      try { await presenceChannel.track({ user_id: user.id, username: myUsername, online_at: new Date().toISOString() }); } catch {}
    }
  });
}
async function openOnline() {
  panel.hidden = false;
  $("online-close").focus();
  try {
    const ok = await requireUser();
    if (!ok) return;
    await startPresence();
    await Promise.all([loadBoard("global"), loadFriends(), loadRankStats(), loadBlockedPlayers()]);
    if (!activeRoom?.id) {
      const savedRoomId = localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
      if (savedRoomId) {
        try { await setRoom({ id: savedRoomId }); message("Room restored. Reconnecting to your pilot…"); }
        catch { localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY); activeRoom = null; }
      }
    }
    if (activeRoom?.id && !roomTimer) roomTimer = setInterval(refreshRoom, 3500);
    if (activeRoom?.id) await refreshRoom();
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
  if (!activeRoom?.id || ["finished", "closed"].includes(activeRoom.status)) stopRoomPolling();
  stopMatchmakingVisual();
  stopChatSubscription();
  if (queueTimer) {
    stopQueuePolling();
    try { await callRpc("leave_ranked_queue", {}); } catch {}
  }
  panel.hidden = true;
  $("online-open").focus();
}
async function loadRankStats() {
  try {
    const stats = unwrap(await callRpc("get_rank_stats", {})) || {};
    $("online-rank-stats").textContent = "RATING " + Number(stats.rating || 1000).toLocaleString() +
      " · W " + (stats.wins || 0) + " / L " + (stats.losses || 0) + " / D " + (stats.draws || 0) +
      " · " + (stats.matches || 0) + " MATCHES";
  } catch (error) { $("online-rank-stats").textContent = "Ranked stats load when online services are ready."; }
}
function avatarNode(profile = {}) {
  const fallback = () => node("span", "leader-avatar avatar-" + (profile.avatar_id || "core-blue"), "■");
  if (!profile.avatar_path && profile.avatar_id !== "ataturk") return fallback();
  const image = node("img", "leader-avatar leader-photo" + (profile.avatar_id === "ataturk" ? " ataturk-avatar" : ""));
  image.src = profile.avatar_path
    ? supabase.storage.from("player-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ataturk1930s.jpg?width=180";
  image.alt = profile.avatar_id === "ataturk" ? "Mustafa Kemal Atatürk portresi" : (profile.username || "Pilot") + " profile photo";
  image.loading = "lazy";
  image.addEventListener("error", () => image.replaceWith(fallback()), { once: true });
  return image;
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
      const avatar = avatarNode(record);
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
      const { data: profiles, error: profileError } = await supabase.from("player_profiles").select("user_id,username,avatar_id,avatar_path").in("user_id", ids);
      if (profileError) throw profileError;
      (profiles || []).forEach(profile => names.set(profile.user_id, { username: profile.username, avatar_id: profile.avatar_id, avatar_path: profile.avatar_path }));
    }
    list.replaceChildren();
    if (!rows.length) list.append(node("p", "empty-state", "No friends yet. Add a pilot by username or invite someone with an X post."));
    rows.forEach(row => {
      const incoming = row.target_user_id === user.id && row.status === "pending";
      const otherId = row.requester_user_id === user.id ? row.target_user_id : row.requester_user_id;
      const line = node("div", "friend-row");
      const label = node("div", "friend-label");
      const profile = names.get(otherId) || { username: "Pilot", avatar_id: "core-blue" };
      const avatar = avatarNode(profile);
      const isOnline = onlineUserIds.has(otherId);
      label.append(node("strong", "", profile.username), node("small", "friend-presence " + (isOnline ? "is-online" : "is-offline"), incoming ? "FRIEND REQUEST · PENDING" : row.status === "accepted" ? (isOnline ? "ONLINE · FRIEND" : "OFFLINE · FRIEND") : "REQUEST SENT"));
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
      if (row.status === "accepted") {
        const actions = node("div", "friend-row-actions");
        const chat = node("button", "mini-button", "CHAT");
        chat.type = "button";
        chat.addEventListener("click", () => openDirectChat(otherId, profile.username));
        const invite = node("button", "mini-button match-invite-button", isOnline ? "INVITE MATCH" : "OFFLINE");
        invite.type = "button";
        invite.disabled = !isOnline;
        invite.title = isOnline ? "Send a match invitation to this online pilot" : "This pilot is not connected to the Online Hub right now";
        invite.addEventListener("click", () => inviteFriend(otherId, profile.username));
        const block = node("button", "mini-button", "BLOCK");
        block.type = "button";
        block.addEventListener("click", async () => { await blockPlayer(otherId, profile.username); });
        const report = node("button", "mini-button", "REPORT");
        report.type = "button";
        report.addEventListener("click", () => { activeChatTarget = { userId: otherId, username: profile.username }; $("online-chat-target").textContent = "Selected player: " + profile.username; $("online-chat-report").disabled = false; message("Choose a reason and submit the report."); });
        actions.append(chat, invite, block, report);
        line.append(actions);
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
async function inviteFriend(userId, username) {
  if (!user || !userId || userId === user.id) return;
  if (!onlineUserIds.has(userId)) { message(username + " is offline right now. Try again when they reconnect.", true); await loadFriends(); return; }
  try {
    const bracket = Math.max(1, Math.min(10, Math.floor((Number(localStorage.getItem("cosmic-scrap-level-bracket")) || 1))));
    const room = await callRpc("create_invite_room", { p_level_bracket: bracket });
    await setRoom(room);
    const body = inviteText(activeRoom);
    const { error } = await supabase.from("player_messages").insert({ sender_user_id: user.id, recipient_user_id: userId, body: body.slice(0, 500) });
    if (error) throw error;
    await openDirectChat(userId, username);
    message("Challenge invitation sent to " + username + ". The room link and code are in your private chat.");
  } catch (error) {
    message("Could not send the direct invite: " + errorText(error) + " Create a room and use Copy Invite instead.", true);
  }
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
  if (["finished", "closed"].includes(room.status)) localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  $("online-room").hidden = false;
  $("online-chat-room").disabled = !["ready","playing"].includes(room.status);
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
  if (!activeRoom?.id) return;
  try {
    if (!["finished", "closed"].includes(activeRoom.status)) {
      await callRpc("heartbeat_coop_room", { p_room_id: activeRoom.id });
    }
    const latest = await getRoom(activeRoom.id);
    if (panel.hidden) {
      activeRoom = latest;
      if (["finished", "closed"].includes(latest.status)) {
        localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
        stopRoomPolling();
      }
      return;
    }
    renderRoom(latest);
  } catch (error) {
    // Keep polling after transient failures so reconnect can recover automatically.
    if (!panel.hidden) message("Room connection interrupted. Retrying automatically… " + errorText(error), true);
  }
}
async function setRoom(room) {
  const roomData = unwrap(room);
  if (!roomData?.id) throw new Error("Room service returned no room ID.");
  stopRoomPolling();
  activeRoom = { ...roomData, host_submitted: roomData.host_submitted ?? false, guest_submitted: roomData.guest_submitted ?? false };
  localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, roomData.id);
  if (!["finished", "closed"].includes(activeRoom.status)) {
    try { await callRpc("heartbeat_coop_room", { p_room_id: roomData.id }); } catch {}
  }
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
  // Fail closed in the browser as well as in SQL: the legacy queue compares separate solo runs.
  stopQueuePolling();
  stopMatchmakingVisual();
  message("Ranked Duel is locked until trusted server simulation and result validation are deployed.", true);
}
async function cancelRankedSearch() {
  stopQueuePolling();
  stopMatchmakingVisual();
  try { await callRpc("leave_ranked_queue", {}); message("Matchmaking cancelled."); }
  catch (error) { message(errorText(error), true); }
}

async function loadBlockedPlayers() {
  const list = $("online-blocked-list");
  if (!list || !user) return;
  try {
    const { data, error } = await supabase.from("player_blocks").select("blocked_user_id,created_at")
      .eq("blocker_user_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    blockedUserIds.clear();
    (data || []).forEach(row => blockedUserIds.add(row.blocked_user_id));
    list.replaceChildren();
    if (!data?.length) {
      list.append(node("p", "empty-state", "Şu anda engellediğin oyuncu yok."));
      return;
    }
    const ids = data.map(row => row.blocked_user_id);
    const { data: profiles } = await supabase.from("player_profiles").select("user_id,username").in("user_id", ids);
    const names = new Map((profiles || []).map(profile => [profile.user_id, profile.username]));
    data.forEach(row => {
      const line = node("div", "blocked-player-row");
      line.append(node("strong", "", names.get(row.blocked_user_id) || "Pilot"));
      const unblock = node("button", "mini-button", "UNBLOCK");
      unblock.type = "button";
      unblock.addEventListener("click", async () => {
        const result = await supabase.from("player_blocks").delete().eq("blocker_user_id", user.id).eq("blocked_user_id", row.blocked_user_id);
        if (result.error) { message(errorText(result.error), true); return; }
        message("Player unblocked.");
        await loadBlockedPlayers();
        await loadFriends();
      });
      line.append(unblock);
      list.append(line);
    });
  } catch (error) {
    list.replaceChildren(node("p", "empty-state error-text", errorText(error)));
  }
}
function setChatStatus(text, error = false) {
  $("online-chat-target").textContent = text;
  $("online-chat-target").dataset.state = error ? "error" : "info";
}
function stopChatSubscription() {
  if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
}
function startChatSubscription() {
  stopChatSubscription();
  chatChannel = supabase.channel("cosmic-player-chat-" + user.id + "-" + Date.now())
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "player_messages" }, () => loadChat())
    .subscribe();
}
async function openDirectChat(userId, username) {
  if (!user || !userId || userId === user.id) return;
  activeChatTarget = { userId, username };
  activeChat = { type: "dm", userId, username };
  $("online-chat-report").disabled = false;
  $("online-chat-block").disabled = false;
  setChatStatus("Private friend chat · " + username + " · block/report tools are available.");
  startChatSubscription();
  await loadChat();
  $("online-chat-input").focus();
  $("online-chat-log").scrollTop = $("online-chat-log").scrollHeight;
}
async function loadChat() {
  if (!user || !activeChat) return;
  const log = $("online-chat-log");
  try {
    let query = supabase.from("player_messages")
      .select("id,sender_user_id,recipient_user_id,room_id,body,created_at")
      .order("created_at", { ascending: true }).limit(80);
    if (activeChat.type === "dm") {
      const target = activeChat.userId;
      query = query.or("and(sender_user_id.eq." + user.id + ",recipient_user_id.eq." + target + "),and(sender_user_id.eq." + target + ",recipient_user_id.eq." + user.id + ")");
    } else {
      query = query.eq("room_id", activeChat.roomId);
    }
    const { data, error } = await query;
    if (error) throw error;
    log.replaceChildren();
    if (!data?.length) log.append(node("p", "empty-state", "Start the conversation respectfully."));
    (data || []).filter(row => row.sender_user_id === user.id || !blockedUserIds.has(row.sender_user_id)).forEach(row => {
      const item = node("div", "chat-message" + (row.sender_user_id === user.id ? " mine" : ""));
      const sender = row.sender_user_id === user.id ? "You" :
        (activeChat.type === "dm" ? activeChat.username : (row.sender_user_id === activeChatTarget?.userId ? activeChatTarget.username : "Pilot"));
      const time = new Date(row.created_at);
      item.append(node("small", "", sender + " · " + (Number.isNaN(time.getTime()) ? "" : time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))));
      item.append(document.createTextNode(row.body));
      const inviteMatch = row.sender_user_id !== user.id && /cosmic scrap/i.test(row.body) && /friendly match|match challenge|challenge room/i.test(row.body) ? row.body.match(/Code:\s*([A-Za-z0-9]{8})/i) : null;
      if (inviteMatch) {
        const accept = node("button", "mini-button chat-accept-invite", "JOIN MATCH ↗");
        accept.type = "button";
        accept.addEventListener("click", async () => {
          $("online-invite-code").value = inviteMatch[1].toUpperCase();
          try { await joinRoom(inviteMatch[1]); $("online-chat-log").scrollTop = $("online-chat-log").scrollHeight; }
          catch (error) { message(errorText(error), true); }
        });
        item.append(accept);
      }
      log.append(item);
    });
    log.scrollTop = log.scrollHeight;
  } catch (error) {
    log.replaceChildren(node("p", "empty-state error-text", errorText(error)));
  }
}
async function sendChat(event) {
  event.preventDefault();
  if (!user || !activeChat) { message("Select a friend or open a live match chat first.", true); return; }
  if (activeChat.type === "dm" && blockedUserIds.has(activeChat.userId)) { message("Unblock this pilot before sending a message.", true); return; }
  const input = $("online-chat-input");
  const body = input.value.trim();
  if (!body) return;
  if (body.length > 500) { message("Messages are limited to 500 characters.", true); return; }
  try {
    const payload = { sender_user_id: user.id, body };
    if (activeChat.type === "dm") payload.recipient_user_id = activeChat.userId;
    else payload.room_id = activeChat.roomId;
    const { error } = await supabase.from("player_messages").insert(payload);
    if (error) throw error;
    input.value = "";
    await loadChat();
  } catch (error) {
    const text = errorText(error);
    setChatStatus(text.includes("CHAT_FILTER") ? "Please remove profanity and send a respectful message." : text, true);
  }
}
async function blockPlayer(userId, username) {
  if (!user || !userId || userId === user.id) return;
  if (!window.confirm("Block " + username + "? You will no longer be able to message each other.")) return;
  try {
    const { error } = await supabase.from("player_blocks").insert({ blocker_user_id: user.id, blocked_user_id: userId });
    if (error) throw error;
    if (activeChatTarget?.userId === userId) { activeChat = null; activeChatTarget = null; stopChatSubscription(); $("online-chat-log").replaceChildren(node("p", "empty-state", "Player blocked. Select another friend to chat.")); $("online-chat-report").disabled = true; $("online-chat-block").disabled = true; }
    await loadBlockedPlayers();
    message("Player blocked. Their messages are hidden here and the server rejects blocked conversations.");
    await loadFriends();
  } catch (error) { message(errorText(error), true); }
}
async function reportPlayer() {
  if (!user || !activeChatTarget?.userId) { message("Önce raporlamak istediğin oyuncuyu seç.", true); return; }
  if (activeChatTarget.userId === user.id) { message("Kendini raporlayamazsın.", true); return; }
  const button = $("online-chat-report");
  button.disabled = true;
  const reportStatus = $("online-report-status");
  try {
    const details = $("online-report-details").value.trim();
    const { error } = await supabase.from("player_reports").insert({
      reporter_user_id: user.id, target_user_id: activeChatTarget.userId,
      room_id: activeChat?.type === "room" ? activeChat.roomId : null,
      reason: $("online-report-reason").value, details: details.slice(0, 1000)
    });
    if (error) throw error;
    $("online-report-details").value = "";
    reportStatus.textContent = "Şikâyetin güvenli şekilde kaydedildi ve moderatör incelemesine gönderildi. Tek rapor otomatik ban değildir.";
    reportStatus.dataset.state = "success";
    message("Şikâyet gönderildi. Teşekkürler; moderasyon ekibi inceleyecek.");
  } catch (error) {
    reportStatus.textContent = "Şikâyet gönderilemedi: " + errorText(error);
    reportStatus.dataset.state = "error";
    message(errorText(error), true);
  } finally { button.disabled = !activeChatTarget?.userId; }
}
async function openRoomChat() {
  if (!user || !activeRoom?.id || !["ready","playing"].includes(activeRoom.status)) {
    message("Join a match first. Match chat opens while both pilots are connected.", true);
    return;
  }
  const rivalId = activeRoom.host_user_id === user.id ? activeRoom.guest_user_id : activeRoom.host_user_id;
  let rivalName = "Rival";
  if (rivalId) {
    const { data } = await supabase.from("player_profiles").select("username").eq("user_id", rivalId).maybeSingle();
    rivalName = data?.username || rivalName;
    activeChatTarget = { userId: rivalId, username: rivalName };
  }
  activeChat = { type: "room", roomId: activeRoom.id };
  $("online-chat-report").disabled = !rivalId;
  $("online-chat-block").disabled = !rivalId;
  setChatStatus("Match chat · " + rivalName + " · visible only to this room's players.");
  startChatSubscription();
  await loadChat();
}
function stopMatchmakingVisual() {
  if (matchmakingClock) clearInterval(matchmakingClock);
  matchmakingClock = null;
  $("online-matchmaking").hidden = true;
}
function startMatchmakingVisual() {
  stopMatchmakingVisual();
  $("online-matchmaking").hidden = false;
  $("online-matchmaking-label").textContent = "FINDING A RIVAL";
  matchmakingStartedAt = Date.now();
  const renderTime = () => {
    const seconds = Math.floor((Date.now() - matchmakingStartedAt) / 1000);
    $("online-matchmaking-time").textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  };
  renderTime();
  matchmakingClock = setInterval(renderTime, 1000);
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
$("online-chat-form").addEventListener("submit", sendChat);
$("online-chat-room").addEventListener("click", openRoomChat);
$("online-chat-block").addEventListener("click", () => { if (activeChatTarget) blockPlayer(activeChatTarget.userId, activeChatTarget.username); });
$("online-chat-report").addEventListener("click", reportPlayer);
$("online-chat-rules-toggle").addEventListener("click", () => {
  const rules = $("online-chat-rules");
  const expanded = $("online-chat-rules-toggle").getAttribute("aria-expanded") === "true";
  rules.hidden = expanded;
  $("online-chat-rules-toggle").setAttribute("aria-expanded", String(!expanded));
  $("online-chat-rules-toggle").textContent = expanded ? "KURALLAR" : "KURALLARI KAPAT";
});
$("online-refresh-blocks").addEventListener("click", loadBlockedPlayers);
$("online-share-room").addEventListener("click", () => { if (activeRoom) shareX(inviteText(activeRoom)); });
$("online-copy-room").addEventListener("click", () => { if (activeRoom) copyText(inviteText(activeRoom)); });
$("online-play-room").addEventListener("click", () => {
  if (!activeRoom?.id) return;
  window.cosmicScrapActiveRoomId = activeRoom.id;
  panel.hidden = true;
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
supabase.auth.onAuthStateChange((_event, session) => {
  user = session?.user || null;
  if (user) startPresence();
  else {
    if (presenceChannel) { supabase.removeChannel(presenceChannel); presenceChannel = null; }
    if (inviteNotificationChannel) { supabase.removeChannel(inviteNotificationChannel); inviteNotificationChannel = null; }
    onlineUserIds.clear();
  }
});
