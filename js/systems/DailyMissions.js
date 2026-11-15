const DAILY_POOL = [
  { id: "survive-120", metric: "survivalSeconds", target: 120, reward: 35 },
  { id: "scrap-120", metric: "scrapCollected", target: 120, reward: 35 },
  { id: "score-2500", metric: "score", target: 2500, reward: 40 },
  { id: "level-5", metric: "maxLevel", target: 5, reward: 45 },
  { id: "runs-2", metric: "runs", target: 2, reward: 40 }
];
const WEEKLY_POOL = [
  { id: "weekly-runs-8", metric: "runs", target: 8, reward: 120 },
  { id: "weekly-scrap-700", metric: "scrapCollected", target: 700, reward: 140 },
  { id: "weekly-score-12000", metric: "score", target: 12000, reward: 150 },
  { id: "weekly-survive-1200", metric: "survivalSeconds", target: 1200, reward: 180 }
];
const LOCALES = ["en", "tr", "pt-BR", "es", "ru", "id", "de", "fr", "ja"];
const CORE_LABELS = {
  en:"Scrap Core",tr:"Hurda Çekirdeği","pt-BR":"Núcleo de Sucata",es:"Núcleo de Chatarra",
  ru:"Ядро лома",id:"Inti Rongsokan",de:"Schrottkern",fr:"Noyau de ferraille",ja:"スクラップコア"
};
const COPY = {
  en: { daily:"DAILY MISSIONS", weekly:"WEEKLY MISSIONS", reset:"Progress resets on the UTC schedule", claim:"CLAIM", claimed:"CLAIMED", reward:"REWARD", complete:"Complete", progress:"Progress", empty:"Finish runs to make progress.", done:"Mission reward added to your Scrap Core.", locked:"Complete the objective to claim this reward.", names:{"survive-120":"Stay in the void","scrap-120":"Salvage collector","runs-2":"Two expeditions","weekly-runs-8":"Regular pilot","weekly-scrap-700":"Master salvager",}, desc:{"survive-120":"Survive for 120 seconds in total.","scrap-120":"Collect 120 scrap across your runs.","runs-2":"Complete two runs.","weekly-runs-8":"Complete eight runs this week.","weekly-scrap-700":"Collect 700 scrap this week.",} },
  tr: { daily:"GÜNLÜK GÖREVLER", weekly:"HAFTALIK GÖREVLER", reset:"İlerleme UTC takvimine göre yenilenir", claim:"ÖDÜLÜ AL", claimed:"ALINDI", reward:"ÖDÜL", complete:"Tamamlandı", progress:"İlerleme", empty:"İlerlemek için oyunları tamamla.", done:"Görev ödülü Hurda Çekirdeğine eklendi.", locked:"Ödülü almak için görevi tamamla.", names:{"survive-120":"Boşlukta kal","scrap-120":"Hurda toplayıcı","runs-2":"İki sefer","weekly-runs-8":"İstikrarlı pilot","weekly-scrap-700":"Usta hurdacı",}, desc:{"survive-120":"Toplam 120 saniye hayatta kal.","scrap-120":"Oyunlarında toplam 120 hurda topla.","runs-2":"İki oyun tamamla.","weekly-runs-8":"Bu hafta sekiz oyun tamamla.","weekly-scrap-700":"Bu hafta 700 hurda topla.",} },
  "pt-BR": { daily:"MISSÕES DIÁRIAS", weekly:"MISSÕES SEMANAIS", reset:"O progresso reinicia pelo calendário UTC", claim:"RESGATAR", claimed:"RESGATADO", reward:"RECOMPENSA", complete:"Concluída", progress:"Progresso", empty:"Conclua partidas para progredir.", done:"Recompensa adicionada ao Núcleo de Sucata.", locked:"Conclua o objetivo para resgatar.", names:{"survive-120":"Permaneça no vazio","scrap-120":"Coletor de sucata","runs-2":"Duas expedições","weekly-runs-8":"Piloto constante","weekly-scrap-700":"Mestre da sucata",}, desc:{"survive-120":"Sobreviva por 120 segundos no total.","scrap-120":"Colete 120 sucatas em suas partidas.","runs-2":"Conclua duas partidas.","weekly-runs-8":"Conclua oito partidas nesta semana.","weekly-scrap-700":"Colete 700 sucatas nesta semana.",} },
  es: { daily:"MISIONES DIARIAS", weekly:"MISIONES SEMANALES", reset:"El progreso se reinicia según el calendario UTC", claim:"RECLAMAR", claimed:"RECLAMADA", reward:"RECOMPENSA", complete:"Completada", progress:"Progreso", empty:"Completa partidas para avanzar.", done:"Recompensa añadida al Núcleo de Chatarra.", locked:"Completa el objetivo para reclamar.", names:{"survive-120":"Permanece en el vacío","scrap-120":"Recolector de chatarra","runs-2":"Dos expediciones","weekly-runs-8":"Piloto constante","weekly-scrap-700":"Maestro chatarrero",}, desc:{"survive-120":"Sobrevive 120 segundos en total.","scrap-120":"Recoge 120 de chatarra en tus partidas.","runs-2":"Completa dos partidas.","weekly-runs-8":"Completa ocho partidas esta semana.","weekly-scrap-700":"Recoge 700 de chatarra esta semana.",} },
  ru: { daily:"ЕЖЕДНЕВНЫЕ ЗАДАНИЯ", weekly:"ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ", reset:"Прогресс обновляется по календарю UTC", claim:"ЗАБРАТЬ", claimed:"ПОЛУЧЕНО", reward:"НАГРАДА", complete:"Выполнено", progress:"Прогресс", empty:"Завершайте забеги, чтобы продвигаться.", done:"Награда добавлена в Ядро лома.", locked:"Выполните цель, чтобы забрать награду.", names:{"survive-120":"Выживший в пустоте","scrap-120":"Сборщик лома","runs-2":"Две экспедиции","weekly-runs-8":"Постоянный пилот","weekly-scrap-700":"Мастер лома",}, desc:{"survive-120":"Выживите в общей сложности 120 секунд.","scrap-120":"Соберите 120 единиц лома за забеги.","runs-2":"Завершите два забега.","weekly-runs-8":"Завершите восемь забегов за неделю.","weekly-scrap-700":"Соберите 700 лома за неделю.",} },
  id: { daily:"MISI HARIAN", weekly:"MISI MINGGUAN", reset:"Progres direset mengikuti kalender UTC", claim:"AMBIL", claimed:"DIAMBIL", reward:"HADIAH", complete:"Selesai", progress:"Progres", empty:"Selesaikan permainan untuk mendapat progres.", done:"Hadiah ditambahkan ke Inti Rongsokan.", locked:"Selesaikan tujuan untuk mengambil hadiah.", names:{"survive-120":"Bertahan di kehampaan","scrap-120":"Pengumpul rongsokan","runs-2":"Dua ekspedisi","weekly-runs-8":"Pilot konsisten","weekly-scrap-700":"Ahli rongsokan",}, desc:{"survive-120":"Bertahan selama total 120 detik.","scrap-120":"Kumpulkan 120 rongsokan dari permainanmu.","runs-2":"Selesaikan dua permainan.","weekly-runs-8":"Selesaikan delapan permainan minggu ini.","weekly-scrap-700":"Kumpulkan 700 rongsokan minggu ini.",} },
  de: { daily:"TÄGLICHE MISSIONEN", weekly:"WÖCHENTLICHE MISSIONEN", reset:"Fortschritt wird nach UTC-Kalender zurückgesetzt", claim:"ABHOLEN", claimed:"ABGEHOLT", reward:"BELOHNUNG", complete:"Abgeschlossen", progress:"Fortschritt", empty:"Schließe Läufe ab, um Fortschritt zu erzielen.", done:"Belohnung wurde deinem Schrottkern hinzugefügt.", locked:"Schließe das Ziel ab, um die Belohnung abzuholen.", names:{"survive-120":"In der Leere bestehen","scrap-120":"Schrottsammler","runs-2":"Zwei Expeditionen","weekly-runs-8":"Beständiger Pilot","weekly-scrap-700":"Schrottmeister",}, desc:{"survive-120":"Überlebe insgesamt 120 Sekunden.","scrap-120":"Sammle 120 Schrott in deinen Läufen.","runs-2":"Schließe zwei Läufe ab.","weekly-runs-8":"Schließe diese Woche acht Läufe ab.","weekly-scrap-700":"Sammle diese Woche 700 Schrott.",} },
  fr: { daily:"MISSIONS QUOTIDIENNES", weekly:"MISSIONS HEBDOMADAIRES", reset:"La progression suit le calendrier UTC", claim:"RÉCUPÉRER", claimed:"RÉCUPÉRÉE", reward:"RÉCOMPENSE", complete:"Terminée", progress:"Progression", empty:"Terminez des parties pour progresser.", done:"Récompense ajoutée au Noyau de ferraille.", locked:"Terminez l’objectif pour récupérer la récompense.", names:{"survive-120":"Survivre dans le vide","scrap-120":"Collecteur de ferraille","runs-2":"Deux expéditions","weekly-runs-8":"Pilote régulier","weekly-scrap-700":"Maître récupérateur",}, desc:{"survive-120":"Survivez 120 secondes au total.","scrap-120":"Collectez 120 ferrailles sur vos parties.","runs-2":"Terminez deux parties.","weekly-runs-8":"Terminez huit parties cette semaine.","weekly-scrap-700":"Collectez 700 ferrailles cette semaine.",} },
  ja: { daily:"デイリーミッション", weekly:"ウィークリーミッション", reset:"進行状況はUTC基準で更新されます", claim:"受け取る", claimed:"受取済み", reward:"報酬", complete:"達成", progress:"進行状況", empty:"プレイを完了して進行しましょう。", done:"報酬がスクラップコアに追加されました。", locked:"報酬を受け取るには目標を達成してください。", names:{"survive-120":"虚空で生き残る","scrap-120":"スクラップ収集","runs-2":"2回の遠征","weekly-runs-8":"継続するパイロット","weekly-scrap-700":"スクラップマスター",}, desc:{"survive-120":"合計120秒間生き残る。","scrap-120":"プレイを通じてスクラップを120集める。","runs-2":"2回のプレイを完了する。","weekly-runs-8":"今週8回のプレイを完了する。","weekly-scrap-700":"今週スクラップを700集める。",} }
};
const TASK_COPY = {
 en: {
  "score-2500":["Score milestone","Earn 2,500 score across your runs."],
  "level-5":["Pilot rank","Reach level 5 in a single run."],
  "weekly-score-12000":["High-score week","Earn 12,000 score this week."],
  "weekly-survive-1200":["Long-haul pilot","Survive for 1,200 seconds this week."]
 },
 tr: {
  "score-2500":["Skor hedefi","Oyunlarında toplam 2.500 skor kazan."],
  "level-5":["Pilot seviyesi","Tek oyunda 5. seviyeye ulaş."],
  "weekly-score-12000":["Haftalık skor","Bu hafta toplam 12.000 skor kazan."],
  "weekly-survive-1200":["Uzun sefer","Bu hafta toplam 1.200 saniye hayatta kal."]
 },
 "pt-BR": {
  "score-2500":["Meta de pontuação","Obtenha 2.500 pontos em suas partidas."],
  "level-5":["Nível do piloto","Alcance o nível 5 em uma partida."],
  "weekly-score-12000":["Pontuação semanal","Obtenha 12.000 pontos nesta semana."],
  "weekly-survive-1200":["Longa jornada","Sobreviva por 1.200 segundos nesta semana."]
 },
 es: {
  "score-2500":["Meta de puntuación","Consigue 2.500 puntos en tus partidas."],
  "level-5":["Nivel de piloto","Alcanza el nivel 5 en una partida."],
  "weekly-score-12000":["Puntuación semanal","Consigue 12.000 puntos esta semana."],
  "weekly-survive-1200":["Viaje largo","Sobrevive 1.200 segundos esta semana."]
 },
 ru: {
  "score-2500":["Цель по очкам","Наберите 2 500 очков за забеги."],
  "level-5":["Уровень пилота","Достигните 5-го уровня за один забег."],
  "weekly-score-12000":["Недельный рекорд","Наберите 12 000 очков за неделю."],
  "weekly-survive-1200":["Долгая экспедиция","Выживите 1 200 секунд за неделю."]
 },
 id: {
  "score-2500":["Target skor","Raih 2.500 skor dari permainanmu."],
  "level-5":["Level pilot","Capai level 5 dalam satu permainan."],
  "weekly-score-12000":["Skor mingguan","Raih 12.000 skor minggu ini."],
  "weekly-survive-1200":["Ekspedisi panjang","Bertahan selama 1.200 detik minggu ini."]
 },
 de: {
  "score-2500":["Punkteziel","Erreiche insgesamt 2.500 Punkte."],
  "level-5":["Pilotlevel","Erreiche Level 5 in einem Lauf."],
  "weekly-score-12000":["Wochenrekord","Erreiche diese Woche 12.000 Punkte."],
  "weekly-survive-1200":["Lange Expedition","Überlebe diese Woche 1.200 Sekunden."]
 },
 fr: {
  "score-2500":["Objectif de score","Obtenez 2 500 points sur vos parties."],
  "level-5":["Niveau du pilote","Atteignez le niveau 5 en une partie."],
  "weekly-score-12000":["Score hebdomadaire","Obtenez 12 000 points cette semaine."],
  "weekly-survive-1200":["Longue expédition","Survivez 1 200 secondes cette semaine."]
 },
 ja: {
  "score-2500":["スコア目標","プレイを通じて2,500ポイントを獲得する。"],
  "level-5":["パイロットレベル","1回のプレイでレベル5に到達する。"],
  "weekly-score-12000":["週間スコア","今週12,000ポイントを獲得する。"],
  "weekly-survive-1200":["長期遠征","今週合計1,200秒生き残る。"]
 }
};
const locale = value => LOCALES.includes(value) ? value : "en";
const dayKey = date => date.toISOString().slice(0, 10);
function weekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}
function hash(value) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}
function choose(pool, key, count) {
  return pool.slice().sort((a, b) => hash(key + a.id) - hash(key + b.id)).slice(0, count);
}
function normalizePeriod(value, period) {
  if (!value || value.period !== period) return { period, progress: {}, claimed: [] };
  const progress = {};
  for (const [key, amount] of Object.entries(value.progress || {})) {
    if (/^[a-z0-9-]{1,40}$/.test(key)) progress[key] = Math.max(0, Math.min(10000000, Math.floor(Number(amount) || 0)));
  }
  return { period, progress, claimed: [...new Set((Array.isArray(value.claimed) ? value.claimed : []).filter(x => typeof x === "string" && /^[a-z0-9-]{1,40}$/.test(x)))] };
}
export function getMissionState(profile, now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  const current = profile.dailyMissions || {};
  const state = {
    daily: normalizePeriod(current.daily, dayKey(date)),
    weekly: normalizePeriod(current.weekly, weekKey(date))
  };
  profile.dailyMissions = state;
  return state;
}
export function getMissionView(profile, now = new Date(), language = "en") {
  const state = getMissionState(profile, now), code = locale(language), copy = COPY[code];
  const build = (pool, period) => choose(pool, state[period].period, period === "daily" ? 3 : 2).map(task => ({
    ...task,
    name: TASK_COPY[code]?.[task.id]?.[0] || copy.names[task.id],
    description: TASK_COPY[code]?.[task.id]?.[1] || copy.desc[task.id],
    progress: Math.min(task.target, state[period].progress[task.id] || 0),
    claimed: state[period].claimed.includes(task.id),
    complete: (state[period].progress[task.id] || 0) >= task.target
  }));
  return { copy: { ...copy, core: CORE_LABELS[locale(language)] }, daily: build(DAILY_POOL, "daily"), weekly: build(WEEKLY_POOL, "weekly") };
}
export function recordMissionProgress(profile, run, now = new Date()) {
  const state = getMissionState(profile, now);
  const values = {
    survivalSeconds: Math.max(0, Math.floor(Number(run?.survivalSeconds) || 0)),
    scrapCollected: Math.max(0, Math.floor(Number(run?.scrapCollected) || 0)),
    score: Math.max(0, Math.floor(Number(run?.score) || 0)),
    maxLevel: Math.max(0, Math.floor(Number(run?.level) || 0)),
    runs: 1
  };
  for (const period of ["daily", "weekly"]) {
    const pool = period === "daily" ? DAILY_POOL : WEEKLY_POOL;
    const selected = choose(pool, state[period].period, period === "daily" ? 3 : 2);
    for (const task of selected) {
      const previous = state[period].progress[task.id] || 0;
      const next = task.metric === "maxLevel" ? Math.max(previous, values[task.metric]) : previous + values[task.metric];
      state[period].progress[task.id] = Math.min(task.target, next);
    }
  }
  return getMissionView(profile, now, "en");
}
export function claimMissionReward(profile, period, id, now = new Date()) {
  if (!["daily", "weekly"].includes(period) || typeof id !== "string") return { ok: false, reason: "invalid" };
  const view = getMissionView(profile, now, "en"), task = view[period].find(item => item.id === id);
  if (!task) return { ok: false, reason: "missing" };
  const state = profile.dailyMissions[period];
  if (state.claimed.includes(id)) return { ok: false, reason: "claimed" };
  if (!task.complete) return { ok: false, reason: "incomplete" };
  state.claimed.push(id);
  profile.scrapCore = Math.max(0, Number(profile.scrapCore) || 0) + task.reward;
  return { ok: true, reward: task.reward, id, period };
}
export function missionCopy(language = "en") { const code=locale(language); return { ...COPY[code], core: CORE_LABELS[code] }; }
