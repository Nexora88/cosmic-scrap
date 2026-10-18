const WORLD_KEY = "cosmic-scrap-frontier-world-v1";
const COLS = 15;
const SIZE = COLS * COLS;
const HOME_ID = Math.floor(SIZE / 2);

export const WORLD_FACTIONS = [
  { id: "player", name: "İnsan Kolonileri", short: "SEN", color: "#71edc2" },
  { id: "scrapborn", name: "Hurda Doğanlar", short: "BOT", color: "#ffad77" },
  { id: "void", name: "Boşluk Hanedanı", short: "BOT", color: "#c4a0ff" }
];

export function createWorldState(now = Date.now()) {
  const tiles = Array.from({ length: SIZE }, (_, id) => ({
    id, owner: id === HOME_ID ? "player" : (id % 4 === 0 ? "void" : "scrapborn"),
    name: id === HOME_ID ? "Yeni Ufuk Yerleşimi" : `Sektör ${String(id + 1).padStart(2, "0")}`,
    population: id === HOME_ID ? 24 : 0, level: id === HOME_ID ? 1 : 0,
    army: id === HOME_ID ? 24 : (id % 4 === 0 ? 12 : 8), infantry: id === HOME_ID ? 20 : 6, tanks: id === HOME_ID ? 3 : 1, ships: id === HOME_ID ? 2 : 1, tower: null, settlement: id === HOME_ID ? true : false, lastBattleAt: 0
  }));
  tiles[HOME_ID + 1].name = "Yakın Yerleşim"; tiles[HOME_ID + 1].settlement = true; tiles[HOME_ID + 1].population = 8;
  return {
    version: 1, lastSimulatedAt: now, selectedTile: HOME_ID, selectedTower: "pulse",
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
      // Independent bot factions can attack each other along shared borders.
      const botFronts = state.tiles.filter(t => t.owner !== "player").flatMap(attacker =>
        [attacker.id - COLS, attacker.id + COLS, attacker.id - 1, attacker.id + 1]
          .filter(id => id >= 0 && id < SIZE && Math.abs((id % COLS) - (attacker.id % COLS)) + Math.abs(Math.floor(id / COLS) - Math.floor(attacker.id / COLS)) === 1)
          .map(id => ({ attacker, defender: state.tiles[id] }))
          .filter(pair => pair.defender.owner !== "player" && pair.defender.owner !== pair.attacker.owner && !state.alliances.includes(pair.attacker.owner) && !state.alliances.includes(pair.defender.owner)));
      if (botFronts.length && Math.random() < 0.42) {
        const { attacker, defender } = botFronts[Math.floor(Math.random() * botFronts.length)];
        const attack = (Number(attacker.army)||0) + (Number(attacker.tanks)||0)*3 + (Number(attacker.ships)||0)*4 + Math.floor(Math.random()*8);
        const defense = (Number(defender.army)||0) + (Number(defender.tanks)||0)*3 + (Number(defender.ships)||0)*4 + Math.floor(Math.random()*8) + (defender.tower ? 8 : 0);
        attacker.army = Math.max(0, (Number(attacker.army)||0) - Math.max(1, Math.floor((Number(attacker.army)||0)*0.18)));
        defender.army = Math.max(0, (Number(defender.army)||0) - Math.max(1, Math.floor((Number(defender.army)||0)*0.22)));
        if (attack > defense) {
          defender.owner = attacker.owner; defender.army = Math.max(1, Math.floor((attack-defense)*0.45)); defender.tower = null;
          state.log.unshift("Bot savaşı: " + attacker.name + " birlikleri " + defender.name + " sektörünü ele geçirdi.");
        } else state.log.unshift("Bot savaşı: " + defender.name + " sektörü saldırıyı püskürttü.");
      }
      const botTiles = state.tiles.filter(t => t.owner !== "player");
      const target = state.tiles.find(t => t.owner === "player" && t.id !== HOME_ID && !isTileDefended(state, t.id));
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
    if (!raw || raw.version !== 1 || !Array.isArray(raw.tiles)) return createWorldState();
    const base = createWorldState();
    // Preserve existing 5x5 saves by centering them inside the expanded 9x9 map.
    if (raw.tiles.length === 25 && SIZE === 225) {
      for (let oldY = 0; oldY < 5; oldY++) {
        for (let oldX = 0; oldX < 5; oldX++) {
          const oldId = oldY * 5 + oldX;
          const newId = (oldY + 5) * COLS + oldX + 5;
          base.tiles[newId] = { ...base.tiles[newId], ...raw.tiles[oldId], id: newId };
        }
      }
      return { ...base, ...raw, selectedTile: (Number.isInteger(raw.selectedTile) && raw.selectedTile >= 0 && raw.selectedTile < 25) ? (Math.floor(raw.selectedTile / 5) + 5) * COLS + (raw.selectedTile % 5) + 5 : HOME_ID, tiles: base.tiles };
    }
    if (raw.tiles.length !== SIZE) return base;
    return { ...base, ...raw, tiles: raw.tiles.map((tile, id) => ({ ...base.tiles[id], ...tile, id })) };
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
    .fmap-map-viewport{overflow:auto;max-width:100%;border:1px solid #243b4c;border-radius:9px;background:#050b13;touch-action:pan-x pan-y}.fmap-grid{display:grid;grid-template-columns:repeat(15,minmax(30px,1fr));gap:4px;margin:8px;min-width:510px}
    .fmap-tile{position:relative;aspect-ratio:1/1;min-width:0;padding:4px 2px;border:1px solid #2b3b4d;border-radius:7px;background:#0c1722;color:#dceaf7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:clamp(8px,2.3vw,11px);overflow:hidden}
    .fmap-tile.player{border-color:#328b71;background:#0c2b29}.fmap-tile.scrapborn{border-color:#835238;background:#281b16}.fmap-tile.void{border-color:#65518c;background:#211a31}
    .fmap-tile.selected{outline:2px solid #8beaff;outline-offset:-2px;box-shadow:inset 0 0 0 2px #8beaff45}
    .fmap-tile[draggable="true"]{cursor:grab}.fmap-tile.dragging{opacity:.45;transform:scale(.94)}.fmap-tile.drop-target{outline:2px dashed #fff;outline-offset:-2px}
    .fmap-unit-row{display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;line-height:1}.fmap-unit{display:inline-flex;align-items:center;justify-content:center;min-width:13px;height:13px;padding:0 2px;border-radius:4px;font-size:10px;font-weight:900;color:#07111b;background:#71edc2}.fmap-unit.tank{background:#ffad77}.fmap-unit.ship{background:#c4a0ff}
    #fmap-battle-report.fmap-battle-active{animation:fmap-battle-in .35s ease-out;border-color:#ffad77;box-shadow:0 0 24px #ff7d3440}
    #fmap-battle-report.fmap-battle-active:before{content:"⚡ ÇATIŞMA TAMAMLANDI";display:block;color:#ffbf8b;font-weight:900;font-size:12px;letter-spacing:.1em;animation:fmap-flash .6s ease-in-out 3}
    @keyframes fmap-battle-in{from{transform:translateY(8px) scale(.98);opacity:.35}to{transform:translateY(0) scale(1);opacity:1}}
    @keyframes fmap-flash{50%{opacity:.25;text-shadow:0 0 18px #ff9c53}}
    .fmap-loss-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}.fmap-loss-card{padding:8px;border:1px solid #26394a;border-radius:8px;background:#07101a;font-size:10px;line-height:1.7}
    .fmap-tile.defended:after{content:"";position:absolute;inset:2px;border:1px dashed #6edfff88;border-radius:5px;pointer-events:none}
    .fmap-symbol{font-size:clamp(14px,4vw,23px)}.fmap-tile small{font-size:8px;opacity:.8}
    .fmap-legend{display:flex;gap:8px;flex-wrap:wrap;font-size:9px;color:#a9bdcf}.fmap-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}
    .fmap-panel{padding:12px;border:1px solid #26394a;border-radius:10px;background:#09121b;margin-top:10px}
    .fmap-btn{min-height:42px;padding:10px 12px;border:1px solid #426175;border-radius:8px;background:#102433;color:#a4eaff;font-weight:800;font-size:11px}
    .fmap-btn.primary{background:#d8f7ff;color:#061019;border-color:#d8f7ff}.fmap-btn:disabled{opacity:.4}
    .fmap-tower-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:9px 0}
    .fmap-log{padding-left:18px;color:#9cb0c4;font-size:10px;line-height:1.7}
    .fmap-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.fmap-metric{padding:9px;border:1px solid #243b4c;border-radius:8px;background:#07101a;min-width:0}.fmap-metric small{display:block;color:#9cb0c4;font-size:9px}.fmap-metric strong{display:block;margin:5px 0;font-size:14px}.fmap-bar{height:5px;background:#1b2a38;border-radius:8px;overflow:hidden}.fmap-bar i{display:block;height:100%;background:linear-gradient(90deg,#39a9d7,#8beaff);width:0;transition:width .2s}
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
      <div class="fmap-head"><div><p class="frontier-kicker">GALAKTİK SINIR · MOBİL KOMUTA</p><h2>UZAY FETİH HARİTASI</h2><p class="fmap-muted">Kare seç, kule kur, menzili gör. Botlar sen çevrimdışıyken de büyür ve saldırır.</p></div><div class="fmap-actions"><button class="fmap-btn primary" id="fmap-shared">🌐 ORTAK GALAKSİ</button><button class="fmap-btn" id="fmap-close">KAPAT ✕</button></div></div>
      <div class="fmap-legend"><span><i class="fmap-dot" style="background:#71edc2"></i>Senin kolonin</span><span><i class="fmap-dot" style="background:#ffad77"></i>Hurda Doğanlar</span><span><i class="fmap-dot" style="background:#c4a0ff"></i>Boşluk Hanedanı</span><span>┄ Kule savunma menzili</span></div>
      <div class="fmap-map-viewport" aria-label="Kaydırılabilir galaksi haritası"><div class="fmap-grid" id="fmap-grid" role="group" aria-label="225 sektörlük galaksi haritası"></div></div>
      <div class="fmap-panel"><div class="fmap-detail"><div><strong id="fmap-selected-name">Sektör</strong><p class="fmap-muted" id="fmap-selected-detail"></p></div><span id="fmap-resource-count">Hurda: 0</span></div>
        <div class="fmap-tower-options"><button class="fmap-btn" data-tower="pulse">Darbe Kulesi · 90</button><button class="fmap-btn" data-tower="rail">Ray Kulesi · 130</button><button class="fmap-btn" data-tower="shield">Kalkan · 110</button></div>
        <div class="fmap-actions"><button class="fmap-btn primary" id="fmap-build">Seçili sektöre kur</button><button class="fmap-btn" id="fmap-settle">Yerleşim kur · 160</button><button class="fmap-btn" id="fmap-recruit">Piyade eğit · 40</button><button class="fmap-btn" id="fmap-tank">Tank üret · 100</button><button class="fmap-btn" id="fmap-ship">Uzay gemisi · 140</button><button class="fmap-btn" id="fmap-move">Orduyu taşı</button><button class="fmap-btn" id="fmap-attack">Botlara saldır</button><button class="fmap-btn" id="fmap-alliance">İttifak teklif et</button></div>
      </div>
      <div class="fmap-panel"><div class="fmap-detail"><strong>CANLI CEPHE ANALİZİ</strong><span id="fmap-population">Nüfus: 0</span></div><div class="fmap-metrics"><div class="fmap-metric"><small>ORDU GÜCÜ</small><strong id="fmap-army-total">0</strong><div class="fmap-bar"><i id="fmap-army-bar"></i></div></div><div class="fmap-metric"><small>SAVUNMA AĞI</small><strong id="fmap-tower-total">0</strong><div class="fmap-bar"><i id="fmap-tower-bar"></i></div></div><div class="fmap-metric"><small>FETİH</small><strong id="fmap-capture-total">0</strong><div class="fmap-bar"><i id="fmap-capture-bar"></i></div></div></div><p class="fmap-muted" id="fmap-offline"></p><div id="fmap-battle-report" class="fmap-panel" hidden aria-live="polite"><strong id="fmap-battle-title">SAVAŞ RAPORU</strong><p class="fmap-muted" id="fmap-battle-summary"></p><div class="fmap-metric"><small>SALDIRAN GÜCÜ</small><div class="fmap-bar"><i id="fmap-attack-bar"></i></div><small id="fmap-attack-value"></small></div><div class="fmap-metric"><small>SAVUNAN GÜCÜ</small><div class="fmap-bar"><i id="fmap-defense-bar"></i></div><small id="fmap-defense-value"></small></div><p class="fmap-muted" id="fmap-losses"></p><div class="fmap-loss-grid"><div class="fmap-loss-card"><strong>🟢 Kayıplarımız</strong><span id="fmap-own-losses">—</span></div><div class="fmap-loss-card"><strong>🟠 Bot kayıpları</strong><span id="fmap-enemy-losses">—</span></div></div><p class="fmap-muted" id="fmap-battle-units"></p></div><strong>Komuta günlüğü</strong><ul class="fmap-log" id="fmap-log"></ul></div>
    </div>`;
  document.body.append(modal);
  const $ = id => modal.querySelector("#" + id);
  const prices = { pulse: 90, rail: 130, shield: 110 };
  let moveFromId = null;
  function persist() { saveWorld(state); render(); }
  function selected() { return state.tiles[state.selectedTile]; }
  function render() {
    const selectedTile = selected();
    $("fmap-grid").replaceChildren();
    state.tiles.forEach(tile => {
      const button = document.createElement("button");
      button.type = "button";
      button.draggable = tile.owner === "player" && (Number(tile.army)||0) > 0;
      button.className = "fmap-tile " + tile.owner + (tile.id === state.selectedTile ? " selected" : "") + (isTileDefended(state, tile.id) ? " defended" : "");
      button.setAttribute("aria-label", `${tile.name}, ${tile.owner === "player" ? "senin" : "bot"}${tile.tower ? ", kule var" : ""}`);
      const symbol = document.createElement("span"); symbol.className = "fmap-symbol";
      symbol.textContent = tile.tower ? (tile.tower === "rail" ? "⌁" : tile.tower === "shield" ? "⬡" : "⌖") : tile.settlement ? "⌂" : tile.owner === "player" ? "◆" : tile.owner === "void" ? "☄" : "✦";
      const name = document.createElement("span"); name.textContent = tile.name.length > 12 ? tile.name.slice(0, 11) + "…" : tile.name;
      const units = document.createElement("span"); units.className = "fmap-unit-row";
      const infantry = document.createElement("span"); infantry.className = "fmap-unit"; infantry.textContent = "♟" + (Number(tile.infantry)||0);
      const tanks = document.createElement("span"); tanks.className = "fmap-unit tank"; tanks.textContent = "▰" + (Number(tile.tanks)||0);
      const ships = document.createElement("span"); ships.className = "fmap-unit ship"; ships.textContent = "✦" + (Number(tile.ships)||0);
      units.append(infantry, tanks, ships);
      const small = document.createElement("small"); small.textContent = "⚔ " + (Number(tile.army) || 0);
      button.append(symbol, name, units, small);
      button.addEventListener("dragstart", event => {
        if (!button.draggable) { event.preventDefault(); return; }
        moveFromId = tile.id; button.classList.add("dragging");
        if (event.dataTransfer) { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(tile.id)); }
      });
      button.addEventListener("dragend", () => { button.classList.remove("dragging"); $("fmap-grid").querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target")); });
      button.addEventListener("dragover", event => {
        if (moveFromId !== null && tile.owner === "player" && tile.id !== moveFromId) { event.preventDefault(); button.classList.add("drop-target"); }
      });
      button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
      button.addEventListener("drop", event => {
        event.preventDefault(); button.classList.remove("drop-target");
        const source = state.tiles[moveFromId];
        if (source && source.owner === "player" && tile.owner === "player" && tile.id !== source.id) {
          tile.army = (Number(tile.army)||0) + (Number(source.army)||0);
          tile.infantry = (Number(tile.infantry)||0) + (Number(source.infantry)||0);
          tile.tanks = (Number(tile.tanks)||0) + (Number(source.tanks)||0);
          tile.ships = (Number(tile.ships)||0) + (Number(source.ships)||0);
          source.army = 0; source.infantry = 0; source.tanks = 0; source.ships = 0;
          state.log.unshift("Sürükle-bırak komutu: " + source.name + " → " + tile.name + ".");
          state.selectedTile = tile.id; moveFromId = null; persist(); toast("ORDU YENİ KONUMA TAŞINDI");
        }
      });
      button.addEventListener("click", () => {
        if (moveFromId !== null) {
          const source = state.tiles[moveFromId];
          if (tile.owner === "player" && tile.id !== moveFromId && source && source.owner === "player") {
            tile.army = (Number(tile.army)||0) + (Number(source.army)||0);
            tile.infantry = (Number(tile.infantry)||0) + (Number(source.infantry)||0);
            tile.tanks = (Number(tile.tanks)||0) + (Number(source.tanks)||0);
            tile.ships = (Number(tile.ships)||0) + (Number(source.ships)||0);
            source.army = 0; source.infantry = 0; source.tanks = 0; source.ships = 0;
            state.log.unshift("Ordu " + source.name + " bölgesinden " + tile.name + " bölgesine taşındı.");
            moveFromId = null; state.selectedTile = tile.id; persist(); toast("ORDU YENİ KONUMLANDIRILDI"); return;
          }
        }
        state.selectedTile = tile.id; render();
      });
      $("fmap-grid").append(button);
    });
    $("fmap-selected-name").textContent = selectedTile.name;
    $("fmap-selected-detail").textContent = (selectedTile.owner === "player" ? "Senin bölgen" : "Bot kontrolünde") + " · " + (selectedTile.settlement ? "Yerleşim" : "Boş alan") + " · Ordu: " + (Number(selectedTile.army) || 0) + (selectedTile.tower ? " · Kule: " + selectedTile.tower : "");
    $("fmap-resource-count").textContent = "Hurda: " + state.resources;
    $("fmap-population").textContent = "Toplam halk: " + state.tiles.filter(t => t.owner === "player").reduce((n,t) => n + (t.population || 0), 0);
    const playerTiles = state.tiles.filter(t => t.owner === "player");
    const armyTotal = playerTiles.reduce((n,t) => n + (Number(t.army) || 0), 0);
    const towerTotal = playerTiles.filter(t => t.tower).length;
    $("fmap-army-total").textContent = armyTotal.toLocaleString("tr-TR");
    $("fmap-tower-total").textContent = String(towerTotal);
    $("fmap-capture-total").textContent = String(state.stats.captured || 0);
    $("fmap-army-bar").style.width = Math.min(100, armyTotal / 5) + "%";
    $("fmap-tower-bar").style.width = Math.min(100, towerTotal * 12) + "%";
    $("fmap-capture-bar").style.width = Math.min(100, (state.stats.captured || 0) * 5) + "%";
    $("fmap-offline").textContent = "Botlar çevrimdışı sürede üs geliştirir ve sınır baskınları yapar. Kule menzili kesikli çerçeveyle gösterilir. Aktif ittifak: " + (state.alliances.length ? state.alliances.map(id => WORLD_FACTIONS.find(f => f.id === id)?.name || id).join(", ") : "yok") + ".";
    $("fmap-log").replaceChildren();
    state.log.slice(0, 5).forEach(message => { const li = document.createElement("li"); li.textContent = message; $("fmap-log").append(li); });
    $("fmap-build").disabled = selectedTile.owner !== "player" || Boolean(selectedTile.tower) || state.resources < prices[state.selectedTower];
    $("fmap-build").textContent = "Kur: " + ({pulse:"Darbe Kulesi",rail:"Ray Kulesi",shield:"Kalkan"}[state.selectedTower]) + " · " + prices[state.selectedTower] + " hurda";
    $("fmap-settle").disabled = selectedTile.owner !== "player" || selectedTile.settlement || state.resources < 160;
    $("fmap-recruit").disabled = selectedTile.owner !== "player" || state.resources < 40;
    $("fmap-tank").disabled = selectedTile.owner !== "player" || state.resources < 100;
    $("fmap-ship").disabled = selectedTile.owner !== "player" || state.resources < 140;
    $("fmap-move").disabled = selectedTile.owner !== "player" || (Number(selectedTile.army)||0) < 1;
    $("fmap-move").textContent = moveFromId === selectedTile.id ? "Hedef sektöre dokun…" : "Orduyu taşı";
    const adjacentEnemy = state.tiles.some(t => t.owner !== "player" && Math.abs((t.id % COLS) - (selectedTile.id % COLS)) + Math.abs(Math.floor(t.id / COLS) - Math.floor(selectedTile.id / COLS)) === 1);
    $("fmap-attack").disabled = selectedTile.owner !== "player" || (Number(selectedTile.army) || 0) < 8 || !adjacentEnemy;
    $("fmap-alliance").textContent = state.alliances.includes(selectedTile.owner) ? "İttifakı sonlandır" : "İttifak teklif et";
    $("fmap-alliance").disabled = selectedTile.owner === "player";
  }
  open.addEventListener("click", () => { state = simulateOffline(state, Math.max(0, Date.now() - state.lastSimulatedAt)); persist(); modal.hidden = false; $("fmap-close").focus(); });
  $("fmap-shared").addEventListener("click", async () => { try { const { openSharedGalaxy } = await import("./SharedGalaxy.js"); await openSharedGalaxy({ toast }); } catch (error) { toast("ORTAK GALAKSİ AÇILAMADI · HESAP / BAĞLANTIYI KONTROL ET"); } });
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
  $("fmap-recruit").addEventListener("click", () => {
    const tile = selected();
    if (tile.owner !== "player" || state.resources < 40) return;
    state.resources -= 40; tile.army = Math.min(9999, (Number(tile.army) || 0) + 12); tile.infantry = (Number(tile.infantry)||0) + 12;
    state.log.unshift(tile.name + " bölgesinde 12 piyade eğitildi."); persist(); toast("12 PİYADE EĞİTİLDİ");
  });
  $("fmap-tank").addEventListener("click", () => {
    const tile = selected(); if (tile.owner !== "player" || state.resources < 100) return;
    state.resources -= 100; tile.tanks = (Number(tile.tanks)||0) + 4; tile.army = (Number(tile.army)||0) + 4;
    state.log.unshift(tile.name + " bölgesinde 4 zırhlı tank üretildi."); persist(); toast("4 TANK ÜRETİLDİ");
  });
  $("fmap-ship").addEventListener("click", () => {
    const tile = selected(); if (tile.owner !== "player" || state.resources < 140) return;
    state.resources -= 140; tile.ships = (Number(tile.ships)||0) + 2; tile.army = (Number(tile.army)||0) + 6;
    state.log.unshift(tile.name + " filosuna 2 uzay gemisi katıldı."); persist(); toast("2 UZAY GEMİSİ ÜRETİLDİ");
  });
  $("fmap-move").addEventListener("click", () => {
    const tile = selected(); if (tile.owner !== "player" || (Number(tile.army)||0) < 1) return;
    moveFromId = moveFromId === tile.id ? null : tile.id;
    toast(moveFromId === null ? "HAREKET İPTAL EDİLDİ" : "HEDEF OLARAK BAŞKA BİR DOST SEKTÖRE DOKUN");
    render();
  });
  $("fmap-attack").addEventListener("click", () => {
    const source = selected();
    if (source.owner !== "player" || (Number(source.army) || 0) < 8) return;
    const targets = state.tiles.filter(t => t.owner !== "player" && Math.abs((t.id % COLS) - (source.id % COLS)) + Math.abs(Math.floor(t.id / COLS) - Math.floor(source.id / COLS)) === 1);
    if (!targets.length) return;
    const target = targets.sort((a,b) => (Number(a.army)||0) - (Number(b.army)||0))[0];
    const committed = Math.max(8, Math.floor(source.army * 0.6));
    const attackPower = committed + (Number(source.tanks)||0)*3 + (Number(source.ships)||0)*4 + Math.floor(Math.random() * 9) + (source.tower ? 3 : 0);
    const defensePower = (Number(target.army)||0) + (Number(target.tanks)||0)*3 + (Number(target.ships)||0)*4 + Math.floor(Math.random() * 8) + (target.tower ? 8 : 0);
    const attackerStart = attackPower, defenderStart = defensePower;
    const sourceArmyBefore = Number(source.army)||0, targetArmyBefore = Number(target.army)||0;
    const sourceInfantryBefore = Number(source.infantry)||0, sourceTanksBefore = Number(source.tanks)||0, sourceShipsBefore = Number(source.ships)||0;
    const targetInfantryBefore = Number(target.infantry)||0, targetTanksBefore = Number(target.tanks)||0, targetShipsBefore = Number(target.ships)||0;
    const targetTowerBefore = target.tower;
    source.army = Math.max(0, source.army - committed);
    target.lastBattleAt = Date.now();
    if (attackPower > defensePower) {
      target.owner = "player"; target.army = Math.max(2, Math.floor((attackPower-defensePower)*0.6)); target.infantry = Math.floor(target.army*0.7); target.tanks = Math.floor(target.army*0.15); target.ships = Math.floor(target.army*0.1);
      target.tower = null; target.settlement = false; target.population = 0;
      target.name = target.name.replace("Sektör", "Koloni");
      state.stats.captured += 1; state.resources += 35;
      state.log.unshift("Zafer: " + target.name + " ele geçirildi; +35 hurda.");
      toast("ZAFER · SEKTÖR ELE GEÇİRİLDİ");
    } else {
      target.army = Math.max(1, defensePower - Math.floor(attackPower*0.35));
      state.log.unshift("Saldırı püskürtüldü: " + target.name + " savunmada kaldı.");
      toast("SALDIRI PÜSKÜRTÜLDÜ · ORDU KAYIP VERDİ");
    }
    const won = attackPower > defensePower;
    const attackerCasualties = Math.min(sourceArmyBefore, Math.max(1, Math.ceil(sourceArmyBefore * (won ? 0.16 : 0.42))));
    const defenderCasualties = Math.min(targetArmyBefore, Math.max(1, Math.ceil(targetArmyBefore * (won ? 0.75 : 0.38))));
    $("fmap-battle-report").hidden = false;
    $("fmap-battle-report").classList.remove("fmap-battle-active");
    void $("fmap-battle-report").offsetWidth;
    $("fmap-battle-report").classList.add("fmap-battle-active");
    $("fmap-battle-title").textContent = won ? "🏆 ZAFER · SAVAŞ RAPORU" : "🛡️ SAVUNMA HATTI TUTULDU";
    $("fmap-battle-summary").textContent = source.name + " → " + target.name + " · " + (won ? "Sektör ele geçirildi" : "Bot saldırıyı püskürttü");
    const maxPower = Math.max(1, attackerStart, defenderStart);
    $("fmap-attack-bar").style.width = Math.min(100, attackerStart/maxPower*100) + "%";
    $("fmap-defense-bar").style.width = Math.min(100, defenderStart/maxPower*100) + "%";
    $("fmap-attack-value").textContent = "Senin ordu gücün: " + attackerStart + " · Sevk edilen: " + committed;
    $("fmap-defense-value").textContent = "Bot savunması: " + defenderStart + " · Kule bonusu " + (targetTowerBefore ? "aktif" : "yok");
    $("fmap-losses").textContent = "Önceki güç: saldıran " + attackerStart + ", savunan " + defenderStart + ". Sonuç: " + (won ? "zafer ve bölge kontrolü" : "saldırı püskürtüldü") + ".";
    $("fmap-own-losses").textContent = "Tahmini " + attackerCasualties + " birlik · Piyade " + Math.min(sourceInfantryBefore, attackerCasualties) + " · Tank " + Math.min(sourceTanksBefore, Math.ceil(attackerCasualties*.15)) + " · Gemi " + Math.min(sourceShipsBefore, Math.ceil(attackerCasualties*.1));
    $("fmap-enemy-losses").textContent = "Tahmini " + defenderCasualties + " birlik · Piyade " + Math.min(targetInfantryBefore, defenderCasualties) + " · Tank " + Math.min(targetTanksBefore, Math.ceil(defenderCasualties*.15)) + " · Gemi " + Math.min(targetShipsBefore, Math.ceil(defenderCasualties*.1));
    $("fmap-battle-units").textContent = "Çatışma öncesi: dost " + sourceArmyBefore + " birlik (♟" + sourceInfantryBefore + " / ▰" + sourceTanksBefore + " / ✦" + sourceShipsBefore + "), bot " + targetArmyBefore + " birlik (♟" + targetInfantryBefore + " / ▰" + targetTanksBefore + " / ✦" + targetShipsBefore + "). Kayıp değerleri simülasyona dayalı tahmindir.";
    persist();
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
