export class AntiIdleTracker {
  constructor({ movementRadius = 14, warningAfter = 8, damageAfter = 12, penaltyEvery = 2.5 } = {}) {
    this.movementRadius = movementRadius;
    this.warningAfter = warningAfter;
    this.damageAfter = damageAfter;
    this.penaltyEvery = penaltyEvery;
    this.anchor = null;
    this.idleSeconds = 0;
    this.warned = false;
    this.lastPenaltyAt = 0;
  }

  update(x, y, dt) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(dt) || dt <= 0) {
      return { warning: false, damage: 0, idleSeconds: this.idleSeconds };
    }
    if (!this.anchor) this.anchor = { x, y };
    if (Math.hypot(x - this.anchor.x, y - this.anchor.y) >= this.movementRadius) {
      this.anchor = { x, y };
      this.idleSeconds = 0;
      this.warned = false;
      this.lastPenaltyAt = 0;
      return { warning: false, damage: 0, idleSeconds: 0 };
    }

    this.idleSeconds += Math.min(dt, 0.25);
    const warning = !this.warned && this.idleSeconds >= this.warningAfter;
    if (warning) this.warned = true;
    let damage = 0;
    if (this.idleSeconds >= this.damageAfter && this.idleSeconds - this.lastPenaltyAt >= this.penaltyEvery) {
      this.lastPenaltyAt = this.idleSeconds;
      damage = Math.min(12, 4 + Math.floor((this.idleSeconds - this.damageAfter) / 10) * 2);
    }
    return { warning, damage, idleSeconds: this.idleSeconds };
  }
}
