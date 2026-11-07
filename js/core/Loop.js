export class Loop {
  constructor(update, render, onError) {
    this.update = update;
    this.render = render;
    this.onError = onError;
    this.last = 0;
    this.running = false;
    this.resumeWhenVisible = false;
    this.canResume = () => true;
    this.generation = 0;
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.resumeWhenVisible = this.running && this.canResume();
        this.stop({ preserveVisibilityResume: true });
      } else if (this.resumeWhenVisible) {
        this.resumeWhenVisible = false;
        if (this.canResume()) this.start();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler, { passive: true });
  }

  frame = (generation, timestamp) => {
    if (!this.running || generation !== this.generation) return;
    // Match the proven PR #70 loop: one bounded simulation update per display frame.
    // Do not run a burst of catch-up updates after a slow mobile frame.
    const dt = Math.min(0.033, Math.max(0, (timestamp - this.last) / 1000 || 0));
    this.last = timestamp;
    try {
      this.update(dt);
      this.render?.();
    } catch (error) {
      this.stop();
      this.onError?.(error);
      return;
    }
    if (this.running && generation === this.generation) {
      requestAnimationFrame(next => this.frame(generation, next));
    }
  };

  start() {
    if (this.running) return;
    this.resumeWhenVisible = false;
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
