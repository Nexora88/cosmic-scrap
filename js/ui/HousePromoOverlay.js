const $=id=>document.getElementById(id);
const locales={
en:{supportEyebrow:"PILOT SUPPORT · ONE CONTINUE",revive:"TAVIRO SHIELD · ONE CONTINUE",note:"One free continue is available during this run.",title:"TAVIRO SHIELD",body:"A free in-game continue. No advertisement, follow, or external action is required.",status:"SHIELD READY",now:"CONTINUE NOW",cancel:"CANCEL",used:"CONTINUE USED",unavailable:"CONTINUE IS UNAVAILABLE",close:"CLOSE",expired:"CONTINUE EXPIRED",brandEyebrow:"INDEPENDENT GAME DEVELOPMENT · TÜRKİYE",brandBody:"TAVIRO is an independent game created by a Turkish developer, with curiosity, persistence, and a love of games.",brandClose:"CONTINUE TO MENU"},
tr:{supportEyebrow:"PİLOT DESTEĞİ · 1 CANLANMA",revive:"TAVIRO KALKANI · 1 KEZ CANLANMA",note:"Bu koşuda bir ücretsiz canlanma hakkın var.",title:"TAVIRO KALKANI",body:"Ücretsiz oyun içi canlanma. Reklam izleme, takip veya harici işlem gerekmez.",status:"KALKAN HAZIR",now:"ŞİMDİ CANLAN",cancel:"İPTAL",used:"CANLANMA KULLANILDI",unavailable:"CANLANMA ŞU ANDA KULLANILAMIYOR",close:"KAPAT",expired:"CANLANMA SÜRESİ DOLDU",brandEyebrow:"BAĞIMSIZ OYUN GELİŞTİRME · TÜRKİYE",brandBody:"TAVIRO, bağımsız bir Türk geliştirici tarafından geliştiriliyor. Merak, emek ve oyun sevgisiyle yapılıyor.",brandClose:"MENÜYE DEVAM ET"},
"pt-BR":{supportEyebrow:"SUPORTE AO PILOTO · UMA CONTINUAÇÃO",revive:"ESCUDO TAVIRO · UMA CONTINUAÇÃO",note:"Você tem uma continuação gratuita nesta partida.",title:"ESCUDO TAVIRO",body:"Uma continuação gratuita no jogo. Não é necessário assistir a anúncios, seguir perfis ou realizar ações externas.",status:"ESCUDO PRONTO",now:"CONTINUAR AGORA",cancel:"CANCELAR",used:"CONTINUAÇÃO UTILIZADA",unavailable:"CONTINUAÇÃO INDISPONÍVEL",close:"FECHAR",expired:"CONTINUAÇÃO EXPIRADA",brandEyebrow:"DESENVOLVIMENTO INDEPENDENTE · TURQUIA",brandBody:"TAVIRO é um jogo independente criado por um desenvolvedor turco, com curiosidade, dedicação e paixão por jogos.",brandClose:"CONTINUAR AO MENU"},
es:{supportEyebrow:"APOYO AL PILOTO · UNA CONTINUACIÓN",revive:"ESCUDO TAVIRO · UNA CONTINUACIÓN",note:"Tienes una continuación gratuita en esta partida.",title:"ESCUDO TAVIRO",body:"Una continuación gratuita dentro del juego. No necesitas ver anuncios, seguir cuentas ni realizar acciones externas.",status:"ESCUDO LISTO",now:"CONTINUAR AHORA",cancel:"CANCELAR",used:"CONTINUACIÓN UTILIZADA",unavailable:"CONTINUACIÓN NO DISPONIBLE",close:"CERRAR",expired:"CONTINUACIÓN CADUCADA",brandEyebrow:"DESARROLLO INDEPENDIENTE · TURQUÍA",brandBody:"TAVIRO es un videojuego independiente creado por un desarrollador turco con curiosidad, dedicación y pasión por los videojuegos.",brandClose:"CONTINUAR AL MENÚ"},
ru:{supportEyebrow:"ПОДДЕРЖКА ПИЛОТА · ОДНО ПРОДОЛЖЕНИЕ",revive:"ЩИТ TAVIRO · ОДНО ВОЗРОЖДЕНИЕ",note:"В этом забеге доступно одно бесплатное продолжение.",title:"ЩИТ TAVIRO",body:"Бесплатное продолжение в игре. Не нужно смотреть рекламу, подписываться или выполнять действия вне игры.",status:"ЩИТ ГОТОВ",now:"ПРОДОЛЖИТЬ",cancel:"ОТМЕНА",used:"ПРОДОЛЖЕНИЕ ИСПОЛЬЗОВАНО",unavailable:"ПРОДОЛЖЕНИЕ НЕДОСТУПНО",close:"ЗАКРЫТЬ",expired:"ВРЕМЯ ПРОДОЛЖЕНИЯ ИСТЕКЛО",brandEyebrow:"НЕЗАВИСИМАЯ РАЗРАБОТКА ИГР · ТУРЦИЯ",brandBody:"TAVIRO — независимая игра, созданная турецким разработчиком с любознательностью, упорством и любовью к играм.",brandClose:"ПЕРЕЙТИ В МЕНЮ"},
id:{supportEyebrow:"DUKUNGAN PILOT · SATU KALI LANJUT",revive:"PERISAI TAVIRO · SATU KALI LANJUT",note:"Satu kesempatan lanjut gratis tersedia dalam permainan ini.",title:"PERISAI TAVIRO",body:"Kesempatan lanjut gratis di dalam game. Tidak perlu menonton iklan, mengikuti akun, atau melakukan tindakan di luar game.",status:"PERISAI SIAP",now:"LANJUT SEKARANG",cancel:"BATAL",used:"KESEMPATAN TELAH DIGUNAKAN",unavailable:"KESEMPATAN TIDAK TERSEDIA",close:"TUTUP",expired:"WAKTU LANJUT HABIS",brandEyebrow:"PENGEMBANGAN GAME INDEPENDEN · TURKI",brandBody:"TAVIRO adalah game independen yang dibuat oleh pengembang Turki dengan rasa ingin tahu, ketekunan, dan kecintaan pada game.",brandClose:"LANJUT KE MENU"},
de:{supportEyebrow:"PILOTENHILFE · EINMAL WEITERSPIELEN",revive:"TAVIRO-SCHILD · EINMAL WEITERSPIELEN",note:"In diesem Lauf ist eine kostenlose Fortsetzung verfügbar.",title:"TAVIRO-SCHILD",body:"Eine kostenlose Fortsetzung im Spiel. Keine Werbung, kein Folgen und keine externe Aktion erforderlich.",status:"SCHILD BEREIT",now:"JETZT WEITERSPIELEN",cancel:"ABBRECHEN",used:"FORTSETZUNG VERWENDET",unavailable:"FORTSETZUNG NICHT VERFÜGBAR",close:"SCHLIESSEN",expired:"FORTSETZUNG ABGELAUFEN",brandEyebrow:"UNABHÄNGIGE SPIELEENTWICKLUNG · TÜRKEI",brandBody:"TAVIRO ist ein unabhängiges Spiel eines türkischen Entwicklers, geschaffen mit Neugier, Ausdauer und Leidenschaft für Spiele.",brandClose:"WEITER ZUM MENÜ"},
fr:{supportEyebrow:"AIDE AU PILOTE · UNE REPRISE",revive:"BOUCLIER TAVIRO · UNE REPRISE",note:"Une reprise gratuite est disponible pendant cette partie.",title:"BOUCLIER TAVIRO",body:"Une reprise gratuite dans le jeu. Aucune publicité, aucun abonnement ni action externe requis.",status:"BOUCLIER PRÊT",now:"REPRENDRE",cancel:"ANNULER",used:"REPRISE UTILISÉE",unavailable:"REPRISE INDISPONIBLE",close:"FERMER",expired:"DÉLAI DE REPRISE ÉCOULÉ",brandEyebrow:"DÉVELOPPEMENT INDÉPENDANT · TURQUIE",brandBody:"TAVIRO est un jeu indépendant créé par un développeur turc avec curiosité, persévérance et passion pour le jeu vidéo.",brandClose:"CONTINUER VERS LE MENU"},
ja:{supportEyebrow:"パイロット支援 · 1回コンティニュー",revive:"TAVIROシールド · 1回コンティニュー",note:"このランでは無料コンティニューを1回利用できます。",title:"TAVIROシールド",body:"ゲーム内で無料コンティニューできます。広告視聴、フォロー、外部操作は必要ありません。",status:"シールド準備完了",now:"コンティニュー",cancel:"キャンセル",used:"コンティニュー使用済み",unavailable:"コンティニューを利用できません",close:"閉じる",expired:"コンティニューの制限時間終了",brandEyebrow:"インディーゲーム開発 · トルコ",brandBody:"TAVIROはトルコの個人開発者が、好奇心と粘り強さ、ゲームへの情熱を込めて制作しているインディーゲームです。",brandClose:"メニューへ"}
};
export const HOUSE_PROMO_LOCALES=locales;
const locale=()=>{try{const code=localStorage.getItem("cosmic-scrap-language")||"en";return locales[code]?code:"en"}catch{return"en"}};
export function mountHousePromoOverlays(){
 const death=$("death-screen"),stats=$("run-stats"),retry=$("retry");
 let revive=null,note=null,reviveLayer=null,brandLayer=null,brandTimer=null;
 const words=()=>locales[locale()];
 const update=()=>{
  const w=words();
  if(revive){revive.textContent="✦ "+(revive.dataset.used==="true"?w.used:revive.dataset.expired==="true"?w.expired:w.revive);note.textContent=w.note}
  if(reviveLayer){$("revive-eyebrow").textContent=w.supportEyebrow;$("revive-title").textContent=w.title;$("revive-body").textContent=w.body;$("revive-status").textContent=w.status;$("revive-now").textContent=w.now;$("revive-cancel").textContent=w.cancel}
  if(brandLayer){$("house-interstitial-eyebrow").textContent=w.brandEyebrow;$("house-interstitial-copy").textContent=w.brandBody;$("house-interstitial-close").textContent=w.brandClose}
 };
 if(death&&stats&&retry&&!$("house-revive")){
  revive=document.createElement("button");revive.id="house-revive";revive.className="house-promo-trigger";revive.type="button";revive.setAttribute("aria-haspopup","dialog");
  note=document.createElement("p");note.className="house-promo-note";
  stats.insertAdjacentElement("afterend",revive);revive.insertAdjacentElement("afterend",note);
  reviveLayer=document.createElement("div");reviveLayer.className="house-promo-layer";reviveLayer.hidden=true;
  reviveLayer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="revive-title"><p class="eyebrow" id="revive-eyebrow"></p><h2 id="revive-title"></h2><p id="revive-body"></p><div class="house-promo-count" id="revive-count">5</div><p id="revive-status" role="status" aria-live="polite"></p><div class="house-promo-actions"><button id="revive-now" type="button"></button><button id="revive-cancel" class="secondary" type="button"></button></div></section>';
  document.body.append(reviveLayer);
  let timer=null,remaining=5;
  const close=()=>{if(timer)clearInterval(timer);timer=null;reviveLayer.hidden=true};
  const request=()=>{close();window.dispatchEvent(new Event("cosmic-scrap:request-revive"))};
  revive.addEventListener("click",()=>{if(revive.disabled||revive.dataset.used==="true"||revive.dataset.expired==="true")return;remaining=5;$("revive-count").textContent=String(remaining);reviveLayer.hidden=false;if(timer)clearInterval(timer);timer=setInterval(()=>{remaining-=1;$("revive-count").textContent=String(Math.max(0,remaining));if(remaining<=0)request()},1000);$("revive-now").focus()});
  $("revive-now").addEventListener("click",request);$("revive-cancel").addEventListener("click",close);
  window.addEventListener("cosmic-scrap:revive-result",event=>{const w=words();if(event.detail?.ok){close();revive.disabled=true;revive.dataset.used="true";update()}else{$("revive-status").textContent=w.unavailable;$("revive-count").textContent="—";$("revive-cancel").textContent=w.close}});
  window.addEventListener("cosmic-scrap:run-restarted",()=>{revive.disabled=false;delete revive.dataset.used;delete revive.dataset.expired;update()});
  window.addEventListener("cosmic-scrap:run-finalized",()=>{if(revive&&!revive.dataset.used){revive.disabled=true;revive.dataset.expired="true";update()}});
 }
 const app=$("app");
 if(app&&!$("house-interstitial")){
  brandLayer=document.createElement("div");brandLayer.id="house-interstitial";brandLayer.className="house-promo-layer";brandLayer.hidden=true;
  brandLayer.innerHTML='<section class="house-promo-panel" role="dialog" aria-modal="true" aria-labelledby="house-interstitial-title"><p class="eyebrow" id="house-interstitial-eyebrow"></p><h2 id="house-interstitial-title">TAVIRO</h2><p id="house-interstitial-copy"></p><div class="house-promo-actions"><button id="house-interstitial-close" class="secondary" type="button"></button></div></section>';
  app.append(brandLayer);
  const hide=()=>{if(brandTimer)clearTimeout(brandTimer);brandTimer=null;brandLayer.hidden=true};
  $("house-interstitial-close").addEventListener("click",hide);
  window.addEventListener("cosmic-scrap:menu-return",()=>{hide();update();brandLayer.hidden=false;brandTimer=setTimeout(hide,6500)});
 }
 window.addEventListener("cosmic-scrap:language-changed",update);
 update();
}
