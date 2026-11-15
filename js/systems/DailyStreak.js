const KEY="cosmic-scrap-daily-streak";
const LOCALE_COPY={
 en:{day:"DAILY STREAK",core:"Scrap Core",box:"Signal Capsule",claimed:"Daily reward claimed",again:"Already claimed today",streak:"day streak"},
 tr:{day:"GÜNLÜK SERİ",core:"Hurda Çekirdeği",box:"Sinyal Kapsülü",claimed:"Günlük ödül alındı",again:"Bugünün ödülü zaten alındı",streak:"günlük seri"},
 "pt-BR":{day:"SEQUÊNCIA DIÁRIA",core:"Núcleo de Sucata",box:"Cápsula de Sinal",claimed:"Recompensa diária recebida",again:"Você já recebeu a recompensa de hoje",streak:"dias seguidos"},
 es:{day:"RACHA DIARIA",core:"Núcleo de Chatarra",box:"Cápsula de Señal",claimed:"Recompensa diaria obtenida",again:"Ya reclamaste la recompensa de hoy",streak:"días seguidos"},
 ru:{day:"ЕЖЕДНЕВНАЯ СЕРИЯ",core:"Ядро лома",box:"Сигнальная капсула",claimed:"Ежедневная награда получена",again:"Награда за сегодня уже получена",streak:"дней подряд"},
 id:{day:"STREAK HARIAN",core:"Inti Rongsokan",box:"Kapsul Sinyal",claimed:"Hadiah harian diterima",again:"Hadiah hari ini sudah diambil",streak:"hari berturut-turut"},
 de:{day:"TÄGLICHE SERIE",core:"Schrottkern",box:"Signalkapsel",claimed:"Tagesbelohnung erhalten",again:"Heutige Belohnung bereits abgeholt",streak:"Tage in Folge"},
 fr:{day:"SÉRIE QUOTIDIENNE",core:"Noyau de ferraille",box:"Capsule de signal",claimed:"Récompense quotidienne obtenue",again:"Récompense du jour déjà récupérée",streak:"jours consécutifs"},
 ja:{day:"デイリーストリーク",core:"スクラップコア",box:"シグナルカプセル",claimed:"デイリー報酬を獲得",again:"今日の報酬は受け取り済み",streak:"日連続"}
};
const dateKey=date=>{const d=date instanceof Date?date:new Date(date);return [d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,"0"),String(d.getUTCDate()).padStart(2,"0")].join("-")};
const dayNumber=key=>{const [y,m,d]=key.split("-").map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000)};
export function claimDailyStreak(profile,storage=globalThis.localStorage,now=new Date()){
 if(!profile||!storage)return null;
 const today=dateKey(now);let saved={};try{saved=JSON.parse(storage.getItem(KEY)||"{}")||{}}catch{}
 if(saved.lastDate===today)return {claimed:false,streak:Math.max(1,Number(saved.streak)||1)};
 const previous=typeof saved.lastDate==="string"?dayNumber(saved.lastDate):0;
 const gap=previous?dayNumber(today)-previous:0;
 const streak=gap===1?Math.max(0,Number(saved.streak)||0)+1:1;
 const cycle=((streak-1)%4)+1;
 const coreReward=cycle===1?50:cycle===2?100:cycle===3?150:0;
 if(coreReward)profile.scrapCore=Math.max(0,Number(profile.scrapCore)||0)+coreReward;
 try{storage.setItem(KEY,JSON.stringify({lastDate:today,streak}))}catch{}
 if(cycle===4&&typeof window!=="undefined")window.dispatchEvent(new CustomEvent("cosmic-scrap:daily-capsule-earned"));
 return {claimed:true,streak,coreReward,capsuleReward:cycle===4};
}
const SERVER_COPY={
 en:{day:"DAILY REWARD",streak:"day streak",points:"Signal Points",badge:"BADGE UNLOCKED",badges:{"signal-streak-7":"Signal Streak I","signal-streak-30":"Signal Veteran"}},
 tr:{day:"GÜNLÜK ÖDÜL",streak:"günlük seri",points:"Sinyal Puanı",badge:"ROZET AÇILDI",badges:{"signal-streak-7":"Sinyal Serisi I","signal-streak-30":"Sinyal Gazisi"}},
 "pt-BR":{day:"RECOMPENSA DIÁRIA",streak:"dias seguidos",points:"Pontos de Sinal",badge:"DISTINTIVO DESBLOQUEADO",badges:{"signal-streak-7":"Sequência de Sinal I","signal-streak-30":"Veterano do Sinal"}},
 es:{day:"RECOMPENSA DIARIA",streak:"días seguidos",points:"Puntos de Señal",badge:"INSIGNIA DESBLOQUEADA",badges:{"signal-streak-7":"Racha de Señal I","signal-streak-30":"Veterano de Señal"}},
 ru:{day:"ЕЖЕДНЕВНАЯ НАГРАДА",streak:"дней подряд",points:"Очки сигнала",badge:"ЗНАЧОК ОТКРЫТ",badges:{"signal-streak-7":"Серия сигналов I","signal-streak-30":"Ветеран сигнала"}},
 id:{day:"HADIAH HARIAN",streak:"hari berturut-turut",points:"Poin Sinyal",badge:"LENCANA TERBUKA",badges:{"signal-streak-7":"Rangkaian Sinyal I","signal-streak-30":"Veteran Sinyal"}},
 de:{day:"TAGESBELOHNUNG",streak:"Tage in Folge",points:"Signalpunkte",badge:"ABZEICHEN FREIGESCHALTET",badges:{"signal-streak-7":"Signalserie I","signal-streak-30":"Signalveteran"}},
 fr:{day:"RÉCOMPENSE QUOTIDIENNE",streak:"jours consécutifs",points:"Points de signal",badge:"BADGE DÉBLOQUÉ",badges:{"signal-streak-7":"Série de signaux I","signal-streak-30":"Vétéran du signal"}},
 ja:{day:"デイリー報酬",streak:"日連続",points:"シグナルポイント",badge:"バッジ獲得",badges:{"signal-streak-7":"シグナル連続 I","signal-streak-30":"シグナルベテラン"}}
};
export function serverDailyRewardMessage(result,language="en"){
 if(!result||result.status!=="claimed")return "";
 const copy=SERVER_COPY[language]||SERVER_COPY.en;
 const parts=[copy.day,result.current_streak+" "+copy.streak,"+"+(Number(result.earned_points)||0)+" "+copy.points];
 const earned=Array.isArray(result.badge_awarded)?result.badge_awarded:[];
 for(const id of earned){const name=copy.badges[id];if(name)parts.push(copy.badge+": "+name)}
 return parts.join(" · ");
}
export function dailyStreakMessage(result,language="en"){
 const copy=LOCALE_COPY[language]||LOCALE_COPY.en;
 if(!result)return "";
 if(!result.claimed)return copy.again;
 const reward=result.capsuleReward?copy.box:result.coreReward+" "+copy.core;
 return copy.day+" · "+result.streak+" "+copy.streak+" · "+reward;
}
