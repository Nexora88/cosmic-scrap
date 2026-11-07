import test from "node:test";
import assert from "node:assert/strict";
import {MainMenu} from "../js/ui/MainMenu.js";

function fakeElement(){
 const children=[];
 return {
  children,hidden:false,dataset:{},className:"",textContent:"",
  setAttribute(){},addEventListener(){},append(node){children.push(node)},
  insertAdjacentElement(){},prepend(node){children.push(node)},
  querySelector(){return null},querySelectorAll(){return []},
  scrollIntoView(){},scrollTo(){},focus(){}
 };
}

test("MainMenu constructor mounts all seven navigation destinations",()=>{
 const previous={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
 const overlay=fakeElement(),panel=fakeElement(),anchor=fakeElement(),sections=fakeElement();
 sections.querySelectorAll=()=>[];
 panel.querySelector=selector=>selector===".home-utility-row"?anchor:null;
 overlay.querySelector=()=>panel;
 globalThis.document={
  getElementById:id=>id==="overlay"?overlay:id==="panel"?panel:id==="classic-menu-sections"?sections:null,
  createElement:()=>fakeElement()
 };
 globalThis.localStorage={getItem:()=> "tr"};
 globalThis.window={matchMedia:()=>({matches:true}),addEventListener(){}};
 try{
  const menu=new MainMenu();
  assert.equal(menu.nav.children.length,7);
  assert.deepEqual(menu.items.map(item=>item[0]),["home","battle","galaxy","ranking","skins","career","settings"]);
  assert.ok(menu.navStatus);
  assert.equal(sections.hidden,true,"home starts with the section deck collapsed");
 }finally{
  if(previous.document===undefined)delete globalThis.document;else globalThis.document=previous.document;
  if(previous.window===undefined)delete globalThis.window;else globalThis.window=previous.window;
  if(previous.localStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous.localStorage;
 }
});

test("navigation targets existing in-page controls instead of blank placeholder screens",()=>{
 const previous={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
 const visited=[];
 const ids=["classic-game","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings"];
 const nodes=new Map(ids.map(id=>[id,{...fakeElement(),id,hidden:false,scrollIntoView:()=>visited.push(id)}]));
 const sections={hidden:false,querySelectorAll:()=>[...nodes.values()]};
 const panel={scrollTo:()=>visited.push("panel-top")};
 const overlay={querySelector:()=>panel};
 globalThis.document={getElementById:id=>id==="classic-menu-sections"?sections:(nodes.get(id)||null)};
 globalThis.window={matchMedia:()=>({matches:true})};
 globalThis.localStorage={getItem:()=> "tr"};
 try{
  const menu=Object.create(MainMenu.prototype);
  menu.root=overlay;menu.nav={querySelectorAll:()=>[]};menu.navStatus={textContent:""};
  for(const key of ["battle","galaxy","ranking","skins","career","settings","home"])menu.navigate(key);
  assert.deepEqual(visited,["classic-game","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings","panel-top"]);
  assert.equal(sections.hidden,true,"home hides the secondary screen deck");
  assert.equal(nodes.get("classic-settings").hidden,true,"home leaves every secondary screen hidden");
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
