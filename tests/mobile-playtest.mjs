import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseURL = "http://127.0.0.1:4173";
const outDir = "mobile-reports";
fs.mkdirSync(outDir, { recursive: true });
const device = devices["Pixel 7"];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...device,
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const errors = [];
const page = await context.newPage();
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => {
  if (message.type() === "error") errors.push(message.text());
});

const summary = {
  test: "Cosmic Scrap Android-like mobile browser emulation",
  deviceProfile: "Playwright Pixel 7 profile (Chromium emulation; not physical Android hardware)",
  startedAt: new Date().toISOString(),
};
await page.goto(baseURL, { waitUntil: "networkidle" });
const accessibility = { checks: [] };
const semantics = await page.evaluate(() => ({
  language: document.documentElement.lang,
  canvasHasLabel: Boolean(document.querySelector("#game")?.getAttribute("aria-label")),
  startIsButton: document.querySelector("#start")?.tagName === "BUTTON",
  pauseHasLabel: Boolean(document.querySelector("#pause")?.getAttribute("aria-label")),
  settingsDialogHasTitle: Boolean(document.querySelector("#settings-screen [role=dialog]")?.getAttribute("aria-labelledby")),
  reducedFlashControlExists: document.querySelector("#setting-reduced-flash")?.type === "checkbox",
  visibleFocusRuleExists: [...document.styleSheets].some(sheet => {
    try { return [...sheet.cssRules].some(rule => rule.selectorText && rule.selectorText.includes(":focus-visible")); }
    catch { return false; }
  }),
}));
if (!semantics.language || !semantics.canvasHasLabel || !semantics.startIsButton ||
    !semantics.pauseHasLabel || !semantics.settingsDialogHasTitle ||
    !semantics.reducedFlashControlExists || !semantics.visibleFocusRuleExists) {
  throw new Error("Accessibility smoke check failed: " + JSON.stringify(semantics));
}
await page.locator("#start").focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(250);
accessibility.checks.push("document semantics, canvas label, pause name, labelled settings dialog, reduced-flash control, visible focus rule, keyboard-only start");
summary.gamePage = await page.evaluate(() => ({
  title: document.title,
  viewport: { width: innerWidth, height: innerHeight },
  devicePixelRatio,
  screen: { width: screen.width, height: screen.height },
  documentWidth: document.documentElement.scrollWidth,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  canvas: (() => {
    const c = document.querySelector("#game");
    const r = c.getBoundingClientRect();
    return { cssWidth: r.width, cssHeight: r.height, backingWidth: c.width, backingHeight: c.height };
  })(),
  startOverlayHidden: document.querySelector("#overlay").hidden || getComputedStyle(document.querySelector("#overlay")).display === "none",
  joystickVisible: getComputedStyle(document.querySelector("#joystick")).display !== "none",
}));
const frameData = await page.evaluate(async () => {
  const times = [];
  let previous = performance.now();
  const end = previous + 3000;
  await new Promise(resolve => {
    function frame(now) {
      times.push(now - previous);
      previous = now;
      if (now < end) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
  const sorted = times.slice(1).sort((a,b) => a-b);
  return {
    sampleFrames: Math.max(0, times.length - 1),
    avgFrameIntervalMs: +(times.slice(1).reduce((a,b)=>a+b,0) / Math.max(1,times.length-1)).toFixed(2),
    p95FrameIntervalMs: +(sorted[Math.floor((sorted.length-1)*0.95)] || 0).toFixed(2),
    framesOver16_7ms: times.slice(1).filter(x=>x>16.7).length,
    framesOver33ms: times.slice(1).filter(x=>x>33).length,
  };
});
summary.gamePage.rafMeasurement3s = frameData;
await page.keyboard.press("p");
summary.gamePage.pauseScreenOpened = await page.locator("#pause-screen").isVisible();
if (!summary.gamePage.pauseScreenOpened) throw new Error("Keyboard P did not open pause screen");
summary.gamePage.pauseFocusOnResume = await page.evaluate(() => document.activeElement?.id === "resume");
if (!summary.gamePage.pauseFocusOnResume) throw new Error("Pause dialog did not move focus to Resume");
await page.keyboard.press("Enter");
summary.gamePage.keyboardResumeWorked = await page.locator("#pause-screen").isHidden();
if (!summary.gamePage.keyboardResumeWorked) throw new Error("Keyboard Enter did not resume from pause");
await page.keyboard.press("p");
await page.locator("#pause-settings").click();
await page.locator("#setting-reduced-flash").check();
await page.locator("#setting-vibration").check();
await page.locator("#settings-close").click();
summary.gamePage.settingsPersisted = await page.evaluate(() =>
  localStorage.getItem("cosmic-scrap-reduced-flash") === "on" &&
  localStorage.getItem("cosmic-scrap-vibration") === "on"
);
if (!summary.gamePage.settingsPersisted) throw new Error("Accessibility settings did not persist");
accessibility.checks.push("keyboard pause/resume, focus placement and settings persistence");
summary.accessibilitySmoke = accessibility;
if (summary.gamePage.horizontalOverflow) throw new Error("Horizontal overflow detected on mobile game page");
if (!summary.gamePage.startOverlayHidden) throw new Error("Start button did not start the game");
if (!summary.gamePage.pauseScreenOpened) throw new Error("Pause control failed on mobile profile");
if (errors.length) throw new Error("Browser console/page errors: " + errors.join(" | "));

const lab = await context.newPage();
const labErrors = [];
lab.on("pageerror", e => labErrors.push(e.message));
lab.on("console", m => { if (m.type() === "error") labErrors.push(m.text()); });
await lab.goto(baseURL + "/tests/playtest.html", { waitUntil: "networkidle" });
const scenarios = [
  { id: "#baseline", name: "baseline" },
  { id: "#stacked", name: "stacked" },
  { id: "#low", name: "low-end" },
];
summary.balanceScenarios = [];
for (const scenario of scenarios) {
  await lab.locator(scenario.id).click();
  await lab.waitForFunction(() => {
    const text = document.querySelector("#status")?.textContent || "";
    return text.includes("300 simulated seconds") || text.includes("Run ended in game") || text.includes("Could not initialize simulation.");
  }, null, { timeout: 360000 });
  const raw = await lab.locator("#report").textContent();
  let report;
  try { report = JSON.parse(raw); } catch { throw new Error(scenario.name + " did not produce valid JSON: " + raw); }
  report.mobileEmulation = { profile: "Pixel 7", viewport: "412x915", devicePixelRatio: 2 };
  fs.writeFileSync(path.join(outDir, scenario.name + ".json"), JSON.stringify(report, null, 2));
  summary.balanceScenarios.push({
    scenario: scenario.name,
    simulatedSeconds: report.simulatedSeconds,
    finish: report.finish,
    kills: report.kills,
    level: report.level,
    score: report.score,
    bossesSeen: report.bossesSeen,
    bossesDefeated: report.bossesDefeated,
    bossSpawnSeconds: report.bossSpawnSeconds,
    bossKillSeconds: report.bossKillSeconds,
    bossKillDurationsSeconds: report.bossSpawnSeconds.map((spawn, i) =>
      Number.isFinite(report.bossKillSeconds?.[i]) && report.bossKillSeconds[i] >= spawn
        ? +(report.bossKillSeconds[i] - spawn).toFixed(1)
        : null
    ),
    avgUpdateDrawMs: report.avgFrameMs,
    p95UpdateDrawMs: report.p95FrameMs,
    over16_7msPct: report.framesOver16_7Pct,
    over33msPct: report.framesOver33Pct,
    maxEnemies: report.maxEnemies,
    maxEnemyProjectiles: report.maxEnemyProjectiles,
  });
  const requiredFields = ["simulatedSeconds", "finish", "kills", "level", "score", "bossesSeen", "bossesDefeated", "bossSpawnSeconds", "bossKillSeconds", "avgFrameMs", "p95FrameMs", "framesOver16_7Pct", "framesOver33Pct"];
  const missingFields = requiredFields.filter(key => !(key in report));
  if (missingFields.length) throw new Error(scenario.name + " report missing fields: " + missingFields.join(", "));
  if (!Number.isFinite(report.simulatedSeconds) || report.simulatedSeconds <= 0) throw new Error(scenario.name + " simulation made no progress");
  if (!report.finish || !Array.isArray(report.bossSpawnSeconds) || !Array.isArray(report.bossKillSeconds) ||
      !Number.isFinite(report.avgFrameMs) || !Number.isFinite(report.p95FrameMs) ||
      !Number.isFinite(report.framesOver16_7Pct) || !Number.isFinite(report.framesOver33Pct)) {
    throw new Error(scenario.name + " report is missing finish or boss telemetry");
  }
}
summary.playtestBrowserErrors = labErrors;
summary.finishedAt = new Date().toISOString();
summary.reportIntegrity = {
  expectedScenarios: ["baseline", "stacked", "low-end"],
  completedScenarios: summary.balanceScenarios.map(s => s.scenario),
  allScenariosPresent: ["baseline", "stacked", "low-end"].every(name => summary.balanceScenarios.some(s => s.scenario === name)),
  requiredMetricsValidated: true,
};
if (!summary.reportIntegrity.allScenariosPresent) throw new Error("Stress report set incomplete");
for (const name of ["baseline", "stacked", "low-end"]) {
  const reportPath = path.join(outDir, name + ".json");
  if (!fs.existsSync(reportPath) || fs.statSync(reportPath).size < 100) throw new Error("Missing or suspiciously small report: " + name);
}
fs.writeFileSync(path.join(outDir, "mobile-summary.json"), JSON.stringify(summary, null, 2));
if (labErrors.length) throw new Error("Playtest browser errors: " + labErrors.join(" | "));
console.log(JSON.stringify(summary, null, 2));
await browser.close();
