import { chromium } from "playwright";
const baseURL = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.route("https://esm.sh/**", route => route.fulfill({
  status: 200,
  contentType: "application/javascript",
  body: "export const createClient = () => ({ auth: { getSession: async () => ({ data: { session: null }, error: null }) } });"
}));
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
await page.goto(new URL("profile.html", baseURL).href, { waitUntil: "networkidle" });
await page.locator(".daily-rewards-card").waitFor();
const expected = {
  en: ["Daily rewards", "Badge collection"], tr: ["Günlük ödüller", "Rozet koleksiyonu"],
  "pt-BR": ["Recompensas diárias", "Coleção de distintivos"],
  es: ["Recompensas diarias", "Colección de insignias"], ru: ["Ежедневные награды", "Коллекция значков"],
  id: ["Hadiah Harian", "Koleksi Lencana"], de: ["Tägliche Belohnungen", "Abzeichensammlung"],
  fr: ["Récompenses quotidiennes", "Collection de badges"], ja: ["デイリー報酬", "バッジコレクション"]
};
const observed = {};
for (let i = 0; i < 9; i++) {
  await page.locator("#language-toggle").click();
  const lang = await page.evaluate(() => document.documentElement.lang);
  const title = await page.locator(".daily-rewards-card h2").innerText();
  const badgeTitle = await page.locator(".badges-card h2").innerText();
  observed[lang] = [title, badgeTitle];
  if (title !== expected[lang][0] || badgeTitle !== expected[lang][1]) throw new Error("Wrong profile section translation for " + lang + ": " + title + " / " + badgeTitle);
  if (!await page.locator("#best-level").count()) throw new Error("Best-run level stat is missing");
  const dimensions = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  if (dimensions.documentWidth > dimensions.width + 2) throw new Error("Profile page overflows at 390px in " + lang);
}
console.log(JSON.stringify({ localesChecked: Object.keys(observed), observed, errors }, null, 2));
await browser.close();
if (errors.length) process.exit(1);
