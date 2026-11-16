import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
await context.addInitScript(() => {
  localStorage.setItem("cosmic-scrap-language-selected", "1");
  localStorage.removeItem("taviro-onboarding-complete");
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

try {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  if (await page.locator("#intro-screen").isVisible()) await page.locator("#intro-continue").click();
  await page.locator("#start").click();
  const dialog = page.locator(".onboarding-overlay");
  await dialog.waitFor({ state: "visible" });
  assert.equal(await dialog.getAttribute("aria-modal"), "true");
  assert.match(await page.locator(".onboarding-progress-label").textContent(), /1 \/ 5/);

  await page.keyboard.press("Escape");
  assert.equal(await dialog.isVisible(), false, "Escape should dismiss without completing the guide");
  assert.equal(await page.evaluate(() => localStorage.getItem("taviro-onboarding-complete")), null);
  assert.equal(await page.locator("#time").textContent(), "00:00", "dismissing the guide must not launch the game");

  await page.locator("#start").click();
  await dialog.waitFor({ state: "visible" });
  const locales = [
    ["en", "YOUR FIRST FIVE MINUTES"], ["tr", "İLK BEŞ DAKİKAN"],
    ["pt-BR", "SEUS PRIMEIROS CINCO MINUTOS"], ["es", "TUS PRIMEROS CINCO MINUTOS"],
    ["ru", "ПЕРВЫЕ ПЯТЬ МИНУТ"], ["id", "LIMA MENIT PERTAMAMU"],
    ["de", "DEINE ERSTEN FÜNF MINUTEN"], ["fr", "VOS CINQ PREMIÈRES MINUTES"],
    ["ja", "最初の5分間"]
  ];
  for (const [locale, heading] of locales) {
    await page.evaluate(code => {
      localStorage.setItem("cosmic-scrap-language", code);
      window.dispatchEvent(new Event("cosmic-scrap:language-changed"));
    }, locale);
    assert.equal(await page.locator("#onboarding-title").textContent(), heading, "onboarding locale " + locale);
  }
  for (let step = 1; step < 5; step++) {
    await page.locator(".onboarding-next").click();
    assert.match(await page.locator(".onboarding-progress-label").textContent(), new RegExp((step + 1) + " \\/ 5"));
  }
  await page.locator(".onboarding-next").click();
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await page.evaluate(() => localStorage.getItem("taviro-onboarding-complete")), "1");
  await page.waitForTimeout(400);
  const launchState = await page.evaluate(() => ({ time: document.querySelector("#time")?.textContent, overlayHidden: document.querySelector("#overlay")?.hidden, onboardingHidden: document.querySelector(".onboarding-overlay")?.hidden, runtimeError: document.querySelector("#runtime-error")?.textContent, localComplete: localStorage.getItem("taviro-onboarding-complete") }));
  if (launchState.overlayHidden !== true) throw new Error("Onboarding completion did not launch the run: " + JSON.stringify(launchState));
  await page.waitForTimeout(1500);
  const runtimeState = await page.evaluate(() => ({ time: document.querySelector("#time")?.textContent, deathHidden: document.querySelector("#death-screen")?.hidden, pauseHidden: document.querySelector("#pause-screen")?.hidden, upgradeHidden: document.querySelector("#upgrade-screen")?.hidden, health: document.querySelector("#health")?.textContent, canvas: { width: document.querySelector("#game")?.width, height: document.querySelector("#game")?.height }, runtimeError: document.querySelector("#runtime-error")?.textContent }));
  if (!runtimeState.upgradeHidden) await page.locator("#upgrade-cards button").first().click();
  await page.waitForFunction(() => document.querySelector("#time")?.textContent !== "00:00", null, { timeout: 10000 });
  if (runtimeState.runtimeError) throw new Error("Game runtime error after onboarding: " + runtimeState.runtimeError);
  assert.equal(await page.locator("#overlay").isHidden(), true);

  await page.locator("#pause").click();
  await page.locator("#pause-menu").click();
  await page.locator(".onboarding-replay").click();
  await dialog.waitFor({ state: "visible" });
  assert.equal(await page.locator(".onboarding-replay").textContent(), "5分ガイドをもう一度見る");
  await page.locator(".onboarding-close").click();
  assert.equal(await dialog.isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ firstRunGate: "passed", escapeDismiss: "passed", fiveSteps: "passed", locales: locales.length, finishLaunch: "passed", replay: "passed", viewport: "412x915", errors }, null, 2));
} finally {
  await browser.close();
}
