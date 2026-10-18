const SAVE_KEY = "cosmic-scrap-frontier-v1";

export const FRONTIER_MISSIONS = [
  { id: "resource", title: "RESOURCE EXPEDITION", tr: "KAYNAK SEFERİ", icon: "⛏", difficulty: 1, reward: 90, contract: "salvager", description: "Recover scrap from a quiet asteroid belt.", objective: "Collect at least 120 scrap", objectiveTr: "En az 120 hurda topla", success: run => Number(run.scrapCollected) >= 120 },
  { id: "elite", title: "ELITE INTERCEPT", tr: "ELİT HEDEF", icon: "✦", difficulty: 3, reward: 150, contract: "elite", description: "Hunt an elite commander guarding a frontier sector.", objective: "Defeat an elite boss", objectiveTr: "Bir elit boss yen", success: run => Number(run.bossesDefeated) >= 1 },
  { id: "debris", title: "DANGEROUS DEBRIS", tr: "TEHLİKELİ ENKAZ", icon: "⚠", difficulty: 2, reward: 120, contract: "storm", description: "Hold your course through a hostile debris field.", objective: "Survive 75 seconds and get 8 kills", objectiveTr: "75 saniye dayan ve 8 düşman yen", success: run => Number(run.survivalSeconds) >= 75 && Number(run.kills) >= 8 },
  { id: "boss", title: "BOSS SIEGE", tr: "BOSS KUŞATMASI", icon: "☄", difficulty: 4, reward: 240, contract: "elite", description: "Break the command ship and claim its sector.", objective: "Defeat a boss to capture the sector", objectiveTr: "Bölgeyi almak için boss'u yen", success: run => Number(run.bossesDefeated) >= 1 }
];

export const FRONTIER_BUILDINGS = [
  { id: "turret", name: "Pulse Turret", tr: "Darbe Kulesi", cost: 140, description: "Adds a defensive tower to your home base." },
  { id: "extractor", name: "Scrap Extractor", tr: "Hurda Üretici", cost: 180, description: "Improves resource rewards from future victories." },
  { id: "shield", name: "Orbital Shield", tr: "Yörünge Kalkanı", cost: 220, description: "Strengthens your base against bot raids." }
];

export function createFrontierState() {
  return { version: 1, resources: 180, selectedMission: "resource", activeMission: null, buildings: { turret: 0, extractor: 0, shield: 0 }, sectors: [
    { id: "home", name: "NOVA HOME", owner: "player", level: 1 },
    { id: "dust", name: "DUST REACH", owner: "bot", level: 1 },
    { id: "ion", name: "ION WILDS", owner: "bot", level: 2 },
    { id: "wreck", name: "WRECK BELT", owner: "bot", level: 2 },
    { id: "eclipse", name: "ECLIPSE GATE", owner: "bot", level: 3 },
    { id: "crown", name: "VOID CROWN", owner: "bot", level: 4 }
  ], inventory: [], achievements: [], daily: { date: "", progress: { runs: 0, scrap: 0, bosses: 0 }, claimed: [] }, stats: { victories: 0, captures: 0, totalScrap: 0 } };
}

export function missionSucceeded(missionId, run = {}) {
  const mission = FRONTIER_MISSIONS.find(item => item.id === missionId);
  return Boolean(mission && mission.success(run));
}

export function rollLoot(random = Math.random) {
  const value = random();
  if (value < 0.07) return { rarity: "legendary", name: "Singularity Core", power: 3 };
  if (value < 0.30) return { rarity: "rare", name: "Ion Lance", power: 2 };
  return { rarity: "common", name: "Scrap Plating", power: 1 };
}

export function purchaseBuilding(state, buildingId) {
  const building = FRONTIER_BUILDINGS.find(item => item.id === buildingId);
  if (!building || state.resources < building.cost) return false;
  state.resources -= building.cost;
  state.buildings[buildingId] = (Number(state.buildings[buildingId]) || 0) + 1;
  return true;
}

function safeState(raw) {
  const base = createFrontierState();
  if (!raw || typeof raw !== "object") return base;
  const state = { ...base, ...raw, buildings: { ...base.buildings, ...(raw.buildings || {}) }, daily: { ...base.daily, ...(raw.daily || {}), progress: { ...base.daily.progress, ...(raw.daily?.progress || {}) }, claimed: Array.isArray(raw.daily?.claimed) ? raw.daily.claimed : [] }, stats: { ...base.stats, ...(raw.stats || {}) } };
  state.resources = Math.max(0, Math.floor(Number(state.resources) || 0));
  state.sectors = base.sectors.map(sector => {
    const old = Array.isArray(raw.sectors) ? raw.sectors.find(item => item?.id === sector.id) : null;
    return old && ["player", "bot"].includes(old.owner) ? { ...sector, owner: old.owner, level: Math.max(1, Number(old.level) || sector.level) } : sector;
  });
  state.inventory = Array.isArray(raw.inventory) ? raw.inventory.filter(item => item && ["common", "rare", "legendary"].includes(item.rarity)).slice(-100) : [];
  state.achievements = Array.isArray(raw.achievements) ? raw.achievements.filter(item => typeof item === "string") : [];
  return state;
}

function readState() {
  try { return safeState(JSON.parse(localStorage.getItem(SAVE_KEY) || "null")); } catch { return createFrontierState(); }
}
function writeState(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

export function initFrontierCommand({ onLaunch, toast = () => {} } = {}) {
  if (typeof document === "undefined" || !document.getElementById("app")) return null;
  let state = readState();
  const tr = () => localStorage.getItem("cosmic-scrap-language") === "tr";
  const app = document.getElementById("app");
  const style = document.createElement("style");
  style.textContent = `
  .frontier-open{border:1px solid #3c7185!important;color:#91eaff!important;background:#0b1c28!important}
  #frontier-screen{position:absolute;z-index:9;inset:0;overflow:auto;padding:clamp(10px,3vw,24px);background:radial-gradient(ellipse at top,#11273a 0,#070b12 58%,#030508 100%);color:#edf7ff;font-family:inherit}
  #frontier-screen[hidden]{display:none}
  .frontier-shell{max-width:1080px;margin:0 auto;padding:clamp(12px,3vw,28px);border:1px solid #254054;border-radius:16px;background:#080f18f2;box-shadow:0 24px 90px #0009}
  .frontier-top,.frontier-actions,.frontier-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .frontier-kicker{color:#62dfff;font-size:9px;font-weight:900;letter-spacing:.2em}
  .frontier-shell h2{margin:8px 0 5px;font-size:clamp(24px,5vw,38px);letter-spacing:-.05em}
  .frontier-sub{color:#9aaec0;font-size:12px;line-height:1.6}
  .frontier-resource{padding:10px 14px;border:1px solid #3c7185;border-radius:9px;background:#0b1b27;font-size:11px}
  .frontier-resource strong{color:#7fe8ff;font-size:18px;margin-left:7px}
  .frontier-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:15px 0}
  .frontier-card{min-width:0;text-align:left;padding:13px;border:1px solid #263849;border-radius:10px;background:linear-gradient(150deg,#101d2b,#080d14);color:#eaf5ff;cursor:pointer}
  .frontier-card.selected{border-color:#60dfff;box-shadow:inset 0 0 0 1px #60dfff35,0 0 22px #42cfff12}
  .frontier-card:disabled{opacity:.45;cursor:not-allowed}
  .frontier-icon{font-size:22px;color:#7ce8ff}
  .frontier-card strong,.frontier-card small,.frontier-card span{display:block}
  .frontier-card strong{font-size:11px;line-height:1.4;margin:8px 0}
  .frontier-card small{font-size:10px;line-height:1.5;color:#9aafc3}
  .frontier-pill{display:inline-block!important;margin-top:10px;padding:5px 7px;border:1px solid #314758;border-radius:5px;color:#8be9ff;font-size:8px!important;font-weight:900;letter-spacing:.1em}
  .frontier-columns{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;margin-top:20px}
  .frontier-section{min-width:0;padding:15px;border:1px solid #203243;border-radius:11px;background:#090f17}
  .frontier-section h3{font-size:13px;letter-spacing:.08em;margin:0}
  .frontier-sector-list,.frontier-build-list,.frontier-loot-list{display:grid;gap:7px;margin-top:12px}
  .frontier-sector,.frontier-building,.frontier-loot{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #202e3c;border-radius:8px;background:#070c12}
  .frontier-sector-main,.frontier-building-main{flex:1;min-width:0}
  .frontier-sector strong,.frontier-building strong{display:block;font-size:10px}
  .frontier-sector small,.frontier-building small{display:block;color:#8297ac;font-size:9px;line-height:1.45;margin-top:4px}
  .frontier-owner{font-size:8px;font-weight:900;letter-spacing:.08em;color:#ffbd8b}
  .frontier-owner.player{color:#81edc3}
  .frontier-buy,.frontier-primary,.frontier-close{border:1px solid #355267;border-radius:7px;padding:10px 12px;background:#0c1c29;color:#8deaff;font-size:9px;font-weight:900;letter-spacing:.06em;cursor:pointer}
  .frontier-primary{background:#d8f7ff;color:#061019;border-color:#d8f7ff;padding:13px 16px}
  .frontier-buy:disabled{opacity:.4;cursor:not-allowed}
  .frontier-note{margin-top:12px;padding:11px;border:1px dashed #31475a;border-radius:8px;color:#8ea4b8;font-size:10px;line-height:1.6}
  .frontier-loot{justify-content:space-between;font-size:10px}
  .frontier-loot.common{color:#b9c6d4}.frontier-loot.rare{color:#64dcff}.frontier-loot.legendary{color:#e1a5ff}
  .frontier-progress{height:5px;border-radius:5px;background:#1a2835;overflow:hidden;margin-top:10px}.frontier-progress i{display:block;height:100%;background:#61dcff}
  @media(max-width:760px){.frontier-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.frontier-columns{grid-template-columns:1fr}.frontier-shell{padding:13px}.frontier-card{padding:10px}.frontier-card strong{font-size:10px}.frontier-card small{font-size:9px}.frontier-section{padding:11px}.frontier-primary{width:100%}}
  @media(max-width:360px){.frontier-grid{grid-template-columns:1fr}.frontier-top{align-items:flex-start}}
  @media(prefers-reduced-motion:reduce){#frontier-screen *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
  `;
  document.head.append(style);

  const screen = document.createElement("section");
  screen.id = "frontier-screen";
  screen.hidden = true;
  screen.setAttribute("aria-labelledby", "frontier-title");
  screen.innerHTML = `
    <div class="frontier-shell">
      <div class="frontier-top"><div><p class="frontier-kicker">COSMIC SCRAP · FRONTIER COMMAND</p><h2 id="frontier-title">SPACE <span style="color:#61dcff">COMMAND</span></h2><p class="frontier-sub" data-frontier-intro>Choose a sector, build your base, and push back the bot empire.</p></div><div class="frontier-resource"><span data-frontier-resource-label>SCRAP RESOURCES</span><strong id="frontier-resources">0</strong></div></div>
      <div class="frontier-section-head"><h3 data-frontier-mission-heading>CHOOSE YOUR NEXT OPERATION</h3><span class="frontier-kicker" id="frontier-target-label">NEXT BOT SECTOR</span></div>
      <div class="frontier-grid" id="frontier-missions" role="group" aria-label="Mission selection"></div>
      <div class="frontier-actions"><p class="frontier-sub" id="frontier-objective">Select an operation to see its objective and reward.</p><button class="frontier-primary" id="frontier-launch" type="button">LAUNCH OPERATION ↗</button></div>
      <div class="frontier-columns">
        <section class="frontier-section"><div class="frontier-section-head"><h3 data-frontier-map-heading>SECTOR CONTROL</h3><span class="frontier-kicker" id="frontier-capture-count">0 / 5 CAPTURED</span></div><div class="frontier-sector-list" id="frontier-sectors"></div><p class="frontier-note" data-frontier-map-note>Win an operation to capture the next bot-held sector. Captured sectors produce resources between visits.</p></section>
        <section class="frontier-section"><div class="frontier-section-head"><h3 data-frontier-base-heading>HOME BASE</h3><span class="frontier-kicker" id="frontier-base-level">LEVEL 1</span></div><div class="frontier-build-list" id="frontier-buildings"></div><div class="frontier-section-head" style="margin-top:18px"><h3 data-frontier-loot-heading>RECENT LOOT</h3><span class="frontier-kicker" id="frontier-achievement-count">0 ACHIEVEMENTS</span></div><div class="frontier-loot-list" id="frontier-loot"></div><p class="frontier-note" id="frontier-daily">Daily orders load here.</p></section>
      </div>
      <div class="frontier-actions" style="margin-top:16px"><span class="frontier-sub" id="frontier-save-status">Progress saved on this device.</span><button class="frontier-close" id="frontier-close" type="button">← BACK TO HANGAR</button></div>
    </div>`;
  app.append(screen);

  const $ = id => screen.querySelector("#" + id);
  const missionName = mission => tr() ? mission.tr : mission.title;
  function persist() { writeState(state); render(); }
  function nextSector() { return state.sectors.find(sector => sector.owner === "bot") || null; }
  function activeMission() { return FRONTIER_MISSIONS.find(mission => mission.id === state.selectedMission) || FRONTIER_MISSIONS[0]; }
  function dailyTasks() {
    const date = new Date().toISOString().slice(0, 10);
    if (state.daily.date !== date) state.daily = { date, progress: { runs: 0, scrap: 0, bosses: 0 }, claimed: [] };
    return [
      { id: "run", title: tr() ? "Bir sefer tamamla" : "Complete one run", target: 1, value: state.daily.progress.runs, reward: 35 },
      { id: "scrap", title: tr() ? "Bugün 100 hurda topla" : "Collect 100 scrap today", target: 100, value: state.daily.progress.scrap, reward: 50 },
      { id: "boss", title: tr() ? "Bir boss yen" : "Defeat one boss", target: 1, value: state.daily.progress.bosses, reward: 80 }
    ];
  }
  function render() {
    const mission = activeMission(), target = nextSector();
    $("frontier-resources").textContent = state.resources.toLocaleString();
    $("frontier-target-label").textContent = target ? (tr() ? "SONRAKİ BOT BÖLGESİ" : "NEXT BOT SECTOR") : (tr() ? "TÜM BÖLGELER SENİN" : "ALL SECTORS SECURED");
    $("frontier-objective").textContent = (tr() ? mission.objectiveTr : mission.objective) + " · " + (tr() ? "Ödül" : "Reward") + ": +" + (mission.reward + state.buildings.extractor * 10) + " scrap · " + (tr() ? "Zorluk" : "Difficulty") + " " + "★".repeat(mission.difficulty);
    $("frontier-missions").replaceChildren();
    FRONTIER_MISSIONS.forEach(item => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "frontier-card" + (item.id === state.selectedMission ? " selected" : "");
      button.setAttribute("aria-pressed", String(item.id === state.selectedMission));
      const icon = document.createElement("span"); icon.className = "frontier-icon"; icon.textContent = item.icon;
      const title = document.createElement("strong"); title.textContent = missionName(item);
      const desc = document.createElement("small"); desc.textContent = tr() ? item.objectiveTr : item.objective;
      const reward = document.createElement("span"); reward.className = "frontier-pill"; reward.textContent = "+" + (item.reward + state.buildings.extractor * 10) + " SCRAP";
      button.append(icon, title, desc, reward);
      button.addEventListener("click", () => { state.selectedMission = item.id; persist(); });
      $("frontier-missions").append(button);
    });
    $("frontier-sectors").replaceChildren();
    state.sectors.forEach(sector => {
      const row = document.createElement("div"); row.className = "frontier-sector";
      const main = document.createElement("div"); main.className = "frontier-sector-main";
      const name = document.createElement("strong"); name.textContent = sector.name;
      const desc = document.createElement("small"); desc.textContent = (tr() ? "Bölge seviyesi " : "Sector level ") + sector.level;
      main.append(name, desc);
      const owner = document.createElement("span"); owner.className = "frontier-owner" + (sector.owner === "player" ? " player" : ""); owner.textContent = sector.owner === "player" ? (tr() ? "SENİN" : "YOUR") : (tr() ? "BOT" : "BOT");
      row.append(main, owner); $("frontier-sectors").append(row);
    });
    const captured = state.sectors.filter(sector => sector.owner === "player").length - 1;
    $("frontier-capture-count").textContent = captured + " / " + (state.sectors.length - 1) + (tr() ? " ELE GEÇİRİLDİ" : " CAPTURED");
    $("frontier-base-level").textContent = (tr() ? "SEVİYE " : "LEVEL ") + (1 + state.buildings.turret + state.buildings.extractor + state.buildings.shield);
    $("frontier-buildings").replaceChildren();
    FRONTIER_BUILDINGS.forEach(building => {
      const row = document.createElement("div"); row.className = "frontier-building";
      const main = document.createElement("div"); main.className = "frontier-building-main";
      const title = document.createElement("strong"); title.textContent = (tr() ? building.tr : building.name) + " · " + (state.buildings[building.id] || 0);
      const desc = document.createElement("small"); desc.textContent = (tr() ? "Sonraki yükseltme " : "Next upgrade ") + building.cost + " scrap";
      main.append(title, desc);
      const buy = document.createElement("button"); buy.type = "button"; buy.className = "frontier-buy"; buy.textContent = tr() ? "KUR" : "BUILD"; buy.disabled = state.resources < building.cost;
      buy.addEventListener("click", () => { if (purchaseBuilding(state, building.id)) { persist(); toast(tr() ? "ÜS YAPISI KURULDU" : "BASE STRUCTURE BUILT"); } });
      row.append(main, buy); $("frontier-buildings").append(row);
    });
    $("frontier-loot").replaceChildren();
    const loot = state.inventory.slice(-4).reverse();
    if (!loot.length) { const empty = document.createElement("p"); empty.className = "frontier-sub"; empty.textContent = tr() ? "Henüz ganimet yok. İlk görevi tamamla." : "No loot yet. Complete your first operation."; $("frontier-loot").append(empty); }
    loot.forEach(item => { const row = document.createElement("div"); row.className = "frontier-loot " + item.rarity; row.textContent = item.name + " · " + item.rarity.toUpperCase(); $("frontier-loot").append(row); });
    $("frontier-achievement-count").textContent = state.achievements.length + (tr() ? " BAŞARIM" : " ACHIEVEMENTS");
    const tasks = dailyTasks();
    $("frontier-daily").textContent = (tr() ? "GÜNLÜK: " : "DAILY: ") + tasks.map(task => task.title + " " + Math.min(task.value, task.target) + "/" + task.target + (state.daily.claimed.includes(task.id) ? " ✓" : task.value >= task.target ? " · CLAIM" : "")).join(" · ");
    $("frontier-save-status").textContent = tr() ? "İlerleme bu cihazda kaydedilir." : "Progress saves on this device.";
    $("frontier-launch").textContent = tr() ? "SEFERİ BAŞLAT ↗" : "LAUNCH OPERATION ↗";
    $("frontier-intro").textContent = tr() ? "Bölge seç, üssünü kur ve bot imparatorluğunu gerilet." : "Choose a sector, build your base, and push back the bot empire.";
  }
  function open() { render(); screen.hidden = false; $("frontier-close").focus({ preventScroll: true }); }
  function close() { screen.hidden = true; document.getElementById("meta-open")?.focus({ preventScroll: true }); }
  const openButton = document.createElement("button");
  openButton.type = "button"; openButton.id = "frontier-open"; openButton.className = "text-button frontier-open";
  openButton.textContent = tr() ? "UZAY KOMUTASI ↗" : "FRONTIER COMMAND ↗";
  document.querySelector(".settings-row")?.append(openButton);
  openButton.addEventListener("click", open);
  $("frontier-close").addEventListener("click", close);
  $("frontier-launch").addEventListener("click", () => {
    const mission = activeMission();
    state.activeMission = { id: mission.id, sectorId: nextSector()?.id || "home", launchedAt: Date.now() };
    writeState(state); screen.hidden = true;
    if (typeof onLaunch === "function") onLaunch(mission);
  });
  window.addEventListener("cosmic-scrap:run-ended", event => {
    if (!state.activeMission) return;
    const mission = FRONTIER_MISSIONS.find(item => item.id === state.activeMission.id);
    if (!mission) { state.activeMission = null; writeState(state); return; }
    const run = event.detail || {};
    const success = missionSucceeded(mission.id, run);
    const today = new Date().toISOString().slice(0, 10);
    if (state.daily.date !== today) state.daily = { date: today, progress: { runs: 0, scrap: 0, bosses: 0 }, claimed: [] };
    state.daily.progress.runs += 1;
    state.daily.progress.scrap += Math.max(0, Number(run.scrapCollected) || 0);
    state.daily.progress.bosses += Math.max(0, Number(run.bossesDefeated) || 0);
    if (success) {
      const sector = state.sectors.find(item => item.id === state.activeMission.sectorId);
      const alreadyOwned = !sector || sector.owner === "player";
      const payout = mission.reward + state.buildings.extractor * 10 + (alreadyOwned ? 0 : Math.max(0, sector.level - 1) * 20);
      state.resources += payout;
      state.stats.victories += 1;
      state.stats.totalScrap += Math.max(0, Number(run.scrapCollected) || 0);
      const loot = rollLoot();
      loot.acquiredAt = new Date().toISOString();
      state.inventory.push(loot);
      if (state.inventory.length > 100) state.inventory = state.inventory.slice(-100);
      if (sector && !alreadyOwned) { sector.owner = "player"; state.stats.captures += 1; }
      if (state.stats.victories >= 1 && !state.achievements.includes("first-victory")) state.achievements.push("first-victory");
      if (state.stats.captures >= 1 && !state.achievements.includes("first-capture")) state.achievements.push("first-capture");
      toast((tr() ? "SEFER BAŞARILI · +" : "OPERATION SUCCESS · +") + payout + " SCRAP · " + loot.rarity.toUpperCase() + " LOOT");
    } else {
      toast(tr() ? "SEFER TAMAMLANAMADI · TEKRAR DENE" : "OPERATION FAILED · TRY AGAIN");
    }
    dailyTasks().forEach(task => {
      if (task.value >= task.target && !state.daily.claimed.includes(task.id)) {
        state.daily.claimed.push(task.id); state.resources += task.reward;
        toast((tr() ? "GÜNLÜK GÖREV ÖDÜLÜ · +" : "DAILY ORDER REWARD · +") + task.reward + " SCRAP");
      }
    });
    state.activeMission = null;
    persist();
  });
  render();
  return { open, close, getState: () => structuredClone(state), refresh: render };
}
