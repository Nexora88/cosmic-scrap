export class AudioSystem {
  constructor() { this.ctx = null; this.enabled = localStorage.getItem("cosmic-scrap-audio") !== "off"; }
  unlock() { if (!this.enabled) return; const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return; if (!this.ctx) this.ctx = new Ctx(); if (this.ctx.state === "suspended") this.ctx.resume().catch(()=>{}); }
  setEnabled(value) { this.enabled = Boolean(value); try { localStorage.setItem("cosmic-scrap-audio", this.enabled ? "on" : "off"); } catch {} if (this.enabled) this.unlock(); }
  toggle() { this.setEnabled(!this.enabled); return this.enabled; }
  tone(freq=440, duration=.08, type="sine", volume=.035, endFreq=null) { if (!this.enabled) return; this.unlock(); if (!this.ctx) return; const now=this.ctx.currentTime, osc=this.ctx.createOscillator(), gain=this.ctx.createGain(); osc.type=type; osc.frequency.setValueAtTime(freq,now); if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+duration); gain.gain.setValueAtTime(volume,now); gain.gain.exponentialRampToValueAtTime(.0001,now+duration); osc.connect(gain);gain.connect(this.ctx.destination);osc.start(now);osc.stop(now+duration); }
  levelUp(){this.tone(520,.12,"triangle",.04,780);setTimeout(()=>this.tone(780,.16,"triangle",.035,1040),75);}
  combo(){this.tone(640,.07,"sine",.025,900);}
  storm(){this.tone(180,.4,"sawtooth",.025,65);}
  death(){this.tone(260,.45,"triangle",.04,55);}
}
