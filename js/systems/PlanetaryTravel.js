const SAVE_KEY = "cosmic-scrap-planetary-travel-v1";
const PLANETS = [
  {id:"terra",name:"NOVA TERRA",type:"Yaşanabilir",color:"#2e9d75",land:"#b9d77b",size:35,orbit:0,desc:"İnsan kolonilerinin ana dünyası. Okyanuslar, bulut kuşakları ve ilk uzay limanı.",resources:"Gıda · Nüfus",cost:0},
  {id:"ember",name:"EMBER",type:"Lav gezegeni",color:"#bc482d",land:"#ffb34b",size:25,orbit:1,desc:"Volkanik yüzey, kızıl lav nehirleri ve yüksek maden potansiyeli.",resources:"Cevher · Enerji",cost:120},
  {id:"pelagia",name:"PELAGIA",type:"Okyanus dünyası",color:"#1465b6",land:"#4ec6b0",size:31,orbit:2,desc:"Derin okyanusları ve yüzen yerleşimler için elverişli sakin bir dünya.",resources:"Su · Biyokütle",cost:150},
  {id:"cryo",name:"CRYO-7",type:"Buz gezegeni",color:"#77bce2",land:"#e4f5ff",size:22,orbit:3,desc:"Buz kabuğunun altında nadir kristaller ve donmuş eski yapılar var.",resources:"Kristal · Araştırma",cost:180,ring:true},
  {id:"verdant",name:"VERDANT",type:"Orman dünyası",color:"#276a43",land:"#78c96a",size:39,orbit:4,desc:"Yoğun bitki örtüsü, zengin biyomlar ve büyük koloniler için alan.",resources:"Gıda · Biyokütle",cost:220},
  {id:"umbra",name:"UMBRA",type:"Karanlık dünya",color:"#4a3b71",land:"#a58cce",size:28,orbit:5,desc:"Yıldız ışığının az ulaştığı bu dünyada antik kalıntılar tespit edildi.",resources:"Eser · Araştırma",cost:260,ring:true},
  {id:"helios",name:"HELIOS PRIME",type:"Kristal gezegen",color:"#b67d2f",land:"#ffe6a0",size:44,orbit:6,desc:"Yıldızına yakın, parlak kristallerle dolu bir gezegen. İleri teknoloji gerekir.",resources:"Kristal · Enerji",cost:320}
];
const ROUTES = [[0,1],[1,2],[2,3],[2,4],[4,5],[5,6]];
function loadState(){
  let saved={};try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{}}catch{}
  return {credits:Math.max(0,Number(saved.credits)||260),discovered:Array.isArray(saved.discovered)?[...new Set([0,1,...saved.discovered.filter(n=>Number.isInteger(n)&&n>=0&&n<PLANETS.length)])]:[0,1],colonies:Array.isArray(saved.colonies)?saved.colonies.filter(n=>Number.isInteger(n)&&n>=0&&n<PLANETS.length):[0],current:Math.max(0,Math.min(PLANETS.length-1,Number(saved.current)||0)),population:Math.max(24,Number(saved.population)||24)};
}
function saveState(state){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{}}
export function initPlanetaryTravel({toast=()=>{}}={}){
  if(typeof document==="undefined"||!document.getElementById("app")||document.getElementById("planetary-travel"))return null;
  let state=loadState(),selected=state.current,travel=null,raf=0,stars=[],lastW=0,lastH=0;
  const app=document.getElementById("app");
  const launcher=document.createElement("button");launcher.id="planetary-open";launcher.type="button";launcher.innerHTML='<span class="pt-launch-icon">✦</span><span>GALAKSİ</span>';launcher.setAttribute("aria-label","Gezegen galaksisini aç");
  const panel=document.createElement("section");panel.id="planetary-travel";panel.hidden=true;panel.innerHTML=`
    <div class="pt-shell">
      <header class="pt-top"><div><div class="pt-eyebrow">COSMIC SCRAP · FRONTIER COMMAND</div><h2>Yıldızlararası Keşif</h2><p>Gezegenleri keşfet, aralarında seyahat et ve yeni dünyalarda koloniler kur.</p></div><button class="pt-close" type="button" aria-label="Galaksiyi kapat">×</button></header>
      <div class="pt-resources"><span>✧ <b data-pt-credits>260</b> hurda kredisi</span><span>◉ <b data-pt-pop>24</b> nüfus</span><span>⌖ <b data-pt-count>2/7</b> keşfedilen dünya</span></div>
      <div class="pt-layout"><div class="pt-space-wrap"><canvas class="pt-space" aria-label="Etkileşimli gezegen sistemi; gezegen seçmek için dokun"></canvas><div class="pt-space-hint">GEZEGENE DOKUN · SİSTEMİ KEŞFET</div><div class="pt-flight" hidden><span class="pt-flight-dot"></span><span>UZAY GEMİSİ SEYAHATTE</span></div></div>
      <aside class="pt-detail"><div class="pt-detail-art"><div class="pt-mini-planet"></div><div class="pt-detail-orbit"></div></div><div class="pt-eyebrow" data-pt-status>ANA DÜNYA</div><h3 data-pt-name>NOVA TERRA</h3><div class="pt-type" data-pt-type>Yaşanabilir</div><p data-pt-desc></p><div class="pt-detail-stats"><div><small>ÜRETİM</small><strong data-pt-res>Gıda · Nüfus</strong></div><div><small>KOLONİ</small><strong data-pt-colony>ANA ÜS</strong></div></div><div class="pt-actions"><button type="button" data-pt-travel>Seyahat et ↗</button><button type="button" data-pt-colonize>Koloni kur</button></div><small class="pt-note" data-pt-note>Uzay gemin hazır.</small></aside></div>
      <footer class="pt-legend"><span><i class="pt-dot pt-dot-home"></i> Ana koloni</span><span><i class="pt-dot pt-dot-owned"></i> Kolonileştirildi</span><span><i class="pt-dot pt-dot-unknown"></i> Keşfedilmedi</span><span class="pt-controls">Sürükle/dokunarak gez · gezegene dokunarak seç</span></footer>
    </div>`;
  app.append(launcher,panel);
  const style=document.createElement("style");style.textContent=`
    #planetary-open{position:absolute;z-index:8;left:12px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:8px;padding:12px 14px;border:1px solid #5a9eb9;border-radius:12px;background:linear-gradient(135deg,#102b42ed,#07131fed);color:#dff7ff;font:800 10px/1 inherit;letter-spacing:.13em;box-shadow:0 8px 28px #0008;cursor:pointer}
    .pt-launch-icon{font-size:20px;color:#8eeaff}
    #planetary-travel{position:absolute;z-index:20;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 10%,#183954 0,#07111e 47%,#02050b 100%);color:#eaf6ff;font-family:inherit;padding:clamp(10px,2.5vw,24px)}
    #planetary-travel[hidden]{display:none}
    .pt-shell{max-width:1300px;margin:0 auto;border:1px solid #28465b;border-radius:18px;background:#050b13ed;box-shadow:0 28px 100px #000b;overflow:hidden}
    .pt-top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:clamp(16px,3vw,28px);border-bottom:1px solid #20384b;background:linear-gradient(100deg,#10283b,#08121f)}
    .pt-eyebrow{font-size:9px;font-weight:900;letter-spacing:.2em;color:#71dfff}.pt-top h2{margin:7px 0 4px;font-size:clamp(22px,4vw,34px);letter-spacing:-.045em}.pt-top p{margin:0;color:#91a9bc;font-size:12px;line-height:1.6}
    .pt-close{flex:0 0 auto;width:38px;height:38px;border:1px solid #345267;border-radius:10px;background:#0b1a28;color:#eaf6ff;font-size:25px;cursor:pointer}
    .pt-resources{display:flex;flex-wrap:wrap;gap:10px;padding:12px clamp(16px,3vw,28px);border-bottom:1px solid #1b3041;background:#07111c}.pt-resources span{padding:8px 11px;border:1px solid #294254;border-radius:8px;background:#0a1926;color:#9fb9ca;font-size:11px}.pt-resources b{color:#e6f9ff}
    .pt-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(230px,.75fr);gap:14px;padding:14px}
    .pt-space-wrap{position:relative;min-height:390px;border:1px solid #203b52;border-radius:14px;overflow:hidden;background:#020610}.pt-space{display:block;width:100%;height:100%;min-height:390px;touch-action:pan-y;cursor:grab}.pt-space:active{cursor:grabbing}
    .pt-space-hint{position:absolute;left:14px;bottom:12px;color:#8ba9bd;font-size:9px;letter-spacing:.15em;pointer-events:none}.pt-flight{position:absolute;top:13px;right:13px;display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #59d8ff66;border-radius:7px;background:#061a28d9;color:#a8ecff;font-size:9px;letter-spacing:.12em}.pt-flight[hidden]{display:none}.pt-flight-dot{width:7px;height:7px;border-radius:50%;background:#76eaff;box-shadow:0 0 12px #76eaff;animation:pt-blink .7s infinite alternate}@keyframes pt-blink{to{opacity:.25}}
    .pt-detail{position:relative;min-width:0;overflow:hidden;border:1px solid #294355;border-radius:14px;background:linear-gradient(165deg,#102234,#07101a);padding:18px}.pt-detail-art{height:105px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at center,#254d66 0,#102337 36%,transparent 72%)}.pt-mini-planet{position:relative;width:67px;height:67px;border-radius:50%;background:radial-gradient(ellipse at 30% 25%,#d9ffda 0,#4bbd8a 18%,#197a74 47%,#072b45 78%);box-shadow:inset -12px -7px 15px #000b,inset 6px 5px 12px #ffffff70,0 0 24px #57d7ff45;z-index:2}.pt-mini-planet:after{content:"";position:absolute;inset:15% 8%;border-radius:45%;background:repeating-linear-gradient(15deg,#8fcb6e 0 5px,#3a9e74 6px 10px,#1b657a 11px 15px);opacity:.8;mix-blend-mode:screen;clip-path:polygon(10% 10%,60% 0,80% 20%,100% 50%,75% 85%,40% 100%,0 70%,15% 35%)}.pt-detail-orbit{position:absolute;width:130px;height:44px;border:1px solid #73d7ff70;border-radius:50%;transform:rotate(-18deg)}
    .pt-detail h3{margin:8px 0 2px;font-size:24px;letter-spacing:-.04em}.pt-type{font-size:11px;color:#7edbff}.pt-detail p{min-height:68px;color:#9eb2c4;font-size:12px;line-height:1.65}.pt-detail-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}.pt-detail-stats>div{padding:10px;border:1px solid #243b4d;border-radius:8px;background:#091522}.pt-detail-stats small,.pt-detail-stats strong{display:block}.pt-detail-stats small{font-size:8px;letter-spacing:.14em;color:#7e9caf}.pt-detail-stats strong{margin-top:6px;font-size:10px;color:#e5f5ff}.pt-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pt-actions button{min-height:40px;border:1px solid #3b7189;border-radius:8px;background:linear-gradient(130deg,#123b50,#0a2334);color:#c9f6ff;font-size:11px;font-weight:800;cursor:pointer}.pt-actions button+button{border-color:#445a70;background:#111e2d;color:#d6e4f3}.pt-actions button:disabled{opacity:.36;cursor:not-allowed}.pt-note{display:block;margin-top:12px;color:#7894a9;font-size:10px;line-height:1.5}
    .pt-legend{display:flex;flex-wrap:wrap;align-items:center;gap:15px;padding:12px 18px;border-top:1px solid #20384b;color:#8da9bb;font-size:10px}.pt-legend span{display:flex;align-items:center;gap:6px}.pt-dot{display:inline-block;width:7px;height:7px;border-radius:50%}.pt-dot-home{background:#80ffcf;box-shadow:0 0 8px #80ffcf}.pt-dot-owned{background:#70bfff}.pt-dot-unknown{background:#596675}.pt-controls{margin-left:auto}
    @media(max-width:720px){#planetary-open{top:auto;bottom:15px;left:12px;transform:none;padding:10px 12px}.pt-layout{grid-template-columns:1fr;padding:9px}.pt-space-wrap{min-height:310px}.pt-space{min-height:310px}.pt-detail{display:grid;grid-template-columns:94px 1fr;column-gap:13px;padding:13px}.pt-detail-art{grid-row:1/5;height:100px}.pt-detail h3{font-size:20px}.pt-detail p{grid-column:1/-1;min-height:0;margin:8px 0}.pt-detail-stats,.pt-actions,.pt-note{grid-column:1/-1}.pt-detail-stats{margin:7px 0}.pt-controls{margin-left:0}.pt-top p{max-width:260px}}
    @media(prefers-reduced-motion:reduce){.pt-flight-dot{animation:none}}
  `;document.head.append(style);
  const $=s=>panel.querySelector(s),canvas=$(".pt-space"),ctx=canvas.getContext("2d"),close=$(".pt-close");
  function planetPositions(w,h){const cx=w*.49,cy=h*.51,scale=Math.min(w/690,h/430,1.05);const coords=[[-.34,.02],[-.10,-.20],[.15,.10],[.39,-.15],[.30,.34],[-.02,.37],[.44,.17]];return PLANETS.map((p,i)=>({x:cx+coords[i][0]*w*.94,y:cy+coords[i][1]*h*1.25,r:p.size*scale*(w<480?.82:1)}))}
  function drawPlanet(p,pos,time,dim=false){
    const {x,y,r}=pos;if(dim){ctx.save();ctx.globalAlpha=.27;ctx.fillStyle="#5e7185";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();return}
    ctx.save();
    const glow=ctx.createRadialGradient(x-r*.15,y-r*.2,r*.15,x,y,r*1.6);glow.addColorStop(0,p.color+"55");glow.addColorStop(1,"#02061000");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*1.65,0,Math.PI*2);ctx.fill();
    if(p.ring){ctx.save();ctx.translate(x,y);ctx.rotate(-.25);ctx.strokeStyle=p.color+"99";ctx.lineWidth=Math.max(3,r*.22);ctx.beginPath();ctx.ellipse(0,0,r*1.65,r*.48,0,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle="#d8efff70";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,r*1.65,r*.48,0,0,Math.PI);ctx.stroke();ctx.restore()}
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
    const base=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.05,x+r*.18,y+r*.2,r*1.3);base.addColorStop(0,p.land);base.addColorStop(.28,p.color);base.addColorStop(.68,p.color);base.addColorStop(1,"#02040c");ctx.fillStyle=base;ctx.fillRect(x-r,y-r,r*2,r*2);
    // Curved continent bands and surface formations clipped to the spherical limb.
    for(let j=0;j<7;j++){const bx=x+Math.sin(iSeed(p.id,j)*7.1)*r*.65,by=y+Math.cos(iSeed(p.id,j)*3.9)*r*.62,bw=r*(.22+(j%3)*.16),bh=r*(.10+(j%2)*.15);ctx.fillStyle=j%2?p.land+"65":"#e5f8ff18";ctx.beginPath();ctx.ellipse(bx,by,bw,bh,Math.sin(j*2.1),0,Math.PI*2);ctx.fill()}
    for(let j=0;j<Math.max(5,Math.floor(r*.6));j++){const cx=x+Math.sin(j*12.989+ p.orbit)*r*.78,cy=y+Math.cos(j*7.123+p.orbit)*r*.75,cr=Math.max(.6,r*.018+(j%3)*r*.009);ctx.fillStyle="#07132135";ctx.beginPath();ctx.arc(cx,cy,cr*2,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#f1ffff20";ctx.lineWidth=.7;ctx.beginPath();ctx.arc(cx-cr*.3,cy-cr*.3,cr,0,Math.PI*2);ctx.stroke()}
    const shade=ctx.createLinearGradient(x-r*.2,y-r,x+r,y+r*.2);shade.addColorStop(0,"#ffffff55");shade.addColorStop(.38,"#ffffff00");shade.addColorStop(1,"#000b");ctx.fillStyle=shade;ctx.fillRect(x-r,y-r,r*2,r*2);
    ctx.restore();
    ctx.strokeStyle=state.colonies.includes(PLANETS.indexOf(p))?"#83ffd4":"#92dfff55";ctx.lineWidth=state.colonies.includes(PLANETS.indexOf(p))?1.8:1;ctx.beginPath();ctx.arc(x,y,r+2,0,Math.PI*2);ctx.stroke();
    if(selected===PLANETS.indexOf(p)){ctx.strokeStyle="#a3efff";ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(x,y,r+8+Math.sin(time/220)*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
    if(state.discovered.includes(PLANETS.indexOf(p))){ctx.textAlign="center";ctx.font="800 10px system-ui";ctx.fillStyle=selected===PLANETS.indexOf(p)?"#f0fbff":"#a7c2d5";ctx.fillText(p.name,x,y+r+18)}
    if(state.colonies.includes(PLANETS.indexOf(p))){ctx.fillStyle="#83ffd4";ctx.beginPath();ctx.arc(x+r*.6,y-r*.65,3,0,Math.PI*2);ctx.fill()}
  }
  function iSeed(str,n){let v=n+11;for(let i=0;i<str.length;i++)v=(v*31+str.charCodeAt(i))%997;return v/997}
  function draw(time=0){
    if(panel.hidden)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,rect.width),h=Math.max(1,rect.height);
    if(w!==lastW||h!==lastH){lastW=w;lastH=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);stars=Array.from({length:Math.round(w*h/2200)},(_,i)=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.4+.25,a:Math.random()*.65+.15,phase:Math.random()*7}))}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#020713");bg.addColorStop(.5,"#07182a");bg.addColorStop(1,"#03050c");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const neb=ctx.createRadialGradient(w*.42,h*.46,5,w*.42,h*.46,w*.7);neb.addColorStop(0,"#22516b38");neb.addColorStop(.55,"#13243d20");neb.addColorStop(1,"#02061000");ctx.fillStyle=neb;ctx.fillRect(0,0,w,h);
    stars.forEach(s=>{ctx.globalAlpha=s.a*(.7+.3*Math.sin(time/700+s.phase));ctx.fillStyle="#d5f2ff";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
    const pos=planetPositions(w,h);
    ROUTES.forEach(([a,b])=>{const A=pos[a],B=pos[b],known=state.discovered.includes(a)&&state.discovered.includes(b);ctx.strokeStyle=known?"#58c9ef55":"#59718824";ctx.lineWidth=known?1.2:1;ctx.setLineDash(known?[]:[3,7]);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo((A.x+B.x)/2,(A.y+B.y)/2-Math.min(45,w*.07),B.x,B.y);ctx.stroke();ctx.setLineDash([])});
    // A distant star with lens flare anchors the scene so it reads as a star system, not a tile grid.
    const sx=w*.88,sy=h*.13,sr=Math.max(8,Math.min(20,w*.026));const sun=ctx.createRadialGradient(sx-sr*.2,sy-sr*.2,1,sx,sy,sr*2.8);sun.addColorStop(0,"#fff8d0");sun.addColorStop(.2,"#ffdf8a");sun.addColorStop(.5,"#ff9c4a66");sun.addColorStop(1,"#ff7c3000");ctx.fillStyle=sun;ctx.beginPath();ctx.arc(sx,sy,sr*2.8,0,Math.PI*2);ctx.fill();
    pos.forEach((p,i)=>drawPlanet(PLANETS[i],p,time,!state.discovered.includes(i)));
    if(travel){const A=pos[travel.from],B=pos[travel.to],t=Math.min(1,(time-travel.start)/travel.duration),ease=t*t*(3-2*t),x=A.x+(B.x-A.x)*ease,y=A.y+(B.y-A.y)*ease-Math.sin(t*Math.PI)*Math.min(70,w*.14);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(B.y-A.y,B.x-A.x));ctx.fillStyle="#b8f5ff";ctx.shadowColor="#64e8ff";ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-7,-4);ctx.lineTo(-4,0);ctx.lineTo(-7,4);ctx.closePath();ctx.fill();ctx.strokeStyle="#78e9ff99";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-18,0);ctx.stroke();ctx.restore();if(t>=1){state.current=travel.to;state.discovered=[...new Set([...state.discovered,travel.to])];state.credits+=25;saveState(state);travel=null;$(".pt-flight").hidden=true;toast("Yeni dünya keşfedildi · +25 hurda kredisi");renderDetail();draw(time)}}
    if(!panel.hidden)raf=requestAnimationFrame(draw);
  }
  function canTravel(index){return index!==state.current&&!travel&&ROUTES.some(([a,b])=>(a===state.current&&b===index)||(b===state.current&&a===index))}
  function renderDetail(){
    const p=PLANETS[selected],known=state.discovered.includes(selected),owned=state.colonies.includes(selected),travelable=known&&canTravel(selected),canColonize=known&&!owned&&selected===state.current&&state.credits>=p.cost&&p.cost>0;
    $("[data-pt-credits]").textContent=state.credits;$("[data-pt-pop]").textContent=state.population;$("[data-pt-count]").textContent=state.discovered.length+"/"+PLANETS.length;
    $("[data-pt-status]").textContent=!known?"BİLİNMEYEN DÜNYA":selected===state.current?"MEVCUT KONUM":owned?"KOLONİ KURULDU":"KEŞFEDİLDİ";
    $("[data-pt-name]").textContent=known?p.name:"BİLİNMEYEN SİSTEM";$("[data-pt-type]").textContent=known?p.type:"Uzay taraması gerekli";$("[data-pt-desc]").textContent=known?p.desc:"Bu gezegen hakkında veri yok. Komşu sisteme seyahat ederek yeni rotaların kilidini aç.";
    $("[data-pt-res]").textContent=known?p.resources:"—";$("[data-pt-colony]").textContent=owned?(selected===0?"ANA ÜS":"YERLEŞİM YERİ"):"KURULMADI";
    const mini=$(".pt-mini-planet");mini.style.background=known?`radial-gradient(ellipse at 28% 25%, ${p.land} 0, ${p.color} 38%, #020711 82%)`:"radial-gradient(ellipse at 30% 25%,#647181,#182230 70%,#050810)";
    $(".pt-detail-art").style.opacity=known?"1":".45";
    const travelBtn=$("[data-pt-travel]");travelBtn.disabled=!travelable;travelBtn.textContent=travel?"Seyahat sürüyor…":travelable?"Seyahat et ↗":selected===state.current?"Buradasın":known?"Önce komşu sisteme git":"Kilitli rota";
    const colonizeBtn=$("[data-pt-colonize]");colonizeBtn.hidden=owned||selected!==state.current||selected===0;colonizeBtn.disabled=!canColonize;colonizeBtn.textContent=owned?"Koloni kuruldu":`Koloni kur · ${p.cost}`;
    $("[data-pt-note]").textContent=owned?(selected===0?"Ana dünya üretim merkezi.":"Bu dünyada koloni üretime hazır."):(selected!==state.current?"Önce rotadaki komşu gezegene seyahat et.":selected===0?"Ana dünyan güvende; yakın sistemleri keşfet.":state.credits<p.cost?"Koloni kurmak için daha fazla hurda kredisi topla.":"Bu gezegene koloni kurarak yeni kaynaklar aç.");
  }
  function resize(){lastW=0;lastH=0}
  function open(){panel.hidden=false;launcher.hidden=true;renderDetail();cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
  function shut(){panel.hidden=true;launcher.hidden=false;cancelAnimationFrame(raf);close.focus()}
  launcher.addEventListener("click",open);close.addEventListener("click",shut);
  canvas.addEventListener("click",e=>{if(travel)return;const rect=canvas.getBoundingClientRect(),pos=planetPositions(rect.width,rect.height),x=e.clientX-rect.left,y=e.clientY-rect.top;let best=-1,dist=Infinity;pos.forEach((p,i)=>{const d=Math.hypot(x-p.x,y-p.y);if(d<p.r+12&&d<dist){best=i;dist=d}});if(best>=0){selected=best;renderDetail()}});
  $("[data-pt-travel]").addEventListener("click",()=>{if(!canTravel(selected))return;travel={from:state.current,to:selected,start:performance.now(),duration:1850};$(".pt-flight").hidden=false;renderDetail();cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)});
  $("[data-pt-colonize]").addEventListener("click",()=>{const p=PLANETS[selected];if(selected!==state.current||state.colonies.includes(selected)||state.credits<p.cost||selected===0)return;state.credits-=p.cost;state.colonies.push(selected);state.population+=12;saveState(state);toast(p.name+" kolonisi kuruldu");renderDetail();draw(performance.now())});
  addEventListener("resize",resize);
  renderDetail();
  return {open,close:shut,getState:()=>structuredClone(state)};
}
