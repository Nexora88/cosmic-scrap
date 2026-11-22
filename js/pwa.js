const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
const installButton = document.getElementById("pwa-install-button");
const installStatus = document.getElementById("pwa-install-status");
let deferredInstallPrompt = null;

function setInstallStatus(message) {
  if (!installStatus) return;
  installStatus.textContent = message;
  installStatus.hidden = false;
}

function isInstalled() {
  return window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

if (installButton) {
  if (isInstalled()) {
    installButton.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
    installButton.disabled = false;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton.hidden = true;
    setInstallStatus(document.documentElement.lang === "tr"
      ? "TAVIRO cihazına yüklendi."
      : "TAVIRO has been installed.");
  });

  installButton.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (choice?.outcome === "accepted") {
        setInstallStatus(document.documentElement.lang === "tr"
          ? "Yükleme başlatıldı."
          : "Installation started.");
      }
      return;
    }

    const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const message = isIOS
      ? "Safari'de Paylaş → Ana Ekrana Ekle seçeneğini kullan."
      : isSamsung
        ? "Samsung Internet menüsünü açıp 'Sayfayı şuna ekle' → 'Ana ekran' seçeneğini kullan."
        : "Tarayıcı menüsünü açıp 'Uygulamayı yükle' veya 'Ana ekrana ekle' seçeneğini kullan.";
    setInstallStatus(message);
  });
}

if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => {
        const requestMusicCache = () => registration.active?.postMessage({ type: "TAVIRO_CACHE_MUSIC" });
        if (registration.active) requestMusicCache();
        else navigator.serviceWorker.addEventListener("controllerchange", requestMusicCache, { once: true });
      })
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  }, { once: true });
}
