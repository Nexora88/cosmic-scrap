export class Loop {
  constructor(update, render, onError) {
    this.update = update;
    this.render = render;
    this.onError = onError;
    this.last = 0;
    this.accumulator = 0;
    this.step = 1 / 60;
    // Bound catch-up work so a slow frame does not trigger a long burst of
    // simulation updates that makes controls feel delayed on mobile.
    this.maxSteps = 8;
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
    const frameDelta = Math.max(0, (timestamp - this.last) / 1000 || 0);
    this.last = timestamp;
    // Preserve at most 8 simulation steps (133ms). Drop excess stall time
    // instead of freezing input while the game tries to catch up 18 updates.
    this.accumulator = Math.min(this.accumulator + frameDelta, this.step * this.maxSteps);
    try {
      let steps = 0;
      while (this.accumulator + 1e-9 >= this.step && steps < this.maxSteps) {
        this.update(this.step);
        this.accumulator -= this.step;
        steps += 1;
        if (!this.running || generation !== this.generation) return;
      }
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
    this.accumulator = 0;
    this.generation += 1;
    const generation = this.generation;
    this.last = performance.now();
    requestAnimationFrame(timestamp => this.frame(generation, timestamp));
  }

  stop({ preserveVisibilityResume = false } = {}) {
    this.running = false;
    this.generation += 1;
    this.accumulator = 0;
    if (!preserveVisibilityResume) this.resumeWhenVisible = false;
  }

  destroy() {
    this.stop();
    document.removeEventListener("visibilitychange", this.visibilityHandler);
  }
}
