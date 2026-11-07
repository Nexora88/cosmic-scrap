import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mergeGameSaves, mergeCloudSaveConflict } from "./systems/CloudSave.js";
import { normalizeOwnedCosmetics, readEquippedCosmetics, COSMETIC_STORAGE_KEYS } from "./systems/Cosmetics.js";

const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (id) => document.getElementById(id);
const panel = $("account-screen");
const status = $("account-status");
const authForm = $("account-auth-form");
const profileForm = $("account-profile-form");
const signedOut = $("account-signed-out");
const signedIn = $("account-signed-in");
let currentUser = null;
let currentAvatarPath = null;
let currentProfile = null;
let cosmeticLevel = 1;
let busy = false;
const FLAG_COUNTRY_CODES={"🇹🇷":"TR","🇺🇸":"US","🇬🇧":"GB","🇩🇪":"DE","🇯🇵":"JP","🇧🇷":"BR","🇫🇷":"FR","🇮🇳":"IN"};
const localCountryCode=()=>FLAG_COUNTRY_CODES[localStorage.getItem("cosmic-scrap-flag")||"🇹🇷"]||"TR";
let saveSyncInFlight = null;
let saveSyncTimer = null;
let saveSyncQueued = false;
const OWNED_CAPSULE_COSMETICS_KEY = "cosmic-scrap-capsule-cosmetics";
const VALID_SHIPS = new Set(["blue","mint","violet","amber","red","gold"]);

function captureCosmeticSave(save) {
  let owned = [];
  try { owned = normalizeOwnedCosmetics(JSON.parse(localStorage.getItem(OWNED_CAPSULE_COSMETICS_KEY) || "[]")); } catch {}
  const selectedSkin = localStorage.getItem("cosmic-scrap-skin") || "blue";
  return {
    ...save,
    selectedSkin: VALID_SHIPS.has(selectedSkin) ? selectedSkin : "blue",
    ownedCapsuleCosmetics: owned,
    equippedCosmetics: readEquippedCosmetics(localStorage)
  };
}
function restoreCosmeticSave(save) {
  try {
    const skin = VALID_SHIPS.has(save?.selectedSkin) ? save.selectedSkin : "blue";
    localStorage.setItem("cosmic-scrap-skin", skin);
    localStorage.setItem(OWNED_CAPSULE_COSMETICS_KEY, JSON.stringify(normalizeOwnedCosmetics(save?.ownedCapsuleCosmetics)));
    const equipped = save?.equippedCosmetics || {};
    for (const [type,key] of Object.entries(COSMETIC_STORAGE_KEYS)) {
      const value = equipped[type];
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
  } catch {}
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? "error" : "info";
}
function setBusy(value) {
  busy = value;
  authForm.querySelectorAll("button, input").forEach((node) => { node.disabled = value; });
  profileForm.querySelectorAll("button, input, select").forEach((node) => { node.disabled = value; });
}
function localCareerLevel() {
  try { const save = JSON.parse(localStorage.getItem("cosmic-scrap-save-v2") || "{}"); return Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(save.totalScrap) || 0) / 100)) + 1); } catch { return 1; }
}
async function getCosmeticLevel(userId) {
  let level = localCareerLevel();
  try { const { data, error } = await supabase.from("player_game_progress").select("level").eq("user_id", userId).maybeSingle(); if (!error) level = Math.max(1, Number(data?.level) || 1); } catch {}
  return level;
}
function applyCosmeticLocks() {
  const tr = localStorage.getItem("cosmic-scrap-language") === "tr";
  const requirements = { "core-blue": 1, "core-mint": 2, "core-violet": 3, "core-amber": 5, starter: 1, comet: 2, wraith: 4, nova: 6 };
  const names = { "core-blue": ["Blue Core", "Mavi Çekirdek"], "core-mint": ["Mint Core", "Nane Çekirdek"], "core-violet": ["Violet Core", "Mor Çekirdek"], "core-amber": ["Amber Core", "Kehribar Çekirdek"], starter: ["Starter", "Başlangıç"], comet: ["Comet", "Kuyruklu Yıldız"], wraith: ["Wraith", "Hayalet"], nova: ["Nova", "Nova"] };
  for (const id of ["account-avatar", "account-rocket"]) {
    const select = $(id); if (!select) continue;
    for (const option of select.options) {
      const required = requirements[option.value] || Number(option.dataset.requiredLevel) || 1;
      if (!option.dataset.baseLabel) option.dataset.baseLabel = names[option.value]?.[0] || option.textContent.replace(/ · LOCKED \(LVL \d+\)$/, "");
      const current = currentProfile && option.value === (id === "account-avatar" ? currentProfile.avatar_id : currentProfile.rocket_id);
      const locked = cosmeticLevel < required && !current;
      option.disabled = locked;
      option.textContent = (names[option.value]?.[tr ? 1 : 0] || option.dataset.baseLabel) + (locked ? (tr ? " · KİLİTLİ (SEV. " : " · LOCKED (LVL ") + required + ")" : (tr ? " · SEVİYE " : " · LEVEL ") + required);
    }
  }
  const note = $("account-cosmetic-lock-note");
  if (note) note.textContent = tr ? "KARİYER SEVİYESİ " + cosmeticLevel + " · AVATAR VE ROKETLERİ AÇMAK İÇİN OYNA" : "CAREER LEVEL " + cosmeticLevel + " · COMPLETE RUNS TO UNLOCK AVATARS AND ROCKETS";
}
window.addEventListener("cosmic-scrap:language-changed", applyCosmeticLocks);
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}
function showSignedOut() {
  currentUser = null;
  currentAvatarPath = null;
  signedOut.hidden = false;
  signedIn.hidden = true;
  $("account-email").textContent = "";
  $("account-joined").textContent = "—";
  $("account-trophies").textContent = "0";
}
function renderProgress(data) {
  const progress = data || { xp: 0, level: 1, total_runs: 0, best_score: 0, total_kills: 0, total_scrap: 0, recent_runs: [] };
  const xp = Math.max(0, Number(progress.xp) || 0);
  const level = Math.max(1, Number(progress.level) || 1);
  const floor = (level - 1) * (level - 1) * 100;
  const ceiling = level * level * 100;
  const within = Math.max(0, xp - floor);
  const span = Math.max(1, ceiling - floor);
  $("account-level-label").textContent = "LEVEL " + level;
  $("account-xp-fill").style.width = Math.min(100, within / span * 100) + "%";
  $("account-xp-track").setAttribute("aria-valuenow", String(Math.round(within / span * 100)));
  $("account-xp-label").textContent = within + " / " + span + " XP TO NEXT LEVEL";
  $("account-runs").textContent = String(progress.total_runs || 0);
  $("account-best-score").textContent = Number(progress.best_score || 0).toLocaleString();
  $("account-total-kills").textContent = Number(progress.total_kills || 0).toLocaleString();
  $("account-total-scrap").textContent = Number(progress.total_scrap || 0).toLocaleString();
  const achievementsList = $("account-achievements");
  achievementsList.replaceChildren();
  const achievementNames = { "first-signal": "First Signal", scavenger: "Void Scavenger", "storm-veteran": "Storm Veteran", "elite-breaker": "Elite Breaker", "void-walker": "Void Walker", "combo-architect": "Combo Architect" };
  const achievements = Array.isArray(progress.achievements) ? progress.achievements : [];
  if (!achievements.length) { const li = document.createElement("li"); li.textContent = "No synced achievements yet."; achievementsList.append(li); }
  achievements.forEach(id => { const li = document.createElement("li"); li.textContent = achievementNames[id] || String(id); achievementsList.append(li); });
  const history = $("account-run-history");
  history.replaceChildren();
  const runs = Array.isArray(progress.recent_runs) ? progress.recent_runs : [];
  if (!runs.length) { const li = document.createElement("li"); li.textContent = "No synced runs yet."; history.append(li); return; }
  runs.slice(0, 10).forEach(run => {
    const li = document.createElement("li");
    const date = run.played_at ? new Date(run.played_at).toLocaleString() : "Recent run";
    li.textContent = date + " · Score " + Number(run.score || 0).toLocaleString() + " · Lv " + Number(run.level || 1) + " · " + Number(run.survival_seconds || 0) + "s";
    history.append(li);
  });
}
async function syncGameSave({ silent = false } = {}) {
  if (!currentUser) {
    if (!silent) $("account-save-sync-status").textContent = "Sign in first to sync this save.";
    return false;
  }
  if (saveSyncTimer) { clearTimeout(saveSyncTimer); saveSyncTimer = null; }
  if (saveSyncInFlight) { saveSyncQueued = true; return saveSyncInFlight; }
  const label = $("account-save-sync-status");
  const button = $("account-save-sync");
  if (button) button.disabled = true;
  if (!silent && label) label.textContent = "Comparing this device with your cloud save…";

  saveSyncInFlight = (async () => {
    try {
      let localSave = {};
      try { localSave = captureCosmeticSave(JSON.parse(localStorage.getItem("cosmic-scrap-save-v2") || "{}")); }
      catch { localSave = captureCosmeticSave({}); }
      const { data: snapshot, error: readError } = await supabase.rpc("get_player_game_save_v2");
      if (readError) throw readError;

      let revision = Math.max(0, Number(snapshot?.revision) || 0);
      let merged = mergeGameSaves(localSave, snapshot?.game_save || {});
      let result = await supabase.rpc("sync_player_game_save_v2", {
        p_save: merged,
        p_expected_revision: revision
      });
      if (result.error) throw result.error;

      if (!result.data?.ok) {
        // Another device saved after our read. Merge against that newer copy,
        // then retry once using the server's current revision.
        revision = Math.max(0, Number(result.data?.revision) || 0);
        merged = mergeCloudSaveConflict(merged, result.data?.game_save || {});
        result = await supabase.rpc("sync_player_game_save_v2", {
          p_save: merged,
          p_expected_revision: revision
        });
        if (result.error) throw result.error;
        if (!result.data?.ok) throw new Error("Your other device is still saving. Try syncing again in a moment.");
      }

      restoreCosmeticSave(merged);
      const syncedSave = { ...merged, lastSeen: Date.now() };
      localStorage.setItem("cosmic-scrap-save-v2", JSON.stringify(syncedSave));
      window.dispatchEvent(new CustomEvent("cosmic-scrap:cloud-save-applied", { detail:syncedSave }));
      if (label) label.textContent = "Cloud save up to date · career, Scrap Core, upgrades and achievements are backed up.";
      if (!silent) setStatus("Cloud save synchronized across devices.");
      return true;
    } catch (error) {
      if (label) label.textContent = "Cloud sync paused. Your local save is safe on this device; reconnect and retry.";
      if (!silent) setStatus(error.message || "Could not sync your game save.", true);
      return false;
    } finally {
      if (button) button.disabled = false;
    }
  })().finally(() => {
    saveSyncInFlight = null;
    if (saveSyncQueued && currentUser) {
      saveSyncQueued = false;
      queueMicrotask(() => syncGameSave({ silent:true }));
    } else {
      saveSyncQueued = false;
    }
  });
  return saveSyncInFlight;
}
async function loadProgress(user) {
  const { data, error } = await supabase.from("player_game_progress")
    .select("xp,level,total_runs,best_score,total_kills,total_scrap,achievements,recent_runs")
    .eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  renderProgress(data);
}
async function loadProfile(user) {
  const { data, error } = await supabase.from("player_profiles")
    .select("user_id, username, avatar_id, rocket_id, avatar_path, trophies, country_code, created_at")
    .eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Your profile is still being created. Wait a moment and open the account panel again.");
  $("account-email").textContent = user.email || "Email account";
  $("account-joined").textContent = formatDate(data.created_at);
  $("account-trophies").textContent = String(data.trophies ?? 0);
  currentProfile = data;
  const chosenCountry=localCountryCode();
  if(data.country_code!==chosenCountry){const {error:countryError}=await supabase.from("player_profiles").update({country_code:chosenCountry}).eq("user_id",user.id);if(!countryError)data.country_code=chosenCountry;}
  cosmeticLevel = await getCosmeticLevel(user.id);
  $("account-username").value = data.username;
  applyCosmeticLocks();
  $("account-avatar").value = data.avatar_id === "ataturk" ? "core-blue" : (data.avatar_id || "core-blue");
  $("account-rocket").value = data.rocket_id;
  $("account-user-label").textContent = data.username;
  currentAvatarPath = data.avatar_path || null;
  const preview = $("account-photo-preview");
  if (currentAvatarPath) { preview.src = supabase.storage.from("player-avatars").getPublicUrl(currentAvatarPath).data.publicUrl; preview.hidden = false; }
  else { preview.removeAttribute("src"); preview.hidden = true; }
}
async function renderSession(session) {
  currentUser = session?.user || null;
  if (!currentUser) {
    showSignedOut();
    setStatus("Sign in or create an account to sync your player profile.");
    return;
  }
  signedOut.hidden = true;
  signedIn.hidden = false;
  $("account-email").textContent = currentUser.email || "Email account";
  try {
    await loadProfile(currentUser);
    await loadProgress(currentUser);
    await syncGameSave({ silent: true });
    setStatus("Account connected · career save and profile sync are active.");
  } catch (error) {
    setStatus(error.message || "Could not load profile.", true);
  }
}
async function openAccount() {
  panel.hidden = false;
  $("account-close").focus();
  setStatus("Connecting to account service…");
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    await renderSession(data.session);
  } catch (error) {
    setStatus(error.message || "Could not reach Supabase. Check your connection.", true);
  }
}
const passwordToggle = $("account-password-toggle");
passwordToggle?.addEventListener("click", () => {
  const input = $("account-auth-password");
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  passwordToggle.textContent = showing ? "SHOW PASSWORD" : "HIDE PASSWORD";
  passwordToggle.setAttribute("aria-pressed", String(!showing));
});
window.addEventListener("cosmic-scrap:open-account", openAccount);
$("account-close").addEventListener("click", () => { panel.hidden = true; $("account-open").focus(); });
$("account-mode-signup").addEventListener("click", () => {
  $("account-auth-title").textContent = "CREATE ACCOUNT";
  $("account-auth-submit").textContent = "CREATE ACCOUNT";
  $("account-auth-mode").value = "signup";
  $("account-signup-name-wrap").hidden = false;
  $("account-signup-username").required = true;
  $("account-auth-password").autocomplete = "new-password";
  setStatus("Use an email you can access. Confirmation may be required before sign-in.");
});
$("account-mode-login").addEventListener("click", () => {
  $("account-auth-title").textContent = "WELCOME BACK";
  $("account-auth-submit").textContent = "SIGN IN";
  $("account-auth-mode").value = "login";
  $("account-signup-name-wrap").hidden = true;
  $("account-signup-username").required = false;
  $("account-auth-password").autocomplete = "current-password";
  setStatus("Sign in to load your saved online profile.");
});
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  setBusy(true);
  try {
    const email = $("account-auth-email").value.trim();
    const password = $("account-auth-password").value;
    if ($("account-auth-mode").value === "signup") {
      const requestedName = $("account-signup-username").value.trim();
      const username = requestedName.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 20);
      if (username.length < 3) throw new Error("Pilot name must contain at least 3 letters, numbers or underscores.");
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: new URL("./", window.location.href).href, data: { username } }
      });
      if (error) throw error;
      if (data.session) await renderSession(data.session);
      else setStatus("Account created. Check your email for the confirmation link, then return here to sign in.");
      window.dispatchEvent(new Event("cosmic-scrap:show-intro"));
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await renderSession(data.session);
    }
  } catch (error) {
    setStatus(error.message || "Authentication failed.", true);
  } finally {
    setBusy(false);
  }
});
$("account-avatar-file").addEventListener("change", () => {
  const file = $("account-avatar-file").files?.[0];
  const preview = $("account-photo-preview");
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1048576) {
    $("account-avatar-file").value = "";
    setStatus("Choose a JPG, PNG or WEBP image up to 1 MB.", true);
    return;
  }
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  setStatus("Photo selected. Save profile to upload it.");
});
profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !currentUser) return;
  setBusy(true);
  try {
    const username = $("account-username").value.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) throw new Error("Username must be 3–20 letters, numbers or underscores.");
    const requiredLevel = { "core-blue": 1, "core-mint": 2, "core-violet": 3, "core-amber": 5, ataturk: 8, starter: 1, comet: 2, wraith: 4, nova: 6 };
    const chosenAvatar = $("account-avatar").value, chosenRocket = $("account-rocket").value;
    if (cosmeticLevel < (requiredLevel[chosenAvatar] || 1) && chosenAvatar !== currentProfile?.avatar_id) throw new Error("That avatar is locked. Reach career level " + requiredLevel[chosenAvatar] + " first.");
    if (cosmeticLevel < (requiredLevel[chosenRocket] || 1) && chosenRocket !== currentProfile?.rocket_id) throw new Error("That rocket is locked. Reach career level " + requiredLevel[chosenRocket] + " first.");
    const file = $("account-avatar-file").files?.[0];
    let nextAvatarPath = currentAvatarPath;
    let uploadedPath = null;
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1048576) {
        throw new Error("Choose a JPG, PNG or WEBP image up to 1 MB.");
      }
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      uploadedPath = currentUser.id + "/avatar-" + Date.now() + "." + extension;
      const { error: uploadError } = await supabase.storage.from("player-avatars").upload(uploadedPath, file, {
        contentType: file.type, cacheControl: "3600", upsert: false
      });
      if (uploadError) throw uploadError;
      nextAvatarPath = uploadedPath;
    }
    const updates = {
      username,
      avatar_id: chosenAvatar,
      rocket_id: chosenRocket,
      country_code: localCountryCode(),
      updated_at: new Date().toISOString()
    };
    if (file) updates.avatar_path = nextAvatarPath;
    else updates.avatar_path = null;
    const { error } = await supabase.from("player_profiles").update(updates).eq("user_id", currentUser.id);
    if (error) {
      if (uploadedPath) await supabase.storage.from("player-avatars").remove([uploadedPath]);
      throw error;
    }
    const previousAvatarPath = currentAvatarPath;
    await loadProfile(currentUser);
    $("account-avatar-file").value = "";
    if (uploadedPath && previousAvatarPath && previousAvatarPath !== uploadedPath) {
      await supabase.storage.from("player-avatars").remove([previousAvatarPath]);
    }
    setStatus("Profile saved to your free account.");
  } catch (error) {
    setStatus(error.message || "Profile could not be saved. The username may already be taken.", true);
  } finally {
    setBusy(false);
  }
});
$("account-signout").addEventListener("click", async () => {
  if (busy) return;
  setBusy(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showSignedOut();
    setStatus("Signed out. Your local game save is unchanged.");
  } catch (error) {
    setStatus(error.message || "Could not sign out.", true);
  } finally {
    setBusy(false);
  }
});
supabase.auth.onAuthStateChange((_event, session) => {
  // Defer database work to avoid running Supabase queries inside its auth callback lock.
  queueMicrotask(() => { if (!panel.hidden) renderSession(session); });
});

window.addEventListener("cosmic-scrap:flag-changed", async event => {
  if(!currentUser)return;
  const countryCode=FLAG_COUNTRY_CODES[event.detail?.flag]||"TR";
  try{const {error}=await supabase.from("player_profiles").update({country_code:countryCode}).eq("user_id",currentUser.id);if(error)throw error;}catch(error){if(!panel.hidden)setStatus("Flag saved locally; country ranking will sync when reconnected.",true);}
});

window.addEventListener("cosmic-scrap:cloud-save-request", async event => {
  if (!event.detail) return;
  const run = event.detail;
  try {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    currentUser = data.session?.user || null;
    if (!currentUser) return;

    let achievements = [];
    try {
      const localSave = JSON.parse(localStorage.getItem("cosmic-scrap-save-v2") || "{}");
      achievements = Array.isArray(localSave.achievements) ? localSave.achievements.filter(id => typeof id === "string") : [];
    } catch {}

    const { error } = await supabase.rpc("record_player_run", {
      p_score: Math.max(0, Math.floor(run.score || 0)),
      p_level: Math.max(1, Math.floor(run.level || 1)),
      p_survival_seconds: Math.max(0, Math.floor(run.survivalSeconds || 0)),
      p_kills: Math.max(0, Math.floor(run.kills || 0)),
      p_bosses_defeated: Math.max(0, Math.floor(run.bossesDefeated || 0)),
      p_scrap_collected: Math.max(0, Math.floor(run.scrapCollected || 0)),
      p_achievements: achievements
    });
    if (error) throw error;
    if (!panel.hidden) await loadProgress(currentUser);
  } catch (error) {
    if (!panel.hidden) setStatus("Run saved locally, but career statistics could not sync. Your offline save remains safe.", true);
  }
  await syncGameSave({ silent: true });
});

window.addEventListener("cosmic-scrap:save-changed", () => {
  if (!currentUser) return;
  if (saveSyncTimer) clearTimeout(saveSyncTimer);
  saveSyncTimer = setTimeout(() => {
    saveSyncTimer = null;
    syncGameSave({ silent: true });
  }, 1600);
});
supabase.auth.getSession().then(({ data, error }) => {
  if (!error && data.session?.user) {
    currentUser = data.session.user;
    syncGameSave({ silent: true });
  }
}).catch(() => {});

$("account-save-sync")?.addEventListener("click", () => syncGameSave());

window.addEventListener("online", () => {
  if (currentUser) syncGameSave({ silent: true });
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentUser) syncGameSave({ silent: true });
});
