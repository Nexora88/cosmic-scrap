export const PROMO_CAMPAIGNS = Object.freeze([
  Object.freeze({ id: "nexora-ai", title: "NEXORA AI", titleTr: "NEXORA AI", description: "An optional look at the Nexora AI project.", descriptionTr: "Nexora AI projesine isteğe bağlı kısa bir bakış.", src: "assets/promos/nexora-ai.mp4" }),
]);
export function getNextPromo(_lastId, campaigns = PROMO_CAMPAIGNS) {
  return Array.isArray(campaigns) && campaigns.length ? campaigns[0] : null;
}
