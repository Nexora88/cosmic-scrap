import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $ = id => document.getElementById(id);
const panel = $("online-screen");
const status = $("online-status");
const SITE_URL = "https://nexora88.github.io/cosmic-scrap/";
const CASUAL_SCORE_SUBMISSIONS_ENABLED = false;
let user = null;
let pendingShareText = "";

function message(text, error = false) {
  status.textContent = text;
  status.dataset.state = error ? "error" : "info";
}
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = String(text);
  return el;
}
async function callRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}
function avatarNode(profile = {}) {
  const avatarId = ["core-blue", "core-mint", "core-violet", "core-amber"].includes(profile.avatar_id)
    ? profile.avatar_id : "core-blue";
  if (!profile.avatar_path) return node("span", "leader-avatar avatar-" + avatarId, "■");
  const image = node("img", "leader-avatar leader-photo");
  image.src = supabase.storage.from("player-avatars").getPublicUrl(profile.avatar_path).data.publicUrl;
  image.alt = (profile.username || "Pilot") + " profile photo";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => image.replaceWith(node("span", "leader-avatar avatar-" + avatarId, "■")), { once: true });
  return image;
}
function currentLocale(){return localStorage.getItem("cosmic-scrap-language")||"en"}
const BOARD_COPY={
 en:{ranked:"RANKED SEASON",casual:"CASUAL RECORDS",countries:"COUNTRY TOTALS",rankedNote:"RANKED · SERVER-SIMULATED MATCH RESULTS · VERIFIED BY THE MATCH SERVER",casualNote:"PROVISIONAL · CLIENT-REPORTED · UNVERIFIED — NOT ELIGIBLE FOR VERIFIED COMPETITION",emptyRanked:"No ranked matches recorded in this season yet.",league:"LEAGUE",matches:"MATCHES",wins:"WINS",provisional:"PROVISIONAL",casualPaused:"ONLINE CASUAL SCORES PAUSED · SERVER VALIDATION IS BEING BUILT",},
 tr:{ranked:"SEZONLUK DERECE",casual:"GAYRİRESMÎ SKORLAR",countries:"ÜLKE TOPLAMLARI",rankedNote:"RANKED · SUNUCUDA SİMÜLE EDİLEN MAÇLAR · SUNUCU TARAFINDAN DOĞRULANDI",casualNote:"GEÇİCİ · İSTEMCİDEN BİLDİRİLEN · DOĞRULANMAMIŞ — DERECELİ REKABETE UYGUN DEĞİL",emptyRanked:"Bu sezonda henüz dereceli maç kaydı yok.",league:"LİG",matches:"MAÇ",wins:"GALİBİYET",provisional:"GEÇİCİ",casualPaused:"ÇEVRİM İÇİ CASUAL SKORLAR DURAKLATILDI · SUNUCU DOĞRULAMASI GELİŞTİRİLİYOR",},
 "pt-BR":{ranked:"TEMPORADA RANQUEADA",casual:"RECORDES CASUAIS",countries:"TOTAIS POR PAÍS",rankedNote:"RANQUEADO · PARTIDAS SIMULADAS NO SERVIDOR · RESULTADOS VERIFICADOS",casualNote:"PROVISÓRIO · INFORMADO PELO CLIENTE · NÃO VERIFICADO — NÃO VÁLIDO PARA COMPETIÇÃO OFICIAL",emptyRanked:"Ainda não há partidas ranqueadas nesta temporada.",league:"LIGA",matches:"PARTIDAS",wins:"VITÓRIAS",provisional:"PROVISÓRIO",casualPaused:"PONTUAÇÕES CASUAIS ONLINE PAUSADAS · A VALIDAÇÃO NO SERVIDOR ESTÁ EM DESENVOLVIMENTO",},
 es:{ranked:"TEMPORADA CLASIFICATORIA",casual:"RÉCORDS CASUALES",countries:"TOTALES POR PAÍS",rankedNote:"RANKED · PARTIDAS SIMULADAS EN EL SERVIDOR · RESULTADOS VERIFICADOS",casualNote:"PROVISIONAL · ENVIADO POR EL CLIENTE · NO VERIFICADO — NO VÁLIDO PARA COMPETICIÓN OFICIAL",emptyRanked:"Aún no hay partidas clasificatorias en esta temporada.",league:"LIGA",matches:"PARTIDAS",wins:"VICTORIAS",provisional:"PROVISIONAL",casualPaused:"PUNTUACIONES CASUALES EN PAUSA · SE ESTÁ DESARROLLANDO LA VALIDACIÓN DEL SERVIDOR",},
 ru:{ranked:"РЕЙТИНГ СЕЗОНА",casual:"ОБЫЧНЫЕ РЕКОРДЫ",countries:"РЕЗУЛЬТАТЫ СТРАН",rankedNote:"RANKED · МАТЧИ СИМУЛИРУЮТСЯ СЕРВЕРОМ · РЕЗУЛЬТАТЫ ПРОВЕРЕНЫ",casualNote:"ПРЕДВАРИТЕЛЬНЫЙ · ОТПРАВЛЕН КЛИЕНТОМ · НЕ ПРОВЕРЕН — НЕ ДЛЯ ОФИЦИАЛЬНОГО РЕЙТИНГА",emptyRanked:"В этом сезоне ещё нет рейтинговых матчей.",league:"ЛИГА",matches:"МАТЧИ",wins:"ПОБЕДЫ",provisional:"ВРЕМЕННЫЙ",casualPaused:"ОНЛАЙН-КАЗУАЛЬНЫЕ РЕЗУЛЬТАТЫ ПРИОСТАНОВЛЕНЫ · РАЗРАБАТЫВАЕТСЯ ПРОВЕРКА НА СЕРВЕРЕ",},
 id:{ranked:"MUSIM PERINGKAT",casual:"REKOR KASUAL",countries:"TOTAL NEGARA",rankedNote:"RANKED · PERTANDINGAN DISIMULASIKAN SERVER · HASIL TERVERIFIKASI",casualNote:"SEMENTARA · DILAPORKAN KLIEN · BELUM TERVERIFIKASI — BUKAN UNTUK KOMPETISI RESMI",emptyRanked:"Belum ada pertandingan peringkat musim ini.",league:"LIGA",matches:"PERTANDINGAN",wins:"MENANG",provisional:"SEMENTARA",casualPaused:"SKOR KASUAL ONLINE DIJEDA · VALIDASI SERVER SEDANG DIKEMBANGKAN",},
 de:{ranked:"RANGLISTE DER SAISON",casual:"CASUAL-REKORDE",countries:"LÄNDERGESAMT",rankedNote:"RANKED · SERVER-SIMULIERTE MATCHES · SERVERSEITIG VERIFIZIERT",casualNote:"VORLÄUFIG · VOM CLIENT GEMELDET · NICHT VERIFIZIERT — NICHT FÜR OFFIZIELLE WERTUNG",emptyRanked:"In dieser Saison gibt es noch keine Ranglistenmatches.",league:"LIGA",matches:"MATCHES",wins:"SIEGE",provisional:"VORLÄUFIG",casualPaused:"ONLINE-CASUAL-ERGEBNISSE PAUSIERT · SERVERPRÜFUNG WIRD ENTWICKELT",},
 fr:{ranked:"CLASSEMENT DE SAISON",casual:"RECORDS CASUAL",countries:"TOTAUX PAR PAYS",rankedNote:"RANKED · MATCHS SIMULÉS PAR LE SERVEUR · RÉSULTATS VÉRIFIÉS",casualNote:"PROVISOIRE · DÉCLARÉ PAR LE CLIENT · NON VÉRIFIÉ — HORS COMPÉTITION OFFICIELLE",emptyRanked:"Aucun match classé enregistré cette saison.",league:"LIGUE",matches:"MATCHS",wins:"VICTOIRES",provisional:"PROVISOIRE",casualPaused:"SCORES CASUAL EN LIGNE EN PAUSE · LA VALIDATION SERVEUR EST EN COURS",},
 ja:{ranked:"シーズンランキング",casual:"カジュアル記録",countries:"国別合計",rankedNote:"ランク戦 · サーバーシミュレーション · サーバー検証済み",casualNote:"暫定 · クライアント送信 · 未検証 — 公式ランキング対象外",emptyRanked:"今シーズンのランク戦記録はまだありません。",league:"リーグ",matches:"試合",wins:"勝利",provisional:"仮",casualPaused:"オンラインカジュアルスコアは一時停止中 · サーバー検証を開発しています",}
};
function flagForCountry(code){return String(code||"").toUpperCase().replace(/[A-Z]/g,ch=>String.fromCodePoint(ch.charCodeAt(0)+127397))}
function countryFlagNode(code){const image=node("img","leader-country-flag");image.src="https://flagcdn.com/w80/"+String(code||"").toLowerCase()+".png";image.alt=countryName(code)+" flag";image.loading="lazy";image.decoding="async";image.addEventListener("error",()=>image.replaceWith(node("span","leader-country-code",String(code||"—"))),{once:true});return image}
function countryName(code){try{return new Intl.DisplayNames([currentLocale()],{type:"region"}).of(code)||code}catch{return code}}
async function loadBoard(scope="players") {
 if(scope==="ranked")scope="players";
 const list=$("leaderboard-list"),tr=currentLocale()==="tr",copy=BOARD_COPY[currentLocale()]||BOARD_COPY.en;
 $("global-ranking-ranked").hidden=true;
 $("global-ranking-ranked")?.classList.toggle("selected",scope==="ranked");
 $("global-ranking-ranked")?.setAttribute("aria-pressed",String(scope==="ranked"));
 if($("global-ranking-players"))$("global-ranking-players").textContent=copy.casual;
 if($("global-ranking-countries"))$("global-ranking-countries").textContent=copy.countries;
 if($("global-ranking-ranked"))$("global-ranking-ranked").textContent=copy.ranked;
 const trustNote=$("leaderboard-trust-note");if(trustNote)trustNote.textContent=scope==="ranked"?copy.rankedNote:copy.casualPaused;
 $("global-ranking-players")?.classList.toggle("selected",scope==="players");
 $("global-ranking-countries")?.classList.toggle("selected",scope==="countries");
 $("global-ranking-players")?.setAttribute("aria-pressed",String(scope==="players"));
 $("global-ranking-countries")?.setAttribute("aria-pressed",String(scope==="countries"));
 list.replaceChildren(node("p","empty-state",scope==="countries"?(tr?"Ülke sıralaması yükleniyor…":"Loading country rankings…"):(tr?"Pilot sıralaması yükleniyor…":"Loading pilot rankings…")));
  if(!CASUAL_SCORE_SUBMISSIONS_ENABLED){list.replaceChildren(node("p","empty-state",copy.casualPaused));return;}
 try{
  if(scope==="ranked"){
   const records=await callRpc("get_ranked_leaderboard",{p_scope:"global",p_limit:50});list.replaceChildren();
   if(!records?.length){list.append(node("p","empty-state",copy.emptyRanked));return}
   records.forEach((record,index)=>{
    const row=node("div","leader-row"),rank=node("span","leader-rank",String(record.rank_position||index+1).padStart(2,"0")),identity=node("div","leader-identity");
    identity.append(node("strong","",record.username||(tr?"İsimsiz pilot":"Pilot")));
    identity.append(node("small","",copy.league+" "+record.league+" · "+copy.wins+" "+Number(record.wins||0)+" · "+copy.matches+" "+Number(record.matches||0)+(record.provisional?" · "+copy.provisional:"")));
    row.append(rank,avatarNode(record),identity,node("strong","leader-score",Number(record.rating||0).toLocaleString()));
    list.append(row);
   });
   return;
  }
  if(scope==="countries"){
   const records=await callRpc("get_country_score_leaderboard",{p_limit:50});list.replaceChildren();
   if(!records?.length){list.append(node("p","empty-state",tr?"Henüz ülke skoru yok. Hesabından temsil edeceğin ülkeyi seç.":"No country scores yet. Choose your country in your account profile."));return}
   records.forEach((record,index)=>{const row=node("div","leader-row"),rank=node("span","leader-rank",String(index+1).padStart(2,"0")),identity=node("div","leader-identity");identity.append(countryFlagNode(record.country_code));identity.append(node("strong","",countryName(record.country_code)));identity.append(node("small","",Number(record.pilot_count||0).toLocaleString()+" "+(tr?"pilot":"pilots")+" · "+(tr?"+100 galaksi başına":"+100 per captured galaxy")));row.append(rank,identity,node("strong","leader-score",Number(record.total_score||0).toLocaleString()));list.append(row)});
  }else{
   const records=await callRpc("get_player_leaderboard",{p_limit:50});list.replaceChildren();
   if(!records?.length){list.append(node("p","empty-state",tr?"Henüz skor yok. İlk sıraya yerleşmek için bir oyun tamamla.":"No scores yet. Finish a run to claim the first spot."));return}
   const ids=records.map(record=>record.user_id).filter(Boolean);
   let countryByUser={};
   if(ids.length){try{const {data:profiles}=await supabase.from("player_profiles").select("user_id,country_code").in("user_id",ids);countryByUser=Object.fromEntries((profiles||[]).map(profile=>[profile.user_id,profile.country_code]))}catch{}}
   records.forEach((record,index)=>{const row=node("div","leader-row"),rank=node("span","leader-rank",String(index+1).padStart(2,"0")),identity=node("div","leader-identity");const countryCode=countryByUser[record.user_id]||record.country_code;if(countryCode){const flag=node("img","leader-country-flag");flag.src="https://flagcdn.com/w80/"+countryCode.toLowerCase()+".png";flag.alt=countryName(countryCode);flag.loading="lazy";flag.addEventListener("error",()=>flag.replaceWith(node("span","leader-country-code",countryCode)),{once:true});identity.append(flag)}identity.append(node("strong","",record.username||(tr?"İsimsiz pilot":"Pilot")));identity.append(node("small","",(tr?"SEV. ":"LVL ")+Number(record.best_level||1)+" · "+Number(record.best_survival_seconds||0)+(tr?" sn hayatta kaldı":"s survived")));row.append(rank,avatarNode(record),identity,node("strong","leader-score",Number(record.best_score||0).toLocaleString()));list.append(row)});
  }
 }catch(error){list.replaceChildren(node("p","empty-state error-text",error?.message||(tr?"Skor tablosu yüklenemedi.":"Could not load leaderboard.")))}
}

const REGION_COUNTRIES={TR:["🇹🇷","Türkiye"],US:["🇺🇸","United States"],GB:["🇬🇧","United Kingdom"],DE:["🇩🇪","Germany"],JP:["🇯🇵","Japan"],BR:["🇧🇷","Brazil"],FR:["🇫🇷","France"],IN:["🇮🇳","India"]};
async function loadRegionBoard(scope="players"){
 const list=$("region-ranking-list");if(!list)return;
 const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
 const playersButton=$("region-ranking-players"),countriesButton=$("region-ranking-countries");
 if(!user){if(playersButton)playersButton.disabled=true;if(countriesButton)countriesButton.disabled=true;list.replaceChildren(node("p","empty-state",tr?"Bölge sıralamasını görmek için ücretsiz hesap aç veya giriş yap.":"Create a free account or sign in to view conquest rankings."));return;}
 if(playersButton)playersButton.disabled=false;if(countriesButton)countriesButton.disabled=false;
 playersButton?.classList.toggle("selected",scope==="players");countriesButton?.classList.toggle("selected",scope==="countries");
 playersButton?.setAttribute("aria-pressed",String(scope==="players"));countriesButton?.setAttribute("aria-pressed",String(scope==="countries"));
 list.replaceChildren(node("p","empty-state",tr?"Bölge sıralaması yükleniyor…":"Loading conquest rankings…"));
 try{
  const records=await callRpc(scope==="countries"?"get_region_country_leaderboard":"get_region_player_leaderboard",{p_limit:10});
  list.replaceChildren();
  if(!records?.length){list.append(node("p","empty-state",tr?"Henüz fethedilmiş bölge yok. İlk bölgeyi sen kazan!":"No captured regions yet. Claim the first one!"));return}
  records.forEach((record,index)=>{
   const row=node("div","region-ranking-row");
   const rank=node("span","leader-rank",String(record.rank_position||index+1).padStart(2,"0"));
   const country=REGION_COUNTRIES[record.country_code]||["🌐",record.country_code||"—"];
   const flag=countryFlagNode(record.country_code);
   const identity=node("div");
   const countryName=tr?({TR:"Türkiye",US:"ABD",GB:"Birleşik Krallık",DE:"Almanya",JP:"Japonya",BR:"Brezilya",FR:"Fransa",IN:"Hindistan"}[record.country_code]||country[1]):country[1];
   identity.append(node("strong","",scope==="countries"?countryName:(record.username||"Pilot")));
   identity.append(node("small","",scope==="countries"?((record.pilots||0)+(tr?" pilot":" pilots")):(tr?"Ülke: ":"Country: ")+countryName));
   const score=node("strong","region-ranking-score",String(record.regions_captured||0)+(tr?" bölge":" regions"));
   row.append(rank,flag,identity,score);list.append(row);
  });
 }catch(error){list.replaceChildren(node("p","empty-state error-text",error?.message||(tr?"Bölge sıralaması yüklenemedi.":"Could not load conquest rankings.")))}
}
async function submitRegionCapture(event){
 const detail=event.detail||{},regionIds={debris:0,ember:1,cryo:2,rift:3,starforge:4},regionId=regionIds[detail.regionId];
 if(!Number.isInteger(regionId))return;
 try{
  const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session?.user)return;
  await callRpc("capture_pilot_region",{p_region_id:regionId});
  await callRpc("award_country_galaxy_point",{p_region_id:regionId});
  if(!panel.hidden)await loadRegionBoard();
 }catch(error){if(!panel.hidden)message((localStorage.getItem("cosmic-scrap-language")==="tr"?"Bölge yerel kayda alındı; çevrim içi eşitleme bekliyor: ":"Region saved locally; online sync is pending: ")+(error?.message||"network error"),true)}
}

async function openOnline() {
  panel.hidden = false;
  $("online-close").focus();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    $("online-needs-account").hidden = Boolean(user);
    if(!user){const note=$("online-needs-account-copy"),copy=BOARD_COPY[currentLocale()]||BOARD_COPY.en;if(note)note.textContent=copy.rankedNote+" · "+copy.casualPaused}
    await Promise.all([loadBoard(user?"ranked":"players"),loadRegionBoard()]);
    if (!user) message((BOARD_COPY[currentLocale()]||BOARD_COPY.en).rankedNote+" · "+(BOARD_COPY[currentLocale()]||BOARD_COPY.en).casualNote);
    else message(BOARD_COPY[currentLocale()]?.casualPaused || BOARD_COPY.en.casualPaused);
  } catch (error) { message(error?.message || "Leaderboard service unavailable.", true); }
}
async function shareRecord() {
  if (pendingShareText) {
    if (navigator.share) { try { await navigator.share({ text: pendingShareText }); return; } catch {} }
    try { await navigator.clipboard.writeText(pendingShareText); message("Record text copied."); } catch { message(pendingShareText); }
    return;
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const signedIn = data.session?.user;
    if (!signedIn) { message("Create a free account to publish and share your score."); return; }
    const { data: record, error: recordError } = await supabase.from("player_run_records")
      .select("best_score,best_level,best_survival_seconds").eq("user_id", signedIn.id).maybeSingle();
    if (recordError) throw recordError;
    if (!record) { message("Finish a run to create your first record."); return; }
    pendingShareText = "My TAVIRO CASUAL (UNVERIFIED) record is " + Number(record.best_score).toLocaleString() +
      " points · level " + record.best_level + " · " + record.best_survival_seconds +
      "s survived. Can you beat it? " + SITE_URL;
    await shareRecord();
  } catch (error) { message(error?.message || "Could not load your record.", true); }
}
async function submitScore() {
  // Do not accept browser-reported totals as trusted online records.
  // The database RPC is also revoked; this guard keeps the UI honest.
  pendingShareText = "";
  if (!panel.hidden) message(BOARD_COPY[currentLocale()]?.casualPaused || BOARD_COPY.en.casualPaused);
}

window.addEventListener("cosmic-scrap:open-online", openOnline);
window.addEventListener("cosmic-scrap:language-changed",()=>{if(!panel.hidden){const scope=$("global-ranking-ranked")?.classList.contains("selected")?"ranked":$("global-ranking-countries")?.classList.contains("selected")?"countries":"players";loadBoard(scope)}});
window.addEventListener("cosmic-scrap:submit-score", submitScore);
window.addEventListener("cosmic-scrap:submit-region-capture", submitRegionCapture);
$("online-close").addEventListener("click", () => { panel.hidden = true; $("online-open").focus(); });
$("online-refresh-board").addEventListener("click", () => { loadBoard(document.getElementById("global-ranking-ranked")?.classList.contains("selected")?"ranked":document.getElementById("global-ranking-countries")?.classList.contains("selected")?"countries":"players"); loadRegionBoard(); });
$("global-ranking-ranked")?.addEventListener("click",()=>loadBoard("ranked"));
$("global-ranking-players")?.addEventListener("click",()=>loadBoard("players"));
$("global-ranking-countries")?.addEventListener("click",()=>loadBoard("countries"));
$("region-ranking-players")?.addEventListener("click",()=>loadRegionBoard("players"));
$("region-ranking-countries")?.addEventListener("click",()=>loadRegionBoard("countries"));
$("online-needs-account-button").addEventListener("click", () => {
  panel.hidden = true;
  window.dispatchEvent(new Event("cosmic-scrap:request-account"));
});
$("online-share-record").disabled = true;
$("online-share-record").setAttribute("aria-label", BOARD_COPY.en.casualPaused);
