import assert from "node:assert/strict";
import { chromium } from "playwright";
import { translations, REQUIRED_SETTINGS_FOOTER_KEYS } from "../js/language.js";

const locales=["en","tr","pt-BR","es","ru","id","de","fr","ja"];
const baseURL=process.env.COSMIC_SCRAP_BASE_URL||"http://127.0.0.1:4173/";
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
   await page.locator("#settings-open").waitFor({state:"visible"});
   await page.locator("#settings-open").click();
   await page.locator("#settings-screen").waitFor({state:"visible"});
   const rendered=await page.locator("#settings-screen").innerText();
   for (const key of [...REQUIRED_SETTINGS_FOOTER_KEYS.slice(0,3), "Scales all procedural SFX ·", ...REQUIRED_SETTINGS_FOOTER_KEYS.slice(4,11)]) {
    assert.ok(translations[locale][key],locale+" missing dictionary entry: "+key);
    assert.ok(rendered.includes(translations[locale][key]),locale+" settings screen missing translation: "+key+" => "+translations[locale][key]);
   }
   await page.locator("#settings-close").click();
   const collection=await page.locator("#skin-shop-open").innerText();
   assert.ok(collection.includes(translations[locale]["SKINS & FLAGS COLLECTION"]),locale+" collection entry not localized");
   await page.locator("#skin-shop-open").click();
   await page.locator("#skin-shop-screen").waitFor({state:"visible"});
   const shop=await page.locator("#skin-shop-screen").innerText();
   const visibleCollectionKeys=["PILOT HANGAR","SKIN & FLAG COLLECTION","Cosmetics only · choose your look before launching a run","BACK TO HANGAR","Earn cosmetics through play or spend Scrap Core in the collection shop. Equip your favourite before the next run.","LVL 1 · STARTER","LVL 2","LVL 3","LVL 5","CAPTURE REGIONS: 3","WIN RAIDS: 3","CAREER LEVEL","LEVEL 1","0 / 100 XP TO NEXT LEVEL"];
   for (const key of visibleCollectionKeys) assert.ok(shop.includes(translations[locale][key]),locale+" visible collection screen missing translation: "+key+" => "+translations[locale][key]);
   // This duplicate subheading is intentionally hidden by css/ui.css in the shop layout.
   // Keep its locale entries covered without incorrectly requiring hidden text in innerText.
   for (const key of ["PILOT ARMORY","SKINS · FLAGS · RARE BANNERS"]) assert.ok(translations[locale][key],locale+" missing hidden collection label translation: "+key);
   const duplicateHeadings=page.locator("#skin-shop-content .skin-picker-heading");
   assert.ok(await duplicateHeadings.count()>=1,locale+" expected collection subheadings");
   assert.deepEqual(await duplicateHeadings.evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).display)),Array(await duplicateHeadings.count()).fill("none"),locale+" duplicate collection subheadings should remain hidden");
   await page.locator("#skin-shop-close").click();
   const footer=await page.locator(".legal-links").innerText();
   assert.ok(footer.includes(translations[locale].PRIVACY),locale+" privacy footer not localized");
   assert.ok(footer.includes(translations[locale].SUPPORT),locale+" support footer not localized");
   assert.ok(!footer.toLowerCase().includes("github"),locale+" public footer still exposes GitHub");
   const width=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(width.scroll<=width.client+1,viewport.width+"px "+locale+" horizontal overflow: "+JSON.stringify(width));
  }
  await context.close();
 }
 assert.deepEqual(failures,[]);
 console.log("Settings/footer localization passed: 9 locales × 2 viewports; GitHub footer link removed and no horizontal overflow.");
} finally { await browser.close(); }
