import assert from "node:assert/strict";
import { chromium } from "playwright";
import { translations, REQUIRED_SETTINGS_FOOTER_KEYS, REQUIRED_ACCOUNT_RUNTIME_KEYS } from "../js/language.js";
import { HOUSE_PROMO_LOCALES } from "../js/ui/HousePromoOverlay.js";

const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
const baseURL=process.env.COSMIC_SCRAP_BASE_URL||"http://127.0.0.1:4173/";
const normalizeText=value=>String(value||"").replace(/\s+/g," ").trim();
const browser=await chromium.launch({headless:true});
const failures=[];
try {
 for (const viewport of [{width:390,height:844},{width:1365,height:900}]) {
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await context.newPage();
  page.on("pageerror",error=>failures.push("pageerror: "+error.message));
  await page.goto(baseURL,{waitUntil:"domcontentloaded"});
  for (const locale of locales) {
   await page.evaluate(code=>{localStorage.setItem("cosmic-scrap-language",code);localStorage.setItem("cosmic-scrap-language-selected","1")},locale);
   await page.reload({waitUntil:"domcontentloaded"});
   // The first-visit cinematic intro is intentionally modal; dismiss it before testing home settings.
   const introContinue = page.locator("#intro-continue");
   if (await introContinue.isVisible().catch(() => false)) {
    await introContinue.click();
    await page.locator("#intro-screen").waitFor({state:"hidden"});
   }
   const installPanel=normalizeText(await page.locator(".install-app-panel").innerText());
   for(const key of ["TAKE TAVIRO OFFLINE","Install the game on your device. Your TAVIRO icon opens it in a clean app window.","INSTALL TAVIRO","Install TAVIRO on this device for offline play."]) {
    assert.ok(translations[locale][key],locale+" missing install-panel translation: "+key);
    assert.ok(installPanel.includes(normalizeText(translations[locale][key])),locale+" install panel missing translated copy: "+key);
   }
   assert.equal(await page.locator("#install-app").isVisible(),true,locale+" install action should be visible in the browser menu");
   assert.equal(await page.locator("#install-app-status").getAttribute("aria-live"),"polite");
   await page.locator("#settings-open").waitFor({state:"visible"});
   await page.locator("#settings-open").click();
   await page.locator("#settings-screen").waitFor({state:"visible"});
   const rendered=normalizeText(await page.locator("#settings-screen").innerText());
   for (const key of [...REQUIRED_SETTINGS_FOOTER_KEYS.slice(0,3), "Scales all procedural SFX ·", ...REQUIRED_SETTINGS_FOOTER_KEYS.slice(4,11)]) {
    assert.ok(translations[locale][key],locale+" missing dictionary entry: "+key);
    assert.ok(rendered.includes(normalizeText(translations[locale][key])),locale+" settings screen missing translation: "+key+" => "+translations[locale][key]);
   }
   await page.locator("#settings-close").click();
   await page.locator("#account-open").click();
   await page.locator("#account-screen").waitFor({state:"visible"});
   await page.locator("#account-mode-signup").click();
   assert.equal(normalizeText(await page.locator("#account-auth-title").innerText()),normalizeText(translations[locale]["CREATE ACCOUNT"]),locale+" account title not localized");
   assert.equal(normalizeText(await page.locator("#account-auth-submit").innerText()),normalizeText(translations[locale]["CREATE ACCOUNT"]),locale+" account submit not localized");
   assert.equal(normalizeText(await page.locator("#account-status").innerText()),normalizeText(translations[locale]["Use an email you can access. Confirmation may be required before sign-in."]),locale+" signup guidance not localized");
   for(const key of REQUIRED_ACCOUNT_RUNTIME_KEYS)assert.ok(translations[locale][key],locale+" missing account runtime translation "+key);
   await page.locator("#account-close").click();
   const deathScreen=page.locator("#death-screen");
   await deathScreen.evaluate(el=>{el.hidden=false});
   const reviveCopy=HOUSE_PROMO_LOCALES[locale];
   const reviveButton=page.locator("#house-revive");
   assert.equal(normalizeText(await reviveButton.textContent()),normalizeText("✦ "+reviveCopy.revive),locale+" revive action not localized");
   assert.equal(normalizeText(await page.locator(".house-promo-note").textContent()),normalizeText(reviveCopy.note),locale+" revive note not localized");
   await reviveButton.click();
   assert.equal(normalizeText(await page.locator("#revive-title").textContent()),normalizeText(reviveCopy.title),locale+" revive dialog title not localized");
   assert.equal(normalizeText(await page.locator("#revive-body").textContent()),normalizeText(reviveCopy.body),locale+" revive dialog body not localized");
   assert.equal(normalizeText(await page.locator("#revive-now").textContent()),normalizeText(reviveCopy.now),locale+" revive confirmation not localized");
   assert.equal(normalizeText(await page.locator("#revive-cancel").textContent()),normalizeText(reviveCopy.cancel),locale+" revive cancel not localized");
   window.dispatchEvent(new CustomEvent("cosmic-scrap:revive-result",{detail:{ok:false,reason:"unavailable"}}));
   assert.equal(normalizeText(await page.locator("#revive-status").textContent()),normalizeText(reviveCopy.unavailable),locale+" revive failure status not localized");
   await page.locator("#revive-cancel").click();
   window.dispatchEvent(new CustomEvent("cosmic-scrap:revive-result",{detail:{ok:true}}));
   assert.equal(normalizeText(await reviveButton.textContent()),normalizeText("✦ "+reviveCopy.used),locale+" revive-used state not localized");
   window.dispatchEvent(new Event("cosmic-scrap:run-restarted"));
   await deathScreen.evaluate(el=>{el.hidden=true});
   await page.locator("#online-open").click();
   await page.locator("#online-open").click();
   await page.locator("#online-screen").waitFor({state:"visible"});
   assert.equal(normalizeText(await page.locator("#online-refresh-board").innerText()),normalizeText(translations[locale]["REFRESH ↻"]),locale+" leaderboard refresh button not localized");
   assert.equal(normalizeText(await page.locator("#online-needs-account-button").innerText()),normalizeText(translations[locale]["CREATE FREE PILOT ACCOUNT"]+" ↗"),locale+" free-account action not localized");
   await page.locator("#online-close").click();
   const collection=normalizeText(await page.locator("#skin-shop-open").innerText());
   assert.ok(collection.includes(normalizeText(translations[locale]["SKINS & FLAGS COLLECTION"])),locale+" collection entry not localized");
   await page.locator("#skin-shop-open").click();
   await page.locator("#skin-shop-screen").waitFor({state:"visible"});
   const shop=normalizeText(await page.locator("#skin-shop-screen").innerText());
   const visibleCollectionKeys=["PILOT HANGAR","SKIN & FLAG COLLECTION","Cosmetics only · choose your look before launching a run","BACK TO HANGAR","Earn cosmetics through play or spend Scrap Core in the collection shop.","LVL 1 · STARTER","LVL 2","LVL 3","LVL 5","CAPTURE REGIONS: 3","WIN RAIDS: 3","CAREER LEVEL","LEVEL 1","0 / 100 XP TO NEXT LEVEL"];
   for (const key of visibleCollectionKeys) assert.ok(shop.includes(normalizeText(translations[locale][key])),locale+" visible collection screen missing translation: "+key+" => "+translations[locale][key]+"; rendered text: "+shop);
   // This duplicate subheading is intentionally hidden by css/ui.css in the shop layout.
   // Keep its locale entries covered without incorrectly requiring hidden text in innerText.
   for (const key of ["PILOT ARMORY","SKINS · FLAGS · RARE BANNERS"]) assert.ok(translations[locale][key],locale+" missing hidden collection label translation: "+key);
   const duplicateHeadings=page.locator("#skin-shop-content .skin-picker-heading");
   assert.ok(await duplicateHeadings.count()>=1,locale+" expected collection subheadings");
   assert.deepEqual(await duplicateHeadings.evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).display)),Array(await duplicateHeadings.count()).fill("none"),locale+" duplicate collection subheadings should remain hidden");
   await page.locator("#skin-shop-close").click();
   const leaderboardEntry=normalizeText(await page.locator("#online-open").innerText());
   assert.ok(leaderboardEntry.includes(normalizeText(translations[locale]["Online scores paused while server validation is built"])),locale+" leaderboard entry does not explain paused scores");
   const accountEntry=normalizeText(await page.locator("#home-create-account").innerText());
   assert.ok(accountEntry.includes(normalizeText(translations[locale]["Optional · profile and cloud-save backup"])),locale+" account entry advertises unavailable score publishing");
   const footer=normalizeText(await page.locator(".legal-links").innerText());
   assert.ok(footer.includes(normalizeText(translations[locale].PRIVACY)),locale+" privacy footer not localized");
   assert.ok(footer.includes(normalizeText(translations[locale].SUPPORT)),locale+" support footer not localized");
   assert.ok(footer.includes(normalizeText(translations[locale].ABOUT)),locale+" About footer not localized");
   const vision=normalizeText(await page.locator(".taviro-vision-note").innerText());
   for(const key of ["SCIENCE · CURIOSITY · THE FUTURE","Atatürk's vision for the Republic placed science, education and progress at the centre of a modern society. His era also encouraged a stronger national interest in aviation and the possibilities of the sky. It was a belief that knowledge, research and determined work could widen the horizon of what people might achieve.","TAVIRO takes inspiration from that spirit of curiosity: look beyond what is familiar, learn how things work and keep building toward the future."]) {
    assert.ok(vision.includes(normalizeText(translations[locale][key])),locale+" home vision section not localized: "+key);
   }
   const maker=normalizeText(await page.locator(".taviro-maker-credit").innerText());
   assert.ok(maker.includes(normalizeText(translations[locale]["Created by Ahmet Eymen Bakraç · Independent Turkish Developer"])),locale+" creator credit not localized");
   assert.ok(!footer.toLowerCase().includes("github"),locale+" public footer still exposes GitHub");
   const width=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(width.scroll<=width.client+1,viewport.width+"px "+locale+" horizontal overflow: "+JSON.stringify(width));
  }
  await context.close();
 }
 assert.deepEqual(failures,[]);
 console.log("Settings/footer localization passed: 9 locales × 2 viewports; GitHub footer link removed and no horizontal overflow.");
} finally { await browser.close(); }
