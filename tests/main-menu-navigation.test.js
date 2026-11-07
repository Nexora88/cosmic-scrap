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
 const previous={document:globalThis.document,localStorage:globalThis.localStorage};
 const overlay=fakeElement(),panel=fakeElement(),anchor=fakeElement();
 panel.querySelector=selector=>selector===".home-utility-row"?anchor:null;
 globalThis.document={
  getElementById:id=>id==="overlay"?overlay:id==="panel"?panel:null,
  createElement:()=>fakeElement()
 };
 globalThis.localStorage={getItem:()=> "tr"};
 try{
  const menu=new MainMenu();
  assert.equal(menu.nav.children.length,7);
  assert.deepEqual(menu.items.map(item=>item[0]),["home","battle","galaxy","ranking","skins","career","settings"]);
  assert.ok(menu.navStatus);
 }finally{
  if(previous.document===undefined)delete globalThis.document;else globalThis.document=previous.document;
  if(previous.localStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous.localStorage;
 }
});

test("navigation targets existing in-page controls instead of blank placeholder screens",()=>{
 const previous={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
 const visited=[];
 const ids=["classic-game","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings"];
 const nodes=new Map(ids.map(id=>[id,{...fakeElement(),scrollIntoView:()=>visited.push(id)}]));
 const panel={scrollTo:()=>visited.push("panel-top")};
 const overlay={querySelector:()=>panel};
 globalThis.document={getElementById:id=>nodes.get(id)||null};
 globalThis.window={matchMedia:()=>({matches:true})};
 globalThis.localStorage={getItem:()=> "tr"};
 try{
  const menu=Object.create(MainMenu.prototype);
  menu.root=overlay;menu.nav={querySelectorAll:()=>[]};menu.navStatus={textContent:""};
  for(const key of ["battle","galaxy","ranking","skins","career","settings","home"])menu.navigate(key);
  assert.deepEqual(visited,["classic-game","classic-galaxy","classic-ranking","classic-shop","classic-career","classic-settings","panel-top"]);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
