const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
const installButtons = () => [...document.querySelectorAll("#pwa-install, #pwa-install-settings")];
let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function announceInstall(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 4200);
  } else {
    window.alert(message);
  }
}

function setInstallButtonState() {
  const installed = isStandalone();
  for (const button of installButtons()) {
    button.hidden = installed;
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
    button.title = deferredInstallPrompt ? "Install TAVIRO on this device" : "Use your browser menu to install TAVIRO";
  }
}

async function installTaviro() {
  if (isStandalone()) {
    setInstallButtonState();
    return;
  }
  if (!deferredInstallPrompt) {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    announceInstall(isIOS
      ? "TAVIRO'yu yüklemek için Paylaş menüsünü açıp 'Ana Ekrana Ekle' seçeneğine dokun."
      : "TAVIRO'yu yüklemek için tarayıcı menüsünü açıp 'Uygulamayı yükle' veya 'Ana ekrana ekle' seçeneğini kullan.");
    return;
  }
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  setInstallButtonState();
  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    announceInstall(choice?.outcome === "accepted"
      ? "TAVIRO cihazına yükleniyor. Kurulum tamamlanınca ana ekranından açabilirsin."
      : "Kurulum isteği iptal edildi. İstediğin zaman tekrar deneyebilirsin.");
  } catch (error) {
    console.warn("TAVIRO install prompt failed:", error);
    announceInstall("Otomatik kurulum açılamadı. Tarayıcı menüsünden 'Ana ekrana ekle' seçeneğini kullan.");
  }
}

for (const button of installButtons()) button.addEventListener("click", installTaviro);

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallButtonState();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  setInstallButtonState();
  announceInstall("TAVIRO başarıyla cihaza eklendi.");
});

window.addEventListener("DOMContentLoaded", setInstallButtonState, { once: true });
setInstallButtonState();

if (secureContext && "serviceWorker" in navigator) {
  const registerOfflineShell = () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => registration.update().catch(() => {}))
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  };
  if (document.readyState === "complete") registerOfflineShell();
  else window.addEventListener("load", registerOfflineShell, { once: true });
}
