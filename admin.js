import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $ = id => document.getElementById(id);
let currentUser = null;
const reasonLabels = {harassment:"Taciz / zorbalık",hate:"Nefret söylemi",profanity:"Küfür",spam:"Spam",cheating:"Hile şüphesi",inappropriate_name:"Uygunsuz kullanıcı adı",other:"Diğer"};
const statusLabels = {open:"Yeni",reviewing:"İnceleniyor",actioned:"İşlem uygulandı",dismissed:"Reddedildi"};
function setStatus(text,error=false){$("auth-status").textContent=text;$("auth-status").classList.toggle("error",error)}
function setQueueStatus(text,error=false){$("queue-status").textContent=text;$("queue-status").classList.toggle("error",error)}
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e}
function showLoggedOut(){currentUser=null;$("auth-card").hidden=false;$("dashboard").hidden=true;$("claim-box").hidden=true}
function showClaim(user){$("claim-box").hidden=false;$("user-id").textContent=user.id;$("copy-id").onclick=async()=>{try{await navigator.clipboard.writeText(user.id);setStatus("Hesap kimliği kopyalandı.")}catch{setStatus("Hesap kimliği: "+user.id)}}}
async function enterDashboard(session){
  currentUser=session?.user||null;
  if(!currentUser){showLoggedOut();return}
  $("auth-card").hidden=false;$("dashboard").hidden=true;$("claim-box").hidden=true;
  setStatus("Yetki kontrol ediliyor…");
  const {data:mod,error}=await supabase.from("player_moderation").select("is_moderator,status").eq("user_id",currentUser.id).maybeSingle();
  if(error)throw error;
  if(!mod?.is_moderator||mod.status!=="active"){setStatus("Bu hesap için moderatör yetkisi bulunamadı.",true);showClaim(currentUser);return}
  $("auth-card").hidden=true;$("dashboard").hidden=false;$("whoami").textContent="Yetkili oturum: "+(currentUser.email||currentUser.id);
  await loadReports();
}
async function loadReports(){
  $("report-list").replaceChildren();
  setQueueStatus("Şikâyet kuyruğu güvenli RPC üzerinden yükleniyor…");
  try{
    const {data,error}=await supabase.rpc("get_moderation_reports",{p_status:$("status-filter").value,p_limit:Number($("limit-filter").value)});
    if(error)throw error;
    const reports=Array.isArray(data)?data:[];
    if(!reports.length){$("report-list").append(element("div","empty","Bu filtrede şikâyet yok. Yeni şikâyet geldiğinde yenile."));setQueueStatus("Kuyruk güncel · 0 kayıt.");return}
    reports.forEach(report=>$("report-list").append(renderReport(report)));
    setQueueStatus(reports.length+" şikâyet listelendi. Karar vermeden önce ayrıntıları incele.");
  }catch(error){setQueueStatus(error.message||"Şikâyetler yüklenemedi.",true)}
}
function renderReport(r){
  const card=element("article","report-card");
  const top=element("div","report-top"),left=element("div","");
  left.append(element("div","report-id","REPORT · "+r.id),element("div","report-title",(r.reporter_username||"Silinmiş/anonim oyuncu")+" → "+(r.target_username||"Oyuncu")));
  left.append(element("span","reason",reasonLabels[r.reason]||r.reason));
  const state=element("span","reason",statusLabels[r.status]||r.status);top.append(left,state);card.append(top);
  const date=r.created_at?new Date(r.created_at).toLocaleString():"—";
  const meta=element("div","report-meta");
  meta.append(element("span","","Gönderildi: "+date),element("span","","Bildiren ID: "+r.reporter_user_id),element("span","","Hedef ID: "+r.target_user_id));
  if(r.room_id)meta.append(element("span","","Oda: "+r.room_id));
  card.append(meta,element("div","report-details",r.details||"Ek açıklama eklenmemiş."));
  if(r.moderator_note)card.append(element("p","muted","Önceki moderatör notu: "+r.moderator_note));
  const actions=element("div","report-actions");
  const statusLabel=element("label","","ŞİKÂYET DURUMU"),statusSelect=document.createElement("select");
  Object.entries(statusLabels).forEach(([v,label])=>{const o=document.createElement("option");o.value=v;o.textContent=label;statusSelect.append(o)});statusSelect.value=r.status;statusLabel.append(statusSelect);
  const actionLabel=element("label","","HESAP İŞLEMİ"),actionSelect=document.createElement("select");
  [["none","İşlem yok"],["temp_ban","Geçici uzaklaştır"],["perma_ban","Kalıcı uzaklaştır"],["unban","Uzaklaştırmayı kaldır"]].forEach(([v,label])=>{const o=document.createElement("option");o.value=v;o.textContent=label;actionSelect.append(o)});actionLabel.append(actionSelect);
  const durationLabel=element("label","","SÜRE (SAAT)"),duration=document.createElement("select");
  [[1,"1 saat"],[24,"24 saat"],[72,"3 gün"],[168,"7 gün"],[720,"30 gün"]].forEach(([v,label])=>{const o=document.createElement("option");o.value=v;o.textContent=label;duration.append(o)});duration.value="24";durationLabel.append(duration);
  actionSelect.addEventListener("change",()=>{durationLabel.hidden=actionSelect.value!=="temp_ban";if(actionSelect.value!=="none")statusSelect.value="actioned"});durationLabel.hidden=true;
  const noteLabel=element("label","note","MODERATÖR NOTU / GEREKÇE"),note=document.createElement("textarea");note.maxLength=1000;note.placeholder="Kanıt ve bağlamı kısaca kaydet. Kalıcı yaptırımda özellikle dikkatli ol.";note.value=r.moderator_note||"";noteLabel.append(note);
  const saveWrap=element("div","report-save"),save=element("button","primary","İNCELEMEYİ KAYDET");save.type="button";
  save.addEventListener("click",async()=>{save.disabled=true;save.textContent="KAYDEDİLİYOR…";try{const {error}=await supabase.rpc("review_player_report",{p_report_id:r.id,p_status:statusSelect.value,p_note:note.value.trim(),p_action:actionSelect.value,p_duration_hours:actionSelect.value==="temp_ban"?Number(duration.value):null});if(error)throw error;setQueueStatus("İnceleme kaydedildi: "+r.id);await loadReports()}catch(error){setQueueStatus(error.message||"İnceleme kaydedilemedi.",true);save.disabled=false;save.textContent="TEKRAR DENE"}});
  saveWrap.append(save);actions.append(statusLabel,actionLabel,durationLabel,noteLabel,saveWrap);card.append(actions);
  return card;
}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();setStatus("Giriş yapılıyor…");const {data,error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){setStatus(error.message,true);return}try{await enterDashboard(data.session)}catch(err){setStatus(err.message||"Oturum doğrulanamadı.",true)}});
$("refresh").addEventListener("click",loadReports);$("status-filter").addEventListener("change",loadReports);$("limit-filter").addEventListener("change",loadReports);
$("sign-out").addEventListener("click",async()=>{const {error}=await supabase.auth.signOut();if(error){setQueueStatus(error.message,true);return}showLoggedOut();setStatus("Güvenli oturum kapatıldı.")});
supabase.auth.getSession().then(async({data,error})=>{if(error){setStatus(error.message,true);return}if(data.session){try{await enterDashboard(data.session)}catch(err){setStatus(err.message||"Oturum açılamadı.",true)}}});
supabase.auth.onAuthStateChange((_event,session)=>{queueMicrotask(()=>{if(!session)showLoggedOut()})});
