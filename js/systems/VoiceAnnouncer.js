const VOICE_FILES = {
  missionStart: "mission-start",
  enemiesApproaching: "enemies-approaching",
  bossStart: "boss-start",
  bossDefeated: "boss-defeated",
  levelUp: "level-up",
  sectorSecured: "sector-secured"
};

class VoiceAnnouncer {
  constructor() {
    this.enabled = localStorage.getItem("cosmic-scrap-voice") !== "off";
    this.audio = new Audio();
    this.audio.preload = "none";
    this.lastPlayedAt = 0;
    this.bind();
    const toggle = document.getElementById("setting-voice");
    if (toggle) toggle.checked = this.enabled;
  }

  bind() {
    window.addEventListener("cosmic-scrap:announce", event => this.play(event.detail?.key));
    window.addEventListener("cosmic-scrap:run-restarted", () => this.stop());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stop();
    });
    document.getElementById("setting-voice")?.addEventListener("change", event => {
      this.setEnabled(event.target.checked);
    });
    document.getElementById("setting-sound")?.addEventListener("change", event => {
      if (!event.target.checked) this.stop();
    });
    document.getElementById("audio-toggle")?.addEventListener("click", () => {
      if (localStorage.getItem("cosmic-scrap-audio") === "off") this.stop();
    });
    document.getElementById("setting-volume")?.addEventListener("input", event => {
      this.audio.volume = Math.max(0, Math.min(1, Number(event.target.value) / 100)) * 0.82;
    });
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    try { localStorage.setItem("cosmic-scrap-voice", this.enabled ? "on" : "off"); } catch {}
    if (!this.enabled) this.stop();
  }

  play(key) {
    const file = VOICE_FILES[key];
    if (!this.enabled || !file || localStorage.getItem("cosmic-scrap-audio") === "off") return;
    const now = Date.now();
    if (now - this.lastPlayedAt < 1800) return;
    const language = localStorage.getItem("cosmic-scrap-language") === "tr" ? "tr" : "en";
    const volume = Number(localStorage.getItem("cosmic-scrap-volume"));
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = `./assets/sounds/voice/${language}/${file}.mp3`;
    this.audio.volume = (Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.7) * 0.82;
    this.lastPlayedAt = now;
    this.audio.play().catch(() => {});
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

window.cosmicScrapVoice = new VoiceAnnouncer();
