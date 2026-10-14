import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeUsername } from "./utils/Username.js";

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
let currentAvatarId = "core-blue";
let busy = false;
let authFailures = 0;
let authLockedUntil = 0;
try { authLockedUntil = Number(localStorage.getItem("cosmic-scrap-auth-lock-until") || 0); } catch {}

const trMode = () => {
  try { return localStorage.getItem("cosmic-scrap-language") === "tr"; } catch { return false; }
};
const statusTR = {
  "Sign in or create an account to sync your player profile.": "Pilot profilini eşitlemek için giriş yap veya hesap oluştur.",
  "Account connected · profile synced with Supabase.": "Hesap bağlandı · profil Supabase ile eşitlendi.",
  "Could not load profile.": "Profil yüklenemedi.",
  "Connecting to account service…": "Hesap hizmetine bağlanılıyor…",
  "Could not reach Supabase. Check your connection.": "Supabase'e bağlanılamadı. İnternet bağlantını kontrol et.",
  "Use an email you can access. Confirmation may be required before sign-in.": "Erişebildiğin bir e-posta kullan. Girişten önce e-posta onayı gerekebilir.",
  "Sign in to load your saved online profile.": "Kayıtlı çevrim içi profilini yüklemek için giriş yap.",
  "Account created. Check your email for the confirmation link, then return here to sign in.": "Hesap oluşturuldu. Onay bağlantısı için e-postanı kontrol et, ardından buradan giriş yap.",
  "Choose a JPG, PNG or WEBP image up to 1 MB.": "En fazla 1 MB boyutunda JPG, PNG veya WEBP görsel seç.",
  "Photo selected. Save profile to upload it.": "Fotoğraf seçildi. Yüklemek için profili kaydet.",
  "Profile saved to your free account.": "Profil ücretsiz hesabına kaydedildi.",
  "Signed out. Your local game save is unchanged.": "Çıkış yapıldı. Bu cihazdaki oyun kaydın değişmedi.",
  "Could not sign out.": "Çıkış yapılamadı.",
  "This pilot name is already taken. Try another one.": "Bu pilot adı kullanımda. Başka bir ad dene.",
  "Too many attempts. Wait before trying again.": "Çok fazla deneme yapıldı. Yeniden denemeden önce bekle.",
  "Please enter a pilot name with at least 3 letters or numbers.": "En az 3 harf veya rakam içeren bir pilot adı yaz.",
  "Profile could not be saved.": "Profil kaydedilemedi."
};
function translateStatus(message) {
  if (!trMode()) return message;
  if (statusTR[message]) return statusTR[message];
  if (/Username must be|pilot name/i.test(message)) return "Pilot adı en az 3 karakter olmalı; harf, rakam ve alt çizgi kullanılır.";
  if (/duplicate key|player_profiles_username_key|already taken|username.*unique/i.test(message)) return statusTR["This pilot name is already taken. Try another one."];
  if (/permission denied for table player_profiles/i.test(message)) return "Profil izinleri güncellendi. Sayfayı yenileyip tekrar dene.";
  if (/invalid login credentials/i.test(message)) return "E-posta veya şifre hatalı.";
  if (/email not confirmed/i.test(message)) return "Önce e-posta adresini onayla.";
  if (/user already registered/i.test(message)) return "Bu e-posta ile bir hesap zaten var. Giriş yapmayı dene.";
  if (/rate limit|too many requests/i.test(message)) return "Çok fazla deneme yapıldı. Bir süre bekleyip tekrar dene.";
  if (/password.*8 characters/i.test(message)) return "Şifre en az 8 karakter olmalı.";
  return message;
}
function setStatus(message, error = false) {
  status.textContent = translateStatus(message);
  status.dataset.state = error ? "error" : "info";
}
function authIsLocked() {
  if (Date.now() < authLockedUntil) {
    setStatus("Too many attempts. Wait before trying again.", true);
    return true;
  }
  return false;
}
function recordAuthFailure() {
  authFailures += 1;
  if (authFailures < 3) return;
  const duration = authFailures >= 8 ? 10 * 60_000 : authFailures >= 5 ? 2 * 60_000 : 30_000;
  authLockedUntil = Date.now() + duration;
  try { localStorage.setItem("cosmic-scrap-auth-lock-until", String(authLockedUntil)); } catch {}
  setStatus("Too many attempts. Wait before trying again.", true);
}
function clearAuthFailures() {
  authFailures = 0;
  authLockedUntil = 0;
  try { localStorage.removeItem("cosmic-scrap-auth-lock-until"); } catch {}
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
  currentAvatarId = "core-blue";
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
  currentAvatarId = data.avatar_id;
  $("account-rocket").value = data.rocket_id;
  $("account-user-label").textContent = data.username;
  currentAvatarPath = data.avatar_path || null;
  const preview = $("account-photo-preview");
  if (currentAvatarPath) { preview.src = supabase.storage.from("player-avatars").getPublicUrl(currentAvatarPath).data.publicUrl; preview.hidden = false; }
  else if (data.avatar_id === "ataturk") { preview.src = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ataturk1930s.jpg?width=180"; preview.hidden = false; }
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
    const requestedName = normalizeUsername(currentUser.user_metadata?.username || "");
    const actualName = $("account-username").value;
    if (requestedName && actualName.startsWith("pilot_") && actualName !== requestedName) {
      setStatus("That pilot name was already used; a temporary name was assigned. Choose another name and save your profile.");
    } else {
      setStatus("Account connected · profile synced with Supabase.");
    }
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
function setAuthMode(mode) {
  const signup = mode === "signup";
  $("account-auth-title").textContent = signup ? "CREATE ACCOUNT" : "WELCOME BACK";
  $("account-auth-submit").textContent = signup ? "CREATE ACCOUNT" : "SIGN IN";
  $("account-auth-mode").value = signup ? "signup" : "login";
  $("account-auth-password").autocomplete = signup ? "new-password" : "current-password";
  $("account-signup-name-wrap").hidden = !signup;
  $("account-signup-username").required = signup;
  if (signup) $("account-signup-username").focus();
  setStatus(signup
    ? "Use an email you can access. Confirmation may be required before sign-in."
    : "Sign in to load your saved online profile.");
}
$("account-mode-signup").addEventListener("click", () => setAuthMode("signup"));
$("account-mode-login").addEventListener("click", () => setAuthMode("login"));
setAuthMode("login");
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || authIsLocked()) return;
  setBusy(true);
  let authRequestStarted = false;
  try {
    const email = $("account-auth-email").value.trim();
    const password = $("account-auth-password").value;
    if ($("account-auth-mode").value === "signup") {
      const username = normalizeUsername($("account-signup-username").value);
      if (username.length < 3) throw new Error("Please enter a pilot name with at least 3 letters or numbers.");
      authRequestStarted = true;
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: new URL("./", window.location.href).href,
          data: { username }
        }
      });
      if (error) throw error;
      clearAuthFailures();
      if (data.session) await renderSession(data.session);
      else setStatus("Account created. Check your email for the confirmation link, then return here to sign in.");
      window.dispatchEvent(new Event("cosmic-scrap:show-intro"));
    } else {
      authRequestStarted = true;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      clearAuthFailures();
      await renderSession(data.session);
    }
  } catch (error) {
    if (authRequestStarted) {
      recordAuthFailure();
      if (Date.now() < authLockedUntil) return;
    }
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
    const username = normalizeUsername($("account-username").value);
    if (username.length < 3) throw new Error("Please enter a pilot name with at least 3 letters or numbers.");
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
    else if ($("account-avatar").value !== currentAvatarId) updates.avatar_path = null;
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
    setStatus(error.message || "Profile could not be saved.", true);
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
