import { PROMO_CAMPAIGNS, getNextPromo } from "../systems/PromoCampaigns.js";
const $ = id => document.getElementById(id);
// Only the optional Nexora AI introduction remains; monetization and unrelated promos are deferred.
if (document.documentElement.dataset.nexoraProjectPromos === "available") {
  const panel = $("panel");
  if (panel && !$("nexora-projects-open") && PROMO_CAMPAIGNS.length) {
    const trigger = document.createElement("button");
    trigger.id = "nexora-projects-open"; trigger.type = "button"; trigger.className = "house-promo-trigger";
    trigger.textContent = localStorage.getItem("cosmic-scrap-language") === "tr" ? "NEXORA AI · İSTEĞE BAĞLI TANITIM" : "NEXORA AI · OPTIONAL INTRODUCTION";
    trigger.setAttribute("aria-haspopup", "dialog");
    const footer = panel.querySelector(".menu-footer");
    if (footer) footer.insertAdjacentElement("beforebegin", trigger); else panel.append(trigger);
    const layer = document.createElement("div"); layer.id = "nexora-projects-layer"; layer.className = "house-promo-layer"; layer.hidden = true;
    layer.innerHTML = '<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="nexora-project-title" tabindex="-1"><p class="eyebrow">NEXORA · AI</p><h2 id="nexora-project-title">NEXORA AI</h2><p id="nexora-project-description"></p><video id="nexora-project-video" controls playsinline preload="metadata" style="width:100%;max-height:58vh;border-radius:10px;background:#000" aria-label="Nexora AI introduction"></video><p id="nexora-project-status" role="status" aria-live="polite"></p><div class="house-promo-actions"><button id="nexora-project-next" type="button">REPLAY INTRODUCTION</button><button id="nexora-project-skip" class="secondary" type="button">SKIP · BACK TO GAME</button></div></section>';
    document.body.append(layer);
    const dialog = layer.querySelector('[role="dialog"]'), video = $("nexora-project-video");
    const tr = () => localStorage.getItem("cosmic-scrap-language") === "tr"; let previousFocus = null;
    const playCampaign = campaign => {
      if (!campaign) return;
      $("nexora-project-title").textContent = campaign.title;
      $("nexora-project-description").textContent = tr() ? campaign.descriptionTr : campaign.description;
      video.setAttribute("aria-label", tr() ? "Nexora AI tanıtım videosu" : "Nexora AI introduction");
      video.pause(); video.src = new URL("../../" + campaign.src, import.meta.url).href; video.load();
      localStorage.setItem("nexora-project-promo-last", campaign.id);
      $("nexora-project-status").textContent = tr() ? "Tanıtımı başlatmak için oynat düğmesine dokun." : "Press play to watch the Nexora AI introduction.";
      const attempt = video.play(); if (attempt?.catch) attempt.catch(() => { $("nexora-project-status").textContent = tr() ? "Video hazır. Başlatmak için oynat düğmesine dokun." : "Video is ready. Press play to start."; });
      $("nexora-project-next").textContent = tr() ? "TANITIMI YENİDEN OYNAT" : "REPLAY INTRODUCTION";
      $("nexora-project-skip").textContent = tr() ? "ATLA · OYUNA DÖN" : "SKIP · BACK TO GAME";
    };
    const close = () => { video.pause(); try { video.currentTime = 0; } catch {} layer.hidden = true; if (previousFocus?.isConnected) previousFocus.focus(); };
    trigger.addEventListener("click", () => { previousFocus = document.activeElement; layer.hidden = false; dialog.focus(); playCampaign(getNextPromo(localStorage.getItem("nexora-project-promo-last"))); });
    $("nexora-project-next").addEventListener("click", () => { video.currentTime = 0; playCampaign(getNextPromo(localStorage.getItem("nexora-project-promo-last"))); });
    $("nexora-project-skip").addEventListener("click", close);
    layer.addEventListener("click", event => { if (event.target === layer) close(); });
    layer.addEventListener("keydown", event => { if (event.key === "Escape") { event.preventDefault(); close(); } });
    video.addEventListener("error", () => { $("nexora-project-status").textContent = tr() ? "Nexora AI tanıtım videosu yüklenemedi." : "The Nexora AI introduction could not be loaded."; });
  }
}
