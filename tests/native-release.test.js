import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),"utf8");
const capacitor=JSON.parse(read("capacitor.config.json"));
test("Capacitor app identity and web staging are configured",()=>{
  assert.equal(capacitor.appId,"io.taviro.game");
  assert.equal(capacitor.appName,"TAVIRO");
  assert.equal(capacitor.webDir,"dist");
  assert.match(read("scripts/build-native.mjs"),/"privacy\.html"/);
  assert.match(read("scripts/build-native.mjs"),/"support\.html"/);
});
test("privacy and support pages are linked and cached offline",()=>{
  const html=read("index.html"),worker=read("sw.js");
  assert.match(html,/privacy\.html/);assert.match(html,/support\.html/);
  assert.match(worker,/"\.\/privacy\.html"/);assert.match(worker,/"\.\/support\.html"/);
  assert.match(worker,/"\.\/css\/legal\.css"/);
  assert.match(read("privacy.html"),/Supabase/);
  assert.match(read("support.html"),/official support email address has not been published yet/i);
  assert.doesNotMatch(read("support.html"),/github\.com\/Nexora88/i);
});
test("native build workflows use pinned runtimes and create test artifacts",()=>{
  const android=read(".github/workflows/android-debug.yml");
  const ios=read(".github/workflows/ios-simulator.yml");
  assert.match(android,/@capacitor\/android@8\.6\.2/);
  assert.match(android,/assembleDebug/);
  assert.match(android,/taviro-android-debug-apk/);
  assert.match(ios,/runs-on: macos-26/);
  assert.match(ios,/@capacitor\/ios@8\.6\.2/);
  assert.match(ios,/iphonesimulator/);
  assert.match(ios,/taviro-ios-simulator-app/);
});
