import { ProgressHub } from "./ProgressHub.js";

export class MainMenu{
 constructor(){
  this.root=document.getElementById("overlay");
  // Build the in-page navigation as soon as the parsed menu is available.
  this.mountNavigation();
  this.progressHub=new ProgressHub();
 }
 mountNavigation(){
  const panel=document.getElementById("panel");
  if(!panel||panel.querySelector(".main-menu-nav"))return;
  const anchor=panel.querySelector(".home-utility-row");
  const nav=document.createElement("nav");
  nav.className="main-menu-nav";
  nav.setAttribute("aria-label","Main game navigation");
  const status=document.createElement("p");
  status.className="main-menu-nav-status";
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  this.items=[
   ["home","ANA MERKEZ","HOME","Günlük hedefini ve pilot durumunu görüntüle.","View today’s objective and pilot status."],
   ["battle","SAVAŞ","BATTLE","Solo oynanabilir. Co-op ve Ranked, güvenilir sunucu altyapısı tamamlanana kadar kapalı.","Solo is playable. Co-op and Ranked stay unavailable until trusted server infrastructure is ready."],
   ["galaxy","GALAKSİ","GALAXY","Yedi sektörün tehditlerini ve boss döngüsünü incele.","Browse all seven sectors, their threats and the boss rotation."],
   ["ranking","SIRALAMA","RANKINGS","Global, Türkiye ve arkadaş skor tablolarını aç.","Open Global, Türkiye and Friends leaderboards."],
   ["skins","SKIN MAĞAZASI","SKIN SHOP","Bayrakları, özel sancakları ve kozmetik koleksiyonunu aç.","Open country flags, special banners and the cosmetic collection."],
   ["career","KARİYER","CAREER","Pilot profilini, mevcut istatistiklerini ve başarımlarını aç.","Open your pilot profile, current statistics and achievements."],
   ["settings","AYARLAR","SETTINGS","Ses, kontrol ve erişilebilirlik ayarlarını aç.","Open audio, controls and accessibility settings."]
  ];
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  for(const [key,labelTR,labelEN] of this.items){
   const button=document.createElement("button");
   button.type="button";
   button.className="main-menu-nav-item";
   button.dataset.menuDestination=key;
   button.textContent=tr?labelTR:labelEN;
   button.addEventListener("click",()=>this.navigate(key));
   nav.append(button);
  }
  const languageToggle=document.getElementById("language-toggle");
  languageToggle?.addEventListener("click",()=>setTimeout(()=>this.updateNavigationLanguage(),0));
  if(anchor)anchor.insertAdjacentElement("afterend",nav);
  else panel.prepend(nav);
  nav.insertAdjacentElement("afterend",status);
  this.nav=nav;
  this.navStatus=status;
 }
 updateNavigationLanguage(){
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  this.items?.forEach(([key,labelTR,labelEN])=>{
   const button=this.nav?.querySelector('[data-menu-destination="'+key+'"]');
   if(button)button.textContent=tr?labelTR:labelEN;
  });
  if(this.navStatus)this.navStatus.textContent="";
 }
 navigate(key){
  const item=this.items?.find(entry=>entry[0]===key);
  const tr=localStorage.getItem("cosmic-scrap-language")==="tr";
  const description=item?(tr?item[3]:item[4]):"";
  this.nav?.querySelectorAll("button").forEach(button=>{
   const active=button.dataset.menuDestination===key;
   button.classList.toggle("active",active);
   button.setAttribute("aria-current",active?"location":"false");
  });
  if(this.navStatus)this.navStatus.textContent=description;
  if(key==="galaxy"&&!document.getElementById("classic-galaxy")){this.progressHub?.showSectors();return;}
  if(key==="ranking"&&!document.getElementById("classic-ranking")){document.getElementById("online-open")?.click();return;}
  const destinations={
   battle:"classic-game",
   galaxy:"classic-galaxy",
   ranking:"classic-ranking",
   skins:"classic-shop",
   career:"classic-career",
   settings:"classic-settings"
  };
  if(key==="home"){
   const panel=this.root?.querySelector(".panel");
   panel?.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
   return;
  }
  const id=destinations[key];
  const section=id?document.getElementById(id):null;
  if(!section)return;
  section.scrollIntoView({
   behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
   block:"start"
  });
  section.setAttribute("tabindex","-1");
  section.focus?.({preventScroll:true});
 }
 refresh(profile={}){
  const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=String(value)};
  const core=Math.max(0,Number(profile.scrapCore??profile.core)||0);
  const achievements=Array.isArray(profile.achievements)?profile.achievements.length:0;
  set("best",profile.bestScore||0);set("local-pilot-core",core);set("local-pilot-best",profile.bestScore||0);
  set("local-pilot-achievements",achievements+"/6");set("local-pilot-runs",profile.runs||0);
  set("local-pilot-scrap",profile.totalScrap||0);
  set("regions-captured",(Array.isArray(profile.capturedRegions)?profile.capturedRegions.length:0)+"/7");
  set("raid-wins",profile.raidWins||0);
  set("achievement-count",achievements+"/6");set("career-level","LEVEL "+(profile.careerLevel||1));
 }
 show(){if(this.root)this.root.hidden=false}
 hide(){if(this.root)this.root.hidden=true}
}
