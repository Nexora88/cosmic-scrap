const TRACKS = {
  menu: "./assets/sounds/cosmic-pulse.mp3",
  combat: "./assets/sounds/deep-space-assault.mp3"
};

const STORAGE = {
  enabled: "cosmic-scrap-audio",
  volume: "cosmic-scrap-volume"
};

class GameMusic {
  constructor() {
    this.enabled = localStorage.getItem(STORAGE.enabled) !== "off";
    const storedVolume = Number(localStorage.getItem(STORAGE.volume));
    this.volume = Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.7;
    this.currentTrack = null;
    this.fadeTimer = null;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.loop = true;
    this.audio.volume = 0;
    this.bind();
  }

  bind() {
    // Start music only from a real user gesture so mobile autoplay policies are respected.
    document.addEventListener("click", event => {
      const button = event.target.closest("button, a");
      if (!button) return;
      if (button.matches("#start, #retry")) {
        this.play("combat");
      } else if (button.matches("#resume")) {
        this.resume();
      } else if (button.matches("#pause")) {
        this.pause();
      } else if (button.matches("#menu, #pause-menu")) {
        this.play("menu");
      } else if (!document.getElementById("overlay")?.hidden) {
        this.play("menu");
      }
    }, true);

    document.getElementById("setting-sound")?.addEventListener("change", event => {
      this.setEnabled(event.target.checked);
    });
    document.getElementById("audio-toggle")?.addEventListener("click", () => {
      setTimeout(() => this.setEnabled(localStorage.getItem(STORAGE.enabled) !== "off"), 0);
    });
    document.getElementById("setting-volume")?.addEventListener("input", event => {
      this.setVolume(Number(event.target.value) / 100);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pause();
      else if (this.currentTrack && this.enabled) this.resume();
    });
    window.addEventListener("pagehide", () => this.pause());
  }

  fadeTo(target, duration = 700) {
    clearInterval(this.fadeTimer);
    const start = this.audio.volume;
    const began = performance.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / duration);
      this.audio.volume = Math.max(0, Math.min(1, start + (target - start) * progress));
      if (progress >= 1) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 40);
  }

  play(name) {
    if (!this.enabled) return;
    const source = TRACKS[name];
    if (!source) return;
    if (this.currentTrack === name && !this.audio.paused) return;

    if (this.currentTrack !== name) {
      this.audio.pause();
      this.audio.src = source;
      this.audio.load();
      this.currentTrack = name;
      this.audio.volume = 0;
    }
    // Call play immediately inside the click gesture; delaying it can trigger mobile autoplay blocking.
    this.audio.play().then(() => {
      this.fadeTo(this.volume * 0.72, 850);
    }).catch(error => {
      if (error?.name !== "NotAllowedError") console.warn("COSMIC_SCRAP_MUSIC", error);
    });
  }

  pause() {
    if (this.audio.paused) return;
    this.fadeTo(0, 180);
    setTimeout(() => this.audio.pause(), 190);
  }

  resume() {
    if (!this.enabled || !this.currentTrack) return;
    this.audio.play().then(() => this.fadeTo(this.volume * 0.72, 350)).catch(() => {});
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    try { localStorage.setItem(STORAGE.enabled, this.enabled ? "on" : "off"); } catch {}
    if (!this.enabled) this.pause();
    else this.resume();
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, Number(value) || 0));
    try { localStorage.setItem(STORAGE.volume, String(this.volume)); } catch {}
    if (!this.audio.paused && this.enabled) this.fadeTo(this.volume * 0.72, 120);
  }
}

new GameMusic();
