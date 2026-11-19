import { translations } from "./language.js";
const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
const installButton = document.getElementById("install-app");
const installPanel = document.querySelector(".install-app-panel");
const installStatus = document.getElementById("install-app-status");
let deferredInstallPrompt = null;
let currentStatusKey = "Install TAVIRO on this device for offline play.";
function locale() {
  try { const value = localStorage.getItem("cosmic-scrap-language"); return translations[value] ? value : "en"; }
  catch { return "en"; }
}
function copy(key) { return translations[locale()]?.[key] || translations.en[key] || key; }
function setStatus(key) { currentStatusKey = key; if (installStatus) installStatus.textContent = copy(key); }
function isInstalled() {
  const nativeRuntime = window.Capacitor?.isNativePlatform?.() || location.protocol === "capacitor:" || location.protocol === "ionic:";
  return Boolean(nativeRuntime) || window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function syncInstallState() {
  if (!installButton) return;
  const installed = isInstalled();
  installButton.hidden = installed;
  if (installPanel) installPanel.hidden = installed;
  if (installed) setStatus("TAVIRO is installed on this device.");
}
if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  }, { once: true });
}
if (installButton) {
  syncInstallState();
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.dataset.installReady = "true";
  });
  installButton.addEventListener("click", async () => {
    if (isInstalled()) { syncInstallState(); return; }
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setStatus(choice?.outcome === "accepted"
          ? "Install request accepted. TAVIRO will be added to your device."
          : "Install prompt dismissed. You can try again from the browser menu.");
      } catch {
        setStatus("Open your browser menu and choose Install app or Add to Home Screen.");
      }
      return;
    }
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      setStatus("On iPhone or iPad, tap Share, then choose Add to Home Screen.");
    } else if (/Android/i.test(ua)) {
      setStatus("On Android, open the browser menu ⋮ and choose Install app or Add to Home screen.");
    } else {
      setStatus("On desktop, use the install icon in the address bar or your browser menu.");
    }
  });
  window.addEventListener("appinstalled", () => { deferredInstallPrompt = null; syncInstallState(); });
  window.addEventListener("cosmic-scrap:language-changed", () => {
    if (installStatus) installStatus.textContent = copy(currentStatusKey);
  });
}
