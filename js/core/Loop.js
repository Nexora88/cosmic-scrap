export class Loop {
  constructor(update, render, onError) {
    this.update = update;
    this.render = render;
    this.onError = onError;
    this.last = 0;
    this.running = false;
    this.resumeWhenVisible = false;
    this.generation = 0;
    this.maxConsecutiveErrors = 3;
    this.consecutiveErrors = 0;
    this.lastError = null;
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.resumeWhenVisible = this.running;
        this.stop({ preserveVisibilityResume: true });
      } else if (this.resumeWhenVisible) {
        this.resumeWhenVisible = false;
        this.start();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler, { passive: true });
  }

  frame = (generation, timestamp) => {
    if (!this.running || generation !== this.generation) return;
    const dt = Math.min(0.033, (timestamp - this.last) / 1000 || 0);
    this.last = timestamp;
    try {
      this.update(dt);
      this.render?.();
      this.consecutiveErrors = 0;
      this.lastError = null;
    } catch (error) {
      this.consecutiveErrors += 1;
      this.lastError = error;
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        const details = { consecutiveErrors: this.consecutiveErrors };
        this.stop();
        this.onError?.(error, details);
        return;
      }
    }
    if (this.running && generation === this.generation) {
      requestAnimationFrame(next => this.frame(generation, next));
    }
  };

  start() {
    if (this.running) return;
    this.resumeWhenVisible = false;
    this.consecutiveErrors = 0;
    this.lastError = null;
    this.running = true;
    this.generation += 1;
    const generation = this.generation;
    this.last = performance.now();
    requestAnimationFrame(timestamp => this.frame(generation, timestamp));
  }

  stop({ preserveVisibilityResume = false } = {}) {
    this.running = false;
    this.generation += 1;
    if (!preserveVisibilityResume) this.resumeWhenVisible = false;
  }

  destroy() {
    this.stop();
    document.removeEventListener("visibilitychange", this.visibilityHandler);
  }
}
