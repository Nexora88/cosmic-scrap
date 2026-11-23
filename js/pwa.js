const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";

let deferredInstallPrompt = null;
const installPanel = document.getElementById("install-app-panel");
const installButton = document.getElementById("install-app-button");
const installStatus = document.getElementById("install-app-status");
const isAndroid = /Android/i.test(navigator.userAgent);

if (installPanel && isAndroid) installPanel.hidden = false;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installPanel && isAndroid) installPanel.hidden = false;
  if (installStatus) installStatus.textContent = "TAVIRO yüklemeye hazır. Yükle düğmesine dokun.";
});

installButton?.addEventListener("click", async () => {
  if (!isAndroid) return;
  if (!deferredInstallPrompt) {
    if (installStatus) installStatus.textContent = "Yükleme seçeneği görünmüyorsa Chrome veya Samsung Internet menüsünü açıp “Uygulamayı yükle” ya da “Ana ekrana ekle” seçeneğine dokun.";
    return;
  }
  installButton.disabled = true;
  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (installStatus) installStatus.textContent = choice?.outcome === "accepted"
      ? "TAVIRO yükleme işlemi başlatıldı."
      : "Yükleme iptal edildi. İstediğinde tekrar deneyebilirsin.";
  } catch (error) {
    console.warn("[TAVIRO] Install prompt failed:", error);
    if (installStatus) installStatus.textContent = "Tarayıcı menüsünden “Uygulamayı yükle” seçeneğini kullan.";
  } finally {
    deferredInstallPrompt = null;
    installButton.disabled = false;
  }
});

window.addEventListener("appinstalled", () => {
  if (installStatus) installStatus.textContent = "TAVIRO cihazına yüklendi.";
  if (installButton) installButton.hidden = true;
});

if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => {
        // Soundtracks are optional and must never delay installation or startup.
        const requestMusicCache = () => registration.active?.postMessage({ type: "TAVIRO_CACHE_MUSIC" });
        if (registration.active) requestMusicCache();
        else navigator.serviceWorker.addEventListener("controllerchange", requestMusicCache, { once: true });
      })
      .catch(error => console.warn("[TAVIRO] Service worker registration failed:", error));
  }, { once: true });
}
