const $=id=>document.getElementById(id);
function mount(){
 const panel=$("panel");
 if(!panel||$("classic-menu-sections"))return;
 const anchor=panel.querySelector(".menu-footer");
 if(!anchor)return;
 const sections=document.createElement("div");
 sections.id="classic-menu-sections";
 sections.className="classic-menu-sections";
 sections.innerHTML=`
 <section class="classic-section" id="classic-game"><div class="classic-section-heading"><span>01 · HANGAR</span><h2>OYUN</h2><p>Hazır olduğunda doğrudan savaşa katıl.</p></div><div class="classic-section-card"><strong>SOLO SURVIVAL</strong><p>Sonsuz hayatta kalma koşusu. Scrap topla, geliş ve galaksiyi keşfet.</p><button type="button" data-open="start" class="primary-button">OYUNA BAŞLA ↗</button></div></section>
 <section class="classic-section" id="classic-scores"><div class="classic-section-heading"><span>02 · RECORDS</span><h2>SKORLAR</h2><p>Bu cihazdaki en iyi performansın.</p></div><div class="classic-section-stats"><article><small>EN İYİ SKOR</small><strong data-stat="best">0</strong></article><article><small>TOPLAM KOŞU</small><strong data-stat="runs">0</strong></article><article><small>BAŞARIM</small><strong data-stat="achievements">0/6</strong></article></div><button type="button" data-open="online-open" class="classic-secondary-button">SKOR TABLOSUNU AÇ</button></section>
 <section class="classic-section" id="classic-galaxy"><div class="classic-section-heading"><span>03 · EXPLORATION</span><h2>GALAKSİ</h2><p>Bölgeleri keşfet, boss mücadelelerini tamamla.</p></div><div class="classic-section-stats"><article><small>FETHEDİLEN BÖLGE</small><strong data-stat="regions">0/7</strong></article><article><small>AKIN ZAFERİ</small><strong data-stat="raids">0</strong></article><article><small>SEKTÖR</small><strong data-stat="sector">DEBRIS BELT</strong></article></div><div id="sector-atlas-slot"></div><button type="button" data-open="start" class="classic-secondary-button">GALAKSİYE GİR</button></section>
 <section class="classic-section" id="classic-ranking"><div class="classic-section-heading"><span>04 · LEADERBOARD</span><h2>SIRALAMA</h2><p>Diğer pilotlarla skorunu karşılaştır.</p></div><div class="classic-section-card"><strong>GLOBAL PILOT BOARD</strong><p>Ortak skor tablosu ve bölge sıralamaları.</p><button type="button" data-open="online-open" class="classic-secondary-button">SIRALAMAYI GÖR ↗</button></div></section>
 <section class="classic-section" id="classic-shop"><div class="classic-section-heading"><span>05 · COLLECTION</span><h2>MAĞAZA</h2><p>Görünümünü özelleştir, koleksiyonunu genişlet.</p></div><div class="classic-section-card"><strong>SKIN & FLAG COLLECTION</strong><p>Gemi skinleri, ülke bayrakları ve kapsül ödülleri.</p><button type="button" data-open="skin-shop-open" class="classic-secondary-button">KOLEKSİYONU AÇ ↗</button></div><div class="classic-section-card"><strong>SCRAP CAPSULE</strong><p>Koşularda kazandığın kapsül ödüllerini aç.</p><button type="button" data-open="scrap-capsule-menu-open" class="classic-secondary-button">KAPSÜLÜ AÇ ↗</button></div></section>
 <section class="classic-section" id="classic-career"><div class="classic-section-heading"><span>06 · PILOT RECORD</span><h2>KARİYER</h2><p>Seviyeni ve kalıcı ilerlemeni takip et.</p></div><div class="classic-section-stats"><article><small>KARİYER SEVİYESİ</small><strong data-stat="career">1</strong></article><article><small>TOPLAM SCRAP</small><strong data-stat="scrap">0</strong></article><article><small>SCRAP CORE</small><strong data-stat="core">0</strong></article></div><div id="daily-status-slot"></div><button type="button" data-open="meta-open" class="classic-secondary-button">KALICI GELİŞİMİ AÇ</button></section>
 <section class="classic-section" id="classic-settings"><div class="classic-section-heading"><span>07 · CONFIGURATION</span><h2>AYARLAR</h2><p>Ses, kontroller ve erişilebilirlik tercihleri.</p></div><div class="classic-section-card"><strong>OYUN TERCİHLERİ</strong><p>Ses düzeyi, titreşim, azaltılmış flaş ve performans seçenekleri.</p><button type="button" data-open="settings-open" class="classic-secondary-button">AYARLARI AÇ ↗</button></div></section>`;
 panel.insertBefore(sections,anchor);
 const sync=()=>{
  const map={best:"local-pilot-best",runs:"local-pilot-runs",achievements:"local-pilot-achievements",regions:"regions-captured",raids:"raid-wins",sector:"sector-label",career:"career-level",scrap:"local-pilot-scrap",core:"local-pilot-core"};
  for(const [key,id] of Object.entries(map)){const node=sections.querySelector('[data-stat="'+key+'"]'),source=$(id);if(node&&source)node.textContent=source.textContent.trim()}
 };
 sync();
 const observer=new MutationObserver(sync);
 for(const id of ["local-pilot-best","local-pilot-runs","local-pilot-achievements","regions-captured","raid-wins","sector-label","career-level","local-pilot-scrap","local-pilot-core"]){const node=$(id);if(node)observer.observe(node,{childList:true,subtree:true,characterData:true})}
 sections.addEventListener("click",event=>{const button=event.target.closest("[data-open]");if(!button)return;$(button.dataset.open)?.click()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
