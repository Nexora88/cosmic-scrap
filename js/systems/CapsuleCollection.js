export const CAPSULE_DUPLICATE_COMPENSATION = 25;
export const CAPSULE_HISTORY_LIMIT = 20;
export const CAPSULE_COLLECTION_COPY = {
  en: { progress: "COLLECTION PROGRESS", history: "RECENT REWARDS", emptyHistory: "No capsule rewards yet.", duplicate: "Duplicate converted to Scrap Core" },
  tr: { progress: "KOLEKSİYON İLERLEMESİ", history: "SON ÖDÜLLER", emptyHistory: "Henüz kapsül ödülün yok.", duplicate: "Tekrar ödül Hurda Çekirdeğine dönüştürüldü" },
  "pt-BR": { progress: "PROGRESSO DA COLEÇÃO", history: "RECOMPENSAS RECENTES", emptyHistory: "Ainda não há recompensas de cápsulas.", duplicate: "Prêmio repetido convertido em Núcleo de Sucata" },
  es: { progress: "PROGRESO DE COLECCIÓN", history: "RECOMPENSAS RECIENTES", emptyHistory: "Aún no hay recompensas de cápsulas.", duplicate: "Recompensa duplicada convertida en Núcleo de Chatarra" },
  ru: { progress: "ПРОГРЕСС КОЛЛЕКЦИИ", history: "ПОСЛЕДНИЕ НАГРАДЫ", emptyHistory: "Наград из капсул пока нет.", duplicate: "Повторная награда обменена на Scrap Core" },
  id: { progress: "PROGRES KOLEKSI", history: "HADIAH TERBARU", emptyHistory: "Belum ada hadiah kapsul.", duplicate: "Hadiah duplikat ditukar menjadi Scrap Core" },
  de: { progress: "SAMMLUNGSFORTSCHRITT", history: "LETZTE BELOHNUNGEN", emptyHistory: "Noch keine Kapselbelohnungen.", duplicate: "Doppelte Belohnung in Scrap Core umgewandelt" },
  fr: { progress: "PROGRESSION DE LA COLLECTION", history: "RÉCOMPENSES RÉCENTES", emptyHistory: "Aucune récompense de capsule pour le moment.", duplicate: "Le doublon a été converti en Scrap Core" },
  ja: { progress: "コレクション進行度", history: "最近の報酬", emptyHistory: "カプセル報酬はまだありません。", duplicate: "重複報酬をScrap Coreに変換しました" }
};

export function getCapsuleCollectionProgress(rewards, inventory) {
  const total = Array.isArray(rewards) ? rewards.length : 0;
  const ownedIds = new Set((Array.isArray(inventory) ? inventory : [])
    .filter(item => item && typeof item.id === "string")
    .map(item => item.id));
  const owned = (Array.isArray(rewards) ? rewards : [])
    .filter(item => item && ownedIds.has(item.id)).length;
  return { owned, total, percent: total ? Math.round(owned / total * 100) : 0 };
}

export function appendCapsuleHistory(history, record, limit = CAPSULE_HISTORY_LIMIT) {
  const entries = Array.isArray(history) ? history : [];
  if (!record || typeof record.rewardId !== "string" || !record.rewardId) return entries.slice(-limit);
  const entry = {
    rewardId: record.rewardId.slice(0, 64),
    rarity: ["copper", "iron", "silver", "gold", "platinum", "titanium", "obsidian", "elite"].includes(record.rarity) ? record.rarity : "silver",
    duplicate: Boolean(record.duplicate),
    compensation: record.duplicate ? Math.max(0, Math.floor(Number(record.compensation) || 0)) : 0,
    earnedAt: typeof record.earnedAt === "string" && !Number.isNaN(Date.parse(record.earnedAt))
      ? record.earnedAt : new Date().toISOString()
  };
  return [...entries.filter(item => item && typeof item.rewardId === "string"), entry].slice(-Math.max(1, limit));
}

export function applyDuplicateCompensation(profile, amount = CAPSULE_DUPLICATE_COMPENSATION) {
  if (!profile || typeof profile !== "object") return 0;
  const reward = Math.max(0, Math.floor(Number(amount) || 0));
  if (!reward) return 0;
  profile.scrapCore = Math.max(0, Number(profile.scrapCore ?? profile.core) || 0) + reward;
  profile.core = 0;
  return reward;
}
