const $=id=>document.getElementById(id);
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
const death=$("death-screen"),stats=$("run-stats"),retry=$("retry");
if(death&&stats&&retry&&!$("house-revive")){
 const revive=document.createElement("button");revive.id="house-revive";revive.className="house-promo-trigger";revive.type="button";revive.innerHTML='<span aria-hidden="true">✦</span> '+(localStorage.getItem("cosmic-scrap-language")==="tr"?"KOZMİK DESTEK · 1 KEZ CANLAN":"COSMIC SUPPORT · ONE CONTINUE");
 const note=document.createElement("p");note.className="house-promo-note";note.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"X profilimiz yeni sekmede açılır. Takip isteğe bağlıdır; oyun takip durumunu doğrulamaz.":"Our X profile opens in a new tab. Following is optional; the game does not verify follow status.";
 stats.insertAdjacentElement("afterend",revive);revive.insertAdjacentElement("afterend",note);
 const layer=document.createElement("div");layer.className="house-promo-layer";layer.hidden=true;layer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="revive-title"><p class="eyebrow">COSMIC SCRAP · HOUSE PROMO</p><h2 id="revive-title">COSMIC SHIELD</h2><p>'+ (localStorage.getItem("cosmic-scrap-language")==="tr"?"X profilimiz açıldı. Bu ücretsiz oyun içi canlanmadır; takip şartı veya reklam izleme yoktur.":"Our X profile has opened. This is a free in-game continue; no follow requirement or ad view.")+'</p><div class="house-promo-count" id="revive-count">5</div><p id="revive-status" role="status" aria-live="polite">'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"KALKAN HAZIRLANIYOR":"SHIELD CHARGING")+'</p><div class="house-promo-actions"><button id="revive-now" type="button">'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"ŞİMDİ CANLAN":"CONTINUE NOW")+'</button><button id="revive-cancel" class="secondary" type="button">'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"İPTAL":"CANCEL")+'</button></div></section>';
 document.body.append(layer);
 let timer=null,remaining=5;
 const close=()=>{if(timer)clearInterval(timer);timer=null;layer.hidden=true};
 const request=()=>{close();window.dispatchEvent(new Event("cosmic-scrap:request-revive"))};
 revive.addEventListener("click",()=>{
  if(revive.disabled)return;
  const used=revive.dataset.used==="true";if(used)return;
  window.open("https://x.com/nexora88team","_blank","noopener,noreferrer");
  remaining=5;$("revive-count").textContent=String(remaining);layer.hidden=false;
  if(timer)clearInterval(timer);
  timer=setInterval(()=>{remaining-=1;$("revive-count").textContent=String(Math.max(0,remaining));if(remaining<=0)request()},1000);
  $("revive-now").focus();
 });
 $("revive-now").addEventListener("click",request);
 $("revive-cancel").addEventListener("click",close);
 window.addEventListener("cosmic-scrap:revive-result",event=>{
  if(event.detail?.ok){close();revive.disabled=true;revive.dataset.used="true";revive.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"✦ CANLANMA KULLANILDI":"✦ CONTINUE USED"}
  else{$("revive-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"CANLANMA ŞU ANDA KULLANILAMIYOR":"CONTINUE IS UNAVAILABLE";$("revive-count").textContent="—";$("revive-cancel").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"KAPAT":"CLOSE"}
 });
 window.addEventListener("cosmic-scrap:run-restarted",()=>{revive.disabled=false;delete revive.dataset.used;revive.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"✦ KOZMİK DESTEK · 1 KEZ CANLAN":"✦ COSMIC SUPPORT · ONE CONTINUE"});
}
const app=$("app");
if(app&&!$("house-interstitial")){
 const layer=document.createElement("div");layer.id="house-interstitial";layer.className="house-promo-layer";layer.hidden=true;
 layer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="house-interstitial-title"><p class="eyebrow">NEXORA · INDEPENDENT GAME</p><h2 id="house-interstitial-title">COSMIC SCRAP</h2><p>'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"Cosmic Scrap, Poki ve CrazyGames için hazırlanıyor. Gelişmeleri takip et!":"Cosmic Scrap is being prepared for Poki and CrazyGames. Follow development updates!")+'</p><div class="house-promo-progress" aria-label="Announcement progress"><i id="house-interstitial-fill"></i></div><p id="house-interstitial-count">3</p><div class="house-promo-actions"><button id="house-interstitial-close" class="secondary" type="button">'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"MENÜYE GEÇ":"CONTINUE TO MENU")+'</button><a href="https://x.com/nexora88team" target="_blank" rel="noopener noreferrer" style="display:block;padding:12px;color:#9defff;font-size:10px">𝕏 · NEXORA</a></div></section>';
 app.append(layer);
 let timer=null,started=0;
 const hide=()=>{if(timer)clearInterval(timer);timer=null;layer.hidden=true};
 $("house-interstitial-close").addEventListener("click",hide);
 window.addEventListener("cosmic-scrap:menu-return",()=>{
  if(timer)clearInterval(timer);layer.hidden=false;started=Date.now();$("house-interstitial-fill").style.width="0%";$("house-interstitial-count").textContent="3";
  timer=setInterval(()=>{const elapsed=Date.now()-started,pct=Math.min(100,elapsed/3000*100);$("house-interstitial-fill").style.width=pct+"%";$("house-interstitial-count").textContent=String(Math.max(0,Math.ceil((3000-elapsed)/1000)));if(pct>=100)hide()},60);
 });
}
window.addEventListener("cosmic-scrap:run-finalized",()=>{const button=$("house-revive");if(button&&!button.dataset.used){button.disabled=true;button.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"✦ CANLANMA SÜRESİ DOLDU":"✦ CONTINUE EXPIRED"}});
window.addEventListener("cosmic-scrap:run-restarted",()=>{const button=$("house-revive");if(button){button.disabled=false;delete button.dataset.used}});

/* Optional Nexora AI video: the entry appears only when the MP4 asset is actually deployed. */
const nexoraVideoUrl=new URL("../../assets/promos/nexora-ai.mp4",import.meta.url).href;
fetch(nexoraVideoUrl,{method:"HEAD",cache:"no-store"}).then(response=>{
 if(!response.ok)return;
 const panel=$("panel");if(!panel||$("nexora-video-open"))return;
 const trigger=document.createElement("button");trigger.id="nexora-video-open";trigger.type="button";trigger.className="house-promo-trigger";
 trigger.textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"NEXORA AI TANITIM VİDEOSU · İSTEĞE BAĞLI":"NEXORA AI INTRO VIDEO · OPTIONAL";
 panel.append(trigger);
 const layer=document.createElement("div");layer.className="house-promo-layer";layer.hidden=true;
 layer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-label="Nexora AI video"><p class="eyebrow">NEXORA AI</p><video id="nexora-promo-video" controls playsinline preload="metadata" style="width:100%;max-height:58vh;border-radius:10px;background:#000"></video><div class="house-promo-actions"><button id="nexora-video-skip" class="secondary" type="button">'+(localStorage.getItem("cosmic-scrap-language")==="tr"?"ATLA · OYUNA DÖN":"SKIP · BACK TO GAME")+'</button></div></section>';
 document.body.append(layer);
 const video=layer.querySelector("video");video.src=nexoraVideoUrl;
 const close=()=>{video.pause();layer.hidden=true};
 trigger.addEventListener("click",()=>{layer.hidden=false;video.play().catch(()=>{})});
 layer.querySelector("#nexora-video-skip").addEventListener("click",close);
 video.addEventListener("ended",close);
}).catch(()=>{});
