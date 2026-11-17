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
