import test from "node:test";
import assert from "node:assert/strict";
import { MainMenu } from "../js/ui/MainMenu.js";

test("progress refresh never opens the main menu over an active run", () => {
  const nodes = new Map();
  for (const id of ["best","local-pilot-core","local-pilot-best","local-pilot-achievements","local-pilot-runs","local-pilot-scrap","regions-captured","raid-wins","achievement-count","career-level"]) {
    nodes.set(id,{textContent:"",hidden:false});
  }
  const root={hidden:true};
  const previous=globalThis.document;
  globalThis.document={getElementById:id=>id==="overlay"?root:(nodes.get(id)||null)};
  try {
    const menu=new MainMenu();
    menu.refresh({capturedRegions:["debris"],raidWins:1,scrapCore:20});
    assert.equal(root.hidden,true,"region/raid progress must not reveal the overlay");
    assert.equal(nodes.get("regions-captured").textContent,"1/7");
    menu.show();
    assert.equal(root.hidden,false,"explicit show still opens the menu");
    menu.refresh({capturedRegions:[],scrapCore:0});
    assert.equal(root.hidden,false,"refresh must preserve current visibility");
    menu.hide();
    assert.equal(root.hidden,true);
  } finally {
    if(previous===undefined)delete globalThis.document;else globalThis.document=previous;
  }
});
