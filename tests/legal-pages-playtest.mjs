import assert from "node:assert/strict";
import { chromium } from "playwright";
import { LEGAL_LOCALES, LEGAL_TRANSLATIONS } from "../js/legal-translations.js";
import { ABOUT_TRANSLATIONS } from "../js/about-translations.js";

const baseURL=process.env.COSMIC_SCRAP_BASE_URL||"http://127.0.0.1:4173/";
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const viewport of [{width:390,height:844},{width:1365,height:900}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await context.newPage();
  page.on("pageerror",error=>failures.push("pageerror: "+error.message));
  for(const path of ["privacy.html","support.html","about.html"]){
   await page.goto(new URL(path,baseURL).href,{waitUntil:"domcontentloaded"});
   await page.locator("#legal-language").waitFor({state:"visible"});
   const externalGitHubLinks=await page.locator('a[href*="github.com/Nexora88"]').count();
   assert.equal(externalGitHubLinks,0,path+" still exposes a public GitHub destination");
   for(const locale of LEGAL_LOCALES){
    await page.locator("#legal-language").selectOption(locale);
    const actual=await page.locator("[data-i18n]").evaluateAll(nodes=>nodes.map(node=>({key:node.dataset.i18n,text:node.textContent})));
    assert.equal(await page.locator("html").getAttribute("lang"),locale,viewport.width+"px "+path+" document lang mismatch: "+locale);
    assert.equal(await page.locator("#legal-language").inputValue(),locale,viewport.width+"px "+path+" selector mismatch: "+locale);
    for(const item of actual){
      assert.equal(item.text,{...LEGAL_TRANSLATIONS[locale],...ABOUT_TRANSLATIONS[locale]}[item.key],viewport.width+"px "+path+" "+locale+" rendered wrong copy: "+item.key);
    }
    const width=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(width.scroll<=width.client+1,viewport.width+"px "+path+" "+locale+" horizontal overflow: "+JSON.stringify(width));
   }
   await page.locator("#legal-language").selectOption("fr");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("html").getAttribute("lang"),"fr",path+" did not restore saved locale after reload");
  }
  await context.close();
 }
 assert.deepEqual(failures,[]);
 console.log("Legal page browser localization passed: 9 locales × 3 pages × 2 viewports; language persistence and overflow verified.");
}finally{await browser.close()}
