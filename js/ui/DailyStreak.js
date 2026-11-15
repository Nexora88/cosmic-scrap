const KEY="taviro-daily-streak-v1";
const CAPSULE_KEY="cosmic-scrap-capsules";
const COPY={
en:{title:"DAILY FLIGHT LOG",claim:"CLAIM TODAY'S REWARD",claimed:"TODAY'S REWARD CLAIMED",day:"STREAK DAY",xp:"CAREER XP",capsule:"SIGNAL CAPSULE",missed:"A missed day resets the streak.",next:"NEXT REWARD"},
tr:{title:"GÜNLÜK UÇUŞ KAYDI",claim:"BUGÜNÜN ÖDÜLÜNÜ AL",claimed:"BUGÜNÜN ÖDÜLÜ ALINDI",day:"SERİ GÜNÜ",xp:"KARİYER XP",capsule:"SİNYAL KAPSÜLÜ",missed:"Bir gün kaçırılırsa seri sıfırlanır.",next:"SONRAKİ ÖDÜL"},
"pt-BR":{title:"REGISTRO DIÁRIO DE VOO",claim:"RESGATAR RECOMPENSA DE HOJE",claimed:"RECOMPENSA DE HOJE RESGATADA",day:"DIA DA SEQUÊNCIA",xp:"XP DE CARREIRA",capsule:"CÁPSULA DE SINAL",missed:"Um dia perdido reinicia a sequência.",next:"PRÓXIMA RECOMPENSA"},
es:{title:"REGISTRO DIARIO DE VUELO",claim:"RECLAMAR RECOMPENSA DE HOY",claimed:"RECOMPENSA DE HOY RECLAMADA",day:"DÍA DE RACHA",xp:"XP DE CARRERA",capsule:"CÁPSULA DE SEÑAL",missed:"Un día sin entrar reinicia la racha.",next:"SIGUIENTE RECOMPENSA"},
ru:{title:"ЕЖЕДНЕВНЫЙ ЖУРНАЛ ПОЛЁТОВ",claim:"ЗАБРАТЬ НАГРАДУ ЗА СЕГОДНЯ",claimed:"НАГРАДА ЗА СЕГОДНЯ ПОЛУЧЕНА",day:"ДЕНЬ СЕРИИ",xp:"ОПЫТ КАРЬЕРЫ",capsule:"СИГНАЛЬНАЯ КАПСУЛА",missed:"Пропуск дня сбрасывает серию.",next:"СЛЕДУЮЩАЯ НАГРАДА"},
id:{title:"LOG PENERBANGAN HARIAN",claim:"AMBIL HADIAH HARI INI",claimed:"HADIAH HARI INI DIAMBIL",day:"HARI BERUNTUN",xp:"XP KARIER",capsule:"KAPSUL SINYAL",missed:"Melewatkan satu hari akan mengatur ulang streak.",next:"HADIAH BERIKUTNYA"},
de:{title:"TÄGLICHES FLUGPROTOKOLL",claim:"HEUTIGE BELOHNUNG ABHOLEN",claimed:"HEUTIGE BELOHNUNG ABGEHOLT",day:"SERIEN-TAG",xp:"KARRIERE-XP",capsule:"SIGNALKAPSEL",missed:"Ein verpasster Tag setzt die Serie zurück.",next:"NÄCHSTE BELOHNUNG"},
fr:{title:"JOURNAL DE VOL QUOTIDIEN",claim:"RÉCUPÉRER LA RÉCOMPENSE DU JOUR",claimed:"RÉCOMPENSE DU JOUR RÉCUPÉRÉE",day:"JOUR DE SÉRIE",xp:"XP DE CARRIÈRE",capsule:"CAPSULE SIGNAL",missed:"Un jour manqué réinitialise la série.",next:"PROCHAINE RÉCOMPENSE"},
ja:{title:"デイリー飛行ログ",claim:"今日の報酬を受け取る",claimed:"今日の報酬を受け取り済み",day:"連続ログイン日数",xp:"キャリアXP",capsule:"シグナルカプセル",missed:"1日逃すと連続記録がリセットされます。",next:"次の報酬"}
};
const today=()=>new Date().toISOString().slice(0,10);
const dayDiff=(a,b)=>Math.round((Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function write(value){try{localStorage.setItem(KEY,JSON.stringify(value))}catch{}}
function language(){const value=localStorage.getItem("cosmic-scrap-language")||"en";return COPY[value]?value:"en"}
function levelForCareerXp(total){let level=1,need=100,xp=Math.max(0,Number(total)||0);while(xp>=need&&level<999){xp-=need;level++;need=Math.floor(need*1.35)}return level}
export function initDailyStreak(profile,save,onRefresh=()=>{}){
 const panel=document.getElementById("panel");if(!panel||document.getElementById("taviro-daily-streak"))return;
 const card=document.createElement("section");card.id="taviro-daily-streak";card.style.cssText="margin:14px 0;padding:14px;border:1px solid #35dfff55;border-radius:11px;background:linear-gradient(130deg,#0c1d2b,#080d15);text-align:left;box-shadow:inset 0 0 22px #35dfff0b";
 const title=document.createElement("strong");title.style.cssText="display:block;color:#9defff;font-size:10px;letter-spacing:.16em";
 const summary=document.createElement("p");summary.style.cssText="margin:9px 0;color:#dcebf7;font-size:11px;line-height:1.6";
 const progress=document.createElement("div");progress.style.cssText="display:flex;gap:6px;margin:10px 0";
 const button=document.createElement("button");button.type="button";button.style.cssText="width:100%;min-height:40px;border:1px solid #35dfff88;border-radius:8px;background:#102b3b;color:#e8fbff;font-weight:900;font-size:10px;letter-spacing:.08em;cursor:pointer";
 const note=document.createElement("small");note.style.cssText="display:block;margin-top:8px;color:#849bad;font-size:9px";
 card.append(title,summary,progress,button,note);
 const footer=panel.querySelector(".menu-footer");if(footer)footer.insertAdjacentElement("beforebegin",card);else panel.append(card);
 const render=()=>{
  const c=COPY[language()],state=read(),date=today(),gap=state.lastClaimDate?dayDiff(state.lastClaimDate,date):99;
  const streak=gap===0?Math.max(1,state.streak||1):gap===1?Math.max(1,(state.streak||0)+1):1;
  const claimed=state.lastClaimDate===date;
  title.textContent=c.title;
  summary.textContent=c.day+" "+streak+" / 4  ·  "+c.next+": "+(streak===4?c.capsule:"+"+([50,100,150][(streak-1)%3])+" "+c.xp);
  progress.replaceChildren();
  for(let i=1;i<=4;i++){const dot=document.createElement("span");dot.textContent=i===4?"✦":String(i);dot.style.cssText="flex:1;padding:7px 3px;text-align:center;border:1px solid "+(i<=streak?"#35dfff":"#263747")+";border-radius:6px;background:"+(i<=streak?"#123447":"#080e15")+";color:"+(i<=streak?"#9defff":"#718397")+";font-size:10px;font-weight:900";progress.append(dot)}
  button.disabled=claimed;button.textContent=claimed?c.claimed:c.claim;button.style.opacity=claimed?".55":"1";
  note.textContent=c.missed;
  button.onclick=()=>{
   const current=read(),now=today(),delta=current.lastClaimDate?dayDiff(current.lastClaimDate,now):99;
   if(delta===0)return;
   const currentStreak=delta===1?Math.max(1,(current.streak||0)+1):1;
   const reward=[50,100,150,200][(currentStreak-1)%4];
   profile.careerXp=(profile.careerXp||0)+reward;profile.careerLevel=levelForCareerXp(profile.careerXp);
   if(currentStreak%4===0){let count=Math.max(0,Number(localStorage.getItem(CAPSULE_KEY))||0);try{localStorage.setItem(CAPSULE_KEY,String(count+1))}catch{}}
   write({streak:currentStreak,lastClaimDate:now,totalClaims:(current.totalClaims||0)+1});
   save(profile);onRefresh(profile);render();
   window.dispatchEvent(new Event("cosmic-scrap:daily-reward-claimed"));
  };
 };
 render();window.addEventListener("cosmic-scrap:language-changed",render);
}
