import { chromium } from "playwright";
const baseUrl=process.env.COSMIC_SCRAP_BASE_URL||"http://127.0.0.1:4173/";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();const errors=[];
page.on("pageerror",error=>errors.push(error.message));page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});page.on("response",response=>{if(response.status()===404)errors.push("HTTP 404: "+response.url())});
try{
 await page.goto(baseUrl,{waitUntil:"domcontentloaded"});
 if(await page.locator("#intro-screen").isVisible())await page.locator("#intro-continue").click();
 await page.locator(".main-menu-nav-item").first().waitFor({state:"visible",timeout:10000});
 if(await page.locator(".main-menu-nav-item").count()!==7)throw new Error("Desktop navigation must expose seven destinations");
 const menuURL=page.url();
 const viewportMatrix=[];
 for(const viewport of [{width:320,height:720},{width:375,height:812},{width:412,height:915},{width:768,height:1024},{width:1440,height:900},{width:1920,height:1080},{width:2560,height:1080}]){
  await page.setViewportSize(viewport);
  await page.waitForTimeout(80);
  const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  if(Math.max(metrics.documentWidth,metrics.bodyWidth)>metrics.width+2)throw new Error("Menu horizontal overflow at "+viewport.width+"x"+viewport.height+": "+JSON.stringify(metrics));
  viewportMatrix.push(metrics);
 }
 await page.setViewportSize({width:1440,height:900});
 for(const [destination,section] of Object.entries({battle:"classic-game",galaxy:"classic-galaxy",ranking:"classic-ranking",skins:"classic-shop",career:"classic-career",settings:"classic-settings"})){
  await page.locator('[data-menu-destination="'+destination+'"]').click();
  await page.waitForFunction(id=>document.activeElement?.id===id,section);
  if(page.url()!==menuURL)throw new Error("Navigation left the single-page menu: "+destination);
 }
 await page.locator('[data-menu-destination="battle"]').click();
 const promoButton=page.locator("#nexora-ai-open");await promoButton.waitFor({state:"visible",timeout:5000});
 if(await page.locator("#nexora-ai-layer").isVisible())throw new Error("Nexora AI showcase opened without player action");
 await promoButton.click();const promoDialog=page.locator("#nexora-ai-layer [role=dialog]");await promoDialog.waitFor({state:"visible"});
 const videoSource=await page.locator("#nexora-ai-video").getAttribute("src");
 if(!videoSource?.includes("/assets/promos/nexora-ai.mp4"))throw new Error("Nexora AI video did not resolve to the correct local asset");
 await page.waitForFunction(()=>document.querySelector("#nexora-ai-video")?.readyState>=1,null,{timeout:10000});
 await page.locator("#nexora-ai-close").click();
 if(await promoDialog.isVisible())throw new Error("Nexora AI showcase close did not work");
 if(await page.evaluate(()=>document.activeElement?.id)!=="nexora-ai-open")throw new Error("Focus was not returned to the optional Nexora AI trigger");
 const promoText=await page.locator("#panel").innerText();if(/NEXORA QUANT|FOLLOW ON X/i.test(promoText))throw new Error("A removed promotion is still visible in the menu");
 const before=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 if(before.documentWidth>before.width+2)throw new Error("Desktop menu has horizontal overflow");
 const joystick=page.locator("#joystick");
 if(!await joystick.evaluate(node=>node.classList.contains("joystick-right")))throw new Error("Desktop default control side is not right");
 await page.locator('#classic-game [data-open="start"]').click();
 for(let i=0;i<4;i++){await page.waitForTimeout(700);if(await page.locator("#upgrade-screen").isVisible()){const card=page.locator("#upgrade-cards button").first();if(await card.count())await card.click()}}
 await page.waitForFunction(()=>(document.querySelector("#time")?.textContent||"00:00")!=="00:00",null,{timeout:10000});
 await page.keyboard.press("Escape");if(!await page.locator("#pause-screen").isVisible())throw new Error("Escape did not pause the desktop run");
 await page.keyboard.press("Escape");if(await page.locator("#pause-screen").isVisible())throw new Error("Escape did not resume the desktop run");
 await page.locator("#pause").click();await page.locator("#pause-settings").click();if(!await page.locator("#settings-screen").isVisible())throw new Error("Pause settings did not open");
 await page.locator("#setting-control-side").selectOption("left");
 const leftSide=await joystick.evaluate(node=>({left:node.classList.contains("joystick-left"),right:node.classList.contains("joystick-right")}));
 if(!leftSide.left||leftSide.right)throw new Error("Desktop left control preference did not update the joystick layout state");
 if(await page.evaluate(()=>localStorage.getItem("cosmic-scrap-control-side"))!=="left")throw new Error("Left control preference was not persisted");
 await page.locator("#setting-control-side").selectOption("right");
 const rightSide=await joystick.evaluate(node=>({left:node.classList.contains("joystick-left"),right:node.classList.contains("joystick-right")}));
 if(!rightSide.right||rightSide.left)throw new Error("Desktop right control preference did not update the joystick layout state");
 if(await page.evaluate(()=>localStorage.getItem("cosmic-scrap-control-side"))!=="right")throw new Error("Right control preference was not persisted");
 await page.locator("#settings-close").click();if(!await page.locator("#pause-screen").isVisible())throw new Error("Settings did not return to the paused run");
 if(errors.length)throw new Error("Chromium console/page errors: "+errors.join(" | "));
 console.log(JSON.stringify({browser:"Chromium desktop profile",viewport:before,viewportMatrix,navigation:"7/7",optionalNexoraAiShowcase:"passed",removedPromos:"not visible",joystickSideSelection:"passed",start:"passed",keyboardPauseResume:"passed",settingsReturn:"passed",errors},null,2));
}finally{await browser.close()}
