import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
let busy = false;

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.state = error ? "error" : "info";
}
function setBusy(value) {
  busy = value;
  authForm.querySelectorAll("button, input").forEach((node) => { node.disabled = value; });
  profileForm.querySelectorAll("button, input, select").forEach((node) => { node.disabled = value; });
}
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
async function loadProfile(user) {
  const { data, error } = await supabase.from("player_profiles")
    .select("user_id, username, avatar_id, rocket_id, avatar_path, trophies, created_at")
    .eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Your profile is still being created. Wait a moment and open the account panel again.");
  $("account-email").textContent = user.email || "Email account";
  $("account-joined").textContent = formatDate(data.created_at);
  $("account-trophies").textContent = String(data.trophies ?? 0);
  $("account-username").value = data.username;
  $("account-avatar").value = data.avatar_id;
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
    setStatus("Account connected · profile synced with Supabase.");
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
window.addEventListener("cosmic-scrap:open-account", openAccount);
$("account-close").addEventListener("click", () => { panel.hidden = true; $("account-open").focus(); });
$("account-mode-signup").addEventListener("click", () => {
  $("account-auth-title").textContent = "CREATE ACCOUNT";
  $("account-auth-submit").textContent = "CREATE ACCOUNT";
  $("account-auth-mode").value = "signup";
  $("account-auth-password").autocomplete = "new-password";
  setStatus("Use an email you can access. Confirmation may be required before sign-in.");
});
$("account-mode-login").addEventListener("click", () => {
  $("account-auth-title").textContent = "WELCOME BACK";
  $("account-auth-submit").textContent = "SIGN IN";
  $("account-auth-mode").value = "login";
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
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: new URL("./", window.location.href).href }
      });
      if (error) throw error;
      if (data.session) await renderSession(data.session);
      else setStatus("Account created. Check your email for the confirmation link, then return here to sign in.");
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
      avatar_id: $("account-avatar").value,
      rocket_id: $("account-rocket").value,
      updated_at: new Date().toISOString()
    };
    if (file) updates.avatar_path = nextAvatarPath;
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
