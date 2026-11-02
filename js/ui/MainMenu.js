export class MainMenu{
 constructor(){
  this.root=document.getElementById("overlay");
  this.mountNavigation();
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
   ["home","ANA MERKEZ","HOME","Pilot profili ve hızlı başlangıç. Günlük durum paneli sonraki aşamada.","Pilot profile and quick start. Daily status is planned for a later update."],
   ["battle","SAVAŞ","BATTLE","Solo oynanabilir. Co-op ve Ranked, güvenilir sunucu altyapısı tamamlanana kadar kapalı.","Solo is playable. Co-op and Ranked stay unavailable until trusted server infrastructure is ready."],
   ["galaxy","GALAKSİ","GALAXY","Bölge ilerlemeni görüntüle. Sektör ve boss tarayıcısı sonraki aşamada.","View region progress. A dedicated sector and boss browser is planned."],
   ["ranking","SIRALAMA","RANKINGS","Mevcut ortak skor tablosunu aç. Global, Türkiye ve arkadaş filtreleri sonraki aşamada.","Open the current shared leaderboard. Global, Türkiye and Friends filters are planned."],
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
   button.setAttribute("aria-current",active?"page":"false");
  });
  if(this.navStatus)this.navStatus.textContent=description;
  const target=(id)=>document.getElementById(id);
  const focus=(id)=>{
   const node=target(id);
   if(!node)return;
   node.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
   if(typeof node.focus==="function")node.focus({preventScroll:true});
  };
  if(key==="home"){this.root?.querySelector(".panel")?.scrollTo({top:0,behavior:"smooth"});return}
  if(key==="battle"){focus("start");return}
  if(key==="galaxy"){focus("local-pilot-card");return}
  if(key==="ranking"){target("online-open")?.click();return}
  if(key==="skins"){target("skin-shop-open")?.click();return}
  if(key==="career"){
   const link=target("profile-page-link");
   if(link)link.click();else focus("local-pilot-card");
   return;
  }
  if(key==="settings")target("settings-open")?.click();
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
