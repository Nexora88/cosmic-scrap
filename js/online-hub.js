import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $ = id => document.getElementById(id);
const panel = $("online-screen");
const status = $("online-status");
const SITE_URL = "https://nexora88.github.io/cosmic-scrap/";
let user = null;
let pendingShareText = "";

function message(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "info";
}
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = String(text);
  return el;
}
async function callRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}
function avatarNode(profile = {}) {
  const avatarId = ["core-blue", "core-mint", "core-violet", "core-amber"].includes(profile.avatar_id)
    ? profile.avatar_id : "core-blue";
  if (!profile.avatar_path) return node("span", "leader-avatar avatar-" + avatarId, "■");
  const image = node("img", "leader-avatar leader-photo");
  image.src = supabase.storage.from("player-avatars").getPublicUrl(profile.avatar_path).data.publicUrl;
  image.alt = (profile.username || "Pilot") + " profile photo";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => image.replaceWith(node("span", "leader-avatar avatar-" + avatarId, "■")), { once: true });
  return image;
}
async function loadBoard() {
  const list = $("leaderboard-list");
  const tr = localStorage.getItem("cosmic-scrap-language") === "tr";
  list.replaceChildren(node("p", "empty-state", tr ? "Pilot sıralaması yükleniyor…" : "Loading pilot rankings…"));
  try {
    const records = await callRpc("get_player_leaderboard", { p_limit: 50 });
    list.replaceChildren();
    if (!records?.length) {
      list.append(node("p", "empty-state", tr
        ? "Henüz skor yok. İlk sıraya yerleşmek için bir oyun tamamla."
        : "No scores yet. Finish a run to claim the first spot."));
      return;
    }
    records.forEach((record, index) => {
      const row = node("div", "leader-row");
      const rank = node("span", "leader-rank", String(index + 1).padStart(2, "0"));
      const identity = node("div", "leader-identity");
      identity.append(
        node("strong", "", record.username || (tr ? "İsimsiz pilot" : "Pilot")),
        node("small", "", (tr ? "SEV. " : "LVL ") + Number(record.best_level || 1) + " · " +
          Number(record.best_survival_seconds || 0) + (tr ? " sn hayatta kaldı" : "s survived"))
      );
      const score = node("strong", "leader-score", Number(record.best_score || 0).toLocaleString(tr ? "tr-TR" : "en-US"));
      row.append(rank, avatarNode(record), identity, score);
      list.append(row);
    });
  } catch (error) {
    list.replaceChildren(node("p", "empty-state error-text", error?.message || (tr ? "Skor tablosu yüklenemedi." : "Could not load leaderboard.")));
  }
}
async function openOnline() {
  panel.hidden = false;
  $("online-close").focus();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    $("online-needs-account").hidden = Boolean(user);
    await loadBoard();
    if (!user) message(localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Tabloyu herkes görebilir. Skor göndermek için ücretsiz hesap aç."
      : "Everyone can view the board. Create a free account to submit scores.");
    else message(localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Hesabın bağlı. Tamamlanan oyunların en iyi skoru otomatik gönderilir."
      : "Account connected. Your best completed-run score syncs automatically.");
  } catch (error) { message(error?.message || "Leaderboard service unavailable.", true); }
}
async function shareRecord() {
  if (pendingShareText) {
    if (navigator.share) { try { await navigator.share({ text: pendingShareText }); return; } catch {} }
    try { await navigator.clipboard.writeText(pendingShareText); message("Record text copied."); } catch { message(pendingShareText); }
    return;
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const signedIn = data.session?.user;
    if (!signedIn) { message("Create a free account to publish and share your score."); return; }
    const { data: record, error: recordError } = await supabase.from("player_run_records")
      .select("best_score,best_level,best_survival_seconds").eq("user_id", signedIn.id).maybeSingle();
    if (recordError) throw recordError;
    if (!record) { message("Finish a run to create your first record."); return; }
    pendingShareText = "My Cosmic Scrap record is " + Number(record.best_score).toLocaleString() +
      " points · level " + record.best_level + " · " + record.best_survival_seconds +
      "s survived. Can you beat it? " + SITE_URL;
    await shareRecord();
  } catch (error) { message(error?.message || "Could not load your record.", true); }
}
async function submitScore(event) {
  const result = event.detail || {};
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    if (!user) return;
    const score = Math.max(0, Math.floor(Number(result.score) || 0));
    const level = Math.max(1, Math.floor(Number(result.level) || 1));
    const seconds = Math.max(0, Math.min(14400, Math.floor(Number(result.survivalSeconds) || 0)));
    await callRpc("submit_run_record", { p_score: score, p_level: level, p_survival_seconds: seconds });
    pendingShareText = "New Cosmic Scrap record: " + score.toLocaleString() + " points · level " + level +
      " · survived " + seconds + "s. Play free: " + SITE_URL;
    if (!panel.hidden) {
      message(localStorage.getItem("cosmic-scrap-language") === "tr"
        ? "Skorun ortak tabloya gönderildi."
        : "Your score was submitted to the shared leaderboard.");
      await loadBoard();
    }
  } catch (error) {
    if (!panel.hidden) message((localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Oyun tamamlandı ancak skor eşitlenemedi: "
      : "Run completed, but score sync failed: ") + (error?.message || "network error"), true);
  }
}
window.addEventListener("cosmic-scrap:open-online", openOnline);
window.addEventListener("cosmic-scrap:submit-score", submitScore);
$("online-close").addEventListener("click", () => { panel.hidden = true; $("online-open").focus(); });
$("online-refresh-board").addEventListener("click", loadBoard);
$("online-needs-account-button").addEventListener("click", () => {
  panel.hidden = true;
  window.dispatchEvent(new Event("cosmic-scrap:request-account"));
});
$("online-share-record").addEventListener("click", shareRecord);
