import { translations } from "./language.js";
const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
const installButton = document.getElementById("install-app");
const installPanel = document.getElementById("pwa-quick-install");
const installStatus = document.getElementById("install-app-status");
let deferredInstallPrompt = null;
let currentStatusKey = "PWA INSTALL READY";
function locale() {
  try { const value = localStorage.getItem("cosmic-scrap-language"); return translations[value] ? value : "en"; }
  catch { return "en"; }
}
function copy(key) { return translations[locale()]?.[key] || translations.en[key] || key; }
function setStatus(key) { currentStatusKey = key; if (installStatus) installStatus.textContent = copy(key); }
function isIOSDevice() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isInstalled() {
  const nativeRuntime = window.Capacitor?.isNativePlatform?.() || location.protocol === "capacitor:" || location.protocol === "ionic:";
  return Boolean(nativeRuntime) || window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function syncInstallState() {
  if (!installButton) return;
  const installed = isInstalled();
  installButton.hidden = installed;
  if (installPanel) installPanel.hidden = installed;
  if (installed) setStatus("PWA INSTALLED");
}
if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => {
        // Cache optional soundtrack files only after the core app worker is active.
        const requestMusicCache = () => registration.active?.postMessage({ type: "TAVIRO_CACHE_MUSIC" });
        if (registration.active) requestMusicCache();
        else navigator.serviceWorker.addEventListener("controllerchange", requestMusicCache, { once: true });
      })
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  }, { once: true });
}
if (installButton) {
  // iOS Safari has no beforeinstallprompt event: show the Share-sheet steps immediately.
  if (isIOSDevice()) setStatus("PWA INSTALL READY");
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
        setStatus("PWA INSTALL READY");
      }
      return;
    }
    const ua = navigator.userAgent || "";
    if (isIOSDevice() && !window.MSStream) {
      setStatus("PWA INSTALL READY");
    } else if (/Android/i.test(ua)) {
      setStatus("PWA INSTALL READY");
    } else {
      setStatus("PWA INSTALL READY");
    }
  });
  window.addEventListener("appinstalled", () => { deferredInstallPrompt = null; syncInstallState(); });
  window.addEventListener("cosmic-scrap:language-changed", () => {
    if (installStatus) installStatus.textContent = copy(currentStatusKey);
  });
}
