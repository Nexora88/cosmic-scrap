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
const COPY = {
  en: { daily:"DAILY MISSIONS",weekly:"WEEKLY MISSIONS",reset:"Progress resets on the UTC schedule",claim:"CLAIM",claimed:"CLAIMED",reward:"REWARD",complete:"Complete",progress:"Progress",empty:"Finish runs to make progress.",done:"Mission reward added to your Scrap Core.",locked:"Complete the objective to claim this reward.",core:"Scrap Core" },
  tr: { daily:"GÜNLÜK GÖREVLER",weekly:"HAFTALIK GÖREVLER",reset:"İlerleme UTC takvimine göre yenilenir",claim:"ÖDÜLÜ AL",claimed:"ALINDI",reward:"ÖDÜL",complete:"Tamamlandı",progress:"İlerleme",empty:"İlerlemek için oyunları tamamla.",done:"Görev ödülü Hurda Çekirdeğine eklendi.",locked:"Ödülü almak için görevi tamamla.",core:"Hurda Çekirdeği" },
  "pt-BR": { daily:"MISSÕES DIÁRIAS",weekly:"MISSÕES SEMANAIS",reset:"O progresso reinicia conforme o calendário UTC",claim:"RESGATAR",claimed:"RESGATADO",reward:"RECOMPENSA",complete:"Concluída",progress:"Progresso",empty:"Conclua partidas para progredir.",done:"Recompensa adicionada ao Núcleo de Sucata.",locked:"Conclua o objetivo para resgatar a recompensa.",core:"Núcleo de Sucata" },
  es: { daily:"MISIONES DIARIAS",weekly:"MISIONES SEMANALES",reset:"El progreso se reinicia según el calendario UTC",claim:"RECLAMAR",claimed:"RECLAMADA",reward:"RECOMPENSA",complete:"Completada",progress:"Progreso",empty:"Completa partidas para avanzar.",done:"Recompensa añadida al Núcleo de Chatarra.",locked:"Completa el objetivo para reclamar la recompensa.",core:"Núcleo de Chatarra" },
  ru: { daily:"ЕЖЕДНЕВНЫЕ ЗАДАНИЯ",weekly:"ЕЖЕНЕДЕЛЬНЫЕ ЗАДАНИЯ",reset:"Прогресс сбрасывается по календарю UTC",claim:"ЗАБРАТЬ",claimed:"ПОЛУЧЕНО",reward:"НАГРАДА",complete:"Выполнено",progress:"Прогресс",empty:"Завершайте забеги, чтобы получать прогресс.",done:"Награда за задание добавлена в Scrap Core.",locked:"Выполните цель, чтобы получить награду.",core:"Scrap Core" },
  id: { daily:"MISI HARIAN",weekly:"MISI MINGGUAN",reset:"Progres direset mengikuti kalender UTC",claim:"AMBIL",claimed:"DIAMBIL",reward:"HADIAH",complete:"Selesai",progress:"Progres",empty:"Selesaikan permainan untuk mendapat progres.",done:"Hadiah misi ditambahkan ke Inti Rongsokan.",locked:"Selesaikan tujuan untuk mengambil hadiah.",core:"Inti Rongsokan" },
  de: { daily:"TÄGLICHE MISSIONEN",weekly:"WÖCHENTLICHE MISSIONEN",reset:"Der Fortschritt wird nach dem UTC-Kalender zurückgesetzt",claim:"ABHOLEN",claimed:"ABGEHOLT",reward:"BELOHNUNG",complete:"Abgeschlossen",progress:"Fortschritt",empty:"Schließe Läufe ab, um Fortschritt zu erzielen.",done:"Missionsbelohnung wurde deinem Schrottkern hinzugefügt.",locked:"Schließe das Ziel ab, um die Belohnung abzuholen.",core:"Schrottkern" },
  fr: { daily:"MISSIONS QUOTIDIENNES",weekly:"MISSIONS HEBDOMADAIRES",reset:"La progression suit le calendrier UTC",claim:"RÉCUPÉRER",claimed:"RÉCUPÉRÉE",reward:"RÉCOMPENSE",complete:"Terminée",progress:"Progression",empty:"Terminez des parties pour progresser.",done:"La récompense a été ajoutée au Noyau de ferraille.",locked:"Terminez l’objectif pour récupérer la récompense.",core:"Noyau de ferraille" },
  ja: { daily:"デイリーミッション",weekly:"ウィークリーミッション",reset:"進行状況はUTCカレンダーに従ってリセットされます",claim:"受け取る",claimed:"受取済み",reward:"報酬",complete:"完了",progress:"進行状況",empty:"プレイしてミッションを進めましょう。",done:"ミッション報酬がスクラップコアに追加されました。",locked:"報酬を受け取るには目標を達成してください。",core:"スクラップコア" }
};
const TASK_COPY = {
  en: {
    "survive-120":["Stay in the void","Survive for 120 seconds in total."],
    "scrap-120":["Salvage collector","Collect 120 scrap across your runs."],
    "score-2500":["Score milestone","Earn 2,500 score across your runs."],
    "level-5":["Pilot rank","Reach level 5 in a single run."],
    "runs-2":["Two expeditions","Complete two runs."],
    "weekly-runs-8":["Regular pilot","Complete eight runs this week."],
    "weekly-scrap-700":["Master salvager","Collect 700 scrap this week."],
    "weekly-score-12000":["High-score week","Earn 12,000 score this week."],
    "weekly-survive-1200":["Long-haul pilot","Survive for 1,200 seconds this week."]
  },
  tr: {
    "survive-120":["Boşlukta kal","Toplam 120 saniye hayatta kal."],
    "scrap-120":["Hurda toplayıcısı","Oyunlarında toplam 120 hurda topla."],
    "score-2500":["Skor hedefi","Oyunlarında toplam 2.500 skor kazan."],
    "level-5":["Pilot seviyesi","Tek oyunda 5. seviyeye ulaş."],
    "runs-2":["İki sefer","İki oyun tamamla."],
    "weekly-runs-8":["İstikrarlı pilot","Bu hafta sekiz oyun tamamla."],
    "weekly-scrap-700":["Usta hurdacı","Bu hafta 700 hurda topla."],
    "weekly-score-12000":["Haftalık skor","Bu hafta toplam 12.000 skor kazan."],
    "weekly-survive-1200":["Uzun sefer","Bu hafta toplam 1.200 saniye hayatta kal."]
  },
  "pt-BR": {
    "survive-120":["Permaneça no vazio","Sobreviva por 120 segundos no total."],
    "scrap-120":["Coletor de sucata","Colete 120 sucatas em suas partidas."],
    "score-2500":["Meta de pontuação","Obtenha 2.500 pontos em suas partidas."],
    "level-5":["Nível do piloto","Alcance o nível 5 em uma partida."],
    "runs-2":["Duas expedições","Conclua duas partidas."],
    "weekly-runs-8":["Piloto constante","Conclua oito partidas nesta semana."],
    "weekly-scrap-700":["Mestre da sucata","Colete 700 sucatas nesta semana."],
    "weekly-score-12000":["Pontuação semanal","Obtenha 12.000 pontos nesta semana."],
    "weekly-survive-1200":["Longa jornada","Sobreviva por 1.200 segundos nesta semana."]
  },
  es: {
    "survive-120":["Permanece en el vacío","Sobrevive 120 segundos en total."],
    "scrap-120":["Recolector de chatarra","Recoge 120 unidades de chatarra en tus partidas."],
    "score-2500":["Meta de puntuación","Consigue 2.500 puntos en tus partidas."],
    "level-5":["Nivel de piloto","Alcanza el nivel 5 en una partida."],
    "runs-2":["Dos expediciones","Completa dos partidas."],
    "weekly-runs-8":["Piloto constante","Completa ocho partidas esta semana."],
    "weekly-scrap-700":["Maestro chatarrero","Recoge 700 unidades de chatarra esta semana."],
    "weekly-score-12000":["Puntuación semanal","Consigue 12.000 puntos esta semana."],
    "weekly-survive-1200":["Viaje largo","Sobrevive 1.200 segundos esta semana."]
  },
  ru: {
    "survive-120":["Выживший в пустоте","Выживите в общей сложности 120 секунд."],
    "scrap-120":["Сборщик лома","Соберите 120 единиц лома за несколько забегов."],
    "score-2500":["Планка очков","Наберите 2 500 очков за несколько забегов."],
    "level-5":["Уровень пилота","Достигните 5-го уровня за один забег."],
    "runs-2":["Две экспедиции","Завершите два забега."],
    "weekly-runs-8":["Постоянный пилот","Завершите восемь забегов на этой неделе."],
    "weekly-scrap-700":["Мастер сбора","Соберите 700 единиц лома на этой неделе."],
    "weekly-score-12000":["Неделя рекордов","Наберите 12 000 очков на этой неделе."],
    "weekly-survive-1200":["Долгая экспедиция","Выживите 1 200 секунд на этой неделе."]
  },
  id: {
    "survive-120":["Bertahan di kehampaan","Bertahan selama total 120 detik."],
    "scrap-120":["Pengumpul rongsokan","Kumpulkan 120 rongsokan dari permainanmu."],
    "score-2500":["Target skor","Raih 2.500 skor dari permainanmu."],
    "level-5":["Level pilot","Capai level 5 dalam satu permainan."],
    "runs-2":["Dua ekspedisi","Selesaikan dua permainan."],
    "weekly-runs-8":["Pilot konsisten","Selesaikan delapan permainan minggu ini."],
    "weekly-scrap-700":["Ahli rongsokan","Kumpulkan 700 rongsokan minggu ini."],
    "weekly-score-12000":["Skor mingguan","Raih 12.000 skor minggu ini."],
    "weekly-survive-1200":["Ekspedisi panjang","Bertahan selama 1.200 detik minggu ini."]
  },
  de: {
    "survive-120":["In der Leere bestehen","Überlebe insgesamt 120 Sekunden."],
    "scrap-120":["Schrottsammler","Sammle 120 Schrott in deinen Läufen."],
    "score-2500":["Punkteziel","Erreiche insgesamt 2.500 Punkte."],
    "level-5":["Pilotlevel","Erreiche Level 5 in einem Lauf."],
    "runs-2":["Zwei Expeditionen","Schließe zwei Läufe ab."],
    "weekly-runs-8":["Beständiger Pilot","Schließe diese Woche acht Läufe ab."],
    "weekly-scrap-700":["Schrottmeister","Sammle diese Woche 700 Schrott."],
    "weekly-score-12000":["Wochenrekord","Erreiche diese Woche 12.000 Punkte."],
    "weekly-survive-1200":["Lange Expedition","Überlebe diese Woche 1.200 Sekunden."]
  },
  fr: {
    "survive-120":["Survivre dans le vide","Survivez 120 secondes au total."],
    "scrap-120":["Collecteur de ferraille","Collectez 120 unités de ferraille sur vos parties."],
    "score-2500":["Objectif de score","Obtenez 2 500 points sur vos parties."],
    "level-5":["Niveau du pilote","Atteignez le niveau 5 en une partie."],
    "runs-2":["Deux expéditions","Terminez deux parties."],
    "weekly-runs-8":["Pilote régulier","Terminez huit parties cette semaine."],
    "weekly-scrap-700":["Maître récupérateur","Collectez 700 unités de ferraille cette semaine."],
    "weekly-score-12000":["Score hebdomadaire","Obtenez 12 000 points cette semaine."],
    "weekly-survive-1200":["Longue expédition","Survivez 1 200 secondes cette semaine."]
  },
  ja: {
    "survive-120":["虚空で生き残る","合計120秒間生き残りましょう。"],
    "scrap-120":["スクラップ収集家","プレイを通じてスクラップを120個集めましょう。"],
    "score-2500":["スコア目標","プレイを通じて2,500ポイント獲得しましょう。"],
    "level-5":["パイロットレベル","1回のプレイでレベル5に到達しましょう。"],
    "runs-2":["2回の遠征","2回のプレイを完了しましょう。"],
    "weekly-runs-8":["継続するパイロット","今週8回のプレイを完了しましょう。"],
    "weekly-scrap-700":["スクラップマスター","今週スクラップを700個集めましょう。"],
    "weekly-score-12000":["週間ハイスコア","今週12,000ポイント獲得しましょう。"],
    "weekly-survive-1200":["長期遠征","今週合計1,200秒間生き残りましょう。"]
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
  const state = { daily: normalizePeriod(current.daily, dayKey(date)), weekly: normalizePeriod(current.weekly, weekKey(date)) };
  profile.dailyMissions = state;
  return state;
}
export function getMissionView(profile, now = new Date(), language = "en") {
  const state = getMissionState(profile, now), code = locale(language), copy = COPY[code];
  const build = (pool, period) => choose(pool, state[period].period, period === "daily" ? 3 : 2).map(task => ({
    ...task,
    name: TASK_COPY[code][task.id][0],
    description: TASK_COPY[code][task.id][1],
    progress: Math.min(task.target, state[period].progress[task.id] || 0),
    claimed: state[period].claimed.includes(task.id),
    complete: (state[period].progress[task.id] || 0) >= task.target
  }));
  return { copy, daily: build(DAILY_POOL, "daily"), weekly: build(WEEKLY_POOL, "weekly") };
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
  if (!profile || typeof profile !== "object" || !["daily", "weekly"].includes(period) || typeof id !== "string") return { ok: false, reason: "invalid" };
  const view = getMissionView(profile, now, "en"), task = view[period].find(item => item.id === id);
  if (!task) return { ok: false, reason: "missing" };
  const state = profile.dailyMissions[period];
  if (state.claimed.includes(id)) return { ok: false, reason: "claimed" };
  if (!task.complete) return { ok: false, reason: "incomplete" };
  state.claimed.push(id);
  profile.scrapCore = Math.max(0, Number(profile.scrapCore ?? profile.core) || 0) + task.reward;
  profile.core = 0;
  return { ok: true, reward: task.reward, id, period };
}
export function missionCopy(language = "en") { return COPY[locale(language)]; }
export function supportedMissionLocales() { return [...LOCALES]; }
