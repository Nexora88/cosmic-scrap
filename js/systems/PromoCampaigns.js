// Only the Turkish-language house campaign remains active.
// NEXORA QUANT is retired from the in-game promotion rotation.
export const PROMO_CAMPAIGNS = Object.freeze([
  Object.freeze({
    id: "nexora-ai",
    title: "NEXORA AI",
    titleTr: "NEXORA AI",
    description: "AI assistant and the Nexora product ecosystem.",
    descriptionTr: "Nexora AI ve Nexora ürün ekosisteminin tanıtımı.",
    src: "assets/promos/nexora-ai.mp4",
    locales: Object.freeze(["tr"]),
    type: "house"
  })
]);

export function getNextPromo(lastId, campaigns = PROMO_CAMPAIGNS, random = Math.random) {
  const available = Array.isArray(campaigns) ? campaigns : [];
  if (!available.length) return null;
  if (available.length === 1) return available[0];
  const lastIndex = available.findIndex(campaign => campaign.id === lastId);
  if (lastIndex >= 0) return available[(lastIndex + 1) % available.length];
  const sample = Number(random());
  const index = Math.max(0, Math.min(available.length - 1, Math.floor((Number.isFinite(sample) ? sample : 0) * available.length)));
  return available[index];
}
