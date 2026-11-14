// Set true only after all localized voice clips are committed.
const VOICE_ASSETS_READY = false;

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
    const language = document.getElementById("setting-voice-language");
    if (language) language.value = localStorage.getItem("cosmic-scrap-voice-language") || "auto";
    const gender = document.getElementById("setting-voice-gender");
    if (gender) gender.value = localStorage.getItem("cosmic-scrap-voice-gender") || "male";
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
    document.getElementById("setting-voice-language")?.addEventListener("change", event => {
      try { localStorage.setItem("cosmic-scrap-voice-language", event.target.value); } catch {}
      this.stop();
    });
    document.getElementById("setting-voice-gender")?.addEventListener("change", event => {
      const gender = event.target.value === "female" ? "female" : "male";
      try { localStorage.setItem("cosmic-scrap-voice-gender", gender); } catch {}
      this.stop();
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
    if (!VOICE_ASSETS_READY || !this.enabled || !file || localStorage.getItem("cosmic-scrap-audio") === "off") return;
    const now = Date.now();
    if (now - this.lastPlayedAt < 1800) return;
    const selectedVoiceLanguage = localStorage.getItem("cosmic-scrap-voice-language") || "auto";
    const gameLanguage = localStorage.getItem("cosmic-scrap-language") === "tr" ? "tr" : "en";
    const language = selectedVoiceLanguage === "auto" ? gameLanguage : selectedVoiceLanguage;
    const gender = localStorage.getItem("cosmic-scrap-voice-gender") === "female" ? "female" : "male";
    const storedVolume = localStorage.getItem("cosmic-scrap-volume");
    const volume = storedVolume === null ? 0.7 : Number(storedVolume);
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = `./assets/sounds/voice/${gender}/${language}/${file}.mp3`;
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
