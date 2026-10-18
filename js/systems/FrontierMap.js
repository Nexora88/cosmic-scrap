const WORLD_KEY = "cosmic-scrap-frontier-world-v1";
const COLS = 5;
const SIZE = COLS * COLS;

export const WORLD_FACTIONS = [
  { id: "player", name: "İnsan Kolonileri", short: "SEN", color: "#71edc2" },
  { id: "scrapborn", name: "Hurda Doğanlar", short: "BOT", color: "#ffad77" },
  { id: "void", name: "Boşluk Hanedanı", short: "BOT", color: "#c4a0ff" }
];

export function createWorldState(now = Date.now()) {
  const tiles = Array.from({ length: SIZE }, (_, id) => ({
    id, owner: id === 12 ? "player" : (id % 4 === 0 ? "void" : "scrapborn"),
    name: id === 12 ? "Yeni Ufuk Yerleşimi" : `Sektör ${String(id + 1).padStart(2, "0")}`,
    population: id === 12 ? 24 : 0, level: id === 12 ? 1 : 0,
    tower: null, settlement: id === 12 ? true : false, lastBattleAt: 0
  }));
  tiles[13].name = "Yakın Yerleşim"; tiles[13].settlement = true; tiles[13].population = 8;
  return {
    version: 1, lastSimulatedAt: now, selectedTile: 12, selectedTower: "pulse",
    tiles, alliances: [], resources: 260, log: ["İlk koloni kuruldu. Yakın yerleşim haritada işaretlendi."],
    stats: { captured: 0, built: 0, raids: 0 }
  };
}

export function towerRange(tower) {
  return tower === "rail" ? 3 : tower === "shield" ? 2 : 2;
}

export function isTileDefended(state, tileId) {
  const tile = state.tiles[tileId];
  if (!tile) return false;
  return state.tiles.some(t => t.owner === "player" && t.tower && Math.abs((t.id % COLS) - (tileId % COLS)) + Math.abs(Math.floor(t.id / COLS) - Math.floor(tileId / COLS)) <= towerRange(t.tower));
}

export function simulateOffline(input, elapsedMs) {
  const state = structuredClone(input);
  const steps = Math.min(48, Math.max(0, Math.floor(elapsedMs / 15000)));
  for (let step = 0; step < steps; step++) {
    state.resources += state.tiles.filter(t => t.owner === "player").reduce((sum, t) => sum + (t.settlement ? 3 : 1), 0);
    for (const tile of state.tiles) {
      if (tile.settlement && tile.owner === "player") tile.population = Math.min(999999, tile.population + 1);
    }
    // Bots expand and raid while the player is offline; alliances prevent attacks between partners.
    if (step % 4 === 3) {
      const botTiles = state.tiles.filter(t => t.owner !== "player");
      const target = state.tiles.find(t => t.owner === "player" && t.id !== 12 && !isTileDefended(state, t.id));
      const attacker = target ? state.tiles.filter(t => t.owner !== "player" && Math.abs((t.id % COLS) - (target.id % COLS)) + Math.abs(Math.floor(t.id / COLS) - Math.floor(target.id / COLS)) === 1).map(t => t.owner).find(owner => !state.alliances.includes(owner)) : null;
      const canAttack = Boolean(target && attacker);
      if (canAttack && Math.random() < 0.24) {
        target.owner = attacker || botTiles[0]?.owner || "scrapborn";
        target.tower = null; target.settlement = false; target.population = 0;
        state.stats.raids += 1;
        state.log.unshift(`Çevrimdışı baskın: ${target.name} kaybedildi.`);
      } else {
        const frontier = state.tiles.find(t => t.owner === "player" && state.tiles.some(n => n.owner !== "player" && Math.abs((n.id % COLS) - (t.id % COLS)) + Math.abs(Math.floor(n.id / COLS) - Math.floor(t.id / COLS)) === 1));
        if (frontier && Math.random() < 0.55) {
          const neighbor = [frontier.id - COLS, frontier.id + COLS, frontier.id - 1, frontier.id + 1]
            .filter(id => id >= 0 && id < SIZE && Math.abs((id % COLS) - (frontier.id % COLS)) + Math.abs(Math.floor(id / COLS) - Math.floor(frontier.id / COLS)) === 1)
            .map(id => state.tiles[id]).find(t => t.owner !== "player");
          if (neighbor) {
            neighbor.owner = "player"; neighbor.name = neighbor.name.replace("Sektör", "Koloni");
            neighbor.level = 1; neighbor.population = 3; neighbor.settlement = false;
            state.stats.captured += 1;
            state.log.unshift(`Savunma ağı büyüdü: ${neighbor.name} ele geçirildi.`);
          }
        }
      }
      // Unallied bots grow their own settlements too.
      const botHomes = state.tiles.filter(t => t.owner !== "player" && t.settlement);
      if (botHomes.length) {
        const botHome = botHomes[step % botHomes.length];
        botHome.population = Math.min(999999, botHome.population + 2);
      }
      if (step % 8 === 7) {
        const botFrontier = state.tiles.find(t => t.owner !== "player" && state.tiles.some(n => n.owner === "player" && Math.abs((n.id % COLS) - (t.id % COLS)) + Math.abs(Math.floor(n.id / COLS) - Math.floor(t.id / COLS)) === 1));
        if (botFrontier && !botFrontier.settlement) {
          botFrontier.settlement = true; botFrontier.population = Math.max(3, botFrontier.population || 0); botFrontier.level = Math.max(1, botFrontier.level || 0);
          state.log.unshift("Botlar sınırda yeni bir karakol kurdu: " + botFrontier.name + ".");
        }
      }
    }
  }
  state.lastSimulatedAt = Date.now();
  state.log = state.log.slice(0, 8);
  return state;
}

function readWorld() {
  try {
    const raw = JSON.parse(localStorage.getItem(WORLD_KEY) || "null");
    if (!raw || raw.version !== 1 || !Array.isArray(raw.tiles) || raw.tiles.length !== SIZE) return createWorldState();
    return { ...createWorldState(), ...raw, tiles: raw.tiles.map((tile, id) => ({ ...createWorldState().tiles[id], ...tile })) };
  } catch { return createWorldState(); }
}
function saveWorld(state) {
  try { localStorage.setItem(WORLD_KEY, JSON.stringify(state)); } catch {}
}

export function initFrontierMap({ toast = () => {} } = {}) {
  const screen = document.getElementById("frontier-screen");
  if (!screen || document.getElementById("frontier-map-open")) return null;
  let state = readWorld();
  state = simulateOffline(state, Math.max(0, Date.now() - (state.lastSimulatedAt || Date.now())));
  saveWorld(state);

  const style = document.createElement("style");
  style.textContent = `
    #frontier-map-open{margin:10px 0;width:100%;min-height:44px;border:1px solid #397b91;border-radius:9px;background:#0c2532;color:#9aeaff;font-weight:900;letter-spacing:.04em}
    #frontier-map-modal{position:fixed;inset:0;z-index:1000;overflow:auto;padding:10px;background:#050a11f7;color:#eaf7ff;font-family:inherit}
    #frontier-map-modal[hidden]{display:none}
    .fmap-shell{max-width:760px;margin:0 auto;padding:12px;border:1px solid #244255;border-radius:14px;background:linear-gradient(155deg,#0e1b29,#060b12)}
    .fmap-head,.fmap-actions,.fmap-detail{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
    .fmap-head h2{font-size:clamp(21px,5vw,32px);margin:6px 0}
    .fmap-muted{font-size:11px;line-height:1.55;color:#9cb0c4}
    .fmap-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:14px 0}
    .fmap-tile{position:relative;aspect-ratio:1/1;min-width:0;padding:4px 2px;border:1px solid #2b3b4d;border-radius:7px;background:#0c1722;color:#dceaf7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:clamp(8px,2.3vw,11px);overflow:hidden}
    .fmap-tile.player{border-color:#328b71;background:#0c2b29}.fmap-tile.scrapborn{border-color:#835238;background:#281b16}.fmap-tile.void{border-color:#65518c;background:#211a31}
    .fmap-tile.selected{outline:2px solid #8beaff;outline-offset:-2px;box-shadow:inset 0 0 0 2px #8beaff45}
    .fmap-tile.defended:after{content:"";position:absolute;inset:2px;border:1px dashed #6edfff88;border-radius:5px;pointer-events:none}
    .fmap-symbol{font-size:clamp(14px,4vw,23px)}.fmap-tile small{font-size:8px;opacity:.8}
    .fmap-legend{display:flex;gap:8px;flex-wrap:wrap;font-size:9px;color:#a9bdcf}.fmap-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}
    .fmap-panel{padding:12px;border:1px solid #26394a;border-radius:10px;background:#09121b;margin-top:10px}
    .fmap-btn{min-height:42px;padding:10px 12px;border:1px solid #426175;border-radius:8px;background:#102433;color:#a4eaff;font-weight:800;font-size:11px}
    .fmap-btn.primary{background:#d8f7ff;color:#061019;border-color:#d8f7ff}.fmap-btn:disabled{opacity:.4}
    .fmap-tower-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:9px 0}
    .fmap-log{padding-left:18px;color:#9cb0c4;font-size:10px;line-height:1.7}
    @media(max-width:370px){.fmap-shell{padding:8px}.fmap-grid{gap:3px}.fmap-tile{border-radius:5px}.fmap-tile small{font-size:7px}.fmap-tower-options{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){#frontier-map-modal *{animation:none!important;transition:none!important}}
  `;
  document.head.append(style);
  const open = document.createElement("button");
  open.id = "frontier-map-open"; open.type = "button";
  open.textContent = "🪐 HARİTAYI AÇ · KOLONİLER, KULELER VE İTTİFAKLAR";
  const launch = screen.querySelector("#frontier-launch");
  if (launch?.parentElement) launch.parentElement.insertAdjacentElement("afterend", open);
  else screen.querySelector(".frontier-shell")?.prepend(open);

  const modal = document.createElement("section");
  modal.id = "frontier-map-modal"; modal.hidden = true;
  modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-label", "Uzay fetih haritası");
  modal.innerHTML = `
    <div class="fmap-shell">
      <div class="fmap-head"><div><p class="frontier-kicker">GALAKTİK SINIR · MOBİL KOMUTA</p><h2>UZAY FETİH HARİTASI</h2><p class="fmap-muted">Kare seç, kule kur, menzili gör. Botlar sen çevrimdışıyken de büyür ve saldırır.</p></div><button class="fmap-btn" id="fmap-close">KAPAT ✕</button></div>
      <div class="fmap-legend"><span><i class="fmap-dot" style="background:#71edc2"></i>Senin kolonin</span><span><i class="fmap-dot" style="background:#ffad77"></i>Hurda Doğanlar</span><span><i class="fmap-dot" style="background:#c4a0ff"></i>Boşluk Hanedanı</span><span>┄ Kule savunma menzili</span></div>
      <div class="fmap-grid" id="fmap-grid" role="group" aria-label="Sektör haritası"></div>
      <div class="fmap-panel"><div class="fmap-detail"><div><strong id="fmap-selected-name">Sektör</strong><p class="fmap-muted" id="fmap-selected-detail"></p></div><span id="fmap-resource-count">Hurda: 0</span></div>
        <div class="fmap-tower-options"><button class="fmap-btn" data-tower="pulse">Darbe Kulesi · 90</button><button class="fmap-btn" data-tower="rail">Ray Kulesi · 130</button><button class="fmap-btn" data-tower="shield">Kalkan · 110</button></div>
        <div class="fmap-actions"><button class="fmap-btn primary" id="fmap-build">Seçili sektöre kur</button><button class="fmap-btn" id="fmap-settle">Yerleşim kur · 160</button><button class="fmap-btn" id="fmap-alliance">İttifak teklif et</button></div>
      </div>
      <div class="fmap-panel"><div class="fmap-detail"><strong>Halk ve çevrimdışı simülasyon</strong><span id="fmap-population">Nüfus: 0</span></div><p class="fmap-muted" id="fmap-offline"></p><strong>Komuta günlüğü</strong><ul class="fmap-log" id="fmap-log"></ul></div>
    </div>`;
  document.body.append(modal);
  const $ = id => modal.querySelector("#" + id);
  const prices = { pulse: 90, rail: 130, shield: 110 };
  function persist() { saveWorld(state); render(); }
  function selected() { return state.tiles[state.selectedTile]; }
  function render() {
    const selectedTile = selected();
    $("fmap-grid").replaceChildren();
    state.tiles.forEach(tile => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fmap-tile " + tile.owner + (tile.id === state.selectedTile ? " selected" : "") + (isTileDefended(state, tile.id) ? " defended" : "");
      button.setAttribute("aria-label", `${tile.name}, ${tile.owner === "player" ? "senin" : "bot"}${tile.tower ? ", kule var" : ""}`);
      const symbol = document.createElement("span"); symbol.className = "fmap-symbol";
      symbol.textContent = tile.tower ? (tile.tower === "rail" ? "⌁" : tile.tower === "shield" ? "⬡" : "⌖") : tile.settlement ? "⌂" : tile.owner === "player" ? "◆" : tile.owner === "void" ? "☄" : "✦";
      const name = document.createElement("span"); name.textContent = tile.name.length > 12 ? tile.name.slice(0, 11) + "…" : tile.name;
      const small = document.createElement("small"); small.textContent = tile.settlement ? "NÜFUS " + tile.population : tile.tower ? "MENZİL " + towerRange(tile.tower) : tile.owner === "player" ? "SENİN" : "BOT";
      button.append(symbol, name, small);
      button.addEventListener("click", () => { state.selectedTile = tile.id; render(); });
      $("fmap-grid").append(button);
    });
    $("fmap-selected-name").textContent = selectedTile.name;
    $("fmap-selected-detail").textContent = (selectedTile.owner === "player" ? "Senin bölgen" : "Bot kontrolünde") + " · " + (selectedTile.settlement ? "Yerleşim" : "Boş alan") + (selectedTile.tower ? " · Kule: " + selectedTile.tower : "");
    $("fmap-resource-count").textContent = "Hurda: " + state.resources;
    $("fmap-population").textContent = "Toplam halk: " + state.tiles.filter(t => t.owner === "player").reduce((n,t) => n + (t.population || 0), 0);
    $("fmap-offline").textContent = "Botlar çevrimdışı sürede üs geliştirir ve sınır baskınları yapar. Kule menzili kesikli çerçeveyle gösterilir. Aktif ittifak: " + (state.alliances.length ? state.alliances.map(id => WORLD_FACTIONS.find(f => f.id === id)?.name || id).join(", ") : "yok") + ".";
    $("fmap-log").replaceChildren();
    state.log.slice(0, 5).forEach(message => { const li = document.createElement("li"); li.textContent = message; $("fmap-log").append(li); });
    $("fmap-build").disabled = selectedTile.owner !== "player" || Boolean(selectedTile.tower) || state.resources < prices[state.selectedTower];
    $("fmap-build").textContent = "Kur: " + ({pulse:"Darbe Kulesi",rail:"Ray Kulesi",shield:"Kalkan"}[state.selectedTower]) + " · " + prices[state.selectedTower] + " hurda";
    $("fmap-settle").disabled = selectedTile.owner !== "player" || selectedTile.settlement || state.resources < 160;
    $("fmap-alliance").textContent = state.alliances.includes(selectedTile.owner) ? "İttifakı sonlandır" : "İttifak teklif et";
    $("fmap-alliance").disabled = selectedTile.owner === "player";
  }
  open.addEventListener("click", () => { state = simulateOffline(state, Math.max(0, Date.now() - state.lastSimulatedAt)); persist(); modal.hidden = false; $("fmap-close").focus(); });
  $("fmap-close").addEventListener("click", () => { modal.hidden = true; open.focus(); });
  modal.addEventListener("keydown", event => { if (event.key === "Escape") { modal.hidden = true; open.focus(); } });
  modal.querySelectorAll("[data-tower]").forEach(button => button.addEventListener("click", () => { state.selectedTower = button.dataset.tower; render(); }));
  $("fmap-build").addEventListener("click", () => {
    const tile = selected(), cost = prices[state.selectedTower];
    if (tile.owner !== "player" || tile.tower || state.resources < cost) return;
    state.resources -= cost; tile.tower = state.selectedTower; state.stats.built += 1;
    state.log.unshift(tile.name + " üzerine " + ({pulse:"Darbe Kulesi",rail:"Ray Kulesi",shield:"Kalkan"}[tile.tower]) + " kuruldu.");
    persist(); toast("KULE YERLEŞTİRİLDİ · SAVUNMA MENZİLİ GÖSTERİLİYOR");
  });
  $("fmap-settle").addEventListener("click", () => {
    const tile = selected();
    if (tile.owner !== "player" || tile.settlement || state.resources < 160) return;
    state.resources -= 160; tile.settlement = true; tile.population = Math.max(5, tile.population || 0); tile.name = "Yeni Yerleşim " + (state.stats.captured + 2);
    state.log.unshift(tile.name + " kuruldu; halk kolonileşmeye başladı."); persist(); toast("YERLEŞİM KURULDU");
  });
  $("fmap-alliance").addEventListener("click", () => {
    const owner = selected().owner;
    if (owner === "player") return;
    if (state.alliances.includes(owner)) { state.alliances = state.alliances.filter(id => id !== owner); state.log.unshift("İttifak sona erdi."); }
    else { state.alliances.push(owner); state.log.unshift((WORLD_FACTIONS.find(f => f.id === owner)?.name || owner) + " ile savunma ittifakı kuruldu."); }
    persist(); toast("İTTİFAK DURUMU GÜNCELLENDİ");
  });
  // Simulate once a minute while the page stays open; the offline timestamp handles closed tabs.
  const tick = () => { state = simulateOffline(state, Math.max(0, Date.now() - state.lastSimulatedAt)); persist(); };
  const timer = setInterval(tick, 60000);
  window.addEventListener("pagehide", () => { clearInterval(timer); state.lastSimulatedAt = Date.now(); saveWorld(state); }, { once: true });
  render();
  return { getState: () => structuredClone(state), refresh: render };
}
