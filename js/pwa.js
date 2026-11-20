const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";

const installCopy = {
  en: { title:"INSTALL TAVIRO", copy:"Add TAVIRO to your home screen for a full-screen app experience.", button:"INSTALL APP", help:"If no install window appears: open your browser menu and choose “Add to Home screen” or “Install app”.", ios:"On iPhone/iPad: tap Share, then “Add to Home Screen”." },
  tr: { title:"TAVIRO'YU YÜKLE", copy:"Tam ekran uygulama deneyimi için TAVIRO'yu ana ekrana ekle.", button:"UYGULAMAYI YÜKLE", help:"Kurulum penceresi açılmazsa tarayıcı menüsünü açıp “Ana ekrana ekle” veya “Uygulamayı yükle” seçeneğine dokun.", ios:"iPhone/iPad: Paylaş düğmesine, ardından “Ana Ekrana Ekle” seçeneğine dokun." },
  "pt-BR": { title:"INSTALAR TAVIRO", copy:"Adicione TAVIRO à tela inicial para uma experiência em tela cheia.", button:"INSTALAR APP", help:"Se a janela não aparecer, abra o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar app”.", ios:"No iPhone/iPad: toque em Compartilhar e depois em “Adicionar à Tela de Início”." },
  es: { title:"INSTALAR TAVIRO", copy:"Añade TAVIRO a tu pantalla de inicio para usarlo a pantalla completa.", button:"INSTALAR APP", help:"Si no aparece la ventana, abre el menú del navegador y elige “Añadir a pantalla de inicio” o “Instalar app”.", ios:"En iPhone/iPad: toca Compartir y después “Añadir a pantalla de inicio”." },
  ru: { title:"УСТАНОВИТЬ TAVIRO", copy:"Добавьте TAVIRO на главный экран для полноэкранного режима.", button:"УСТАНОВИТЬ", help:"Если окно не появилось, откройте меню браузера и выберите «Добавить на главный экран» или «Установить приложение».", ios:"На iPhone/iPad: нажмите «Поделиться», затем «На экран Домой»." },
  id: { title:"INSTAL TAVIRO", copy:"Tambahkan TAVIRO ke layar utama untuk pengalaman layar penuh.", button:"INSTAL APLIKASI", help:"Jika jendela instalasi tidak muncul, buka menu browser lalu pilih “Tambahkan ke layar utama” atau “Instal aplikasi”.", ios:"Di iPhone/iPad: ketuk Bagikan, lalu “Tambahkan ke Layar Utama”." },
  de: { title:"TAVIRO INSTALLIEREN", copy:"Füge TAVIRO zum Startbildschirm hinzu und nutze die Vollbildansicht.", button:"APP INSTALLIEREN", help:"Falls kein Fenster erscheint, öffne das Browsermenü und wähle „Zum Startbildschirm hinzufügen“ oder „App installieren“.", ios:"Auf iPhone/iPad: Tippe auf „Teilen“ und dann auf „Zum Home-Bildschirm“." },
  fr: { title:"INSTALLER TAVIRO", copy:"Ajoutez TAVIRO à l’écran d’accueil pour profiter du plein écran.", button:"INSTALLER L’APP", help:"Si aucune fenêtre ne s’ouvre, ouvrez le menu du navigateur et choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application ».", ios:"Sur iPhone/iPad : touchez Partager, puis « Sur l’écran d’accueil »." },
  ja: { title:"TAVIROをインストール", copy:"TAVIROをホーム画面に追加して全画面でプレイできます。", button:"アプリをインストール", help:"画面が表示されない場合は、ブラウザーのメニューから「ホーム画面に追加」または「アプリをインストール」を選択してください。", ios:"iPhone/iPadでは共有ボタンをタップし、「ホーム画面に追加」を選択します。" }
};

const locale = () => {
  try {
    const saved = localStorage.getItem("cosmic-scrap-language");
    return installCopy[saved] ? saved : (installCopy[navigator.language] ? navigator.language : "en");
  } catch { return "en"; }
};
const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
let installPrompt = null;

function setupInstallUi() {
  const panel = document.getElementById("pwa-install-panel");
  const button = document.getElementById("pwa-install-button");
  const title = document.getElementById("pwa-install-title");
  const copy = document.getElementById("pwa-install-copy");
  const status = document.getElementById("pwa-install-status");
  if (!panel || !button || !title || !copy || !status) return;

  const strings = installCopy[locale()];
  title.textContent = strings.title;
  copy.textContent = strings.copy;
  button.textContent = strings.button;
  if (isInstalled()) { panel.hidden = true; return; }
  panel.hidden = false;

  const showHelp = () => {
    const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    status.textContent = isAppleMobile ? strings.ios : strings.help;
    status.hidden = false;
  };

  button.addEventListener("click", async () => {
    if (!installPrompt) { showHelp(); return; }
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;
    if (choice?.outcome === "accepted") {
      status.textContent = strings.help;
      button.disabled = true;
    } else {
      showHelp();
    }
  });
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    button.disabled = false;
  });
  window.addEventListener("appinstalled", () => { panel.hidden = true; });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupInstallUi, { once: true });
} else {
  setupInstallUi();
}

// Register the offline app shell independently from the install prompt.
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
