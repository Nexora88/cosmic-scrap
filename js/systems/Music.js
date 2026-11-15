const TRACKS = {
  menu: "./assets/sounds/cosmic-pulse.mp3",
  gameplay: "./assets/sounds/deep-space-assault.mp3",
  interlude: "./assets/sounds/deep-space-drift.mp3",
  discovery: "./assets/sounds/unknown-planets.mp3",
  combat: "./assets/sounds/deep-space-assault.mp3",
  warning: "./assets/sounds/pulse-of-conflict.mp3",
  boss: "./assets/sounds/cosmic-confrontation.mp3",
  reveal: "./assets/sounds/taviro-rarity-reveal.mp3"
};

const STORAGE = {
  enabled: "cosmic-scrap-audio",
  volume: "cosmic-scrap-volume"
};

class GameMusic {
  constructor() {
    this.enabled = localStorage.getItem(STORAGE.enabled) !== "off";
    const storedVolume = localStorage.getItem(STORAGE.volume);
    this.volume = storedVolume === null ? 0.7 : Math.min(1, Math.max(0, Number(storedVolume) || 0));
    this.decks = [new Audio(), new Audio()];
    this.decks.forEach(audio => {
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0;
    });
    this.activeDeck = 0;
    this.currentTrack = null;
    this.baseScene = "menu";
    this.scene = "menu";
    this.fadeTimer = null;
    this.pauseTimer = null;
    this.sceneTimer = null;
    this.sceneTimerDeadline = 0;
    this.sceneTimerRemaining = 0;
    this.showcasePaused = false;
    this.bind();
  }

  bind() {
    // Start playback synchronously from a user gesture for mobile autoplay policies.
    document.addEventListener("click", event => {
      const button = event.target.closest("button, a");
      if (!button) return;
      if (button.matches("#start, #retry")) {
        // Normal runs start with the energetic Deep Space Assault gameplay bed.
        this.setBaseScene("gameplay");
      } else if (button.matches("#resume")) {
        this.resume();
      } else if (button.matches("#pause")) {
        const pauseScreen = document.getElementById("pause-screen");
        if (pauseScreen && !pauseScreen.hidden) this.resume();
        else this.pause();
      } else if (button.matches("#menu, #pause-menu")) {
        this.setBaseScene("menu");
      } else if (!document.getElementById("overlay")?.hidden) {
        this.setBaseScene("menu");
      }
    }, true);

    window.addEventListener("taviro:music-scene", event => {
      const detail = event.detail || {};
      this.handleScene(detail.scene, detail.duration);
    });
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
      else if (this.currentTrack && this.enabled && !this.showcasePaused) this.resume();
    });
    window.addEventListener("pagehide", () => this.pause());
    window.addEventListener("cosmic-scrap:showcase-open", () => {
      this.showcasePaused = true;
      // Stop the game soundtrack before the project video starts, so the two
      // sources never overlap during the showcase transition.
      this.pause(true);
    });
    window.addEventListener("cosmic-scrap:showcase-close", () => {
      this.showcasePaused = false;
      if (!document.hidden && this.enabled) this.resume();
    });
  }

  handleScene(scene, duration) {
    if (scene === "menu" || scene === "gameplay") {
      this.setBaseScene(scene);
      return;
    }
    if (scene === "boss-end") {
      // Give the player a short, calmer post-boss interlude, then return
      // to the energetic main gameplay soundtrack.
      this.playScene("interlude", { temporary: true, duration: 8500 });
      return;
    }
    if (scene === "discovery") {
      this.playScene("discovery", { temporary: true, duration: duration || 9000 });
      return;
    }
    if (scene === "combat" || scene === "warning" || scene === "boss") {
      this.playScene(scene, { temporary: true, duration: duration || 0 });
      return;
    }
    if (scene === "reveal") {
      this.playScene("reveal", { temporary: true, oneShot: true });
    }
  }

  setBaseScene(name) {
    if (!TRACKS[name]) return;
    this.baseScene = name;
    this.playScene(name);
  }

  scheduleSceneReturn(duration) {
    clearTimeout(this.sceneTimer);
    this.sceneTimer = null;
    this.sceneTimerRemaining = Math.max(0, Number(duration) || 0);
    this.sceneTimerDeadline = 0;
    if (!this.sceneTimerRemaining || this.showcasePaused || document.hidden) return;
    const delay = this.sceneTimerRemaining;
    this.sceneTimerDeadline = performance.now() + delay;
    this.sceneTimer = setTimeout(() => {
      this.sceneTimer = null;
      this.sceneTimerRemaining = 0;
      this.sceneTimerDeadline = 0;
      if (!this.showcasePaused && !document.hidden && this.enabled) this.playScene(this.baseScene);
    }, delay);
  }

  suspendSceneReturn() {
    if (!this.sceneTimer) return;
    this.sceneTimerRemaining = Math.max(0, this.sceneTimerDeadline - performance.now());
    clearTimeout(this.sceneTimer);
    this.sceneTimer = null;
    this.sceneTimerDeadline = 0;
  }

  resumeSceneReturn() {
    if (!this.sceneTimerRemaining || this.showcasePaused || document.hidden || !this.enabled) return;
    this.scheduleSceneReturn(this.sceneTimerRemaining);
  }

  playScene(name, options = {}) {
    if (!this.enabled || this.showcasePaused || !TRACKS[name]) return;
    const { temporary = false, duration = 0, oneShot = false } = options;
    clearTimeout(this.sceneTimer);
    this.sceneTimer = null;
    this.sceneTimerDeadline = 0;
    this.sceneTimerRemaining = 0;
    if (!temporary) this.baseScene = name;
    if ((this.currentTrack === name || TRACKS[this.currentTrack] === TRACKS[name]) && !this.decks[this.activeDeck].paused) {
      this.currentTrack = name;
      this.scene = name;
      if (duration > 0) this.scheduleSceneReturn(duration);
      return;
    }

    const previousDeck = this.activeDeck;
    const nextDeck = previousDeck === 0 ? 1 : 0;
    const oldAudio = this.decks[previousDeck];
    const nextAudio = this.decks[nextDeck];
    clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    clearTimeout(this.pauseTimer);
    this.pauseTimer = null;

    nextAudio.pause();
    nextAudio.src = TRACKS[name];
    nextAudio.loop = !oneShot;
    nextAudio.currentTime = 0;
    nextAudio.volume = 0;
    nextAudio.load();
    this.activeDeck = nextDeck;
    this.currentTrack = name;
    this.scene = name;

    nextAudio.play().then(() => {
      this.crossfade(oldAudio, nextAudio, this.volume * 0.72, name === "warning" || name === "boss" ? 1500 : 2300);
    }).catch(error => {
      if (error?.name !== "NotAllowedError") console.warn("TAVIRO_MUSIC", error);
    });

    if (oneShot) {
      nextAudio.onended = () => {
        nextAudio.onended = null;
        if (this.scene === "reveal" && this.enabled && !this.showcasePaused) this.playScene(this.baseScene);
      };
    } else {
      nextAudio.onended = null;
    }
    if (duration > 0) this.scheduleSceneReturn(duration);
  }

  crossfade(oldAudio, nextAudio, target, duration) {
    clearInterval(this.fadeTimer);
    const oldStart = oldAudio.volume;
    const nextStart = nextAudio.volume;
    const began = performance.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / duration);
      oldAudio.volume = oldStart * (1 - progress);
      nextAudio.volume = nextStart + (target - nextStart) * progress;
      if (progress >= 1) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        oldAudio.pause();
        oldAudio.volume = 0;
        nextAudio.volume = target;
      }
    }, 40);
  }

  fadeActiveTo(target, duration = 220) {
    const audio = this.decks[this.activeDeck];
    clearInterval(this.fadeTimer);
    const start = audio.volume;
    const began = performance.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / duration);
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * progress));
      if (progress >= 1) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 35);
  }

  pause(immediate = false) {
    this.suspendSceneReturn();
    clearTimeout(this.pauseTimer);
    this.pauseTimer = null;
    if (immediate) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
      this.decks.forEach(audio => {
        audio.pause();
        audio.volume = 0;
      });
      return;
    }
    if (this.decks.every(audio => audio.paused)) return;
    clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    const startingVolumes = this.decks.map(audio => audio.volume);
    const began = performance.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / 260);
      this.decks.forEach((audio, index) => {
        audio.volume = startingVolumes[index] * (1 - progress);
      });
      if (progress >= 1) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 35);
    this.pauseTimer = setTimeout(() => {
      this.decks.forEach(audio => {
        audio.pause();
        audio.volume = 0;
      });
      this.pauseTimer = null;
    }, 280);
  }

  resume() {
    if (!this.enabled || !this.currentTrack || this.showcasePaused || document.hidden) return;
    clearTimeout(this.pauseTimer);
    this.pauseTimer = null;
    clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    this.decks.forEach((audio, index) => {
      if (index !== this.activeDeck) {
        audio.pause();
        audio.volume = 0;
      }
    });
    const audio = this.decks[this.activeDeck];
    if (!audio.paused) {
      this.fadeActiveTo(this.volume * 0.72, 300);
      this.resumeSceneReturn();
      return;
    }
    audio.play().then(() => {
      this.fadeActiveTo(this.volume * 0.72, 450);
      this.resumeSceneReturn();
    }).catch(() => {});
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
    if (!this.decks[this.activeDeck].paused && this.enabled) this.fadeActiveTo(this.volume * 0.72, 140);
  }
}

new GameMusic();
