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
 en:{ranked:"RANKED SEASON",casual:"CASUAL RECORDS",countries:"COUNTRY TOTALS",rankedNote:"RANKED · SERVER-SIMULATED MATCH RESULTS · VERIFIED BY THE MATCH SERVER",casualNote:"CASUAL · CLIENT-REPORTED SCORES · NOT REPLAY-VERIFIED",emptyRanked:"No ranked matches recorded in this season yet.",league:"LEAGUE",matches:"MATCHES",wins:"WINS",provisional:"PROVISIONAL"},
 tr:{ranked:"SEZONLUK DERECE",casual:"GAYRİRESMÎ SKORLAR",countries:"ÜLKE TOPLAMLARI",rankedNote:"RANKED · SUNUCUDA SİMÜLE EDİLEN MAÇLAR · SUNUCU TARAFINDAN DOĞRULANDI",casualNote:"CASUAL · İSTEMCİDEN GELEN SKORLAR · TEKRAR SİMÜLE EDİLMEDİ",emptyRanked:"Bu sezonda henüz dereceli maç kaydı yok.",league:"LİG",matches:"MAÇ",wins:"GALİBİYET",provisional:"GEÇİCİ"},
 "pt-BR":{ranked:"TEMPORADA RANQUEADA",casual:"RECORDES CASUAIS",countries:"TOTAIS POR PAÍS",rankedNote:"RANQUEADO · PARTIDAS SIMULADAS NO SERVIDOR · RESULTADOS VERIFICADOS",casualNote:"CASUAL · PONTUAÇÕES INFORMADAS PELO CLIENTE · NÃO VERIFICADAS POR REPLAY",emptyRanked:"Ainda não há partidas ranqueadas nesta temporada.",league:"LIGA",matches:"PARTIDAS",wins:"VITÓRIAS",provisional:"PROVISÓRIO"},
 es:{ranked:"TEMPORADA CLASIFICATORIA",casual:"RÉCORDS CASUALES",countries:"TOTALES POR PAÍS",rankedNote:"RANKED · PARTIDAS SIMULADAS EN EL SERVIDOR · RESULTADOS VERIFICADOS",casualNote:"CASUAL · PUNTUACIONES ENVIADAS POR EL CLIENTE · SIN VERIFICACIÓN DE REPETICIÓN",emptyRanked:"Aún no hay partidas clasificatorias en esta temporada.",league:"LIGA",matches:"PARTIDAS",wins:"VICTORIAS",provisional:"PROVISIONAL"},
 ru:{ranked:"РЕЙТИНГ СЕЗОНА",casual:"ОБЫЧНЫЕ РЕКОРДЫ",countries:"РЕЗУЛЬТАТЫ СТРАН",rankedNote:"RANKED · МАТЧИ СИМУЛИРУЮТСЯ СЕРВЕРОМ · РЕЗУЛЬТАТЫ ПРОВЕРЕНЫ",casualNote:"CASUAL · СЧЁТ ОТПРАВЛЕН КЛИЕНТОМ · ПОВТОРНО НЕ ПРОВЕРЕН",emptyRanked:"В этом сезоне ещё нет рейтинговых матчей.",league:"ЛИГА",matches:"МАТЧИ",wins:"ПОБЕДЫ",provisional:"ВРЕМЕННЫЙ"},
 id:{ranked:"MUSIM PERINGKAT",casual:"REKOR KASUAL",countries:"TOTAL NEGARA",rankedNote:"RANKED · PERTANDINGAN DISIMULASIKAN SERVER · HASIL TERVERIFIKASI",casualNote:"CASUAL · SKOR DILAPORKAN KLIEN · TIDAK DIVERIFIKASI ULANG",emptyRanked:"Belum ada pertandingan peringkat musim ini.",league:"LIGA",matches:"PERTANDINGAN",wins:"MENANG",provisional:"SEMENTARA"},
 de:{ranked:"RANGLISTE DER SAISON",casual:"CASUAL-REKORDE",countries:"LÄNDERGESAMT",rankedNote:"RANKED · SERVER-SIMULIERTE MATCHES · SERVERSEITIG VERIFIZIERT",casualNote:"CASUAL · VOM CLIENT GEMELDETE PUNKTE · NICHT PER REPLAY VERIFIZIERT",emptyRanked:"In dieser Saison gibt es noch keine Ranglistenmatches.",league:"LIGA",matches:"MATCHES",wins:"SIEGE",provisional:"VORLÄUFIG"},
 fr:{ranked:"CLASSEMENT DE SAISON",casual:"RECORDS CASUAL",countries:"TOTAUX PAR PAYS",rankedNote:"RANKED · MATCHS SIMULÉS PAR LE SERVEUR · RÉSULTATS VÉRIFIÉS",casualNote:"CASUAL · SCORES ENVOYÉS PAR LE CLIENT · NON VÉRIFIÉS PAR REPLAY",emptyRanked:"Aucun match classé enregistré cette saison.",league:"LIGUE",matches:"MATCHS",wins:"VICTOIRES",provisional:"PROVISOIRE"},
 ja:{ranked:"シーズンランキング",casual:"カジュアル記録",countries:"国別合計",rankedNote:"ランク戦 · サーバーシミュレーション · サーバー検証済み",casualNote:"カジュアル · クライアント送信スコア · リプレイ検証なし",emptyRanked:"今シーズンのランク戦記録はまだありません。",league:"リーグ",matches:"試合",wins:"勝利",provisional:"仮"}
};
function flagForCountry(code){return String(code||"").toUpperCase().replace(/[A-Z]/g,ch=>String.fromCodePoint(ch.charCodeAt(0)+127397))}
function countryFlagNode(code){const image=node("img","leader-country-flag");image.src="https://flagcdn.com/w80/"+String(code||"").toLowerCase()+".png";image.alt=countryName(code)+" flag";image.loading="lazy";image.decoding="async";image.addEventListener("error",()=>image.replaceWith(node("span","leader-country-code",String(code||"—"))),{once:true});return image}
function countryName(code){try{return new Intl.DisplayNames([currentLocale()],{type:"region"}).of(code)||code}catch{return code}}
async function loadBoard(scope="players") {
 if(scope==="ranked"&&!user)scope="players";
 const list=$("leaderboard-list"),tr=currentLocale()==="tr",copy=BOARD_COPY[currentLocale()]||BOARD_COPY.en;
 $("global-ranking-ranked").hidden=!user;
 $("global-ranking-ranked")?.classList.toggle("selected",scope==="ranked");
 $("global-ranking-ranked")?.setAttribute("aria-pressed",String(scope==="ranked"));
 if($("global-ranking-players"))$("global-ranking-players").textContent=copy.casual;
 if($("global-ranking-countries"))$("global-ranking-countries").textContent=copy.countries;
 if($("global-ranking-ranked"))$("global-ranking-ranked").textContent=copy.ranked;
 const trustNote=$("leaderboard-trust-note");if(trustNote)trustNote.textContent=scope==="ranked"?copy.rankedNote:copy.casualNote;
 $("global-ranking-players")?.classList.toggle("selected",scope==="players");
 $("global-ranking-countries")?.classList.toggle("selected",scope==="countries");
 $("global-ranking-players")?.setAttribute("aria-pressed",String(scope==="players"));
 $("global-ranking-countries")?.setAttribute("aria-pressed",String(scope==="countries"));
 list.replaceChildren(node("p","empty-state",scope==="countries"?(tr?"Ülke sıralaması yükleniyor…":"Loading country rankings…"):(tr?"Pilot sıralaması yükleniyor…":"Loading pilot rankings…")));
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
    if(!user){const note=$("online-needs-account-copy"),copy=BOARD_COPY[currentLocale()]||BOARD_COPY.en;if(note)note.textContent=copy.rankedNote+" · "+copy.casualNote}
    await Promise.all([loadBoard(user?"ranked":"players"),loadRegionBoard()]);
    if (!user) message((BOARD_COPY[currentLocale()]||BOARD_COPY.en).rankedNote+" · "+(BOARD_COPY[currentLocale()]||BOARD_COPY.en).casualNote);
    else message(BOARD_COPY[currentLocale()]?.rankedNote || BOARD_COPY.en.rankedNote);
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
async function submitScore(event) {
  const result = event.detail || {};
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    if (!user) return;
    const score = Math.max(0, Math.floor(Number(result.score) || 0));
    const level = Math.max(1, Math.floor(Number(result.level) || 1));
    const seconds = Math.max(0, Math.min(14400, Math.floor(Number(result.survivalSeconds) || 0)));
    await callRpc("submit_run_record", { p_score: score, p_level: level, p_survival_seconds: seconds });
    pendingShareText = "New TAVIRO record: " + score.toLocaleString() + " points · level " + level +
      " · survived " + seconds + "s. Play free: " + SITE_URL;
    if (!panel.hidden) {
      message(BOARD_COPY[currentLocale()]?.casualNote || BOARD_COPY.en.casualNote);
      await loadBoard("players");
    }
  } catch (error) {
    if (!panel.hidden) message((localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Oyun tamamlandı ancak skor eşitlenemedi: "
      : "Run completed, but score sync failed: ") + (error?.message || "network error"), true);
  }
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
$("online-share-record").addEventListener("click", shareRecord);
