import { chromium } from "playwright";

const baseUrl = process.env.COSMIC_SCRAP_BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => { localStorage.setItem("cosmic-scrap-language-selected", "1"); localStorage.setItem("cosmic-scrap-capsules", "1"); });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
page.on("response", response => { if (response.status() === 404) errors.push("HTTP 404: " + response.url()); });

try {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  if (await page.locator("#intro-screen").isVisible()) await page.locator("#intro-continue").click();
  await page.locator(".main-menu-nav-item").first().waitFor({ state: "visible", timeout: 10000 });
  if (await page.locator(".main-menu-nav-item").count() !== 7) throw new Error("Desktop navigation must expose seven destinations");
  const languageFlags = await page.locator("#home-language-flag, #setting-language-flag").evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0));
  if (!languageFlags) throw new Error("Desktop language flag SVGs did not load");
  await page.locator("#home-language-current").click();
  const homeLanguageOptions = page.locator("#home-language-options .language-picker-option");
  if (await homeLanguageOptions.count() !== 9) throw new Error("Home language menu must show nine flag options");
  if (!await homeLanguageOptions.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))) throw new Error("A home language option flag did not load");
  await homeLanguageOptions.filter({ hasText: "Türkçe" }).click();
  if (await page.locator("#home-language-select").inputValue() !== "tr") throw new Error("Selecting a language flag did not update the locale");
  if (await page.locator("#joystick").evaluate(node => getComputedStyle(node).display) !== "none") throw new Error("Touch joystick must be hidden on desktop");
  const menuURL = page.url();
  for (const [destination, section] of Object.entries({
    battle: "classic-game", galaxy: "classic-galaxy", ranking: "classic-ranking",
    skins: "classic-shop", career: "classic-career", settings: "classic-settings"
  })) {
    await page.locator('[data-menu-destination="' + destination + '"]').click();
    await page.waitForFunction(id => document.activeElement?.id === id, section);
    if (page.url() !== menuURL) throw new Error("Navigation left the single-page menu: " + destination);
  }
  await page.locator('[data-menu-destination="skins"]').click();
  await page.locator("#skin-shop-open").click();
  await page.locator("#scrap-capsule-open").click({ timeout: 7000 });
  await page.locator("#scrap-capsule-reveal").click();
  await page.locator("#scrap-capsule-reveal").click();
  await page.locator("#scrap-capsule-reveal").click();
  await page.locator("#scrap-capsule-reward").waitFor({ state: "visible", timeout: 7000 });
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.locator("#scrap-capsule-reward").scrollIntoViewIfNeeded();
  const capsuleScroll = await page.locator("#scrap-capsule-layer").evaluate(node => ({ mode: getComputedStyle(node).overflowY, top: node.scrollTop }));
  if (capsuleScroll.mode !== "auto") throw new Error("Desktop capsule reward layer is not vertically scrollable");
  if (capsuleScroll.top <= 0) throw new Error("Desktop capsule reward did not scroll into the visible area");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#scrap-capsule-close").click();
  await page.locator("#skin-shop-close").click();
  await page.locator('[data-menu-destination="battle"]').click();

  const promoButton = page.locator("#nexora-projects-open");
  if (await promoButton.count() !== 1) throw new Error("Optional Nexora project showcase is missing");
  await promoButton.click();
  const promoDialog = page.locator("#nexora-projects-layer [role=dialog]");
  await promoDialog.waitFor({ state: "visible" });
  const firstCampaign = await page.locator("#nexora-project-title").textContent();
  const firstSource = await page.locator("#nexora-project-video").getAttribute("src");
  if (!firstSource?.includes("/assets/promos/")) throw new Error("Project video did not resolve to a local promo asset");
  await page.waitForFunction(() => document.querySelector("#nexora-project-video")?.readyState >= 1, null, { timeout: 10000 });
  await page.locator("#nexora-project-next").click();
  await page.waitForFunction(previous => document.querySelector("#nexora-project-title")?.textContent !== previous, firstCampaign);
  const nextSource = await page.locator("#nexora-project-video").getAttribute("src");
  if (nextSource === firstSource) throw new Error("Next project repeated the same video");
  await page.waitForFunction(() => document.querySelector("#nexora-project-video")?.readyState >= 1, null, { timeout: 10000 });
  await page.locator("#nexora-project-skip").click();
  if (await promoDialog.isVisible()) throw new Error("Skip did not close the project showcase");
  if (await page.evaluate(() => document.activeElement?.id) !== "nexora-projects-open") throw new Error("Focus was not returned to the showcase trigger");

  const before = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  if (before.documentWidth > before.width + 2) throw new Error("Desktop menu has horizontal overflow");
  await page.locator("#start").click();
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(700);
    if (await page.locator("#upgrade-screen").isVisible()) {
      const card = page.locator("#upgrade-cards button").first();
      if (await card.count()) await card.click();
    }
  }
  await page.waitForFunction(() => (document.querySelector("#time")?.textContent || "00:00") !== "00:00", null, { timeout: 10000 });
  await page.keyboard.press("Escape");
  if (!await page.locator("#pause-screen").isVisible()) throw new Error("Escape did not pause the desktop run");
  await page.keyboard.press("Escape");
  if (await page.locator("#pause-screen").isVisible()) throw new Error("Escape did not resume the desktop run");
  await page.locator("#pause").click();
  await page.locator("#pause-settings").click();
  if (!await page.locator("#settings-screen").isVisible()) throw new Error("Pause settings did not open");
  await page.locator("#setting-language-current").click();
  const settingsLanguageOptions = page.locator("#setting-language-options .language-picker-option");
  if (await settingsLanguageOptions.count() !== 9) throw new Error("Settings language menu must show nine flag options");
  if (!await settingsLanguageOptions.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))) throw new Error("A settings language option flag did not load");
  await page.locator("#setting-language-current").click();
  await page.locator("#settings-close").click();
  if (!await page.locator("#pause-screen").isVisible()) throw new Error("Settings did not return to the paused run");
  if (errors.length) throw new Error("Edge console/page errors: " + errors.join(" | "));
  console.log(JSON.stringify({ browser: "Microsoft Edge", viewport: before, navigation: "7/7", languageFlags: "all nine loaded in both pickers", desktopJoystick: "hidden", capsuleReward: "revealed and scrollable", projectPromoRotation: "passed", promoSkipAndFocusReturn: "passed", start: "passed", keyboardPauseResume: "passed", settingsReturn: "passed", errors }, null, 2));
} finally {
  await browser.close();
}
