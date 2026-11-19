import { mountHousePromoOverlays } from "./HousePromoOverlay.js";
import { PROMO_CAMPAIGNS, getNextPromo } from "../systems/PromoCampaigns.js";
const $=id=>document.getElementById(id);

const showcaseLocale=()=>{try{return localStorage.getItem("cosmic-scrap-language")||"en"}catch{return"en"}};
const showcaseCopy={
 en:{play:"Play video",trigger:"NEXORA PROJECTS · OPTIONAL SHOWCASE",next:"NEXT PROJECT",skip:"SKIP · BACK TO GAME",ready:"Press play to watch this project introduction.",blocked:"Video is ready. Press play to start.",finished:"Introduction finished. You can open the next project if you like.",error:"This project video could not be loaded. Try the next project.",projects:{"nexora-ai":"AI assistant and the Nexora product ecosystem.","nexora-quant":"Quantitative research and market intelligence."}},
 tr:{play:"Videoyu oynat",trigger:"NEXORA PROJELERİ · İSTEĞE BAĞLI TANITIM",next:"SONRAKİ PROJE",skip:"ATLA · OYUNA DÖN",ready:"Tanıtımı izlemek için oynat düğmesine dokun.",blocked:"Video hazır. Başlatmak için oynat düğmesine dokun.",finished:"Tanıtım tamamlandı. İstersen sonraki projeyi açabilirsin.",error:"Bu tanıtım videosu yüklenemedi. Sonraki projeyi deneyebilirsin.",projects:{"nexora-ai":"Yapay zekâ asistanı ve Nexora ürün ekosistemi.","nexora-quant":"Nicel araştırma ve piyasa analizi."}},
 "pt-BR":{play:"Reproduzir vídeo",trigger:"PROJETOS NEXORA · APRESENTAÇÃO OPCIONAL",next:"PRÓXIMO PROJETO",skip:"PULAR · VOLTAR AO JOGO",ready:"Pressione reproduzir para assistir à apresentação.",blocked:"O vídeo está pronto. Pressione reproduzir para iniciar.",finished:"Apresentação concluída. Você pode abrir o próximo projeto.",error:"Não foi possível carregar este vídeo. Tente o próximo projeto.",projects:{"nexora-ai":"Assistente de IA e ecossistema de produtos Nexora.","nexora-quant":"Pesquisa quantitativa e inteligência de mercado."}},
 es:{play:"Reproducir vídeo",trigger:"PROYECTOS NEXORA · PRESENTACIÓN OPCIONAL",next:"SIGUIENTE PROYECTO",skip:"SALTAR · VOLVER AL JUEGO",ready:"Pulsa reproducir para ver la presentación.",blocked:"El vídeo está listo. Pulsa reproducir para comenzar.",finished:"Presentación terminada. Puedes abrir el siguiente proyecto.",error:"No se pudo cargar este vídeo. Prueba el siguiente proyecto.",projects:{"nexora-ai":"Asistente de IA y ecosistema de productos Nexora.","nexora-quant":"Investigación cuantitativa e inteligencia de mercado."}},
 ru:{play:"Смотреть видео",trigger:"ПРОЕКТЫ NEXORA · ДОПОЛНИТЕЛЬНЫЙ ОБЗОР",next:"СЛЕДУЮЩИЙ ПРОЕКТ",skip:"ПРОПУСТИТЬ · ВЕРНУТЬСЯ В ИГРУ",ready:"Нажмите воспроизведение, чтобы посмотреть презентацию.",blocked:"Видео готово. Нажмите воспроизведение.",finished:"Презентация завершена. Можно открыть следующий проект.",error:"Не удалось загрузить видео. Попробуйте следующий проект.",projects:{"nexora-ai":"ИИ-ассистент и экосистема продуктов Nexora.","nexora-quant":"Количественные исследования и аналитика рынков."}},
 id:{play:"Putar video",trigger:"PROYEK NEXORA · TAMPILAN OPSIONAL",next:"PROYEK BERIKUTNYA",skip:"LEWATI · KEMBALI KE GAME",ready:"Tekan putar untuk menonton pengenalan proyek.",blocked:"Video siap. Tekan putar untuk memulai.",finished:"Pengenalan selesai. Kamu dapat membuka proyek berikutnya.",error:"Video ini gagal dimuat. Coba proyek berikutnya.",projects:{"nexora-ai":"Asisten AI dan ekosistem produk Nexora.","nexora-quant":"Riset kuantitatif dan intelijen pasar."}},
 de:{play:"Video abspielen",trigger:"NEXORA-PROJEKTE · OPTIONALE VORSTELLUNG",next:"NÄCHSTES PROJEKT",skip:"ÜBERSPRINGEN · ZUM SPIEL",ready:"Drücke auf Wiedergabe, um die Vorstellung anzusehen.",blocked:"Video bereit. Drücke auf Wiedergabe.",finished:"Vorstellung beendet. Du kannst das nächste Projekt öffnen.",error:"Dieses Video konnte nicht geladen werden. Versuche das nächste Projekt.",projects:{"nexora-ai":"KI-Assistent und das Nexora-Produktökosystem.","nexora-quant":"Quantitative Forschung und Marktanalyse."}},
 fr:{play:"Lire la vidéo",trigger:"PROJETS NEXORA · PRÉSENTATION FACULTATIVE",next:"PROJET SUIVANT",skip:"PASSER · RETOUR AU JEU",ready:"Appuyez sur lecture pour voir la présentation.",blocked:"Vidéo prête. Appuyez sur lecture pour démarrer.",finished:"Présentation terminée. Vous pouvez ouvrir le projet suivant.",error:"Impossible de charger cette vidéo. Essayez le projet suivant.",projects:{"nexora-ai":"Assistant IA et écosystème de produits Nexora.","nexora-quant":"Recherche quantitative et intelligence des marchés."}},
 ja:{play:"動画を再生",trigger:"NEXORAプロジェクト · 任意の紹介",next:"次のプロジェクト",skip:"スキップ · ゲームに戻る",ready:"再生ボタンを押してプロジェクト紹介を視聴してください。",blocked:"動画の準備ができました。再生を押してください。",finished:"紹介が終了しました。次のプロジェクトを開けます。",error:"動画を読み込めませんでした。次のプロジェクトをお試しください。",projects:{"nexora-ai":"AIアシスタントとNexora製品エコシステム。","nexora-quant":"定量調査と市場インテリジェンス。"}}
};

const style=document.createElement("style");
style.textContent=`
.house-promo-trigger{width:100%;min-height:46px;margin:10px 0 8px;padding:11px 14px;border:1px solid #3c9fbd;border-radius:10px;background:linear-gradient(110deg,#102b3c,#0a121c);color:#dffaff;font:900 10px system-ui;letter-spacing:.08em;cursor:pointer;box-shadow:0 0 16px #39d8ff18}
.house-promo-trigger span{display:inline-grid;place-items:center;width:24px;height:24px;margin-right:8px;border:1px solid #b9efff;border-radius:6px;color:#fff;font-size:13px}
.house-promo-note{margin:0 0 10px;color:#8ba7ba;font-size:9px;line-height:1.5;text-align:center}
.house-promo-layer{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px;background:rgba(10,10,15,.85);backdrop-filter:blur(5px)}
.house-promo-layer[hidden]{display:none}
.house-promo-panel{width:min(100%,440px);padding:24px 20px;border:1px solid #43d7f2;border-radius:16px;background:linear-gradient(145deg,rgba(10,24,37,.97),rgba(8,10,19,.96));color:#e9fbff;text-align:center;box-shadow:0 0 15px #40cfff55,0 0 45px #40cfff1a}
.house-promo-panel .eyebrow{color:#75e9ff;font-size:9px;letter-spacing:.22em;font-weight:900}
.house-promo-panel h2{margin:12px 0;color:#fff;font-size:clamp(20px,5vw,27px);letter-spacing:.08em}
.house-promo-panel p{color:#9db8ca;font-size:11px;line-height:1.55}
.house-promo-count{margin:16px auto;color:#8ef0ff;font-size:38px;font-weight:950;font-variant-numeric:tabular-nums;text-shadow:0 0 16px #40cfff}
.house-promo-progress{height:6px;margin:15px 0 18px;overflow:hidden;border-radius:99px;background:#152635}
.house-promo-progress i{display:block;width:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#40cfff,#9e7cff);box-shadow:0 0 14px #40cfff;transition:width .12s linear}
.house-promo-actions{display:grid;gap:8px}
.house-promo-actions button{min-height:43px;border:1px solid #398ca8;border-radius:9px;background:#102b3b;color:#e5fbff;font-weight:900;cursor:pointer}
.house-promo-actions button.secondary{background:#0b141e;border-color:#304455;color:#a9c2d2}
@media(prefers-reduced-motion:reduce){.house-promo-progress i{transition:none}}
`;
document.head.append(style);
mountHousePromoOverlays();

// Optional Nexora ecosystem showcase. Campaigns rotate so the same project is not replayed consecutively.
if (document.documentElement.dataset.nexoraProjectPromos === "available") {
  const panel = $("panel");
  if (panel && !$("nexora-projects-open") && PROMO_CAMPAIGNS.length) {
    let lang = showcaseLocale();
    let words = showcaseCopy[lang] || showcaseCopy.en;
    const trigger = document.createElement("button");
    trigger.id = "nexora-projects-open";
    trigger.type = "button";
    trigger.className = "house-promo-trigger";
    trigger.textContent = words.trigger;
    trigger.setAttribute("aria-haspopup", "dialog");
    const footer = panel.querySelector(".menu-footer");
    if (footer) footer.insertAdjacentElement("beforebegin", trigger);
    else panel.append(trigger);

    const layer = document.createElement("div");
    layer.id = "nexora-projects-layer";
    layer.className = "house-promo-layer";
    layer.hidden = true;
    layer.innerHTML = '<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="nexora-project-title" tabindex="-1"><p class="eyebrow">NEXORA · PROJECT ECOSYSTEM</p><h2 id="nexora-project-title">NEXORA PROJECTS</h2><p id="nexora-project-description"></p><video id="nexora-project-video" controls playsinline preload="metadata" style="width:100%;max-height:58vh;border-radius:10px;background:#000" aria-label="Nexora project introduction"></video><p id="nexora-project-status" role="status" aria-live="polite"></p><div class="house-promo-actions"><button id="nexora-project-play" type="button">PLAY VIDEO</button><button id="nexora-project-next" type="button">NEXT PROJECT</button><button id="nexora-project-skip" class="secondary" type="button">SKIP · BACK TO GAME</button></div></section>';
    document.body.append(layer);

    const dialog = layer.querySelector('[role="dialog"]');
    const video = $("nexora-project-video");
    const title = $("nexora-project-title");
    const description = $("nexora-project-description");
    const status = $("nexora-project-status");
    let current = null;
    let previousFocus = null;
    const volumeControl = $("setting-volume");
    const soundControl = $("setting-sound");
    const syncVideoAudio = () => {
      const enabled = localStorage.getItem("cosmic-scrap-audio") !== "off" && soundControl?.checked !== false;
      const rawVolume = volumeControl ? Number(volumeControl.value) / 100 : 0.7;
      video.volume = Math.max(0, Math.min(1, Number.isFinite(rawVolume) ? rawVolume : 0.7));
      video.muted = !enabled;
    };
    volumeControl?.addEventListener("input", syncVideoAudio);
    soundControl?.addEventListener("change", syncVideoAudio);
    $("audio-toggle")?.addEventListener("click", () => setTimeout(syncVideoAudio, 0));

    const stopPromoVideo = () => {
      video.pause();
      video.muted = true;
      try { video.currentTime = 0; } catch {}
    };

    const playCampaign = (campaign) => {
      if (!campaign) return;
      current = campaign;
      title.textContent = campaign.title;
      description.textContent = words.projects[campaign.id] || campaign.description;
      video.setAttribute("aria-label", words.trigger);
      // Mobile browsers often block audible autoplay. Load first and wait for a user gesture.
      stopPromoVideo();
      video.src = new URL("../../" + campaign.src, import.meta.url).href;
      video.load();
      video.muted = true;
      syncVideoAudio();
      localStorage.setItem("nexora-project-promo-last", campaign.id);
      status.textContent = words.ready;
      $("nexora-project-play").textContent = words.play;
      $("nexora-project-play").hidden = false;
      const next = $("nexora-project-next");
      next.textContent = words.next;
      $("nexora-project-skip").textContent = words.skip;
    };
    const close = () => {
      stopPromoVideo();
      layer.hidden = true;
      window.dispatchEvent(new Event("cosmic-scrap:showcase-close"));
      if (previousFocus?.isConnected) previousFocus.focus();
    };
    const open = () => {
      previousFocus = document.activeElement;
      layer.hidden = false;
      window.dispatchEvent(new Event("cosmic-scrap:showcase-open"));
      dialog.focus();
      playCampaign(getNextPromo(localStorage.getItem("nexora-project-promo-last")));
    };

    trigger.addEventListener("click", open);
    $("nexora-project-play").addEventListener("click", async () => {
      if (!current) return;
      syncVideoAudio();
      try {
        await video.play();
        $("nexora-project-play").hidden = true;
      } catch {
        status.textContent = words.blocked;
        $("nexora-project-play").hidden = false;
      }
    });
    $("nexora-project-next").addEventListener("click", () => {
      playCampaign(getNextPromo(current?.id));
    });
    $("nexora-project-skip").addEventListener("click", close);
    video.addEventListener("ended", () => {
      status.textContent = words.finished;
      $("nexora-project-play").hidden = false;
    });
    video.addEventListener("error", () => {
      status.textContent = words.error;
      $("nexora-project-play").hidden = false;
    });
    layer.addEventListener("click", event => {
      if (event.target === layer) close();
    });
    window.addEventListener("cosmic-scrap:language-changed", () => {
      lang = showcaseLocale();
      words = showcaseCopy[lang] || showcaseCopy.en;
      trigger.textContent = words.trigger;
      $("nexora-project-play").textContent = words.play;
      $("nexora-project-next").textContent = words.next;
      $("nexora-project-skip").textContent = words.skip;
      video.setAttribute("aria-label", words.trigger);
      if (current) description.textContent = words.projects[current.id] || current.description;
      if (!layer.hidden) status.textContent = words.ready;
    });
    layer.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll('button,video,[href],[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }
}
