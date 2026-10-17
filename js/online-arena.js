import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class OnlineArena {
  constructor({ mode, roomId = null, matchId = null, onClose = () => {} }) {
    this.mode = mode;
    this.roomId = roomId;
    this.matchId = matchId;
    this.onClose = onClose;
    this.state = null;
    this.keys = new Set();
    this.input = { dx: 0, dy: 0, shoot: false };
    this.fireHeld = false;
    this.running = false;
    this.busy = false;
    this.timer = null;
    this.lastError = "";
    this.root = null;
    this.canvas = null;
    this.ctx = null;
    this.statusNode = null;
    this.keyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright"," ","w","a","s","d"].includes(key)) e.preventDefault();
      this.keys.add(key);
      this.updateInput();
    };
    this.keyUp = (e) => { this.keys.delete(e.key.toLowerCase()); this.updateInput(); };
    this.blur = () => { this.keys.clear(); this.updateInput(); };
  }
  mount() {
    this.root = document.createElement("section");
    this.root.className = "online-arena-overlay";
    this.root.setAttribute("role", "dialog");
    this.root.setAttribute("aria-modal", "true");
    this.root.setAttribute("aria-label", this.mode === "coop" ? "Co-op Defense" : "Ranked Duel");
    this.root.innerHTML = `
      <div class="online-arena-shell">
        <header class="online-arena-header">
          <div><p class="online-arena-eyebrow">COSMIC SCRAP · LIVE SERVER SIMULATION</p><h2>${this.mode === "coop" ? "CO-OP DEFENSE" : "RANKED DUEL"}</h2></div>
          <button class="online-arena-exit" type="button">LEAVE ARENA ×</button>
        </header>
        <div class="online-arena-hud"><span data-stat="left">CONNECTING…</span><span data-stat="center">WAVE —</span><span data-stat="right">SCORE —</span></div>
        <canvas class="online-arena-canvas" width="1000" height="1000" aria-label="Shared server-authoritative arena"></canvas>
        <div class="online-arena-controls">
          <div class="online-arena-dpad" aria-label="Movement controls">
            <button data-move="up" type="button" aria-label="Move up">▲</button>
            <button data-move="left" type="button" aria-label="Move left">◀</button>
            <button data-move="down" type="button" aria-label="Move down">▼</button>
            <button data-move="right" type="button" aria-label="Move right">▶</button>
          </div>
          <button class="online-arena-fire" type="button">AUTO-FIRE</button>
        </div>
        <p class="online-arena-status" role="status" aria-live="polite">Connecting to the simulation server…</p>
        <p class="online-arena-help">Move: WASD / arrows · Fire: Space or AUTO-FIRE · The server owns enemy movement, damage, score and match results.</p>
      </div>`;
    document.body.append(this.root);
    this.canvas = this.root.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.statusNode = this.root.querySelector(".online-arena-status");
    this.root.querySelector(".online-arena-exit").addEventListener("click", () => this.close());
    const fire = this.root.querySelector(".online-arena-fire");
    fire.addEventListener("pointerdown", (e) => { e.preventDefault(); this.fireHeld = true; this.updateInput(); });
    for (const event of ["pointerup","pointercancel","pointerleave"]) fire.addEventListener(event, () => { this.fireHeld = false; this.updateInput(); });
    const moveButtons = this.root.querySelectorAll("[data-move]");
    moveButtons.forEach((button) => {
      const direction = button.dataset.move;
      const down = (e) => { e.preventDefault(); this.keys.add("touch-" + direction); this.updateInput(); };
      const up = () => { this.keys.delete("touch-" + direction); this.updateInput(); };
      button.addEventListener("pointerdown", down);
      for (const event of ["pointerup","pointercancel","pointerleave"]) button.addEventListener(event, up);
    });
    this.canvas.addEventListener("pointerdown", () => { this.fireHeld = true; this.updateInput(); });
    this.canvas.addEventListener("pointerup", () => { this.fireHeld = false; this.updateInput(); });
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    window.addEventListener("blur", this.blur);
    this.running = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), 220);
  }
  updateInput() {
    const left = this.keys.has("a") || this.keys.has("arrowleft") || this.keys.has("touch-left");
    const right = this.keys.has("d") || this.keys.has("arrowright") || this.keys.has("touch-right");
    const up = this.keys.has("w") || this.keys.has("arrowup") || this.keys.has("touch-up");
    const down = this.keys.has("s") || this.keys.has("arrowdown") || this.keys.has("touch-down");
    this.input.dx = (right ? 1 : 0) - (left ? 1 : 0);
    this.input.dy = (down ? 1 : 0) - (up ? 1 : 0);
    this.input.shoot = this.fireHeld || this.keys.has(" ");
  }
  async tick() {
    if (!this.running || this.busy) return;
    this.busy = true;
    try {
      const action = this.mode === "coop" ? "coop_start" : "ranked_tick";
      const body = { action, input: this.input };
      if (this.mode === "coop") body.room_id = this.roomId;
      else body.match_id = this.matchId;
      const { data, error } = await client.functions.invoke("online-match", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.status === "queued") throw new Error("Still matchmaking. Keep this screen open.");
      this.state = data;
      this.lastError = "";
      this.render();
      if (data.status === "finished") {
        this.statusNode.textContent = this.mode === "coop"
          ? "DEFENSE COMPLETE · SHARED RUN SAVED"
          : data.winner_user_id ? "DUEL COMPLETE · " + (data.winner_user_id === this._userId ? "VICTORY" : "DEFEAT") : "DUEL COMPLETE · DRAW";
        this.root.querySelector(".online-arena-exit").textContent = "RETURN TO ONLINE HUB";
        clearInterval(this.timer);
      }
    } catch (error) {
      this.lastError = error?.message || "Connection interrupted.";
      if (this.statusNode) this.statusNode.textContent = "Reconnecting… " + this.lastError;
    } finally { this.busy = false; }
  }
  render() {
    const s = this.state;
    if (!s || !this.ctx) return;
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "#050914"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = "rgba(73,137,197,.13)"; ctx.lineWidth = 1;
    for(let x=0;x<=w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<=h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    for(let i=0;i<70;i++){const x=(i*173+41)%w,y=(i*317+97)%h;ctx.fillStyle="rgba(183,218,255,.35)";ctx.fillRect(x,y,2,2);}
    for(const b of s.bullets||[]){ctx.fillStyle="#b5f5ff";ctx.shadowColor="#52eaff";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    for(const e of s.enemies||[]){ctx.fillStyle="#ff5b7c";ctx.strokeStyle="#ffb0be";ctx.lineWidth=3;ctx.shadowColor="#ff335d";ctx.shadowBlur=15;ctx.beginPath();ctx.arc(e.x,e.y,e.radius||13,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.stroke();ctx.fillStyle="#29111c";ctx.fillRect(e.x-15,e.y-23,30,4);ctx.fillStyle="#ff91a4";ctx.fillRect(e.x-15,e.y-23,30*clamp(e.hp/60,0,1),4);}
    const userId = this._userId;
    for(const [index,p] of (s.players||[]).entries()){
      const mine = p.user_id === userId;
      ctx.globalAlpha = p.alive ? 1 : .35;
      ctx.fillStyle = mine ? "#64e9ff" : (index===0 ? "#9b8cff" : "#ffca76");
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 20;
      ctx.beginPath();ctx.arc(p.x,p.y,17,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle="#f0fbff";ctx.lineWidth=3;ctx.stroke();
      ctx.globalAlpha=1;
      ctx.fillStyle="#eaf7ff";ctx.font="bold 18px system-ui";ctx.textAlign="center";ctx.fillText(mine?"YOU":"PILOT "+(index+1),p.x,p.y-28);
      const hp = this.mode==="coop" ? s.shared_health : p.hp;
      ctx.fillStyle="#172b3d";ctx.fillRect(p.x-24,p.y+24,48,6);ctx.fillStyle=hp>35?"#5cf0bc":"#ff657c";ctx.fillRect(p.x-24,p.y+24,48*clamp(hp/100,0,1),6);
    }
    const left = this.root.querySelector('[data-stat="left"]');
    const center = this.root.querySelector('[data-stat="center"]');
    const right = this.root.querySelector('[data-stat="right"]');
    const elapsed = Math.floor((s.elapsed_ms||0)/1000);
    left.textContent = this.mode==="coop" ? "TEAM HP "+s.shared_health+" · LIVES "+s.shared_lives : "TIME "+String(Math.floor(elapsed/60)).padStart(2,"0")+":"+String(elapsed%60).padStart(2,"0");
    center.textContent = "WAVE "+s.wave;
    const me = (s.players||[]).find(p=>p.user_id===userId);
    right.textContent = this.mode==="coop" ? "SCORE "+(s.shared_score||0)+" · KILLS "+(s.shared_kills||0) : "YOU "+(me?.score||0)+" · RIVAL "+((s.players||[]).find(p=>p.user_id!==userId)?.score||0);
    if(s.status==="finished" && this.mode==="coop") this.statusNode.textContent = "TEAM RUN ENDED · "+(s.finish_reason||"complete").replaceAll("_"," ").toUpperCase();
    else if(s.status==="playing") this.statusNode.textContent = this.lastError ? "Reconnecting… "+this.lastError : "LIVE · SERVER TICK "+s.version;
  }
  async start() {
    const {data}=await client.auth.getUser();
    this._userId=data.user?.id;
    this.mount();
  }
  close() {
    this.running=false;
    if(this.timer)clearInterval(this.timer);
    window.removeEventListener("keydown",this.keyDown);
    window.removeEventListener("keyup",this.keyUp);
    window.removeEventListener("blur",this.blur);
    this.root?.remove();
    this.onClose();
  }
}
