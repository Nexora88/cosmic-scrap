import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hlefwvkgrpgcnobikhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_doCItwMJBnN87I7U-oO0bw_UASrDUF3";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const COPY = {
  en: { title:"CO-OP WITH A FRIEND", note:"Create a private room and share its eight-character code. Both pilots need to sign in.", create:"CREATE INVITE", join:"JOIN ROOM", code:"8-CHARACTER INVITE CODE", copy:"COPY CODE", start:"START CO-OP", leave:"LEAVE VIEW", waiting:"Waiting for a second pilot…", ready:"Both pilots joined. Each player can start their client.", playing:"Server-authoritative match running", reconnect:"Connection interrupted · reconnecting…", finished:"MATCH FINISHED", signed:"Sign in to create or join a Co-op room.", host:"HOST", guest:"GUEST", online:"CONNECTED", offline:"RECONNECTING", error:"Co-op service unavailable", controls:"Move: WASD / arrow keys · Auto-fire is active", createError:"Could not create a room", joinError:"Could not join this room", room:"ROOM", noRoom:"No active room" },
  tr: { title:"ARKADAŞINLA CO-OP", note:"Özel oda oluştur ve sekiz karakterli kodu paylaş. İki pilotun da giriş yapması gerekir.", create:"DAVET OLUŞTUR", join:"ODAYA KATIL", code:"8 KARAKTERLİ DAVET KODU", copy:"KODU KOPYALA", start:"CO-OP BAŞLAT", leave:"GÖRÜNÜMDEN ÇIK", waiting:"İkinci pilot bekleniyor…", ready:"İki pilot da katıldı. Her oyuncu kendi oyununu başlatabilir.", playing:"Sunucu kontrollü maç devam ediyor", reconnect:"Bağlantı kesildi · yeniden bağlanılıyor…", finished:"MAÇ TAMAMLANDI", signed:"Co-op odası oluşturmak veya katılmak için giriş yap.", host:"EV SAHİBİ", guest:"MİSAFİR", online:"BAĞLI", offline:"YENİDEN BAĞLANIYOR", error:"Co-op servisine ulaşılamadı", controls:"Hareket: WASD / yön tuşları · Otomatik ateş açık", createError:"Oda oluşturulamadı", joinError:"Bu odaya katılınamadı", room:"ODA", noRoom:"Aktif oda yok" },
  "pt-BR": { title:"CO-OP COM UM AMIGO", note:"Crie uma sala privada e compartilhe o código de oito caracteres. Ambos precisam entrar na conta.", create:"CRIAR CONVITE", join:"ENTRAR NA SALA", code:"CÓDIGO DE CONVITE DE 8 CARACTERES", copy:"COPIAR CÓDIGO", start:"INICIAR CO-OP", leave:"SAIR DA VISUALIZAÇÃO", waiting:"Aguardando outro piloto…", ready:"Os dois pilotos entraram. Cada jogador pode iniciar seu cliente.", playing:"Partida autoritativa no servidor em andamento", reconnect:"Conexão interrompida · reconectando…", finished:"PARTIDA FINALIZADA", signed:"Entre na conta para criar ou entrar em uma sala Co-op.", host:"ANFITRIÃO", guest:"CONVIDADO", online:"CONECTADO", offline:"RECONectando", error:"Serviço Co-op indisponível", controls:"Mover: WASD / setas · Disparo automático ativo", createError:"Não foi possível criar a sala", joinError:"Não foi possível entrar na sala", room:"SALA", noRoom:"Nenhuma sala ativa" },
  es: { title:"CO-OP CON UN AMIGO", note:"Crea una sala privada y comparte el código de ocho caracteres. Ambos pilotos deben iniciar sesión.", create:"CREAR INVITACIÓN", join:"UNIRSE A LA SALA", code:"CÓDIGO DE INVITACIÓN DE 8 CARACTERES", copy:"COPIAR CÓDIGO", start:"INICIAR CO-OP", leave:"SALIR DE LA VISTA", waiting:"Esperando a otro piloto…", ready:"Ambos pilotos se han unido. Cada jugador puede iniciar su cliente.", playing:"Partida autoritativa del servidor en curso", reconnect:"Conexión interrumpida · reconectando…", finished:"PARTIDA FINALIZADA", signed:"Inicia sesión para crear o unirte a una sala Co-op.", host:"ANFITRIÓN", guest:"INVITADO", online:"CONECTADO", offline:"RECONECTANDO", error:"Servicio Co-op no disponible", controls:"Mover: WASD / flechas · Disparo automático activo", createError:"No se pudo crear la sala", joinError:"No se pudo entrar en la sala", room:"SALA", noRoom:"No hay sala activa" },
  ru: { title:"CO-OP С ДРУГОМ", note:"Создайте приватную комнату и поделитесь восьмизначным кодом. Оба пилота должны войти в аккаунт.", create:"СОЗДАТЬ ПРИГЛАШЕНИЕ", join:"ВОЙТИ В КОМНАТУ", code:"КОД ПРИГЛАШЕНИЯ ИЗ 8 СИМВОЛОВ", copy:"КОПИРОВАТЬ КОД", start:"НАЧАТЬ CO-OP", leave:"ВЫЙТИ ИЗ ПРОСМОТРА", waiting:"Ожидание второго пилота…", ready:"Оба пилота подключились. Каждый игрок может запустить свой клиент.", playing:"Матч под управлением сервера идёт", reconnect:"Связь прервана · повторное подключение…", finished:"МАТЧ ЗАВЕРШЁН", signed:"Войдите, чтобы создать комнату Co-op или присоединиться.", host:"ХОСТ", guest:"ГОСТЬ", online:"В СЕТИ", offline:"ПЕРЕПОДКЛЮЧЕНИЕ", error:"Сервис Co-op недоступен", controls:"Движение: WASD / стрелки · Автострельба включена", createError:"Не удалось создать комнату", joinError:"Не удалось войти в комнату", room:"КОМНАТА", noRoom:"Нет активной комнаты" },
  id: { title:"CO-OP BERSAMA TEMAN", note:"Buat ruang pribadi dan bagikan kode delapan karakter. Kedua pilot harus masuk.", create:"BUAT UNDANGAN", join:"GABUNG RUANG", code:"KODE UNDANGAN 8 KARAKTER", copy:"SALIN KODE", start:"MULAI CO-OP", leave:"KELUAR DARI TAMPILAN", waiting:"Menunggu pilot kedua…", ready:"Kedua pilot telah bergabung. Setiap pemain dapat memulai kliennya.", playing:"Pertandingan dikendalikan server sedang berlangsung", reconnect:"Koneksi terputus · menghubungkan kembali…", finished:"PERTANDINGAN SELESAI", signed:"Masuk untuk membuat atau bergabung ke ruang Co-op.", host:"HOST", guest:"TAMU", online:"TERHUBUNG", offline:"MENGHUBUNGKAN ULANG", error:"Layanan Co-op tidak tersedia", controls:"Gerak: WASD / panah · Tembakan otomatis aktif", createError:"Ruang tidak dapat dibuat", joinError:"Tidak dapat bergabung ke ruang ini", room:"RUANG", noRoom:"Tidak ada ruang aktif" },
  de: { title:"CO-OP MIT EINEM FREUND", note:"Erstelle einen privaten Raum und teile den achtstelligen Code. Beide Piloten müssen angemeldet sein.", create:"EINLADUNG ERSTELLEN", join:"RAUM BEITRETEN", code:"8-STELLIGER EINLADUNGSCODE", copy:"CODE KOPIEREN", start:"CO-OP STARTEN", leave:"ANSICHT VERLASSEN", waiting:"Warte auf einen zweiten Piloten…", ready:"Beide Piloten sind beigetreten. Jeder Spieler kann seinen Client starten.", playing:"Serverautorisiertes Match läuft", reconnect:"Verbindung unterbrochen · erneuter Versuch…", finished:"MATCH BEENDET", signed:"Melde dich an, um einen Co-op-Raum zu erstellen oder beizutreten.", host:"HOST", guest:"GAST", online:"VERBUNDEN", offline:"VERBINDUNG WIRD HERGESTELLT", error:"Co-op-Dienst nicht verfügbar", controls:"Bewegen: WASD / Pfeiltasten · Automatisches Feuer aktiv", createError:"Raum konnte nicht erstellt werden", joinError:"Beitritt zum Raum fehlgeschlagen", room:"RAUM", noRoom:"Kein aktiver Raum" },
  fr: { title:"CO-OP AVEC UN AMI", note:"Créez une salle privée et partagez le code à huit caractères. Les deux pilotes doivent se connecter.", create:"CRÉER UNE INVITATION", join:"REJOINDRE LA SALLE", code:"CODE D'INVITATION À 8 CARACTÈRES", copy:"COPIER LE CODE", start:"LANCER LE CO-OP", leave:"QUITTER LA VUE", waiting:"En attente d'un second pilote…", ready:"Les deux pilotes ont rejoint la salle. Chacun peut lancer son client.", playing:"Match contrôlé par le serveur en cours", reconnect:"Connexion interrompue · reconnexion…", finished:"MATCH TERMINÉ", signed:"Connectez-vous pour créer ou rejoindre une salle Co-op.", host:"HÔTE", guest:"INVITÉ", online:"CONNECTÉ", offline:"RECONNEXION", error:"Service Co-op indisponible", controls:"Déplacement : WASD / flèches · Tir automatique actif", createError:"Impossible de créer la salle", joinError:"Impossible de rejoindre cette salle", room:"SALLE", noRoom:"Aucune salle active" },
  ja: { title:"フレンドとCO-OP", note:"プライベートルームを作成し、8文字のコードを共有します。両方のパイロットがログインする必要があります。", create:"招待を作成", join:"ルームに参加", code:"8文字の招待コード", copy:"コードをコピー", start:"CO-OPを開始", leave:"画面を閉じる", waiting:"もう1人のパイロットを待っています…", ready:"2人とも参加しました。それぞれのプレイヤーがクライアントを開始できます。", playing:"サーバー管理のマッチが進行中", reconnect:"接続が中断されました · 再接続中…", finished:"マッチ終了", signed:"Co-opルームの作成・参加にはログインしてください。", host:"ホスト", guest:"ゲスト", online:"接続中", offline:"再接続中", error:"Co-opサービスを利用できません", controls:"移動：WASD / 矢印キー · オート射撃有効", createError:"ルームを作成できませんでした", joinError:"ルームに参加できませんでした", room:"ルーム", noRoom:"アクティブルームなし" }
};
const locale = () => { try { return localStorage.getItem("cosmic-scrap-language") || "en"; } catch { return "en"; } };
const copy = () => COPY[locale()] || COPY.en;
const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };

class CoopClient {
  constructor() {
    this.room = null;
    this.snapshot = null;
    this.keys = new Set();
    this.tickTimer = null;
    this.roomTimer = null;
    this.heartbeatTimer = null;
    this.tickBusy = false;
    this.started = false;
    this.failures = 0;
    this.mount();
  }

  mount() {
    const panel = document.querySelector("#online-screen .online-panel");
    if (!panel || document.getElementById("coop-client")) return;
    this.root = node("section", "coop-client");
    this.root.id = "coop-client";
    this.root.innerHTML = `
      <div class="coop-heading"><div><span class="eyebrow">TAVIRO · ONLINE CO-OP</span><h3></h3></div><span class="coop-server-badge">SERVER SIM</span></div>
      <p class="coop-note"></p>
      <div class="coop-entry"><button class="coop-create primary-button" type="button"></button><div class="coop-join-row"><input class="coop-code" maxlength="8" autocomplete="off" spellcheck="false"><button class="coop-join mini-button" type="button"></button></div></div>
      <div class="coop-room" hidden><div class="coop-room-top"><span class="coop-room-label"></span><strong class="coop-invite-code"></strong><button class="coop-copy mini-button" type="button"></button></div><div class="coop-presence"></div><p class="coop-status" role="status" aria-live="polite"></p><div class="coop-controls"><button class="coop-start primary-button" type="button" hidden></button><button class="coop-leave text-button" type="button"></button></div><div class="coop-touch-controls" aria-label="Touch movement" hidden><button type="button" data-coop-key="w" aria-label="Move up">↑</button><div><button type="button" data-coop-key="a" aria-label="Move left">←</button><button type="button" data-coop-key="s" aria-label="Move down">↓</button><button type="button" data-coop-key="d" aria-label="Move right">→</button></div></div><canvas class="coop-arena" width="1000" height="1000" aria-label="Co-op arena snapshot" hidden></canvas><p class="coop-help"></p></div>
      <p class="coop-feedback" role="status" aria-live="polite"></p>`;
    const firstSection = panel.querySelector(".online-section");
    panel.insertBefore(this.root, firstSection || null);
    this.root.querySelector(".coop-create").addEventListener("click", () => this.createRoom());
    this.root.querySelector(".coop-join").addEventListener("click", () => this.joinRoom());
    this.root.querySelector(".coop-copy").addEventListener("click", () => this.copyCode());
    this.root.querySelector(".coop-start").addEventListener("click", () => this.startMatch());
    this.root.querySelector(".coop-leave").addEventListener("click", () => this.leaveView());
    this.root.querySelector(".coop-code").addEventListener("input", event => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); });
    window.addEventListener("keydown", event => this.onKey(event, true));
    window.addEventListener("keyup", event => this.onKey(event, false));
    window.addEventListener("blur", () => this.keys.clear());
    this.root.querySelectorAll("[data-coop-key]").forEach(button => {
      const key = button.dataset.coopKey;
      button.addEventListener("pointerdown", event => { event.preventDefault(); if (this.started) this.keys.add(key); });
      for (const type of ["pointerup", "pointercancel", "pointerleave"]) button.addEventListener(type, () => this.keys.delete(key));
    });
    document.getElementById("online-close")?.addEventListener("click", () => this.pauseClient());
    window.addEventListener("cosmic-scrap:open-online", () => { if (this.room) this.beginRoomPolling(); });
    window.addEventListener("cosmic-scrap:language-changed", () => this.renderCopy());
    this.renderCopy();
    this.restoreRoom();
  }

  renderCopy() {
    if (!this.root) return;
    const c = copy();
    this.root.querySelector(".coop-heading h3").textContent = c.title;
    this.root.querySelector(".coop-room-label").textContent = c.room;
    this.root.querySelector(".coop-note").textContent = c.note;
    this.root.querySelector(".coop-create").textContent = c.create;
    this.root.querySelector(".coop-code").placeholder = c.code;
    this.root.querySelector(".coop-code").setAttribute("aria-label", c.code);
    this.root.querySelector(".coop-join").textContent = c.join;
    this.root.querySelector(".coop-copy").textContent = c.copy;
    this.root.querySelector(".coop-start").textContent = c.start;
    this.root.querySelector(".coop-leave").textContent = c.leave;
    this.root.querySelector(".coop-help").textContent = c.controls;
    if (this.room) this.renderRoom();
  }

  persistRoom() {
    try {
      if (this.room?.id) localStorage.setItem("taviro-coop-room-id", this.room.id);
      if (this.room?.invite_code) localStorage.setItem("taviro-coop-invite-code", this.room.invite_code);
    } catch {}
  }

  async restoreRoom() {
    let roomId = null;
    try { roomId = localStorage.getItem("taviro-coop-room-id"); } catch {}
    if (!roomId) return;
    try {
      await this.currentUser();
      const state = await this.rpc("get_room_state", { p_room_id: roomId });
      this.room = state;
      this.persistRoom();
      this.showRoom();
      this.beginRoomPolling();
      this.feedback(copy().reconnect);
    } catch {
      try { localStorage.removeItem("taviro-coop-room-id"); localStorage.removeItem("taviro-coop-invite-code"); } catch {}
    }
  }

  async currentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) throw new Error(copy().signed);
    return data.session.user;
  }

  async rpc(name, args) {
    const { data, error } = await supabase.rpc(name, args);
    if (error) throw error;
    return data;
  }

  async invoke(action, extra = {}) {
    const { data, error } = await supabase.functions.invoke("online-match", { body: { action, ...extra } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }

  feedback(message, error = false) {
    const el = this.root.querySelector(".coop-feedback");
    el.textContent = message;
    el.dataset.state = error ? "error" : "info";
  }

  async createRoom() {
    try {
      await this.currentUser();
      const room = await this.rpc("create_invite_room", { p_level_bracket: 1 });
      this.room = room;
      this.persistRoom();
      await this.rpc("heartbeat_coop_room", { p_room_id: room.id });
      this.showRoom();
      this.feedback(copy().waiting);
      this.beginRoomPolling();
    } catch (error) { this.feedback(error?.message || copy().createError, true); }
  }

  async joinRoom() {
    try {
      await this.currentUser();
      const code = this.root.querySelector(".coop-code").value.trim().toUpperCase();
      if (!/^[A-Z0-9]{8}$/.test(code)) throw new Error(copy().code);
      const room = await this.rpc("join_invite_room", { p_invite_code: code });
      this.room = room;
      this.persistRoom();
      await this.rpc("heartbeat_coop_room", { p_room_id: room.id });
      this.showRoom();
      this.feedback(copy().ready);
      this.beginRoomPolling();
    } catch (error) { this.feedback(error?.message || copy().joinError, true); }
  }

  showRoom() {
    this.root.querySelector(".coop-room").hidden = false;
    this.root.querySelector(".coop-invite-code").textContent = this.room.invite_code;
    this.root.querySelector(".coop-entry").hidden = true;
    this.renderRoom();
  }

  async copyCode() {
    if (!this.room?.invite_code) return;
    try { await navigator.clipboard.writeText(this.room.invite_code); this.feedback(copy().copy + " ✓"); }
    catch { this.feedback(this.room.invite_code); }
  }

  beginRoomPolling() {
    this.stopRoomPolling();
    this.refreshRoom();
    this.roomTimer = setInterval(() => this.refreshRoom(), 2500);
    this.heartbeatTimer = setInterval(() => {
      if (this.room) this.rpc("heartbeat_coop_room", { p_room_id: this.room.id }).catch(error => this.feedback(error.message, true));
    }, 5000);
  }

  stopRoomPolling() {
    if (this.roomTimer) clearInterval(this.roomTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.roomTimer = null;
    this.heartbeatTimer = null;
  }

  async refreshRoom() {
    if (!this.room || this.started) return;
    try {
      const state = await this.rpc("get_room_state", { p_room_id: this.room.id });
      this.room = { ...this.room, ...state };
      this.renderRoom();
      this.feedback(state.guest_user_id ? copy().ready : copy().waiting);
    } catch (error) { this.feedback(copy().reconnect + " " + (error?.message || ""), true); }
  }

  renderRoom() {
    if (!this.room) return;
    const c = copy();
    const room = this.room;
    const presence = this.root.querySelector(".coop-presence");
    presence.replaceChildren(
      node("span", room.host_connected ? "is-online" : "is-offline", c.host + " · " + (room.host_connected ? c.online : c.offline)),
      node("span", room.guest_user_id ? (room.guest_connected ? "is-online" : "is-offline") : "is-offline", c.guest + " · " + (room.guest_user_id ? (room.guest_connected ? c.online : c.offline) : c.waiting))
    );
    const canStart = Boolean(room.guest_user_id && ["ready", "playing"].includes(room.status));
    this.root.querySelector(".coop-start").hidden = !canStart || this.started;
    this.root.querySelector(".coop-status").textContent = this.snapshot?.status === "finished" ? c.finished : canStart ? c.ready : c.waiting;
    this.root.querySelector(".coop-arena").hidden = !this.started;
    this.root.querySelector(".coop-touch-controls").hidden = !this.started;
    this.root.querySelector(".coop-help").hidden = !this.started;
  }

  async startMatch() {
    if (!this.room || this.started) return;
    try {
      await this.invoke("coop_start", { room_id: this.room.id });
      this.started = true;
      this.room.status = "playing";
      this.root.querySelector(".coop-start").hidden = true;
      this.root.querySelector(".coop-arena").hidden = false;
      this.root.querySelector(".coop-touch-controls").hidden = false;
      this.root.querySelector(".coop-help").hidden = false;
      this.stopRoomPolling();
      this.feedback(copy().playing);
      this.tick();
    } catch (error) { this.feedback(error?.message || copy().error, true); }
  }

  onKey(event, down) {
    if (!this.started || this.root.closest("[hidden]")) return;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
      event.preventDefault();
      if (down) this.keys.add(key); else this.keys.delete(key);
    }
  }

  getInput() {
    const dx = (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0) - (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0);
    const dy = (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0) - (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0);
    return { dx, dy, shoot: true };
  }

  async tick() {
    if (!this.started || this.tickBusy || !this.room) return;
    this.tickBusy = true;
    try {
      const snapshot = await this.invoke("coop_tick", { room_id: this.room.id, input: this.getInput() });
      this.snapshot = snapshot;
      this.failures = 0;
      this.renderSnapshot();
      if (snapshot.status === "finished") {
        this.started = false;
        this.feedback(copy().finished);
        this.renderRoom();
        return;
      }
      this.feedback(snapshot.waiting_for_players ? copy().ready : copy().playing);
    } catch (error) {
      this.failures += 1;
      this.feedback(this.failures >= 3 ? copy().reconnect : (error?.message || copy().error), true);
    } finally {
      this.tickBusy = false;
      if (this.started) this.tickTimer = setTimeout(() => this.tick(), Math.min(500, 120 + this.failures * 120));
    }
  }

  renderSnapshot() {
    const canvas = this.root.querySelector(".coop-arena");
    const ctx = canvas.getContext("2d");
    if (!ctx || !this.snapshot) return;
    const s = this.snapshot;
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.fillStyle = "#050b15"; ctx.fillRect(0, 0, 1000, 1000);
    ctx.strokeStyle = "#18344a"; ctx.lineWidth = 1;
    for (let p = 50; p < 1000; p += 50) { ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 1000); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(1000, p); ctx.stroke(); }
    for (const enemy of s.enemies || []) { ctx.fillStyle = "#ff5572"; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius || 12, 0, Math.PI * 2); ctx.fill(); }
    for (const bullet of s.bullets || []) { ctx.fillStyle = "#77e8ff"; ctx.beginPath(); ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2); ctx.fill(); }
    (s.players || []).forEach((player, index) => {
      ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = player.alive ? (index === 0 ? "#5fe2ff" : "#b7a0ff") : "#536272";
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-11, -10); ctx.lineTo(-7, 0); ctx.lineTo(-11, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    ctx.fillStyle = "#d9f3ff"; ctx.font = "bold 24px system-ui";
    ctx.fillText("WAVE " + (s.wave || 1), 24, 38);
    ctx.fillText("SCORE " + (s.shared_score || 0), 24, 70);
    ctx.fillText("LIVES " + (s.shared_lives ?? 3), 24, 102);
  }

  pauseClient() {
    this.started = false;
    if (this.tickTimer) clearTimeout(this.tickTimer);
    this.tickTimer = null;
    this.stopRoomPolling();
    this.keys.clear();
  }

  leaveView() {
    this.started = false;
    if (this.tickTimer) clearTimeout(this.tickTimer);
    this.tickTimer = null;
    this.stopRoomPolling();
    this.keys.clear();
    this.room = null;
    this.snapshot = null;
    try { localStorage.removeItem("taviro-coop-room-id"); localStorage.removeItem("taviro-coop-invite-code"); } catch {}
    this.root.querySelector(".coop-room").hidden = true;
    this.root.querySelector(".coop-entry").hidden = false;
    this.root.querySelector(".coop-arena").hidden = true;
    this.root.querySelector(".coop-touch-controls").hidden = true;
    this.root.querySelector(".coop-code").value = "";
    this.root.querySelector(".coop-presence").replaceChildren();
    this.feedback(copy().noRoom);
  }
}

new CoopClient();
