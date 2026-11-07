import {Game} from "./core/Game.js";

// === FULL QUALITY + REAL-TIME + SMOOTH ===
// Line-art combat does not need "reduced effects". Force full visual quality.
// Keep entity caps modest so phones stay at 60fps without looking downgraded.

Game.prototype.setReducedEffects = function setReducedEffects(_enabled) {
  // Ignore reduced mode — always full quality per player request.
  this.lowEnd = false;
  this.adaptiveEffects = false;
  this.maxEnemies = 180;
  this.maxProjectiles = 320;
  this.maxEnemyProjectiles = 100;
  this.maxParticles = 90;
  if (this.enemies && this.enemies.length > this.maxEnemies) this.enemies.length = this.maxEnemies;
  if (this.projectiles && this.projectiles.length > this.maxProjectiles) this.projectiles.length = this.maxProjectiles;
  if (this.enemyProjectiles && this.enemyProjectiles.length > this.maxEnemyProjectiles) this.enemyProjectiles.length = this.maxEnemyProjectiles;
  if (this.particles && this.particles.length > this.maxParticles) this.particles.length = this.maxParticles;
};

// Never trigger adaptive quality cuts (was causing stutter + visual downgrade).
Game.prototype.noteFrameCost = function noteFrameCost(milliseconds) {
  this.frameCostEMA = this.frameCostEMA ? this.frameCostEMA * 0.85 + milliseconds * 0.15 : milliseconds;
  // Only soft-cap particles if a single frame is catastrophic (>20ms of work)
  if (milliseconds > 20 && this.particles && this.particles.length > 60) {
    this.particles.length = 60;
  }
  if (typeof window !== "undefined" && window.__COSMIC_SCRAP_TEST__) {
    this.frameCostSamples = this.frameCostSamples || [];
    this.frameCostSamples.push(milliseconds);
    if (this.frameCostSamples.length > 120) this.frameCostSamples.shift();
    const sorted = [...this.frameCostSamples].sort((a, b) => a - b);
    window.__cosmicScrapPerf = {
      samples: sorted.length,
      avgUpdateDrawMs: +(this.frameCostSamples.reduce((s, v) => s + v, 0) / this.frameCostSamples.length).toFixed(2),
      p95UpdateDrawMs: +(sorted[Math.floor((sorted.length - 1) * 0.95)] || 0).toFixed(2),
      frameCostEMA: +this.frameCostEMA.toFixed(2),
      adaptiveEffects: false,
      lowEnd: false
    };
  }
};

// Force full quality after construct/reset
const originalReset = Game.prototype.reset;
if (typeof originalReset === "function") {
  Game.prototype.reset = function resetFullQuality() {
    const result = originalReset.call(this);
    this.lowEnd = false;
    this.adaptiveEffects = false;
    this.maxEnemies = 180;
    this.maxProjectiles = 320;
    this.maxEnemyProjectiles = 100;
    this.maxParticles = 90;
    this._rtOrigin = null;
    return result;
  };
}

// Kill feedback (sound + light shake) without depending on lowEnd
const originalOnKill = Game.prototype.onKill;
if (typeof originalOnKill === "function") {
  Game.prototype.onKill = function onKillPatched(e, depth = 0) {
    if (!e) return;
    const before = this.kills | 0;
    originalOnKill.call(this, e, depth);
    if ((this.kills | 0) <= before) return;
    try {
      const mult = this.combo?.multiplier || 1;
      this.callbacks?.audio?.kill?.(mult, this.combo?.count || 0);
      if (this.screenShakeEnabled !== false) {
        this.shake = Math.min(5, (this.shake || 0) + (mult >= 2 ? 1.2 : 0.4));
      }
    } catch (_) {}
  };
}

// Lower canvas DPR on touch devices = real FPS win without "reduced graphics"
const originalResize = Game.prototype.resize;
if (typeof originalResize === "function") {
  Game.prototype.resize = function resizePerf() {
    const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    const dpr = Math.max(1, Math.min(typeof devicePixelRatio === "number" ? devicePixelRatio : 1, coarse ? 1 : 1.5));
    this.width = innerWidth;
    this.height = innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.player) {
      this.player.x = Math.max(14, Math.min(Math.max(14, this.width - 14), this.player.x));
      this.player.y = Math.max(65, Math.min(Math.max(65, this.height - 48), this.player.y));
    }
  };
}

// Apply full quality as soon as module loads (covers already-constructed paths)
if (typeof window !== "undefined") {
  window.addEventListener("cosmic-scrap:run-restarted", () => {
    try {
      localStorage.setItem("cosmic-scrap-effects-mode", "auto");
    } catch (_) {}
  });
}
