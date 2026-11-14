import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseURL = (process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173").replace(/\/+$/, "");
const outDir = "mobile-reports";
fs.rmSync(outDir, { recursive: true, force: true });
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
page.on("response", response => { if (response.status() === 404) errors.push("HTTP 404: " + response.url()); });
page.on("console", message => {
  if (message.type() === "error") errors.push(message.text());
});

const summary = {
  test: "Cosmic Scrap Android-like mobile browser emulation",
  deviceProfile: "Playwright Pixel 7 profile (Chromium emulation; not physical Android hardware)",
  startedAt: new Date().toISOString(),
};
await page.goto(baseURL, { waitUntil: "networkidle" });
// Choose the first-run language before dismissing the cinematic; the modal intentionally blocks background controls.
if (await page.locator("#language-welcome").isVisible()) await page.locator("#language-welcome-option").count().then(async count => { if (count) await page.locator("#language-welcome-option").first().click(); else await page.locator(".language-welcome-option").first().click(); });
if (await page.locator("#intro-screen").isVisible()) await page.locator("#intro-continue").click();
// Verify the classic navigation is present and every destination stays in the same scrollable menu.
const menuURL = page.url();
const menuDestinations = {
  battle: "classic-game",
  galaxy: "classic-galaxy",
  ranking: "classic-ranking",
  skins: "classic-shop",
  career: "classic-career",
  settings: "classic-settings",
};
if (await page.locator(".main-menu-nav-item").count() !== 7) {
  throw new Error("Classic menu navigation must expose all seven sections");
}
for (const [destination, sectionId] of Object.entries(menuDestinations)) {
  await page.locator('[data-menu-destination="' + destination + '"]').click();
  await page.waitForFunction(sectionId => document.activeElement?.id === sectionId, sectionId, { timeout: 2000 });
  const current = await page.locator('[data-menu-destination="' + destination + '"]').getAttribute("aria-current");
  if (current !== "location" || page.url() !== menuURL || await page.locator("#overlay").isHidden()) {
    throw new Error("Menu destination left the single-page hangar: " + destination);
  }
}
await page.locator('[data-menu-destination="battle"]').click();
const accessibility = { checks: [] };
const semantics = await page.evaluate(() => ({
  classicSections: ["classic-game","classic-scores","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings"].every(id => Boolean(document.getElementById(id))),
  language: document.documentElement.lang,
  canvasHasLabel: Boolean(document.querySelector("#game")?.getAttribute("aria-label")),
  startIsButton: document.querySelector("#start")?.tagName === "BUTTON",
  pauseHasLabel: Boolean(document.querySelector("#pause")?.getAttribute("aria-label")),
  settingsDialogHasTitle: Boolean(document.querySelector("#settings-screen [role=dialog]")?.getAttribute("aria-labelledby")),
  reducedFlashControlExists: document.querySelector("#setting-reduced-flash")?.type === "checkbox",
  reducedEffectsControlExists: document.querySelector("#setting-reduced-effects")?.type === "checkbox",
  visibleFocusRuleExists: [...document.styleSheets].some(sheet => {
    try { return [...sheet.cssRules].some(rule => rule.selectorText && rule.selectorText.includes(":focus-visible")); }
    catch { return false; }
  }),
}));
if (!semantics.classicSections || !semantics.language || !semantics.canvasHasLabel || !semantics.startIsButton ||
    !semantics.pauseHasLabel || !semantics.settingsDialogHasTitle ||
    !semantics.reducedFlashControlExists || !semantics.reducedEffectsControlExists || !semantics.visibleFocusRuleExists) {
  throw new Error("Accessibility smoke check failed: " + JSON.stringify(semantics));
}
await page.locator("#start").click();
// Level-up intentionally pauses the run until the player picks an upgrade.
for(let i=0;i<4;i++){
  await page.waitForTimeout(900);
  if(await page.locator("#upgrade-screen").isVisible()){
    const card=page.locator("#upgrade-cards button").first();
    if(await card.count()) await card.click();
  }
}
await page.waitForTimeout(1200);
const runtime = await page.evaluate(() => ({
  time: document.querySelector("#time")?.textContent,
  level: document.querySelector("#level")?.textContent,
  runtimeError: document.querySelector("#runtime-error")?.textContent || null,
  canvasPixels: (() => { const c=document.querySelector("#game");try{const x=c.getContext("2d");const d=x.getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data;return [...d]}catch(e){return String(e)}})()
}));
summary.runtimeProbe = runtime;
if(runtime.runtimeError) throw new Error("Game loop stopped: "+runtime.runtimeError);
if(!runtime.time || runtime.time==="00:00") throw new Error("Game timer did not advance after clicking Start: "+JSON.stringify({runtime,errors}));
const started=await page.evaluate(()=>({overlayHidden:document.querySelector("#overlay").hidden,canvasVisible:getComputedStyle(document.querySelector("#game")).display!=="none"}));
if(!started.overlayHidden||!started.canvasVisible) throw new Error("Start did not enter the arena: "+JSON.stringify(started));
if(errors.length) throw new Error("Browser errors during game start: "+errors.join(" | "));
accessibility.checks.push("live game timer advances and arena canvas renders");
accessibility.checks.push("document semantics, canvas label, pause name, labelled settings dialog, reduced-flash control, visible focus rule, keyboard-only start");
const joystickBounds = await page.locator("#joystick").boundingBox();
if (!joystickBounds) throw new Error("Mobile movement joystick is not visible");
const comboBounds = await page.locator(".bottom-hud .combo-wrap").boundingBox();
if (!comboBounds || comboBounds.y + comboBounds.height > joystickBounds.y + 2) {
  throw new Error("Mobile combo readout overlaps the movement joystick: " + JSON.stringify({comboBounds, joystickBounds}));
}
accessibility.checks.push("combo readout remains visible above the mobile movement joystick");
const joystickX = joystickBounds.x + joystickBounds.width / 2;
const joystickY = joystickBounds.y + joystickBounds.height / 2;
await page.mouse.move(joystickX, joystickY);
await page.mouse.down();
await page.mouse.move(joystickX + 28, joystickY, { steps: 4 });
const joystickDragTransform = await page.locator("#joystick-knob").evaluate(node => node.style.transform);
await page.mouse.up();
const joystickReleasedTransform = await page.locator("#joystick-knob").evaluate(node => node.style.transform);
const joystickDragWorked = Boolean(joystickDragTransform && !joystickDragTransform.includes("0px, 0px"));
const joystickReleased = joystickReleasedTransform.includes("0,0") || joystickReleasedTransform.includes("0px, 0px");
if (!joystickDragWorked || !joystickReleased) throw new Error("Joystick drag/release failed: " + JSON.stringify({joystickDragTransform,joystickReleasedTransform}));
accessibility.checks.push("movement joystick drag and release");
summary.gamePage = { joystickDragWorked, joystickReleased, ...await page.evaluate(() => ({
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
})) };
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
// Opening enemies can legitimately trigger an early level-up; dismiss it before testing pause.
for (let i = 0; i < 4 && await page.locator("#upgrade-screen").isVisible(); i++) {
  const card = page.locator("#upgrade-cards button").first();
  if (await card.count()) await card.click();
  await page.waitForTimeout(100);
}
await page.locator("#upgrade-screen").waitFor({ state: "hidden", timeout: 3000 });
await page.locator("#pause").click();
summary.gamePage.pauseScreenOpened = await page.locator("#pause-screen").isVisible();
if (!summary.gamePage.pauseScreenOpened) throw new Error("Touch pause button did not open pause screen");
await page.locator("#resume").click();
summary.gamePage.touchResumeWorked = await page.locator("#pause-screen").isHidden();
if (!summary.gamePage.touchResumeWorked) throw new Error("Touch resume button did not resume the run");
await page.locator("#pause").click();
await page.locator("#pause-settings").click();
summary.gamePage.pauseSettingsOpened = await page.locator("#settings-screen").isVisible();
if (!summary.gamePage.pauseSettingsOpened) throw new Error("Pause settings button did not open settings screen");
const languageControl = page.locator("#setting-language");
if (await languageControl.count() !== 1) throw new Error("Flag-based language selector is missing from settings");
await languageControl.selectOption("pt-BR");
if (await page.locator("html").getAttribute("lang") !== "pt-BR") throw new Error("Brazilian Portuguese selection did not update the document language");
if (!(await languageControl.inputValue()).includes("pt-BR")) throw new Error("Brazilian Portuguese preference was not reflected in settings");
await languageControl.selectOption("en");
if (await page.locator("html").getAttribute("lang") !== "en") throw new Error("English language selection did not apply");
accessibility.checks.push("English, Turkish and Brazilian Portuguese selector applies and persists its selected value");
// The native checkbox inputs are visually hidden by the settings skin.
 // Tap their visible labels so this follows the same path as a real touch user.
await page.locator('label:has(#setting-reduced-flash)').click();
await page.locator('label:has(#setting-vibration)').click();
await page.locator('label:has(#setting-reduced-effects)').click();
if (!await page.locator("#setting-reduced-flash").isChecked() ||
    !await page.locator("#setting-vibration").isChecked() ||
    !await page.locator("#setting-reduced-effects").isChecked()) {
  throw new Error("Touching the visible accessibility setting labels did not toggle their controls");
}
await page.locator("#settings-close").click();
summary.gamePage.returnedToPauseAfterSettings = await page.locator("#pause-screen").isVisible();
if (!summary.gamePage.returnedToPauseAfterSettings) throw new Error("Closing pause settings did not return to the paused run");
summary.gamePage.settingsPersisted = await page.evaluate(() =>
  localStorage.getItem("cosmic-scrap-reduced-flash") === "on" &&
  localStorage.getItem("cosmic-scrap-vibration") === "on" &&
  localStorage.getItem("cosmic-scrap-effects-mode") === "reduced"
);
if (!summary.gamePage.settingsPersisted) throw new Error("Accessibility settings did not persist");
await page.keyboard.press("Escape");
summary.gamePage.escapeResumes = await page.locator("#pause-screen").isHidden();
if (!summary.gamePage.escapeResumes) throw new Error("Escape did not resume the paused run");
await page.keyboard.press("Escape");
summary.gamePage.escapePauses = await page.locator("#pause-screen").isVisible();
if (!summary.gamePage.escapePauses) throw new Error("Escape did not pause the run");
accessibility.checks.push("Escape key pauses and resumes the run");

accessibility.checks.push("touch pause/resume, reduced-effects control and settings persistence");

// Verify the leaderboard-only panel on the emulated 412px mobile viewport.
const sharedBoardMobile = await page.evaluate(() => {
  const screen = document.querySelector("#online-screen");
  const needsAccount = document.querySelector("#online-needs-account");
  if (!screen) return { present: false };
  screen.hidden = false;
  if (needsAccount) needsAccount.hidden = true;
  const panel = screen.querySelector(".online-panel");
  const board = panel?.querySelector(".online-section");
  const list = document.querySelector("#leaderboard-list");
  const listRect = list?.getBoundingClientRect();
  const legacyControls = ["online-chat-form", "online-create-room", "online-ranked-search", "online-chat-report"];
  return {
    present: true,
    viewportWidth: innerWidth,
    panelWidth: Math.round(panel.getBoundingClientRect().width),
    panelClientWidth: panel.clientWidth,
    panelScrollWidth: panel.scrollWidth,
    boardVisible: Boolean(board && getComputedStyle(board).display !== "none"),
    boardListPresent: Boolean(list),
    boardListWidth: Math.round(listRect?.width || 0),
    legacyControlsHidden: legacyControls.every(id => {
      const el = document.getElementById(id);
      return !el || getComputedStyle(el).display === "none" || el.getBoundingClientRect().width === 0;
    }),
  };
});
summary.sharedLeaderboardMobile = sharedBoardMobile;
if (!sharedBoardMobile.present || !sharedBoardMobile.boardVisible || !sharedBoardMobile.boardListPresent ||
    sharedBoardMobile.boardListWidth < 100 || !sharedBoardMobile.legacyControlsHidden ||
    sharedBoardMobile.panelScrollWidth > sharedBoardMobile.panelClientWidth + 2) {
  throw new Error("Mobile shared leaderboard layout failed: " + JSON.stringify(sharedBoardMobile));
}
accessibility.checks.push("mobile shared leaderboard is visible, legacy multiplayer controls are hidden, and no horizontal overflow");
summary.accessibilitySmoke = accessibility;
if (summary.gamePage.horizontalOverflow) throw new Error("Horizontal overflow detected on mobile game page");
if (!summary.gamePage.startOverlayHidden) throw new Error("Start button did not start the game");
if (!summary.gamePage.pauseScreenOpened) throw new Error("Pause control failed on mobile profile");
if (errors.length) throw new Error("Browser console/page errors: " + errors.join(" | "));

const labErrors = [];
const scenarios = [
  { id: "#baseline", name: "baseline" },
  { id: "#stacked", name: "stacked" },
  { id: "#low", name: "low-end" },
];
const repeatsPerScenario = 5;
const deterministicFields = ["simulatedSeconds", "finish", "kills", "level", "score", "bossesSeen", "bossesDefeated", "bossSpawnSeconds", "bossKillSeconds", "damageTaken"];
summary.balanceScenarios = [];
summary.balanceRepeatability = [];
for (const scenario of scenarios) {
  let firstOutcome = null;
  for (let runNumber = 1; runNumber <= repeatsPerScenario; runNumber++) {
    // Use a fresh browser context so settings changed by the mobile smoke test cannot leak into the balance lab.
    const labContext = await browser.newContext({
      ...device,
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const lab = await labContext.newPage();
    lab.on("pageerror", e => labErrors.push(e.message));
    lab.on("console", m => { if (m.type() === "error") labErrors.push(m.text()); });
    await lab.goto(baseURL + "/tests/playtest.html", { waitUntil: "networkidle" });
    await lab.locator(scenario.id).click();
    await lab.waitForFunction(() => {
      const text = document.querySelector("#status")?.textContent || "";
      return text.includes("300 simulated seconds") || text.includes("Run ended in game") || text.includes("Could not initialize simulation.");
    }, null, { timeout: 600000 });
    const raw = await lab.locator("#report").textContent();
    let report;
    try { report = JSON.parse(raw); } catch { throw new Error(scenario.name + " run " + runNumber + " did not produce valid JSON: " + raw); }
    report.runNumber = runNumber;
    report.targetDurationSeconds = 300;
    report.mobileEmulation = { profile: "Pixel 7", viewport: "412x915", devicePixelRatio: 2 };
    const reportName = scenario.name + "-run-" + runNumber;
    fs.writeFileSync(path.join(outDir, reportName + ".json"), JSON.stringify(report, null, 2));
    summary.balanceScenarios.push({
      scenario: scenario.name,
      runNumber,
      seed: report.seed,
      targetDurationSeconds: report.targetDurationSeconds,
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
    const requiredFields = ["seed", "targetDurationSeconds", "simulatedSeconds", "finish", "kills", "level", "score", "bossesSeen", "bossesDefeated", "bossSpawnSeconds", "bossKillSeconds", "avgFrameMs", "p95FrameMs", "framesOver16_7Pct", "framesOver33Pct"];
    const missingFields = requiredFields.filter(key => !(key in report));
    if (missingFields.length) throw new Error(reportName + " report missing fields: " + missingFields.join(", "));
    if (!Number.isFinite(report.simulatedSeconds) || report.simulatedSeconds <= 0) throw new Error(reportName + " simulation made no progress");
    if (!report.finish || !Array.isArray(report.bossSpawnSeconds) || !Array.isArray(report.bossKillSeconds) ||
        !Number.isFinite(report.avgFrameMs) || !Number.isFinite(report.p95FrameMs) ||
        !Number.isFinite(report.framesOver16_7Pct) || !Number.isFinite(report.framesOver33Pct)) {
      throw new Error(reportName + " report is missing finish or boss telemetry");
    }
    const outcome = Object.fromEntries(deterministicFields.map(key => [key, report[key]]));
    if (firstOutcome && JSON.stringify(outcome) !== JSON.stringify(firstOutcome)) {
      throw new Error(reportName + " diverged from the same-seed reference outcome: " + JSON.stringify({ expected: firstOutcome, actual: outcome }));
    }
    firstOutcome ??= outcome;
    summary.balanceRepeatability.push({ scenario: scenario.name, runNumber, seed: report.seed, sameSeedOutcome: true });
    await labContext.close();
  }
}
summary.playtestBrowserErrors = labErrors;
summary.finishedAt = new Date().toISOString();
const expectedReportNames = scenarios.flatMap(s => Array.from({ length: repeatsPerScenario }, (_, i) => s.name + "-run-" + (i + 1)));
const bossKillRecords = summary.balanceScenarios.flatMap(report =>
  report.bossKillDurationsSeconds
    .map((duration, index) => duration === null ? null : ({
      scenario: report.scenario,
      runNumber: report.runNumber,
      bossNumber: index + 1,
      killDurationSeconds: duration,
    }))
    .filter(Boolean)
);
summary.bossKillTelemetry = {
  successfulKillCount: bossKillRecords.length,
  requiredAutomatedKillRecords: 10,
  records: bossKillRecords,
};
if (bossKillRecords.length < 10) {
  throw new Error("Expected at least ten automated boss kill-time records; got " + bossKillRecords.length);
}
summary.reportIntegrity = {
  expectedScenarios: scenarios.map(s => s.name),
  expectedRunsPerScenario: repeatsPerScenario,
  expectedReportCount: expectedReportNames.length,
  completedReportCount: summary.balanceScenarios.length,
  completedScenarios: [...new Set(summary.balanceScenarios.map(s => s.scenario))],
  allScenariosPresent: scenarios.every(s => summary.balanceScenarios.filter(report => report.scenario === s.name).length === repeatsPerScenario),
  allSameSeedRunsDeterministic: summary.balanceRepeatability.length === expectedReportNames.length && summary.balanceRepeatability.every(r => r.sameSeedOutcome),
  requiredMetricsValidated: true,
};
if (!summary.reportIntegrity.allScenariosPresent || !summary.reportIntegrity.allSameSeedRunsDeterministic) throw new Error("Stress report set incomplete or non-deterministic");
for (const name of expectedReportNames) {
  const reportPath = path.join(outDir, name + ".json");
  if (!fs.existsSync(reportPath) || fs.statSync(reportPath).size < 100) throw new Error("Missing or suspiciously small report: " + name);
}
fs.writeFileSync(path.join(outDir, "mobile-summary.json"), JSON.stringify(summary, null, 2));
if (labErrors.length) throw new Error("Playtest browser errors: " + labErrors.join(" | "));
console.log(JSON.stringify(summary, null, 2));
await browser.close();
