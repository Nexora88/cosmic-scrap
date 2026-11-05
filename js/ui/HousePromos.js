import { PROMO_CAMPAIGNS } from "../systems/PromoCampaigns.js";
const $ = (id) => document.getElementById(id);
function mountNexoraAiShowcase() {
  const panel=$("panel"),campaign=PROMO_CAMPAIGNS.find(item=>item.id==="nexora-ai");
  if(!panel||!campaign||$("nexora-ai-open"))return;
  const trigger=document.createElement("button");trigger.id="nexora-ai-open";trigger.type="button";trigger.className="house-promo-trigger";trigger.textContent="NEXORA AI · İSTEĞE BAĞLI TANITIM";trigger.setAttribute("aria-haspopup","dialog");
  const footer=panel.querySelector(".menu-footer");if(footer)footer.insertAdjacentElement("beforebegin",trigger);else panel.append(trigger);
  const layer=document.createElement("div");layer.id="nexora-ai-layer";layer.className="house-promo-layer";layer.hidden=true;
  layer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="nexora-ai-title" tabindex="-1"><button id="nexora-ai-close" class="house-promo-close" type="button" aria-label="Kapat">×</button><p class="eyebrow">NEXORA · AI PROJECT</p><h2 id="nexora-ai-title">NEXORA AI</h2><p id="nexora-ai-description"></p><video id="nexora-ai-video" controls playsinline preload="none" style="width:100%;max-height:58vh;border-radius:10px;background:#000" aria-label="Nexora AI tanıtım videosu"></video><p id="nexora-ai-status" role="status" aria-live="polite"></p></section>';document.body.append(layer);
  const dialog=layer.querySelector('[role="dialog"]'),video=$("nexora-ai-video"),status=$("nexora-ai-status");let previousFocus=null;
  const close=()=>{video.pause();try{video.currentTime=0}catch{}layer.hidden=true;if(previousFocus?.isConnected)previousFocus.focus()};
  const open=()=>{previousFocus=document.activeElement;$("nexora-ai-description").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?campaign.descriptionTr:campaign.description;layer.hidden=false;dialog.focus();if(!video.src){video.src=new URL("../../"+campaign.src,import.meta.url).href;video.load()}status.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Videoyu izlemek isteğe bağlıdır.":"Watching this video is optional.";const attempt=video.play();if(attempt?.catch)attempt.catch(()=>{status.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Başlatmak için videodaki oynat düğmesine dokun.":"Press play on the video to start."})};
  trigger.addEventListener("click",open);$("nexora-ai-close").addEventListener("click",close);layer.addEventListener("click",e=>{if(e.target===layer)close()});layer.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();close()}});video.addEventListener("error",()=>{status.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Nexora AI videosu şu anda yüklenemedi.":"The Nexora AI video could not be loaded right now."});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mountNexoraAiShowcase,{once:true});else mountNexoraAiShowcase();
