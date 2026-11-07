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
let activeBoardScope = "global";
function ensureBoardScopes() {
  const list = $("leaderboard-list");
  if (!list) return;
  let tabs = $("leaderboard-scope-tabs");
  if (!tabs) {
    tabs = node("div", "leaderboard-scope-tabs");
    tabs.id = "leaderboard-scope-tabs";
    list.insertAdjacentElement("beforebegin", tabs);
  }
  if (tabs.children.length) return;
  const labels = { global:["GLOBAL","GENEL"], turkey:["TÜRKİYE","TÜRKİYE"], friends:["FRIENDS","ARKADAŞLAR"], season:["SEASON","SEZON"] };
  for (const scope of ["global","turkey","friends","season"]) {
    const button = node("button","leaderboard-scope-tab",labels[scope][localStorage.getItem("cosmic-scrap-language")==="tr"?1:0]);
    button.type = "button";
    button.dataset.scope = scope;
    button.setAttribute("aria-pressed",String(scope===activeBoardScope));
    button.addEventListener("click",()=>{activeBoardScope=scope;loadBoard(scope)});
    tabs.append(button);
  }
}

const COUNTRY_NAMES={TR:"Türkiye",US:"ABD",GB:"Birleşik Krallık",DE:"Almanya",JP:"Japonya",BR:"Brezilya",FR:"Fransa",IN:"Hindistan",CA:"Kanada",AU:"Avustralya",ES:"İspanya",IT:"İtalya",NL:"Hollanda",PL:"Polonya",UA:"Ukrayna",KR:"Güney Kore",CN:"Çin",MX:"Meksika",AR:"Arjantin",SE:"İsveç",NO:"Norveç",FI:"Finlandiya",CH:"İsviçre",AT:"Avusturya",BE:"Belçika",PT:"Portekiz",GR:"Yunanistan",RO:"Romanya",CZ:"Çekya",AZ:"Azerbaycan"};
function countryFlag(code){
 const value=String(code||"").toUpperCase();
 if(!/^[A-Z]{2}$/.test(value))return "🌐";
 return String.fromCodePoint(...[...value].map(letter=>127397+letter.charCodeAt(0)));
}
function leagueLabel(record,tr){
 if(record.league)return String(record.league).toUpperCase();
 const rating=Number(record.rating||0);
 if(rating>=1900)return "VOID";
 if(rating>=1500)return "GOLD";
 if(rating>=1200)return "SILVER";
 return rating>0?"BRONZE":(tr?"LİGSİZ":"UNRANKED");
}
async function enrichLeaderboardRecords(records,scope){
 const ids=records.map(row=>row.user_id).filter(Boolean);
 if(!ids.length)return records;
 const [profiles,progress,ranks]=await Promise.all([
  supabase.from("player_profiles").select("user_id,username,avatar_id,avatar_path,country_code").in("user_id",ids),
  supabase.from("player_game_progress").select("user_id,level").in("user_id",ids),
  callRpc("get_ranked_leaderboard",{p_scope:"global",p_limit:100}).catch(()=>[])
 ]);
 const profileMap=new Map((profiles.data||[]).map(row=>[row.user_id,row]));
 const levelMap=new Map((progress.data||[]).map(row=>[row.user_id,row.level]));
 const rankMap=new Map((ranks||[]).map(row=>[row.user_id,row]));
 return records.map(row=>{
  const rank=rankMap.get(row.user_id)||{};
  return {...profileMap.get(row.user_id),...rank,...row,
   country_code:row.country_code||profileMap.get(row.user_id)?.country_code||rank.country_code,
   rating:Number(row.rating||rank.rating||0),league:row.league||rank.league,
   best_level:Number(row.best_level||levelMap.get(row.user_id)||1)};
 });
}
function renderLeaderboard(list,records,scope,tr){
 list.replaceChildren();
 if(!records.length){
  list.append(node("p","empty-state",tr?(scope==="friends"?"Henüz arkadaş skoru yok.":scope==="season"?"Sezonda henüz dereceli maç yok.":"Bu sıralamada henüz skor yok."):(scope==="friends"?"No friend scores yet.":scope==="season"?"No ranked matches in this season yet.":"No scores in this ranking yet.")));
  return;
 }
 const podium=node("div","leader-podium");
 records.slice(0,3).forEach((record,index)=>{
  const card=node("article","leader-podium-card podium-"+(index+1));
  const medal=node("span","podium-medal",["Ⅰ","Ⅱ","Ⅲ"][index]);
  const flag=node("span","leader-country-flag",countryFlag(record.country_code));
  const identity=node("div","leader-identity");
  identity.append(node("strong","",record.username||(tr?"İsimsiz pilot":"Pilot")),
   node("small","",leagueLabel(record,tr)+" · "+(tr?"SEV. ":"LVL ")+Number(record.best_level||1)));
  const score=node("strong","leader-score",Number(record.best_score||0).toLocaleString(tr?"tr-TR":"en-US"));
  const meta=node("small","podium-meta",scope==="season"?(Number(record.wins||0)+(tr?" galibiyet":" wins")):(Number(record.best_survival_seconds||0)+(tr?" sn hayatta":"s survived")));
  card.append(medal,flag,avatarNode(record),identity,score,meta);podium.append(card);
 });
 list.append(podium);
 records.slice(3).forEach((record,index)=>{
  const row=node("div","leader-row");
  const rank=node("span","leader-rank",String(index+4).padStart(2,"0"));
  const flag=node("span","leader-country-flag",countryFlag(record.country_code));
  const identity=node("div","leader-identity");
  identity.append(node("strong","",record.username||(tr?"İsimsiz pilot":"Pilot")),
   node("small","",leagueLabel(record,tr)+" · "+(tr?"SEV. ":"LVL ")+Number(record.best_level||1)));
  const score=node("strong","leader-score",Number(record.best_score||0).toLocaleString(tr?"tr-TR":"en-US"));
  row.append(rank,flag,avatarNode(record),identity,score);list.append(row);
 });
}

async function loadBoard(scope=activeBoardScope) {
  activeBoardScope = scope;
  const list = $("leaderboard-list");
  const tr = localStorage.getItem("cosmic-scrap-language") === "tr";
  ensureBoardScopes();
  document.querySelectorAll("#leaderboard-scope-tabs [data-scope]").forEach(button=>{
    button.setAttribute("aria-pressed",String(button.dataset.scope===scope));
    button.disabled = scope!=="global" && !user;
  });
  list.replaceChildren(node("p", "empty-state", tr ? "Pilot sıralaması yükleniyor…" : "Loading pilot rankings…"));
  try {
    if (scope !== "global" && !user) {
      list.replaceChildren(node("p","empty-state",tr?"Türkiye ve arkadaş sıralamaları için ücretsiz hesapla giriş yap.":"Sign in with a free account to view Türkiye and Friends rankings."));
      return;
    }
    let records;
    if (scope === "global") {
      records = await callRpc("get_player_leaderboard", { p_limit: 50 });
    } else if (scope === "friends") {
      records = await callRpc("get_friends_leaderboard", { p_limit: 50 });
    } else if (scope === "season") {
      records = await callRpc("get_ranked_leaderboard", { p_scope: "global", p_limit: 50 });
      records = (records || []).map(record => ({ ...record, best_score: record.rating, best_level: 1 }));
    } else {
      const {data,error} = await supabase.from("player_run_records")
        .select("best_score,best_level,best_survival_seconds,updated_at,player_profiles!inner(username,avatar_id,avatar_path,country_code)")
        .eq("player_profiles.country_code","TR")
        .order("best_score",{ascending:false})
        .order("best_level",{ascending:false})
        .order("best_survival_seconds",{ascending:false})
        .limit(50);
      if (error) throw error;
      records = (data||[]).map(record=>({...record,...record.player_profiles}));
    }
    records = await enrichLeaderboardRecords(records || [], scope);
    renderLeaderboard(list, records, scope, tr);
  } catch (error) {
    list.replaceChildren(node("p", "empty-state error-text", error?.message || (tr ? "Skor tablosu yüklenemedi." : "Could not load leaderboard.")));
  }
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
   const flag=node("span","",country[0]);
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
  if(!panel.hidden)await loadRegionBoard();
 }catch(error){if(!panel.hidden)message((localStorage.getItem("cosmic-scrap-language")==="tr"?"Bölge yerel kayda alındı; çevrim içi eşitleme bekliyor: ":"Region saved locally; online sync is pending: ")+(error?.message||"network error"),true)}
}

async function loadFriends() {
  const requestsList=$("friend-requests-list"),friendsList=$("friend-list"),statusNode=$("friend-connection-status");
  const form=$("friend-add-form"),input=$("friend-username"),submit=$("friend-add-submit");
  if(!requestsList||!friendsList)return;
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  requestsList.replaceChildren();friendsList.replaceChildren();
  if(!user){
   if(form)form.querySelectorAll("input,button").forEach(control=>control.disabled=true);
   if(statusNode)statusNode.textContent=tr?"Arkadaş eklemek için ücretsiz hesabına giriş yap.":"Sign in to your free account to add friends.";
   requestsList.append(node("p","empty-state",tr?"Giriş yapınca gelen isteklerin burada görünür.":"Sign in to see incoming requests."));
   friendsList.append(node("p","empty-state",tr?"Giriş yapınca arkadaşların burada görünür.":"Sign in to see your friends."));
   return;
  }
  if(form)form.querySelectorAll("input,button").forEach(control=>control.disabled=false);
  try{
   const {data:rows,error}=await supabase.from("player_friends")
    .select("id,requester_user_id,target_user_id,status,created_at")
    .or("requester_user_id.eq."+user.id+",target_user_id.eq."+user.id)
    .order("created_at",{ascending:false});
   if(error)throw error;
   const ids=[...new Set((rows||[]).map(row=>row.requester_user_id===user.id?row.target_user_id:row.requester_user_id))];
   let profileMap=new Map();
   if(ids.length){
    const {data:profiles,error:profileError}=await supabase.from("player_profiles").select("user_id,username").in("user_id",ids);
    if(profileError)throw profileError;
    profileMap=new Map((profiles||[]).map(profile=>[profile.user_id,profile]));
   }
   const incoming=(rows||[]).filter(row=>row.status==="pending"&&row.target_user_id===user.id);
   const visibleFriends=(rows||[]).filter(row=>row.status==="accepted");
   const outgoing=(rows||[]).filter(row=>row.status==="pending"&&row.requester_user_id===user.id);
   for(const row of incoming){
    const otherId=row.requester_user_id,profile=profileMap.get(otherId)||{};
    const item=node("div","friend-list-row");
    item.append(node("strong","",profile.username||"Pilot"));
    const accept=node("button","friend-accept-button",tr?"KABUL ET":"ACCEPT");
    accept.type="button";accept.dataset.acceptFriend=row.id;
    item.append(accept);requestsList.append(item);
   }
   if(!incoming.length)requestsList.append(node("p","empty-state",tr?"Bekleyen istek yok.":"No pending requests."));
   for(const row of visibleFriends){
    const otherId=row.requester_user_id===user.id?row.target_user_id:row.requester_user_id;
    const profile=profileMap.get(otherId)||{};
    const item=node("div","friend-list-row");
    item.append(node("strong","",profile.username||"Pilot"));
    item.append(node("small","friend-state",tr?"ARKADAŞ":"FRIEND"));
    friendsList.append(item);
   }
   for(const row of outgoing){
    const profile=profileMap.get(row.target_user_id)||{};
    const item=node("div","friend-list-row");
    item.append(node("strong","",profile.username||"Pilot"));
    item.append(node("small","friend-state",tr?"İSTEK GÖNDERİLDİ":"REQUEST SENT"));
    friendsList.append(item);
   }
   if(!visibleFriends.length&&!outgoing.length)friendsList.append(node("p","empty-state",tr?"Henüz arkadaşın yok. Bir pilot adıyla istek gönder.":"No friends yet. Send a request using a pilot name."));
   if(statusNode)statusNode.textContent=tr?"İstekler ve arkadaş listen güncel.":"Friend requests and your friend list are up to date.";
  }catch(error){
   if(statusNode)statusNode.textContent=(tr?"Arkadaş listesi yüklenemedi: ":"Could not load friends: ")+(error?.message||"network error");
   requestsList.replaceChildren(node("p","empty-state error-text",tr?"İstekler yüklenemedi.":"Could not load requests."));
   friendsList.replaceChildren(node("p","empty-state error-text",tr?"Arkadaşlar yüklenemedi.":"Could not load friends."));
  }
}



function renderDailyRewardStatus(record){
 const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
 const stats=$("daily-reward-stats"),statusNode=$("daily-reward-status"),claim=$("daily-reward-claim");
 if(!stats||!statusNode||!claim)return;
 const value=record||{};
 stats.replaceChildren(
  node("div","daily-reward-stat",String(Number(value.current_streak||0))+" "+(tr?"GÜN SERİ":"DAY STREAK")),
  node("div","daily-reward-stat",Number(value.reward_points||0).toLocaleString(tr?"tr-TR":"en-US")+" "+(tr?"PİLOT PUANI":"PILOT POINTS")),
  node("div","daily-reward-stat",String(Number(value.best_streak||0))+" "+(tr?"EN İYİ SERİ":"BEST STREAK"))
 );
 const next=7-(Number(value.current_streak||0)%7);
 statusNode.textContent=value.claimed_today
  ?(tr?"Bugünkü ödül alındı. 7 günlük seride sonraki ödül: "+next+" gün sonra.":"Today's reward claimed. Next 7-day milestone in "+next+" day(s).")
  :(tr?"Bugün "+(Number(value.current_streak||0)+1)+". gün ödülünü alabilirsin. 7. gün 250 puan!":"Claim day "+(Number(value.current_streak||0)+1)+". Day 7 awards 250 points!");
 claim.disabled=!user||Boolean(value.claimed_today);
 claim.textContent=value.claimed_today?(tr?"BUGÜN ALINDI":"CLAIMED TODAY"):(tr?"GÜNLÜK ÖDÜLÜ AL":"CLAIM DAILY REWARD");
}
async function loadDailyRewardStatus(){
 const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
 if(!user){renderDailyRewardStatus(null);$("daily-reward-status").textContent=tr?"Seri ve ödül puanları için ücretsiz hesabına giriş yap.":"Sign in to keep a daily streak and earn reward points.";return}
 try{
  const {data,error}=await supabase.rpc("get_daily_reward_status");
  if(error)throw error;
  renderDailyRewardStatus(Array.isArray(data)?data[0]:data);
 }catch(error){$("daily-reward-status").textContent=(tr?"Günlük ödül bilgisi alınamadı: ":"Could not load daily reward status: ")+(error.message||"network error")}
}
async function claimDailyReward(){
 const button=$("daily-reward-claim");if(!user||!button)return;
 button.disabled=true;
 try{
  const {data,error}=await supabase.rpc("claim_daily_reward");
  if(error)throw error;
  renderDailyRewardStatus(data);
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  $("daily-reward-status").textContent=data.status==="claimed"
   ?(tr?"+"+data.earned_points+" Pilot Puanı kazandın! "+data.current_streak+". gün serisi.":"You earned "+data.earned_points+" Pilot Points! Day "+data.current_streak+" streak.")
   :(tr?"Bugünkü ödül zaten alınmış.":"Today's reward has already been claimed.");
 }catch(error){button.disabled=false;$("daily-reward-status").textContent=error.message||"Daily reward claim failed."}
}

let rankedQueueActive=false,rankedMatchId=null,rankedPlayerIds=[],rankedLoopBusy=false,rankedLastTick=0;
let rankedKeys=new Set(),rankedPointer=null,rankedSnapshot=null;
let rankedTimer=null;
function ensureRankedArena(){
 if($("ranked-arena-panel"))return;
 const daily=node("section","online-section daily-rewards-section");
 daily.id="daily-rewards-panel";
 const dailyHead=node("div","online-section-heading");
 const dailyTitle=node("div");dailyTitle.append(node("span","eyebrow","DAILY FLIGHT BONUS"),node("h3","",localStorage.getItem("cosmic-scrap-language")==="tr"?"GÜNLÜK ÖDÜL SERİSİ":"DAILY REWARD STREAK"));
 dailyHead.append(dailyTitle);
 const dailyStats=node("div","daily-reward-stats");dailyStats.id="daily-reward-stats";
 const dailyStatus=node("p","ranked-status","Günlük ödül bilgisi yükleniyor…");dailyStatus.id="daily-reward-status";
 const dailyClaim=node("button","primary-button",localStorage.getItem("cosmic-scrap-language")==="tr"?"GÜNLÜK ÖDÜLÜ AL":"CLAIM DAILY REWARD");dailyClaim.id="daily-reward-claim";dailyClaim.type="button";
 dailyClaim.addEventListener("click",claimDailyReward);
 daily.append(dailyHead,dailyStats,dailyStatus,dailyClaim);
 const section=node("section","online-section ranked-arena-section");
 section.id="ranked-arena-panel";
 const heading=node("div","online-section-heading");
 const titleWrap=node("div");titleWrap.append(node("span","eyebrow","LIVE · SERVER-SIMULATED"),node("h3","",localStorage.getItem("cosmic-scrap-language")==="tr"?"RANKED DÜELLO":"RANKED DUEL"));
 heading.append(titleWrap);
 const stats=node("div","ranked-player-stats");
 stats.id="ranked-player-stats";
 const statusNode=node("p","ranked-status","Rakip aranıyor…");statusNode.id="ranked-arena-status";
 const canvas=node("canvas","ranked-arena-canvas");canvas.id="ranked-arena-canvas";canvas.width=1000;canvas.height=1000;canvas.setAttribute("aria-label","Ranked arena. Use WASD or arrow keys to move.");
 const controls=node("div","ranked-arena-controls");
 const start=node("button","primary-button",localStorage.getItem("cosmic-scrap-language")==="tr"?"RAKİP BUL":"FIND OPPONENT");start.id="ranked-find-button";start.type="button";
 const fire=node("button","mini-button",localStorage.getItem("cosmic-scrap-language")==="tr"?"ATEŞ ET":"FIRE");fire.id="ranked-fire-button";fire.type="button";
 const cancel=node("button","text-button",localStorage.getItem("cosmic-scrap-language")==="tr"?"ARAMAYI / MAÇI BIRAK":"CANCEL / LEAVE");cancel.id="ranked-cancel-button";cancel.type="button";cancel.hidden=true;
 controls.append(start,fire,cancel);
 const help=node("small","ranked-help",localStorage.getItem("cosmic-scrap-language")==="tr"?"WASD / ok tuşlarıyla hareket et · Ateş'e basılı tut · Rakibinden uzun yaşa":"Move with WASD / arrows · Hold Fire · Outlast your rival");
 section.append(heading,stats,statusNode,canvas,controls,help);
 const board=$("leaderboard-list")?.closest(".online-section");
 if(board){board.insertAdjacentElement("afterend",daily);daily.insertAdjacentElement("afterend",section)}
 else {panel.insertBefore(daily,$("friend-connection-title")?.closest(".online-section")||$("online-close"));daily.insertAdjacentElement("afterend",section)}
 start.addEventListener("click",startRankedQueue);
 cancel.addEventListener("click",cancelRanked);
 fire.addEventListener("pointerdown",event=>{event.preventDefault();rankedKeys.add(" ");});
 for(const type of ["pointerup","pointercancel","pointerleave"])fire.addEventListener(type,()=>rankedKeys.delete(" "));
 canvas.addEventListener("pointerdown",event=>{canvas.setPointerCapture?.(event.pointerId);rankedPointer=event.pointerId;updateRankedPointer(event,canvas)});
 canvas.addEventListener("pointermove",event=>{if(rankedPointer===event.pointerId)updateRankedPointer(event,canvas)});
 for(const type of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(type,()=>{rankedPointer=null});
 window.addEventListener("keydown",event=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"," "].includes(event.key)&&rankedMatchId){rankedKeys.add(event.key.toLowerCase());if(event.key.startsWith("Arrow")||event.key===" ")event.preventDefault()}});
 window.addEventListener("keyup",event=>rankedKeys.delete(event.key.toLowerCase()));
}
function updateRankedPointer(event,canvas){
 const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
 const mag=Math.hypot(x,y)||1;rankedPointer={dx:Math.max(-1,Math.min(1,x/mag)),dy:Math.max(-1,Math.min(1,y/mag))};
}
function rankedInput(){
 let dx=(rankedKeys.has("d")||rankedKeys.has("arrowright")?1:0)-(rankedKeys.has("a")||rankedKeys.has("arrowleft")?1:0);
 let dy=(rankedKeys.has("s")||rankedKeys.has("arrowdown")?1:0)-(rankedKeys.has("w")||rankedKeys.has("arrowup")?1:0);
 if(rankedPointer){dx=rankedPointer.dx;dy=rankedPointer.dy}
 const mag=Math.hypot(dx,dy);if(mag>1){dx/=mag;dy/=mag}
 return {dx,dy,shoot:rankedKeys.has(" ")};
}
function drawRankedArena(snapshot){
 const canvas=$("ranked-arena-canvas");if(!canvas||!snapshot)return;
 const ctx=canvas.getContext("2d");ctx.clearRect(0,0,1000,1000);
 ctx.fillStyle="#070d12";ctx.fillRect(0,0,1000,1000);
 ctx.strokeStyle="#263640";ctx.lineWidth=1;
 for(let p=50;p<1000;p+=50){ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,1000);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(1000,p);ctx.stroke()}
 for(const enemy of snapshot.enemies||[]){ctx.beginPath();ctx.arc(enemy.x,enemy.y,enemy.radius||13,0,Math.PI*2);ctx.fillStyle="#b86d45";ctx.fill();ctx.strokeStyle="#f0b47d";ctx.stroke()}
 const colors=["#69d7ed","#c08af0"];
 (snapshot.players||[]).forEach((player,index)=>{ctx.beginPath();ctx.arc(player.x,player.y,18,0,Math.PI*2);ctx.fillStyle=player.alive?colors[index]:"#4a5359";ctx.fill();ctx.strokeStyle="#f1f5f6";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold 22px system-ui";ctx.textAlign="center";ctx.fillText(index===0?"A":"B",player.x,player.y+7)});
 const myIndex=snapshot.players?.findIndex(p=>p.user_id===user?.id)??-1;
 const rival=(snapshot.players||[]).find(p=>p.user_id!==user?.id);
 const mine=snapshot.players?.[myIndex];
 $("ranked-player-stats").textContent=(localStorage.getItem("cosmic-scrap-language")==="tr"?"SEN: ":"YOU: ")+(mine?.alive?Math.ceil(mine.hp)+" HP":"ELENDİN")+" · "+(localStorage.getItem("cosmic-scrap-language")==="tr"?"RAKİP: ":"RIVAL: ")+(rival?.alive?Math.ceil(rival.hp)+" HP":"ELENDİ")+" · "+(snapshot.elapsed_ms/1000|0)+"s";
}
async function invokeRanked(action,extra={}){
 const {data,error}=await supabase.functions.invoke("online-match",{body:{action,...extra}});
 if(error)throw error;
 if(data?.error)throw new Error(data.error);
 return data;
}
async function startRankedQueue(){
 if(!user){message(localStorage.getItem("cosmic-scrap-language")==="tr"?"Ranked için ücretsiz hesabına giriş yap.":"Sign in to your free account to play Ranked.");return}
 ensureRankedArena();
 const button=$("ranked-find-button");button.disabled=true;$("ranked-cancel-button").hidden=false;
 rankedQueueActive=true;
 $("ranked-arena-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Benzer puanlı rakip aranıyor…":"Searching for a similarly rated rival…";
 try{
  const result=await invokeRanked("ranked_join");
  if(result.status==="matched"){beginRankedMatch(result);return}
  $("ranked-arena-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Kuyruktasın. Rakip bulununca otomatik başlayacak.":"Queued. The duel starts as soon as a rival is found.";
  rankedTimer=setTimeout(pollRankedQueue,1800);
 }catch(error){rankedQueueActive=false;button.disabled=false;$("ranked-cancel-button").hidden=true;$("ranked-arena-status").textContent=error.message||"Ranked matchmaking unavailable."}
}
async function pollRankedQueue(){
 if(!rankedQueueActive||rankedMatchId)return;
 try{const result=await invokeRanked("ranked_join");if(result.status==="matched"){beginRankedMatch(result);return}}
 catch(error){$("ranked-arena-status").textContent=error.message||"Matchmaking interrupted.";rankedQueueActive=false;$("ranked-find-button").disabled=false;$("ranked-cancel-button").hidden=true;return}
 rankedTimer=setTimeout(pollRankedQueue,1800);
}
function beginRankedMatch(match){
 rankedQueueActive=false;rankedMatchId=match.match_id;rankedPlayerIds=[match.player_a_id,match.player_b_id];
 $("ranked-find-button").disabled=true;
 $("ranked-arena-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Rakip bulundu. İki pilot da hazır olduğunda maç başlayacak.":"Rival found. The duel begins when both pilots are ready.";
 rankedTimer=setTimeout(tickRankedMatch,100);
}
async function tickRankedMatch(){
 if(!rankedMatchId||rankedLoopBusy)return;
 rankedLoopBusy=true;
 try{
  const snapshot=await invokeRanked("ranked_tick",{match_id:rankedMatchId,input:rankedInput()});
  if(snapshot.players){rankedSnapshot=snapshot;drawRankedArena(snapshot)}
  if(snapshot.status==="finished"||snapshot.status==="complete"){
   const matchId=rankedMatchId;rankedMatchId=null;rankedKeys.clear();rankedPointer=null;
   let result=null;
   for(let i=0;i<4;i++){const {data,error}=await supabase.from("ranked_duel_matches").select("player_a_id,player_b_id,winner_user_id,rating_delta_a,rating_delta_b,outcome").eq("id",matchId).maybeSingle();if(!error&&data){result=data;break}await new Promise(resolve=>setTimeout(resolve,500))}
   const won=result?.winner_user_id===user?.id;
   $("ranked-arena-status").textContent=result?(won?"VICTORY · +"+(result.player_a_id===user.id?result.rating_delta_a:result.rating_delta_b):result.winner_user_id?"DEFEAT · "+(result.player_a_id===user.id?result.rating_delta_a:result.rating_delta_b):"DRAW · RATING UNCHANGED"):"Match complete · rating update pending";
   $("ranked-find-button").disabled=false;$("ranked-cancel-button").hidden=true;
   await loadBoard("season");return;
  }
 }catch(error){$("ranked-arena-status").textContent=(localStorage.getItem("cosmic-scrap-language")==="tr"?"Bağlantı kesildi: ":"Connection interrupted: ")+(error.message||"network error")}
 finally{rankedLoopBusy=false}
 if(rankedMatchId)rankedTimer=setTimeout(tickRankedMatch,100);
}
async function cancelRanked(){
 if(rankedTimer)clearTimeout(rankedTimer);
 rankedQueueActive=false;
 const match=rankedMatchId;rankedMatchId=null;rankedKeys.clear();rankedPointer=null;
 try{if(match){$("ranked-arena-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Maçtan ayrıldın. Bu maç kayıp olarak sonuçlanabilir.":"You left the duel. It may count as a loss.";await invokeRanked("ranked_tick",{match_id:match,input:{dx:0,dy:0,shoot:false}})}else await invokeRanked("ranked_cancel")}
 catch{}
 if($("ranked-find-button"))$("ranked-find-button").disabled=false;
 if($("ranked-cancel-button"))$("ranked-cancel-button").hidden=true;
 if(!match&&$("ranked-arena-status"))$("ranked-arena-status").textContent=localStorage.getItem("cosmic-scrap-language")==="tr"?"Eşleştirme iptal edildi.":"Matchmaking cancelled.";
}

async function openOnline() {
  panel.hidden = false;
  ensureRankedArena();
  $("online-close").focus();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    $("online-needs-account").hidden = Boolean(user);
    await Promise.all([loadBoard(),loadRegionBoard(),loadFriends()]);
    $("ranked-find-button").disabled=!user;
    await loadDailyRewardStatus();
    if (!user) message(localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Tabloyu herkes görebilir. Skor göndermek için ücretsiz hesap aç."
      : "Everyone can view the board. Create a free account to submit scores.");
    else message(localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Hesabın bağlı. Tamamlanan oyunların en iyi skoru otomatik gönderilir."
      : "Account connected. Your best completed-run score syncs automatically.");
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
    pendingShareText = "My Cosmic Scrap record is " + Number(record.best_score).toLocaleString() +
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
    pendingShareText = "New Cosmic Scrap record: " + score.toLocaleString() + " points · level " + level +
      " · survived " + seconds + "s. Play free: " + SITE_URL;
    if (!panel.hidden) {
      message(localStorage.getItem("cosmic-scrap-language") === "tr"
        ? "Skorun ortak tabloya gönderildi."
        : "Your score was submitted to the shared leaderboard.");
      await loadBoard();
    }
  } catch (error) {
    if (!panel.hidden) message((localStorage.getItem("cosmic-scrap-language") === "tr"
      ? "Oyun tamamlandı ancak skor eşitlenemedi: "
      : "Run completed, but score sync failed: ") + (error?.message || "network error"), true);
  }
}
window.addEventListener("cosmic-scrap:open-online", openOnline);
window.addEventListener("cosmic-scrap:submit-score", submitScore);
window.addEventListener("cosmic-scrap:submit-region-capture", submitRegionCapture);
$("online-close").addEventListener("click", () => { if(rankedQueueActive||rankedMatchId)cancelRanked(); panel.hidden = true; $("online-open").focus(); });
$("online-refresh-board").addEventListener("click", () => { loadBoard(); loadRegionBoard(); loadFriends(); });
$("region-ranking-players")?.addEventListener("click",()=>loadRegionBoard("players"));
$("region-ranking-countries")?.addEventListener("click",()=>loadRegionBoard("countries"));
$("online-needs-account-button").addEventListener("click", () => {
  panel.hidden = true;
  window.dispatchEvent(new Event("cosmic-scrap:request-account"));
});
$("online-share-record").addEventListener("click", shareRecord);
$("friend-add-form")?.addEventListener("submit",async event=>{
 event.preventDefault();
 const input=$("friend-username"),statusNode=$("friend-connection-status");
 if(!user){if(statusNode)statusNode.textContent="Sign in to add friends.";return}
 const username=input?.value.trim()||"";
 if(username.length<3){if(statusNode)statusNode.textContent="Pilot name must contain at least 3 characters.";return}
 const button=$("friend-add-submit");if(button)button.disabled=true;
 try{
  const result=await callRpc("send_friend_request",{p_username:username});
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  const labels={sent:tr?"Arkadaşlık isteği gönderildi.":"Friend request sent.",pending:tr?"Bu pilota zaten istek göndermişsin.":"You already sent this request.",accepted:tr?"Artık arkadaşsınız.":"You are now friends."};
  if(statusNode)statusNode.textContent=labels[result?.status]|| (tr?"İstek işlendi.":"Request processed.");
  if(input)input.value="";
  await loadFriends();
  if(result?.status==="accepted")await loadBoard("friends");
 }catch(error){if(statusNode)statusNode.textContent=error?.message||"Could not send friend request."}
 finally{if(button)button.disabled=false}
});
$("friend-requests-list")?.addEventListener("click",async event=>{
 const button=event.target.closest("[data-accept-friend]");if(!button||!user)return;
 button.disabled=true;
 try{
  const accepted=await callRpc("accept_friend_request",{p_request_id:button.dataset.acceptFriend});
  if(!accepted)throw new Error("Friend request is no longer available.");
  await loadFriends();
  await loadBoard("friends");
 }catch(error){const statusNode=$("friend-connection-status");if(statusNode)statusNode.textContent=error?.message||"Could not accept friend request."}
 finally{button.disabled=false}
});
