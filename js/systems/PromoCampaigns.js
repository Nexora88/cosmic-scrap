export const PROMO_CAMPAIGNS = Object.freeze([
  Object.freeze({
    id: "nexora-ai",
    title: "NEXORA AI",
    titleTr: "NEXORA AI",
    description: "AI assistant and the Nexora product ecosystem.",
    descriptionTr: "Nexora AI ve Nexora ürün ekosisteminin tanıtımı.",
    src: "assets/promos/nexora-ai.mp4",
  }),
  Object.freeze({
    id: "nexora-quant",
    title: "NEXORA QUANT",
    titleTr: "NEXORA QUANT",
    description: "Quantitative research and market intelligence.",
    descriptionTr: "Nicel araştırma ve piyasa analizi projesi.",
    src: "assets/promos/nexora-quant.mp4",
  }),
]);

export function getNextPromo(lastId, campaigns = PROMO_CAMPAIGNS, random = Math.random) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) return null;
  if (campaigns.length === 1) return campaigns[0];
  const lastIndex = campaigns.findIndex((campaign) => campaign.id === lastId);
  if (lastIndex >= 0) return campaigns[(lastIndex + 1) % campaigns.length];
  const sample = Number(random());
  const index = Math.max(0, Math.min(campaigns.length - 1, Math.floor((Number.isFinite(sample) ? sample : 0) * campaigns.length)));
  return campaigns[index];
}
