const accountButton = document.getElementById("account-open");
const homeAccountButton = document.getElementById("home-create-account");
const onlineButton = document.getElementById("online-open");
let accountLoad = null;
let onlineLoad = null;
function loadAccount() {
  if (!accountLoad) accountLoad = import("./cloud-account.js");
  return accountLoad;
}
function loadOnline() {
  if (!onlineLoad) onlineLoad = import("./online-hub.js");
  return onlineLoad;
}
async function openAccount() {
  try {
    await loadAccount();
    window.dispatchEvent(new Event("cosmic-scrap:open-account"));
  } catch {
    const status = document.getElementById("account-status");
    document.getElementById("account-screen").hidden = false;
    status.textContent = "Hesap servisi yüklenemedi. Çevrimdışı oyun ve bu tarayıcıdaki kaydın kullanılabilir.";
    status.dataset.state = "error";
  }
}
accountButton?.addEventListener("click", openAccount);
homeAccountButton?.addEventListener("click", openAccount);
onlineButton?.addEventListener("click", async () => {
  try {
    await loadOnline();
    window.dispatchEvent(new Event("cosmic-scrap:open-online"));
  } catch {
    const panel = document.getElementById("online-screen");
    const status = document.getElementById("online-status");
    panel.hidden = false;
    status.textContent = "Skor tablosu yüklenemedi. Çevrimdışı oyun devam edebilir.";
    status.dataset.state = "error";
  }
});
window.addEventListener("cosmic-scrap:request-account", openAccount);
window.addEventListener("cosmic-scrap:region-captured", async event => {
  let hasSavedSession=false;
  try{hasSavedSession=Object.keys(localStorage).some(key=>key.startsWith("sb-")&&key.endsWith("-auth-token"))}catch{}
  if(!hasSavedSession)return;
  try{await loadOnline();window.dispatchEvent(new CustomEvent("cosmic-scrap:submit-region-capture",{detail:event.detail||{}}))}catch{}
});
window.addEventListener("cosmic-scrap:run-ended", async (event) => {
  let hasSavedSession = false;
  try { hasSavedSession = Object.keys(localStorage).some(key => key.startsWith("sb-") && key.endsWith("-auth-token")); } catch {}
  if (!hasSavedSession) return;
  try {
    await Promise.all([loadOnline(), loadAccount()]);
    window.dispatchEvent(new CustomEvent("cosmic-scrap:submit-score", { detail: event.detail || {} }));
    window.dispatchEvent(new CustomEvent("cosmic-scrap:cloud-save-request", { detail: event.detail || {} }));
  } catch { /* Online sync is optional and must never interrupt a completed offline run. */ }
});
if (location.hash === "#leaderboard") {
  loadOnline().then(() => window.dispatchEvent(new Event("cosmic-scrap:open-online"))).catch(() => {});
}
