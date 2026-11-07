import { REGIONS } from "../systems/Regions.js";
import { BOSS_TYPES, BOSS_CATALOG } from "../systems/Encounters.js";

const DAILY_KEY = "cosmic-scrap-daily-status-v1";
const $ = id => document.getElementById(id);
const todayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
};
const goals = [
  { id:"run", target:1, en:"Complete one run", tr:"Bir oyun turunu tamamla", metric:"runs" },
  { id:"boss", target:1, en:"Defeat one boss", tr:"Bir boss yen", metric:"bosses" },
  { id:"scrap", target:300, en:"Collect 300 scrap", tr:"300 hurda topla", metric:"scrap" }
];
const enemyNames = {
  fast:["Fast raiders","Hızlı akıncılar"], charger:["Chargers","Hücumcular"],
  sniper:["Long-range snipers","Keskin nişancılar"], prism:["Prism threats","Prizma tehditleri"],
  leech:["Scrap leeches","Hurda emicileri"], phaseStalker:["Phase stalkers","Faz takipçileri"]
};
function readDaily() {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
    if (saved.date === todayKey()) return { runs:0, bosses:0, scrap:0, ...saved };
  } catch {}
  return { date:todayKey(), runs:0, bosses:0, scrap:0 };
}
function currentGoal() {
  const date = todayKey().replaceAll("-","");
  const index = Number(date.slice(-2)) % goals.length;
  return goals[index];
}
function node(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (value !== undefined) el.textContent = String(value);
  return el;
}

export class ProgressHub {
  constructor() {
    this.panel = $("panel");
    this.mount();
    if (typeof window !== "undefined") {
      window.addEventListener("cosmic-scrap:run-ended", event => this.recordRun(event.detail || {}));
      window.addEventListener("cosmic-scrap:language-changed", () => this.render());
      window.addEventListener("cosmic-scrap:cloud-save-applied", () => this.renderDaily());
    }
    this.render();
  }
  mount() {
    if (!this.panel || typeof document.createElement !== "function" || $("daily-status-panel")) return;
    const daily = node("section","progress-hub daily-status-panel");
    daily.id = "daily-status-panel";
    daily.setAttribute("aria-labelledby","daily-status-title");
    const dailyHead = node("div","progress-hub-heading");
    const dailyEyebrow = node("span","eyebrow","DAILY FLIGHT LOG");
    const dailyTitle = node("h2","", "TODAY'S STATUS");
    dailyTitle.id = "daily-status-title";
    dailyHead.append(dailyEyebrow,dailyTitle);
    const dailyBody = node("div","daily-status-body");
    dailyBody.id = "daily-status-body";
    daily.append(dailyHead,dailyBody);

    const sectors = node("section","progress-hub sector-browser");
    sectors.id = "sector-boss-browser";
    sectors.setAttribute("aria-labelledby","sector-browser-title");
    const sectorHead = node("div","progress-hub-heading");
    sectorHead.append(node("span","eyebrow","GALAXY ATLAS"));
    const sectorTitle = node("h2","", "SECTORS & BOSS DATABASE");
    sectorTitle.id = "sector-browser-title";
    sectorHead.append(sectorTitle);
    const sectorIntro = node("p","progress-hub-intro","Seven sectors, their environmental threats and the boss rotation.");
    const regionGrid = node("div","sector-catalog-grid");
    regionGrid.id = "sector-catalog-grid";
    const bossTitle = node("h3","boss-catalog-title","BOSS ROTATION");
    const bossList = node("div","boss-catalog-grid");
    bossList.id = "boss-catalog-grid";
    sectors.append(sectorHead,sectorIntro,regionGrid,bossTitle,bossList);

    this.dailyBody = dailyBody;
    this.regionGrid = regionGrid;
    this.bossGrid = bossList;
    const attachPanels = () => {
      const dailySlot = $("local-pilot-card") || $("daily-status-slot") || $("classic-career");
      const atlasSlot = $("sector-atlas-slot") || $("classic-galaxy");
      if (dailySlot) dailySlot.append(daily);
      else this.panel.append(daily);
      if (atlasSlot) atlasSlot.append(sectors);
      else this.panel.append(sectors);
    };
    if (document.readyState === "loading" || document.readyState === "interactive") {
      document.addEventListener("DOMContentLoaded", attachPanels, { once:true });
    } else {
      attachPanels();
    }
    this.renderAtlas();
  }
  recordRun(detail) {
    const state = readDaily();
    if (!state.legacy) {
      state.legacy = {
        runs:Math.max(0,Number(state.runs)||0),
        bosses:Math.max(0,Number(state.bosses)||0),
        scrap:Math.max(0,Number(state.scrap)||0)
      };
    }
    const events = Array.isArray(state.events) ? state.events : [];
    const runId = typeof detail.runId === "string" && detail.runId
      ? detail.runId
      : (globalThis.crypto?.randomUUID?.() || (Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)));
    if (!events.some(event => event?.id === runId)) {
      events.push({
        id:runId,
        runs:1,
        bosses:Math.max(0,Math.floor(Number(detail.bossesDefeated)||0)),
        scrap:Math.max(0,Math.floor(Number(detail.scrapCollected)||0))
      });
    }
    if (events.length > 64) {
      const dropped = events.splice(0,events.length-64);
      for (const event of dropped) {
        state.legacy.runs += Math.max(0,Math.floor(Number(event.runs)||0));
        state.legacy.bosses += Math.max(0,Math.floor(Number(event.bosses)||0));
        state.legacy.scrap += Math.max(0,Math.floor(Number(event.scrap)||0));
      }
    }
    state.events = events;
    const totals = state.events.reduce((sum,event)=>({
      runs:sum.runs+Math.max(0,Math.floor(Number(event.runs)||0)),
      bosses:sum.bosses+Math.max(0,Math.floor(Number(event.bosses)||0)),
      scrap:sum.scrap+Math.max(0,Math.floor(Number(event.scrap)||0))
    }),{runs:0,bosses:0,scrap:0});
    state.runs = state.legacy.runs + totals.runs;
    state.bosses = state.legacy.bosses + totals.bosses;
    state.scrap = state.legacy.scrap + totals.scrap;
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(DAILY_KEY,JSON.stringify(state)); } catch {}
    window.dispatchEvent(new Event("cosmic-scrap:save-changed"));
    this.renderDaily();
  }
  renderDaily() {
    if (!this.dailyBody || typeof this.dailyBody.replaceChildren !== "function") return;
    const tr = localStorage.getItem("cosmic-scrap-language") === "tr";
    const goal = currentGoal();
    const state = readDaily();
    const progress = Math.min(goal.target,Math.max(0,Number(state[goal.metric])||0));
    const complete = progress >= goal.target;
    this.dailyBody.replaceChildren();
    const card = node("div","daily-objective-card");
    const copy = node("div","daily-objective-copy");
    copy.append(node("strong","",tr?goal.tr:goal.en),node("small","",tr?"GÜNLÜK HEDEF · YEREL KAYIT + HESAP YEDEĞİ":"DAILY OBJECTIVE · LOCAL SAVE + ACCOUNT BACKUP"));
    const value = node("strong","daily-objective-value",progress.toLocaleString(tr?"tr-TR":"en-US")+" / "+goal.target.toLocaleString(tr?"tr-TR":"en-US"));
    card.append(copy,value);
    const track = node("div","daily-progress-track");
    const fill = node("i");
    fill.style.width = (100*progress/goal.target)+"%";
    track.append(fill);
    const status = node("p","daily-objective-status",complete
      ? (tr?"Günlük hedef tamamlandı. Yarın yeni görev!":"Daily objective complete. A new task arrives tomorrow.")
      : (tr?"İlerleme yerelde tutulur; giriş yapınca hesabınla eşitlenir.":"Progress is saved locally and syncs when you sign in."));
    this.dailyBody.append(card,track,status);
  }
  renderAtlas() {
    if (!this.regionGrid || !this.bossGrid || typeof this.regionGrid.replaceChildren !== "function" || typeof this.bossGrid.replaceChildren !== "function") return;
    const tr = localStorage.getItem("cosmic-scrap-language") === "tr";
    this.regionGrid.replaceChildren();
    REGIONS.forEach((region,index) => {
      const card = node("article","sector-catalog-card");
      const top = node("div","sector-catalog-top");
      top.append(node("span","sector-index",String(index+1).padStart(2,"0")),node("span","sector-accent", "●"));
      const title = node("strong","",region.name[tr?"tr":"en"]);
      const hint = node("p","",region.hint[tr?"tr":"en"]);
      const threat = enemyNames[region.specialEnemy] || [region.specialEnemy,region.specialEnemy];
      const detail = node("small","sector-threat",(tr?"BÖLGE TEHDİDİ · ":"SECTOR THREAT · ")+threat[tr?1:0]);
      const unlock = index===0
        ? (tr?"BAŞLANGIÇTA AÇIK":"AVAILABLE AT START")
        : (tr?"AÇILMA · "+(index*210)+" sn + "+index+" boss": "UNLOCK · "+(index*210)+"s + "+index+" bosses");
      card.append(top,title,hint,detail,node("small","sector-unlock",unlock));
      this.regionGrid.append(card);
    });
    this.bossGrid.replaceChildren();
    BOSS_TYPES.forEach((type,index) => {
      const info = BOSS_CATALOG[type];
      if (!info) return;
      const card = node("article","boss-catalog-card");
      card.append(
        node("span","boss-index","0"+(index+1)),
        node("strong","",info.name[tr?"tr":"en"]),
        node("small","boss-pattern",info.style[tr?"tr":"en"]),
        node("small","boss-stats",(tr?"TEMEL · ":"BASE · ")+info.health+" HP · "+info.damage+(tr?" TEMAS":" CONTACT")+" · "+info.interval+"s"),
        node("small","boss-phases",tr?"3 FAZ · HP VE HASAR SÜREYLE ÖLÇEKLENİR":"3 PHASES · HP AND DAMAGE SCALE WITH RUN TIME")
      );
      this.bossGrid.append(card);
    });
  }
  render() { this.renderDaily(); this.renderAtlas(); }
  showSectors() {
    const target = $("sector-boss-browser");
    if (!target) return;
    target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    target.setAttribute("tabindex","-1");
    target.focus({preventScroll:true});
  }
}
