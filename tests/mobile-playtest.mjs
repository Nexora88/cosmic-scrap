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
await context.addInitScript(() => { window.__COSMIC_SCRAP_TEST__ = true; Object.defineProperty(navigator,"hardwareConcurrency",{configurable:true,get:()=>6}); Object.defineProperty(navigator,"deviceMemory",{configurable:true,get:()=>4}); });
const errors = [];
const page = await context.newPage();
await page.addInitScript(() => {
  if (!localStorage.getItem("cosmic-scrap-save-v2")) {
    localStorage.setItem("cosmic-scrap-save-v2", JSON.stringify({
      version: 2, bestScore: 900, totalScrap: 2400, scrapCore: 1000,
      careerXp: 640, careerLevel: 5, totalKills: 35, runs: 3,
      meta: { health: 0, damage: 0, idle: 0, speed: 0, pickup: 0 },
      selectedFlag: "🇹🇷", ownedFlags: ["🇹🇷"], capturedRegions: [],
      achievements: [], raidWins: 0
    }));
  }
});
page.on("pageerror", error => errors.push(error.message));
page.on("response", response => { if (response.status() === 404) errors.push("HTTP 404: " + response.url()); });
page.on("console", message => {
  if (message.type() === "error") errors.push(message.text());
});

const summary = {
  test: "Cosmic Scrap Android-like mobile browser emulation",
  deviceProfile: "Galaxy A71-like midrange profile (Chromium emulation; not physical Android hardware)",
  startedAt: new Date().toISOString(),
};
await page.goto(baseURL, { waitUntil: "networkidle" });
// Dismiss the first-run cinematic before interacting with the main menu.
if (await page.locator("#intro-screen").isVisible()) await page.locator("#intro-continue").click();
// Verify the seven navigation items target real in-page sections and controls.
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
if (await page.locator("#daily-status-panel").count() !== 1 ||
    await page.locator("#sector-boss-browser").count() !== 1 ||
    await page.locator(".sector-catalog-card").count() !== 7 ||
    await page.locator(".boss-catalog-card").count() !== 6) {
  throw new Error("Daily status, seven-sector atlas or six-boss catalog failed to mount");
}
await page.evaluate(() => window.dispatchEvent(new CustomEvent("cosmic-scrap:run-ended", {
  detail: { bossesDefeated: 1, scrapCollected: 300, survivalSeconds: 240 }
})));
if (!(await page.locator(".daily-objective-value").innerText()).includes("/")) {
  throw new Error("Daily objective did not update after a completed run event");
}
await page.locator('[data-menu-destination="battle"]').click();
const coreBeforeShop=await page.evaluate(()=>JSON.parse(localStorage.getItem("cosmic-scrap-save-v2")||"{}").scrapCore);
await page.locator('[data-menu-destination="skins"]').click();
await page.locator('#classic-shop [data-open="skin-shop-open"]').click();
await page.locator("#skin-shop-screen").waitFor({state:"visible"});
await page.locator('[data-skin="mint"]').click();
await page.locator('[data-flag="🇯🇵"]').click();
const shopAfterPurchase=await page.evaluate(()=>({
  save:JSON.parse(localStorage.getItem("cosmic-scrap-save-v2")||"{}"),
  skin:localStorage.getItem("cosmic-scrap-skin")
}));
if(shopAfterPurchase.skin!=="mint"||shopAfterPurchase.save.selectedFlag!=="🇯🇵"||
   !shopAfterPurchase.save.ownedFlags.includes("🇯🇵")||
   !(shopAfterPurchase.save.scrapCore<coreBeforeShop)) {
  throw new Error("Skin equip, flag purchase or currency accounting failed: "+JSON.stringify({coreBeforeShop,shopAfterPurchase}));
}
await page.locator("#skin-shop-close").click();
await page.reload({waitUntil:"networkidle"});
if(await page.locator("#intro-screen").isVisible())await page.locator("#intro-continue").click();
await page.locator('[data-menu-destination="skins"]').click();
await page.locator('#classic-shop [data-open="skin-shop-open"]').click();
const shopAfterReload=await page.evaluate(()=>({
  skin:localStorage.getItem("cosmic-scrap-skin"),
  save:JSON.parse(localStorage.getItem("cosmic-scrap-save-v2")||"{}"),
  careerLevel:document.querySelector("#career-level")?.textContent,
  selectedSkin:document.querySelector('[data-skin="mint"]')?.getAttribute("aria-pressed"),
  selectedFlag:document.querySelector('[data-flag="🇯🇵"]')?.getAttribute("aria-pressed")
}));
if(shopAfterReload.skin!=="mint"||shopAfterReload.selectedSkin!=="true"||
   shopAfterReload.selectedFlag!=="true"||!["LEVEL 5","SEVİYE 5"].includes(shopAfterReload.careerLevel)||
   !shopAfterReload.save.ownedFlags.includes("🇯🇵")) {
  throw new Error("Shop, flag, skin or career progress did not survive reload: "+JSON.stringify(shopAfterReload));
}
await page.locator("#skin-shop-close").click();
const accessibility = { checks: [] };
accessibility.checks.push("skin equip, flag purchase, Scrap Core deduction and career/collection persistence after reload");

const semantics = await page.evaluate(() => ({
  classicSections: ["classic-game","classic-scores","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings"].every(id => Boolean(document.getElementById(id))),
  language: document.documentElement.lang,
  canvasHasLabel: Boolean(document.querySelector("#game")?.getAttribute("aria-label")),
  startIsButton: document.querySelector("#start")?.tagName === "BUTTON",
  pauseHasLabel: Boolean(document.querySelector("#pause")?.getAttribute("aria-label")),
  settingsDialogHasTitle: Boolean(document.querySelector("#settings-screen [role=dialog]")?.getAttribute("aria-labelledby")),
  reducedFlashControlExists: document.querySelector("#setting-reduced-flash")?.type === "checkbox",
  reducedEffectsControlExists: document.querySelector("#setting-reduced-effects")?.type === "checkbox",
  controlSideSelectExists: document.querySelector("#setting-control-side")?.tagName === "SELECT",
  joystickDefaultsRight: document.querySelector("#joystick")?.classList.contains("joystick-right") && localStorage.getItem("cosmic-scrap-control-side") === "right",
  visibleFocusRuleExists: [...document.styleSheets].some(sheet => {
    try { return [...sheet.cssRules].some(rule => rule.selectorText && rule.selectorText.includes(":focus-visible")); }
    catch { return false; }
  }),
}));
if (!semantics.classicSections || !semantics.language || !semantics.canvasHasLabel || !semantics.startIsButton ||
    !semantics.pauseHasLabel || !semantics.settingsDialogHasTitle ||
    !semantics.reducedFlashControlExists || !semantics.reducedEffectsControlExists || !semantics.controlSideSelectExists || !semantics.joystickDefaultsRight || !semantics.visibleFocusRuleExists) {
  throw new Error("Accessibility smoke check failed: " + JSON.stringify(semantics));
}
const menuBaselineRaf = await page.evaluate(async () => { const values=[];let previous=performance.now();const end=previous+1200;await new Promise(resolve=>{function frame(now){values.push(now-previous);previous=now;if(now<end)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});const samples=values.slice(1),sorted=[...samples].sort((a,b)=>a-b);return {sampleFrames:samples.length,avgFrameIntervalMs:+(samples.reduce((a,b)=>a+b,0)/Math.max(1,samples.length)).toFixed(2),p95FrameIntervalMs:+(sorted[Math.floor((sorted.length-1)*.95)]||0).toFixed(2)}});
summary.menuBaselineRaf = menuBaselineRaf;
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
const testApiReady=await page.evaluate(()=>Boolean(window.__COSMIC_SCRAP_TEST_API__));
if(!testApiReady)throw new Error("Test-only gameplay lifecycle API was not initialized");
await page.evaluate(()=>window.__COSMIC_SCRAP_TEST_API__.forceLevelUp());
await page.locator("#upgrade-screen").waitFor({state:"visible",timeout:3000});
const upgradeCard=page.locator("#upgrade-cards button").first();
if(!(await upgradeCard.count()))throw new Error("Level-up event did not render an upgrade choice");
await upgradeCard.click();
await page.locator("#upgrade-screen").waitFor({state:"hidden",timeout:3000});
const afterUpgrade=await page.evaluate(()=>window.__COSMIC_SCRAP_TEST_API__.snapshot());
if(!afterUpgrade?.running||afterUpgrade.levelUpPending)throw new Error("Selecting an upgrade did not resume the active run");
accessibility.checks.push("level-up choice applies and resumes the run");
if(!await page.locator("#game").evaluate(node=>getComputedStyle(node).contain==="strict"))throw new Error("Canvas is missing its isolated rendering layer");
if(errors.length) throw new Error("Browser errors during game start: "+errors.join(" | "));
accessibility.checks.push("live game timer advances and arena canvas renders");
accessibility.checks.push("document semantics, canvas label, pause name, labelled settings dialog, reduced-flash control, visible focus rule, keyboard-only start");
const joystickBounds = await page.locator("#joystick").boundingBox();
if (!joystickBounds) throw new Error("Mobile movement joystick is not visible");
const joystickX = joystickBounds.x + joystickBounds.width / 2;
const joystickY = joystickBounds.y + joystickBounds.height / 2;
const touchSession = await context.newCDPSession(page);
const beforeTouchMove = await page.evaluate(() => window.__COSMIC_SCRAP_TEST_API__.snapshot());
await touchSession.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: joystickX, y: joystickY, id: 1 }] });
await touchSession.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: joystickX + 38, y: joystickY, id: 1 }] });
await page.waitForTimeout(260);
const duringTouchMove = await page.evaluate(() => window.__COSMIC_SCRAP_TEST_API__.snapshot());
const touchMovedPlayer = duringTouchMove.player.x > beforeTouchMove.player.x + 12;
const touchInputRegistered = duringTouchMove.input.x > .5 && duringTouchMove.input.stickActive;
await touchSession.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await page.waitForTimeout(60);
const afterTouchRelease = await page.evaluate(() => window.__COSMIC_SCRAP_TEST_API__.snapshot());
const touchReleased = !afterTouchRelease.input.stickActive && Math.abs(afterTouchRelease.input.x) < .01 && Math.abs(afterTouchRelease.input.y) < .01;
if (!touchMovedPlayer || !touchInputRegistered || !touchReleased) throw new Error("Real touch-event joystick movement failed: " + JSON.stringify({ beforeTouchMove, duringTouchMove, afterTouchRelease }));
const joystickXMouse = joystickBounds.x + joystickBounds.width / 2;
const joystickYMouse = joystickBounds.y + joystickBounds.height / 2;
await page.mouse.move(joystickXMouse, joystickYMouse);
await page.mouse.down();
await page.mouse.move(joystickXMouse + 28, joystickYMouse, { steps: 4 });
const joystickDragTransform = await page.locator("#joystick-knob").evaluate(node => node.style.transform);
await page.mouse.up();
const joystickReleasedTransform = await page.locator("#joystick-knob").evaluate(node => node.style.transform);
const joystickDragWorked = Boolean(joystickDragTransform && !joystickDragTransform.includes("0px, 0px"));
const joystickReleased = joystickReleasedTransform.includes("0,0") || joystickReleasedTransform.includes("0px, 0px");
if (!joystickDragWorked || !joystickReleased) throw new Error("Joystick drag/release failed: " + JSON.stringify({joystickDragTransform,joystickReleasedTransform}));
accessibility.checks.push("actual touch pointer moves the ship, registers direction and releases cleanly");
accessibility.checks.push("mouse joystick drag and release");
summary.gamePage = { joystickDragWorked, joystickReleased, touchMovedPlayer, touchInputRegistered, touchReleased, ...await page.evaluate(() => ({
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
summary.gamePage.renderCost = await page.evaluate(() => window.__cosmicScrapPerf || null);
summary.gamePage.framePacingInterpretation = frameData.sampleFrames < 90 || frameData.avgFrameIntervalMs > 25
  ? "Headless CI requestAnimationFrame is throttled; interval is diagnostic only, not a device FPS result."
  : "Browser-emulated frame pacing only; physical-device FPS remains unverified.";
console.log("LIVE_MOBILE_FRAME_METRICS " + JSON.stringify({ raf: frameData, renderCost: summary.gamePage.renderCost, interpretation: summary.gamePage.framePacingInterpretation }));
if (!summary.gamePage.renderCost || summary.gamePage.renderCost.samples < 10) throw new Error("Game update/draw timing diagnostics were not collected");
if (summary.gamePage.renderCost.p95UpdateDrawMs > 25) throw new Error("Game update/draw CPU cost exceeded 25ms at p95: " + JSON.stringify(summary.gamePage.renderCost));
// Opening enemies can legitimately trigger an early level-up; dismiss it before testing pause.
async function dismissPendingUpgrades() {
  for (let i = 0; i < 12; i++) {
    if (!await page.locator("#upgrade-screen").isVisible()) return;
    const card = page.locator("#upgrade-cards button").first();
    if (!(await card.count())) throw new Error("Upgrade overlay opened without a selectable card");
    await card.click();
    await page.waitForTimeout(80);
  }
  if (await page.locator("#upgrade-screen").isVisible()) {
    throw new Error("Upgrade overlay did not settle after 12 consecutive choices");
  }
}
await dismissPendingUpgrades();
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
await page.locator("#setting-control-side").selectOption("left");
const leftControlClassApplied = await page.locator("#joystick").evaluate(node => node.classList.contains("joystick-left"));
await page.locator("#setting-control-side").selectOption("right");
const rightControlClassApplied = await page.locator("#joystick").evaluate(node => node.classList.contains("joystick-right"));
const joystickHiddenWhilePaused = await page.locator("#joystick").evaluate(node => getComputedStyle(node).display === "none");
summary.gamePage.controlSideSelectionWorks = leftControlClassApplied && rightControlClassApplied && joystickHiddenWhilePaused;
if (!summary.gamePage.controlSideSelectionWorks) throw new Error("Left/right joystick preference did not apply, or joystick remained visible while paused");
await page.locator("#settings-close").click();
summary.gamePage.returnedToPauseAfterSettings = await page.locator("#pause-screen").isVisible();
if (!summary.gamePage.returnedToPauseAfterSettings) throw new Error("Closing pause settings did not return to the paused run");
await page.locator("#resume").click();
const rightControlBounds = await page.locator("#joystick").boundingBox();
const rightControlVisibleAndPositioned = Boolean(rightControlBounds) && rightControlBounds.x > 206;
await page.locator("#pause").click();
await page.locator("#pause-settings").click();
await page.locator("#setting-control-side").selectOption("left");
await page.locator("#settings-close").click();
await page.locator("#resume").click();
const leftControlBounds = await page.locator("#joystick").boundingBox();
const leftControlVisibleAndPositioned = Boolean(leftControlBounds) && leftControlBounds.x < 206;
summary.gamePage.controlSideSelectionWorks = rightControlVisibleAndPositioned && leftControlVisibleAndPositioned;
if (!summary.gamePage.controlSideSelectionWorks) throw new Error("Left/right joystick setting did not reposition the visible gameplay control correctly");
await page.locator("#pause").click();
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

accessibility.checks.push("touch pause/resume, reduced-effects control, right/left joystick setting and settings persistence");
const beforeDeath=await page.evaluate(()=>window.__COSMIC_SCRAP_TEST_API__.snapshot());
await page.evaluate(()=>window.__COSMIC_SCRAP_TEST_API__.forceDeath());
await page.locator("#death-screen").waitFor({state:"visible",timeout:3000});
const deathState=await page.evaluate(()=>({snapshot:window.__COSMIC_SCRAP_TEST_API__.snapshot(),runs:JSON.parse(localStorage.getItem("cosmic-scrap-save-v2")||"{}").runs,hasSummary:Boolean(document.querySelector("#run-stats")?.textContent.trim())}));
if(deathState.snapshot?.running!==false||deathState.runs!==(beforeDeath.profile.runs||0)+1||!deathState.hasSummary)throw new Error("Death summary or run progression did not finalize: "+JSON.stringify(deathState));
await page.locator("#retry").click();
await page.waitForFunction(()=>window.__COSMIC_SCRAP_TEST_API__?.snapshot()?.elapsed>0.15,null,{timeout:5000});
const restarted=await page.evaluate(()=>window.__COSMIC_SCRAP_TEST_API__.snapshot());
if(!restarted?.running||restarted.elapsed>1.5)throw new Error("Retry did not create a fresh active run: "+JSON.stringify(restarted));
accessibility.checks.push("death summary, career accounting, saved progression and retry/restart lifecycle");
// A fresh retry can earn chained upgrades while the simulation resumes. Drain
// the queue and dispatch the real pause button handler without pointer interception.
let pausedAfterRetry = false;
for (let attempt = 0; attempt < 12; attempt++) {
  await dismissPendingUpgrades();
  if (await page.locator("#upgrade-screen").isHidden()) {
    await page.locator("#pause").evaluate(button => button.click());
    if (await page.locator("#pause-screen").isVisible()) {
      pausedAfterRetry = true;
      break;
    }
  }
  await page.waitForTimeout(120);
}
if (!pausedAfterRetry) throw new Error("Restarted run could not be paused after clearing chained upgrade overlays");

// Retry may queue another upgrade on the same frame that pause opens. Drain
// any late overlay before leaving the paused run for the main menu.
await dismissPendingUpgrades();
await page.locator("#upgrade-screen").waitFor({state:"hidden",timeout:3000});
// Use the actual menu button handler after confirming the overlay is gone.
await page.locator("#pause-menu").evaluate(button => button.click());
await page.locator("#pause-screen").waitFor({state:"hidden",timeout:3000});

// Verify the capsule is visible before the first reward, then exercise a real reveal.
await page.locator("#scrap-capsule-menu-open").click();
summary.gamePage.capsuleEmptyStateVisible = await page.locator("#scrap-capsule-layer").isVisible() && await page.locator("#scrap-capsule-reveal").isHidden();
if (!summary.gamePage.capsuleEmptyStateVisible) throw new Error("Empty capsule state did not open from the main menu");
await page.locator("#scrap-capsule-close").click();
await page.evaluate(() => { localStorage.setItem("cosmic-scrap-capsules","1"); window.dispatchEvent(new Event("cosmic-scrap:capsule-earned")); });
await page.locator("#scrap-capsule-menu-open").click();
await page.locator("#scrap-capsule-reveal").click();
await page.locator("#scrap-capsule-reward:not([hidden])").waitFor({state:"visible",timeout:2500});
summary.gamePage.capsuleRewardRevealWorks = await page.locator("#scrap-capsule-reward").isVisible();
if (!summary.gamePage.capsuleRewardRevealWorks) throw new Error("Capsule reward did not reveal");
await page.locator("#scrap-capsule-close").click();
summary.optionalPromo = { buttonPresent: await page.locator("#nexora-ai-open").count() === 1, autoOpened: await page.locator("#nexora-ai-layer").isVisible().catch(()=>false) };
if (!summary.optionalPromo.buttonPresent || summary.optionalPromo.autoOpened) throw new Error("Nexora AI showcase should be available only as an optional menu action");

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
    await labContext.addInitScript(() => { Object.defineProperty(navigator,"hardwareConcurrency",{configurable:true,get:()=>6}); Object.defineProperty(navigator,"deviceMemory",{configurable:true,get:()=>4}); });
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
    report.mobileEmulation = { profile: "Galaxy A71-like midrange", viewport: "412x915", devicePixelRatio: 2 };
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
    if (scenario.name === "low-end") {
      const expectedCaps = { enemies: 140, playerProjectiles: 240, enemyProjectiles: 72, particles: 70 };
      if (JSON.stringify(report.lowEndCaps) !== JSON.stringify(expectedCaps)) throw new Error("Low-end scenario did not use production caps: " + JSON.stringify(report.lowEndCaps));
    }
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
  requiredAutomatedKillRecords: 5,
  records: bossKillRecords,
};
if (bossKillRecords.length < 5) {
  throw new Error("Expected one boss kill-time record from each of the five stacked stress runs; got " + bossKillRecords.length);
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
