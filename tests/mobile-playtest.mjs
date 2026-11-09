import { chromium } from "playwright";
import fs from "node:fs";

const baseURL = (process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173").replace(/\/+$/, "");
const outDir = "mobile-reports";
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
await context.addInitScript(() => { window.__COSMIC_SCRAP_TEST__ = true; });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("response", response => {
  if (response.status() >= 500) errors.push("HTTP " + response.status() + ": " + response.url());
});

const summary = {
  test: "Cosmic Scrap basic mobile browser smoke test",
  viewport: "412x915",
  checks: [],
  startedAt: new Date().toISOString(),
};

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  if (await page.locator("#intro-screen").isVisible()) {
    await page.locator("#intro-continue").click();
  }
  await page.locator("#start").waitFor({ state: "visible", timeout: 5000 });
  await page.locator("#start").click();
  await page.waitForFunction(() => {
    const state = window.__COSMIC_SCRAP_TEST_API__?.snapshot();
    return state?.running && state.elapsed > 0.1;
  }, null, { timeout: 8000 });

  const started = await page.evaluate(() => ({
    canvasVisible: getComputedStyle(document.querySelector("#game")).display !== "none",
    overlayHidden: document.querySelector("#overlay").hidden,
    timer: document.querySelector("#time")?.textContent?.trim(),
    testApiReady: Boolean(window.__COSMIC_SCRAP_TEST_API__),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  }));
  if (!started.canvasVisible || !started.overlayHidden || !started.testApiReady || started.horizontalOverflow) {
    throw new Error("Game did not start cleanly: " + JSON.stringify(started));
  }
  summary.checks.push("game opens and the timer advances");
  summary.start = started;

  if (await page.locator("#upgrade-screen").isVisible()) {
    await page.locator("#upgrade-cards button").first().click();
  }
  await page.locator("#pause").evaluate(button => button.click());
  await page.locator("#pause-screen").waitFor({ state: "visible", timeout: 3000 });
  await page.locator("#resume").click();
  await page.locator("#pause-screen").waitFor({ state: "hidden", timeout: 3000 });
  summary.checks.push("pause and resume work");

  await page.evaluate(() => window.__COSMIC_SCRAP_TEST_API__.forceDeath());
  await page.locator("#death-screen").waitFor({ state: "visible", timeout: 3000 });
  await page.locator("#retry").click();
  await page.waitForFunction(() => {
    const state = window.__COSMIC_SCRAP_TEST_API__?.snapshot();
    return state?.running && state.elapsed > 0.1;
  }, null, { timeout: 5000 });
  summary.checks.push("game-over and retry work");

  if (errors.length) throw new Error("Browser errors: " + errors.join(" | "));
  summary.result = "passed";
} finally {
  summary.finishedAt = new Date().toISOString();
  fs.writeFileSync(outDir + "/mobile-summary.json", JSON.stringify(summary, null, 2));
  await context.close();
  await browser.close();
}
console.log(JSON.stringify(summary, null, 2));
