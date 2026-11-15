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
const dateKey=date=>{const d=date instanceof Date?date:new Date(date);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
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
export function dailyStreakMessage(result,language="en"){
 const copy=LOCALE_COPY[language]||LOCALE_COPY.en;
 if(!result)return "";
 if(!result.claimed)return copy.again;
 const reward=result.capsuleReward?copy.box:result.coreReward+" "+copy.core;
 return copy.day+" · "+result.streak+" "+copy.streak+" · "+reward;
}
