import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"css/premium-ui.css"),"utf8");
const presentation=fs.readFileSync(path.join(root,"js/ui/PremiumPresentation.js"),"utf8");
const profile=fs.readFileSync(path.join(root,"profile.html"),"utf8");
test("premium presentation is loaded without replacing the original one-page game",()=>{
 assert.match(html,/css\/premium-ui\.css/);
 assert.match(html,/js\/ui\/PremiumPresentation\.js/);
 assert.match(html,/id="overlay"/);
 assert.match(html,/id="game"/);
});
test("opening screen keeps the requested developer credit and bilingual control",()=>{
 assert.match(html,/Ahmet Eymen Bakraç/);
 assert.match(presentation,/intro-language-toggle/);
 assert.match(presentation,/CREATE FREE ACCOUNT/);
});
test("HUD cleanup is visual-only and retains the existing game data hooks",()=>{
 assert.match(html,/id="health-fill"/);
 assert.match(html,/id="xp-fill"/);
 assert.match(html,/id="scrap"/);
 assert.match(css,/#joystick:active/);
 assert.match(css,/\.health-wrap>span\{display:none\}/);
 assert.match(css,/\.xp-wrap>span\{position:absolute/);
});
test("upgrade cards and all major surfaces receive the shared visual system",()=>{
 assert.match(css,/\.upgrade-card\.chosen/);
 assert.match(css,/#account-screen/);
 assert.match(css,/#skin-shop-screen/);
 assert.match(css,/#online-screen/);
 assert.match(profile,/AHMET EYMEN BAKRAÇ/);
});
