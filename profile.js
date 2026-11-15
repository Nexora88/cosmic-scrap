import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { translations } from "./js/language.js";
const supabase=createClient("https://hlefwvkgrpgcnobikhaq.supabase.co","sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3");
const $=id=>document.getElementById(id);
const copy={
en:{checking:"CHECKING ACCOUNT…",signed:"ACCOUNT CONNECTED",signedOut:"SIGN IN THROUGH THE GAME TO LOAD YOUR PROFILE.",error:"Could not load profile. Check your connection and try again.",noProfile:"Pilot profile not found yet.",noFriends:"No friends yet. Add pilots from the Community Hub.",pending:"REQUEST PENDING",friend:"CREW MEMBER",noTrophies:"No trophies yet — complete runs to earn your first.",save:"Profile saved.",saveFail:"Could not save profile.",needLogin:"Sign in from the game first, then open this page again.",xp:"XP",level:"LEVEL",starter:"STARTER ROCKET",joined:"JOINED",record:"Personal record",run:"Total expeditions",kills:"Threats cleared",earned:"Earned",locked:"Not earned yet",runs:"RUNS",score:"SCORE",scrap:"SCRAP"},
tr:{checking:"HESAP KONTROL EDİLİYOR…",signed:"HESAP BAĞLANDI",signedOut:"PROFİLİNİ YÜKLEMEK İÇİN OYUNDAN GİRİŞ YAP.",error:"Profil yüklenemedi. Bağlantını kontrol edip tekrar dene.",noProfile:"Pilot profili henüz bulunamadı.",noFriends:"Henüz arkadaş yok. Topluluk Merkezinden pilot ekle.",pending:"İSTEK BEKLİYOR",friend:"EKİP ARKADAŞI",noTrophies:"Henüz kupa yok — ilk kupan için oyunları tamamla.",save:"Profil kaydedildi.",saveFail:"Profil kaydedilemedi.",needLogin:"Önce oyundan giriş yap, sonra bu sayfayı yeniden aç.",xp:"XP",level:"SEVİYE",starter:"BAŞLANGIÇ ROKETİ",joined:"KATILDI",record:"Kişisel rekor",run:"Toplam sefer",kills:"Temizlenen tehditler",earned:"Kazanıldı",locked:"Henüz kazanılmadı",runs:"KOŞULAR",score:"SKOR",scrap:"HURDA"}
};
const achievementMeta=[
["first-signal","✦",{en:"First Signal",tr:"İlk Sinyal",enDesc:"Complete your first run",trDesc:"İlk oyununu tamamla"}],
["scavenger","◇",{en:"Void Scavenger",tr:"Boşluk Toplayıcısı",enDesc:"Collect scrap and survive",trDesc:"Hurda topla ve hayatta kal"}],
["storm-veteran","ϟ",{en:"Storm Veteran",tr:"Fırtına Gazisi",enDesc:"Survive the cosmic storm",trDesc:"Kozmik fırtınadan sağ çık"}],
["elite-breaker","✹",{en:"Elite Breaker",tr:"Elit Avcısı",enDesc:"Defeat an elite threat",trDesc:"Bir elit tehdidi yen"}],
["void-walker","◉",{en:"Void Walker",tr:"Boşluk Gezgini",enDesc:"Explore the endless void",trDesc:"Sonsuz boşluğu keşfet"}],
["combo-architect","⌁",{en:"Combo Architect",tr:"Kombo Mimarı",enDesc:"Build a powerful combo",trDesc:"Güçlü bir kombo kur"}]
];
const badgeMeta=[
 ["signal-streak-7","✦","SIGNAL STREAK I","Earn 7 consecutive daily rewards."],
 ["signal-streak-30","✧","SIGNAL VETERAN","Earn 30 consecutive daily rewards."]
];
const avatarNames={"core-blue":"Nebula","core-mint":"Photon","core-violet":"Rift","core-amber":"Solar"};
const rocketNames={starter:"Starter",comet:"Comet",wraith:"Wraith",nova:"Nova"};
const LOCALES=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
function language(){const saved=localStorage.getItem("cosmic-scrap-language")||"en";return LOCALES.includes(saved)?saved:"en"}
function localized(source,lang=language()){return (translations[lang]||{})[source]||source}
function copyFor(lang){if(lang==="tr")return copy.tr;return Object.fromEntries(Object.entries(copy.en).map(([key,value])=>[key,localized(value,lang)]))}
function setLanguage(lang){if(!LOCALES.includes(lang))lang="en";localStorage.setItem("cosmic-scrap-language",lang);document.documentElement.lang=lang;document.querySelectorAll("[data-en][data-tr]").forEach(el=>{if(el.matches("input,textarea"))return;const source=el.dataset.en||el.textContent;el.textContent=lang==="tr"?el.dataset.tr:localized(source,lang)});$("language-toggle").textContent=lang.toUpperCase()+" ↻";renderTrophies(window.profileAchievements||[]);renderStats(window.profileProgress||{});renderFriends(window.profileFriends||[]);renderRuns(window.profileProgress?.recent_runs||[]);renderDailyRewards(window.profileDailyRewards||null);renderBadges(window.profileBadges||[]);const f=$("profile-form");if(f){$("username").placeholder=lang==="tr"?"Pilot adını yaz":localized("Choose a pilot name",lang)}}
$("language-toggle").addEventListener("click",()=>{const current=language(),index=LOCALES.indexOf(current);setLanguage(LOCALES[(index+1)%LOCALES.length])});
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function number(v){return (Number(v)||0).toLocaleString(language()==="tr"?"tr-TR":"en-US")}
function renderTrophies(earned){const lang=language(),words=copyFor(lang),list=$("trophy-shelf");list.replaceChildren();const ids=new Set(Array.isArray(earned)?earned:[]);$("trophy-count").textContent=String(ids.size);$("trophy-subtitle").textContent=ids.size+" / "+achievementMeta.length;achievementMeta.forEach(([id,icon,labels])=>{const card=node("article","trophy"+(ids.has(id)?" earned":""));card.append(node("span","trophy-icon",icon),node("strong","",lang==="tr"?labels.tr:localized(labels.en,lang)),node("small","",ids.has(id)?words.earned+" · "+(lang==="tr"?labels.trDesc:localized(labels.enDesc,lang)):words.locked));list.append(card)});if(!ids.size){const note=node("p","empty",copyFor(lang).noTrophies);list.prepend(note)}}
function renderDailyRewards(status){
 const value=status||{};
 const streak=Math.max(0,Number(value.current_streak)||0);
 const best=Math.max(0,Number(value.best_streak)||0);
 const points=Math.max(0,Number(value.reward_points)||0);
 $("daily-current-streak").textContent=number(streak);
 $("daily-best-streak").textContent=number(best);
 $("daily-signal-points").textContent=number(points);
 $("daily-claim-state").textContent=localized(value.claimed_today?"CLAIMED TODAY":"NOT CLAIMED TODAY");
 $("daily-reward-note").textContent=status
  ? localized("Signal Points are account-bound and can be spent on future event cosmetics.")
  : localized("Daily reward status unavailable.");
}
function renderBadges(earned){
 const lang=language(),ids=new Map((Array.isArray(earned)?earned:[]).map(item=>[item.badge_id,item]));
 const list=$("badge-shelf");list.replaceChildren();
 badgeMeta.forEach(([id,icon,name,description])=>{
  const record=ids.get(id),card=node("article","badge-card"+(record?" earned":""));
  card.append(node("span","badge-icon",icon),node("strong","",localized(name)),node("small","",record
   ? localized("Earned")+" · "+(record.earned_at?new Date(record.earned_at).toLocaleDateString(lang==="tr"?"tr-TR":"en-US"):"")
   : localized(description)));
  list.append(card);
 });
 if(!ids.size)list.prepend(node("p","empty",localized("No badges earned yet.")));
}
function renderStats(p){const lang=language(),words=copyFor(lang);$("best-score").textContent=number(p.best_score);$("runs").textContent=number(p.total_runs);$("kills").textContent=number(p.total_kills);$("best-level").textContent=number(p.best_level||1);const seconds=Math.max(0,Number(p.total_playtime_seconds)||0);$("playtime").textContent=Math.floor(seconds/3600)+"h "+Math.floor((seconds%3600)/60)+"m";const xp=Number(p.xp)||0,level=Math.max(1,Number(p.level)||1),within=xp%100;$("pilot-level").textContent=words.level+" "+level;$("xp-text").textContent=number(xp)+" "+words.xp;$("xp-fill").style.width=Math.min(100,within)+"%"}
function avatarView(profile){const el=$("pilot-avatar");el.replaceChildren();if(profile.avatar_path){const img=node("img","", "");img.alt=profile.username+" profile avatar";img.src=supabase.storage.from("player-avatars").getPublicUrl(profile.avatar_path).data.publicUrl;el.append(img)}else el.textContent="■";el.dataset.style=profile.avatar_id==="ataturk"?"core-blue":(profile.avatar_id||"core-blue")}
function renderFriends(){/* Friend lists are intentionally not part of the solo-first profile. */}
function renderRuns(runs){const list=$("recent-runs"),lang=language(),words=copyFor(lang);list.replaceChildren();if(!Array.isArray(runs)||!runs.length){list.append(node("p","empty",lang==="tr"?"Henüz eşitlenmiş koşu yok.":localized("No synced runs yet.",lang)));return}runs.slice(0,5).forEach(run=>{const row=node("div","run-row"),date=run.ended_at||run.created_at||run.date;const d=date?new Date(date).toLocaleDateString(lang==="tr"?"tr-TR":"en-US"):"—";row.append(node("strong","",d),node("span","",words.score+" "+number(run.score)),node("small","",words.scrap+" "+number(run.scrap)));list.append(row)})}
async function loadDailyRewardsAndBadges(){
 const [dailyResult,badgeResult]=await Promise.allSettled([
  supabase.rpc("get_daily_reward_status"),
  supabase.rpc("get_player_badges")
 ]);
 const dailyData=dailyResult.status==="fulfilled"&&!dailyResult.value.error?dailyResult.value.data:null;
 const badgeData=badgeResult.status==="fulfilled"&&!badgeResult.value.error?badgeResult.value.data:[];
 window.profileDailyRewards=Array.isArray(dailyData)?dailyData[0]||null:dailyData;
 window.profileBadges=Array.isArray(badgeData)?badgeData:[];
 renderDailyRewards(window.profileDailyRewards);
 renderBadges(window.profileBadges);
}
let currentUser=null,currentProfile=null;
async function load(){const lang=language(),words=copyFor(lang);$("connection").textContent=words.checking;const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError||!session){$("connection").textContent=copyFor(lang).signedOut;$("connection").classList.add("error");$("pilot-name").textContent="GUEST PILOT";$("pilot-handle").textContent=copyFor(lang).needLogin;$("form-status").textContent=copyFor(lang).needLogin;$("edit-toggle").disabled=true;return}currentUser=session.user;
try{const [{data:profile,error:profileError},{data:progress,error:progressError}]=await Promise.all([supabase.from("player_profiles").select("user_id,username,avatar_id,rocket_id,avatar_path,trophies,created_at").eq("user_id",currentUser.id).maybeSingle(),supabase.from("player_game_progress").select("xp,level,total_runs,best_score,best_level,total_playtime_seconds,total_kills,total_scrap,achievements,recent_runs").eq("user_id",currentUser.id).maybeSingle()]);if(profileError)throw profileError;if(progressError)throw progressError;if(!profile){$("connection").textContent=copyFor(lang).noProfile;$("connection").classList.add("error");return}currentProfile=profile;const p=progress||{};window.profileProgress=p;window.profileAchievements=Array.isArray(p.achievements)?p.achievements:[];$("connection").textContent=copyFor(lang).signed;$("connection").classList.remove("error");$("pilot-name").textContent=profile.username||"PILOT";$("pilot-handle").textContent="@"+String(profile.username||"pilot").toLowerCase().replace(/[^a-z0-9_]/g,"_");$("pilot-rocket").textContent=(rocketNames[profile.rocket_id]||rocketNames.starter).toUpperCase()+" ROCKET";$("pilot-joined").textContent=copyFor(lang).joined+" "+(profile.created_at?new Date(profile.created_at).toLocaleDateString(lang==="tr"?"tr-TR":"en-US",{month:"short",year:"numeric"}):"—");$("username").value=profile.username||"";$("avatar").value=profile.avatar_id==="ataturk"?"core-blue":(profile.avatar_id||"core-blue");$("rocket").value=profile.rocket_id||"starter";avatarView(profile);renderStats(p);renderTrophies(window.profileAchievements);renderRuns(p.recent_runs||[]);await loadDailyRewardsAndBadges();
window.profileFriends=[];applyCosmeticLocks(Number(p.level)||1);
}catch(error){$("connection").textContent=copyFor(lang).error;$("connection").classList.add("error");console.error("Profile load failed",error)}}
function applyCosmeticLocks(level){document.querySelectorAll("#avatar option[data-level],#rocket option[data-level]").forEach(o=>{const required=Number(o.dataset.level)||1;o.disabled=level<required})}
$("edit-toggle").addEventListener("click",()=>{$("edit-panel").hidden=!$("edit-panel").hidden;if(!$("edit-panel").hidden)$("edit-panel").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})});
$("profile-form").addEventListener("submit",async e=>{e.preventDefault();if(!currentUser||!currentProfile)return;const lang=language(),username=$("username").value.trim(),avatar_id=$("avatar").value,rocket_id=$("rocket").value;const status=$("form-status");status.textContent="…";try{const {error}=await supabase.from("player_profiles").update({username,avatar_id,rocket_id}).eq("user_id",currentUser.id);if(error)throw error;currentProfile={...currentProfile,username,avatar_id,rocket_id};$("pilot-name").textContent=username;$("pilot-handle").textContent="@"+username.toLowerCase().replace(/[^a-z0-9_]/g,"_");$("pilot-rocket").textContent=(rocketNames[rocket_id]||rocketNames.starter).toUpperCase()+" ROCKET";avatarView(currentProfile);status.textContent=copyFor(lang).save}catch(error){status.textContent=copyFor(lang).saveFail+": "+(error.message||"");status.classList.add("error")}});
setLanguage(language());load();
