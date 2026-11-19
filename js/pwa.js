const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
let deferredInstallPrompt = null;

const COPY = {
  en: { install:"INSTALL TAVIRO", music:"DOWNLOAD OFFLINE MUSIC (~32 MB)", ready:"TAVIRO is ready to install from this browser.", installed:"TAVIRO has been installed.", manual:"Open the browser menu and choose “Install app” or “Add to Home screen”.", ios:"Open this page in Safari, tap Share, then “Add to Home Screen”.", musicReady:"Offline music is ready on this device.", progress:"Saving offline music", error:"Music download could not finish. Check your connection and try again." },
  tr: { install:"TAVIRO’YU CİHAZA KUR", music:"ÇEVRİMDIŞI MÜZİKLERİ İNDİR (~32 MB)", ready:"TAVIRO bu tarayıcıdan kurulmaya hazır.", installed:"TAVIRO cihaza kuruldu.", manual:"Tarayıcı menüsünü açıp “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullan.", ios:"Sayfayı Safari’de aç, Paylaş’a dokun ve “Ana Ekrana Ekle”yi seç.", musicReady:"Çevrimdışı müzikler bu cihazda hazır.", progress:"Çevrimdışı müzikler kaydediliyor", error:"Müzikler indirilemedi. Bağlantını kontrol edip yeniden dene." },
  "pt-BR": { install:"INSTALAR TAVIRO", music:"BAIXAR MÚSICAS OFFLINE (~32 MB)", ready:"TAVIRO está pronto para instalação.", installed:"TAVIRO foi instalado.", manual:"Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.", ios:"Abra no Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”.", musicReady:"As músicas offline estão prontas.", progress:"Salvando músicas offline", error:"Não foi possível concluir o download. Verifique a conexão e tente novamente." },
  es: { install:"INSTALAR TAVIRO", music:"DESCARGAR MÚSICA SIN CONEXIÓN (~32 MB)", ready:"TAVIRO está listo para instalarse.", installed:"TAVIRO se ha instalado.", manual:"Abre el menú del navegador y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.", ios:"Abre en Safari, pulsa Compartir y elige “Añadir a pantalla de inicio”.", musicReady:"La música sin conexión está lista.", progress:"Guardando música sin conexión", error:"No se pudo completar la descarga. Comprueba la conexión e inténtalo de nuevo." },
  ru: { install:"УСТАНОВИТЬ TAVIRO", music:"СКАЧАТЬ ОФЛАЙН-МУЗЫКУ (~32 МБ)", ready:"TAVIRO готова к установке.", installed:"TAVIRO установлена.", manual:"Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».", ios:"Откройте в Safari, нажмите «Поделиться» и выберите «На экран Домой».", musicReady:"Офлайн-музыка сохранена.", progress:"Сохранение офлайн-музыки", error:"Не удалось скачать музыку. Проверьте подключение и повторите попытку." },
  id: { install:"PASANG TAVIRO", music:"UNDUH MUSIK OFFLINE (~32 MB)", ready:"TAVIRO siap dipasang.", installed:"TAVIRO telah dipasang.", manual:"Buka menu browser lalu pilih “Install app” atau “Tambahkan ke layar utama”.", ios:"Buka di Safari, ketuk Bagikan, lalu “Tambahkan ke Layar Utama”.", musicReady:"Musik offline siap di perangkat ini.", progress:"Menyimpan musik offline", error:"Unduhan tidak selesai. Periksa koneksi lalu coba lagi." },
  de: { install:"TAVIRO INSTALLIEREN", music:"OFFLINE-MUSIK HERUNTERLADEN (~32 MB)", ready:"TAVIRO kann installiert werden.", installed:"TAVIRO wurde installiert.", manual:"Öffne das Browsermenü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.", ios:"In Safari öffnen, Teilen antippen und „Zum Home-Bildschirm“ wählen.", musicReady:"Offline-Musik ist auf diesem Gerät verfügbar.", progress:"Offline-Musik wird gespeichert", error:"Der Download konnte nicht abgeschlossen werden. Verbindung prüfen und erneut versuchen." },
  fr: { install:"INSTALLER TAVIRO", music:"TÉLÉCHARGER LA MUSIQUE HORS LIGNE (~32 Mo)", ready:"TAVIRO peut être installé.", installed:"TAVIRO a été installé.", manual:"Ouvrez le menu du navigateur et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».", ios:"Ouvrez dans Safari, touchez Partager puis « Sur l’écran d’accueil ».", musicReady:"La musique hors ligne est prête.", progress:"Enregistrement de la musique hors ligne", error:"Le téléchargement a échoué. Vérifiez la connexion et réessayez." },
  ja: { install:"TAVIROをインストール", music:"オフライン音楽をダウンロード（約32 MB）", ready:"このブラウザーからTAVIROをインストールできます。", installed:"TAVIROをインストールしました。", manual:"ブラウザーのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。", ios:"Safariで開き、共有をタップして「ホーム画面に追加」を選択してください。", musicReady:"オフライン音楽を保存しました。", progress:"オフライン音楽を保存中", error:"ダウンロードできませんでした。接続を確認して再試行してください。" }
};

function copy() { let lang="en"; try { lang=localStorage.getItem("cosmic-scrap-language") || "en"; } catch {} return COPY[lang] || COPY.en; }
function standalone() { return window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true; }
function status(message, error=false) { const el=document.getElementById("taviro-pwa-status"); if(el){el.textContent=message;el.dataset.state=error?"error":"info";} }
function updateLabels() { const c=copy(); const a=document.getElementById("taviro-install-app"),m=document.getElementById("taviro-offline-music"); if(a)a.textContent=c.install;if(m)m.textContent=c.music; }
function updateInstall() { const b=document.getElementById("taviro-install-app"); if(b)b.hidden=standalone(); }

function mountControls() {
  const row=document.querySelector(".settings-row"); if(!row || document.getElementById("taviro-install-app"))return;
  const install=document.createElement("button"); install.type="button"; install.id="taviro-install-app"; install.className="text-button";
  install.addEventListener("click",async()=>{
    if(deferredInstallPrompt){const prompt=deferredInstallPrompt;deferredInstallPrompt=null;await prompt.prompt();const choice=await prompt.userChoice;if(choice?.outcome==="accepted")status(copy().ready);updateInstall();return;}
    const c=copy();status(/iphone|ipad|ipod/i.test(navigator.userAgent)?c.ios:c.manual);
  });
  const music=document.createElement("button"); music.type="button"; music.id="taviro-offline-music"; music.className="text-button";
  music.addEventListener("click",async()=>{
    const c=copy();if(!("serviceWorker" in navigator)||!("MessageChannel" in window)){status(c.error,true);return;}
    music.disabled=true;
    try{
      const registration=await navigator.serviceWorker.ready;const worker=navigator.serviceWorker.controller||registration.active;if(!worker)throw new Error("Service worker is not active.");
      const channel=new MessageChannel();channel.port1.onmessage=event=>{const data=event.data||{};if(data.type==="progress")status(c.progress+" · "+data.completed+"/"+data.total);if(data.type==="complete")status(c.musicReady);if(data.type==="error")status(c.error,true);};
      worker.postMessage({type:"TAVIRO_CACHE_OFFLINE_AUDIO"},[channel.port2]);
    }catch(error){console.warn("TAVIRO offline music cache failed:",error);status(c.error,true);}finally{music.disabled=false;}
  });
  const note=document.createElement("p");note.id="taviro-pwa-status";note.className="micro";note.setAttribute("role","status");note.setAttribute("aria-live","polite");
  row.append(install,music,note);updateLabels();updateInstall();
}

window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;updateInstall();});
window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;updateInstall();status(copy().installed);});
window.addEventListener("cosmic-scrap:language-changed",updateLabels);
if(secureContext && "serviceWorker" in navigator){
  window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js",{scope:"./"}).then(()=>navigator.serviceWorker.ready.then(mountControls)).catch(error=>{console.warn("TAVIRO offline shell registration failed:",error);mountControls();});},{once:true});
} else { window.addEventListener("DOMContentLoaded",mountControls,{once:true}); }
