import {Game} from "./core/Game.js";

// Faster lag adaptation: cut particles/enemies within ~10 heavy frames instead of 24.
Game.prototype.noteFrameCost = function noteFrameCost(milliseconds) {
  this.frameCostEMA = this.frameCostEMA ? this.frameCostEMA * 0.88 + milliseconds * 0.12 : milliseconds;
  if (this.frameCostEMA > 8.2) {
    this.frameCostHighFrames++;
    this.frameCostHealthyFrames = 0;
  } else if (this.frameCostEMA < 6.2) {
    this.frameCostHealthyFrames++;
    this.frameCostHighFrames = 0;
  } else {
    this.frameCostHighFrames = 0;
    this.frameCostHealthyFrames = 0;
  }
  if (!this.lowEnd && this.frameCostHighFrames >= 10) {
    this.adaptiveEffects = true;
    this.frameCostHighFrames = 0;
    this.maxParticles = Math.min(this.maxParticles, 56);
    this.maxEnemies = Math.min(this.maxEnemies, this.lowEnd ? 110 : 160);
    this.maxProjectiles = Math.min(this.maxProjectiles, this.lowEnd ? 180 : 280);
    this.particles.length = Math.min(this.particles.length, 48);
    this.shockwaves.length = Math.min(this.shockwaves.length, 10);
    if (this.lightning) this.lightning.length = Math.min(this.lightning.length, 8);
    this.resize();
  }
  if (typeof window !== "undefined" && window.__COSMIC_SCRAP_TEST__) {
    this.frameCostSamples = this.frameCostSamples || [];
    this.frameCostSamples.push(milliseconds);
    if (this.frameCostSamples.length > 120) this.frameCostSamples.shift();
    const sorted = [...this.frameCostSamples].sort((a, b) => a - b);
    window.__cosmicScrapPerf = {
      samples: sorted.length,
      avgUpdateDrawMs: +(this.frameCostSamples.reduce((sum, value) => sum + value, 0) / this.frameCostSamples.length).toFixed(2),
      p95UpdateDrawMs: +(sorted[Math.floor((sorted.length - 1) * 0.95)] || 0).toFixed(2),
      frameCostEMA: +this.frameCostEMA.toFixed(2),
      adaptiveEffects: this.adaptiveEffects,
      lowEnd: this.lowEnd
    };
  }
};

// Ensure kill sound + light shake on every enemy death (feedback / addiction).
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
      if (this.screenShakeEnabled && !this.lowEnd) {
        this.shake = Math.min(6, (this.shake || 0) + (mult >= 2 ? 1.35 : 0.5));
      }
    } catch (_) {}
  };
}
