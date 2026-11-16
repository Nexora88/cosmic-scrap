const COPY = {
  en: { kicker:"FIRST FLIGHT · 5-MINUTE GUIDE", title:"YOUR FIRST FIVE MINUTES", intro:"A short field briefing. Learn the controls, collect resources and understand what stays with your pilot.", steps:[
    ["01 · MOVE WITH PURPOSE","Use WASD or the arrow keys on desktop. On touch screens, drag the movement joystick. Keep an open escape route instead of getting surrounded."],
    ["02 · AUTO-FIRE IS ACTIVE","Your ship fires automatically. Focus on movement and positioning; you do not need to tap a fire button."],
    ["03 · COLLECT SCRAP","Move close to the glowing Scrap drops to collect them. Scrap fills your run progress and helps you reach the next upgrade choice."],
    ["04 · CHOOSE ONE UPGRADE","When the level-up screen appears, read the three options and choose one. Each choice shapes this run; repeated upgrades can strengthen the same build."],
    ["05 · SURVIVE, THEN KEEP YOUR CORE","Watch for boss warnings and sector changes. After a run, collected Scrap converts into persistent Scrap Core. Cosmetic collection and pilot progress remain separate from combat power."]
  ], back:"BACK", next:"NEXT STEP", skip:"SKIP GUIDE · LAUNCH", finish:"LAUNCH FIRST RUN", replay:"REPLAY 5-MINUTE GUIDE", close:"CLOSE GUIDE", step:"STEP" },
  tr: { kicker:"İLK UÇUŞ · 5 DAKİKALIK REHBER", title:"İLK BEŞ DAKİKAN", intro:"Kısa bir saha bilgilendirmesi. Kontrolleri, kaynak toplamayı ve pilotunda kalıcı olan ilerlemeyi öğren.", steps:[
    ["01 · BİLİNÇLİ HAREKET ET","Bilgisayarda WASD veya yön tuşlarını kullan. Dokunmatik ekranda hareket joystick'ini sürükle. Etrafının sarılmasını beklemek yerine kaçış alanını açık tut."],
    ["02 · OTOMATİK ATIŞ AÇIK","Geminiz otomatik ateş eder. Ateş düğmesine basman gerekmez; hareketine ve doğru konum almaya odaklan."],
    ["03 · HURDA TOPLA","Parlayan hurda parçalarına yaklaşarak onları topla. Hurdalar oyun içi ilerlemeni artırır ve sonraki yükseltme seçimine ulaşmana yardımcı olur."],
    ["04 · TEK BİR YÜKSELTME SEÇ","Seviye atlama ekranı açıldığında üç seçeneği incele ve birini seç. Her seçim bu oyunun yapısını belirler; aynı yükseltmeyi tekrar seçmek gücünü artırabilir."],
    ["05 · HAYATTA KAL, ÇEKİRDEĞİNİ KORU","Patron uyarılarını ve bölge geçişlerini takip et. Oyun bitince topladığın hurda kalıcı Hurda Çekirdeğine dönüşür. Kozmetik koleksiyonun savaş gücünden ayrıdır."]
  ], back:"GERİ", next:"SONRAKİ ADIM", skip:"REHBERİ GEÇ · OYNA", finish:"İLK OYUNA BAŞLA", replay:"5 DAKİKALIK REHBERİ TEKRARLA", close:"REHBERİ KAPAT", step:"ADIM" },
  "pt-BR": { kicker:"PRIMEIRO VOO · GUIA DE 5 MINUTOS", title:"SEUS PRIMEIROS CINCO MINUTOS", intro:"Uma breve orientação. Aprenda os controles, colete recursos e entenda o progresso permanente do piloto.", steps:[
    ["01 · MOVA-SE COM INTENÇÃO","Use WASD ou as setas no computador. Na tela sensível ao toque, arraste o joystick. Mantenha uma rota de fuga livre."],
    ["02 · DISPARO AUTOMÁTICO ATIVO","Sua nave dispara automaticamente. Concentre-se no movimento e no posicionamento; não é necessário tocar em um botão de disparo."],
    ["03 · COLETE SUCATA","Aproxime-se dos fragmentos brilhantes para coletá-los. A sucata aumenta seu progresso na partida e ajuda a alcançar a próxima melhoria."],
    ["04 · ESCOLHA UMA MELHORIA","Quando a tela de nível aparecer, leia as três opções e escolha uma. Cada escolha molda a partida; repetir uma melhoria pode fortalecê-la."],
    ["05 · SOBREVIVA E PRESERVE SEU NÚCLEO","Observe os avisos de chefes e as mudanças de setor. Ao terminar, a sucata coletada vira Núcleo de Sucata permanente. Cosméticos não aumentam o poder de combate."]
  ], back:"VOLTAR", next:"PRÓXIMA ETAPA", skip:"PULAR GUIA · JOGAR", finish:"INICIAR PRIMEIRA PARTIDA", replay:"REVER GUIA DE 5 MINUTOS", close:"FECHAR GUIA", step:"ETAPA" },
  es: { kicker:"PRIMER VUELO · GUÍA DE 5 MINUTOS", title:"TUS PRIMEROS CINCO MINUTOS", intro:"Una breve orientación. Aprende los controles, recoge recursos y descubre qué progreso conserva tu piloto.", steps:[
    ["01 · MUÉVETE CON INTENCIÓN","Usa WASD o las flechas en ordenador. En pantallas táctiles, arrastra el joystick. Mantén una ruta de escape despejada."],
    ["02 · DISPARO AUTOMÁTICO ACTIVADO","Tu nave dispara automáticamente. Concéntrate en moverte y colocarte; no necesitas pulsar un botón de disparo."],
    ["03 · RECOGE CHATARRA","Acércate a los fragmentos brillantes para recogerlos. La chatarra aumenta tu progreso en la partida y te ayuda a alcanzar la siguiente mejora."],
    ["04 · ELIGE UNA MEJORA","Cuando aparezca la pantalla de nivel, lee las tres opciones y elige una. Cada elección define esta partida; repetir una mejora puede reforzarla."],
    ["05 · SOBREVIVE Y CONSERVA TU NÚCLEO","Presta atención a los avisos de jefes y cambios de sector. Al terminar, la chatarra recogida se convierte en Núcleo de Chatarra permanente. Los cosméticos no dan poder de combate."]
  ], back:"ATRÁS", next:"SIGUIENTE PASO", skip:"SALTAR GUÍA · JUGAR", finish:"INICIAR PRIMERA PARTIDA", replay:"REPETIR GUÍA DE 5 MINUTOS", close:"CERRAR GUÍA", step:"PASO" },
  ru: { kicker:"ПЕРВЫЙ ПОЛЁТ · ГИД НА 5 МИНУТ", title:"ПЕРВЫЕ ПЯТЬ МИНУТ", intro:"Краткий инструктаж: управление, сбор ресурсов и постоянный прогресс пилота.", steps:[
    ["01 · ДВИГАЙТЕСЬ ОСОЗНАННО","На компьютере используйте WASD или стрелки. На сенсорном экране перемещайте джойстик. Всегда оставляйте свободный путь для отхода."],
    ["02 · АВТОСТРЕЛЬБА ВКЛЮЧЕНА","Ваш корабль стреляет автоматически. Сосредоточьтесь на движении и позиции — нажимать кнопку стрельбы не нужно."],
    ["03 · СОБИРАЙТЕ ЛОМ","Подлетайте к светящимся обломкам, чтобы собрать их. Лом продвигает текущий забег и помогает получить следующий выбор улучшения."],
    ["04 · ВЫБЕРИТЕ ОДНО УЛУЧШЕНИЕ","Когда появится экран уровня, прочитайте три варианта и выберите один. Повторный выбор улучшения может усилить его."],
    ["05 · ВЫЖИВАЙТЕ И СОХРАНЯЙТЕ ЯДРО","Следите за предупреждениями о боссах и сменой секторов. После забега собранный лом превращается в постоянное Ядро лома. Косметика не усиливает бой."]
  ], back:"НАЗАД", next:"ДАЛЕЕ", skip:"ПРОПУСТИТЬ ГИД · ИГРАТЬ", finish:"НАЧАТЬ ПЕРВЫЙ ЗАБЕГ", replay:"ПОВТОРИТЬ ГИД НА 5 МИНУТ", close:"ЗАКРЫТЬ ГИД", step:"ШАГ" },
  id: { kicker:"PENERBANGAN PERTAMA · PANDUAN 5 MENIT", title:"LIMA MENIT PERTAMAMU", intro:"Panduan singkat untuk kontrol, mengumpulkan sumber daya, dan memahami progres pilot yang tersimpan.", steps:[
    ["01 · BERGERAK DENGAN TUJUAN","Gunakan WASD atau tombol panah di desktop. Di layar sentuh, seret joystick. Jaga jalur untuk menghindar tetap terbuka."],
    ["02 · TEMBAKAN OTOMATIS AKTIF","Kapalmu menembak secara otomatis. Fokus pada gerakan dan posisi; kamu tidak perlu menekan tombol tembak."],
    ["03 · KUMPULKAN RONGSOKAN","Dekati pecahan bercahaya untuk mengumpulkannya. Rongsokan menambah progres permainan dan membantumu mencapai pilihan peningkatan berikutnya."],
    ["04 · PILIH SATU PENINGKATAN","Saat layar level muncul, baca tiga pilihan lalu pilih satu. Memilih peningkatan yang sama lagi dapat memperkuatnya."],
    ["05 · BERTAHAN DAN SIMPAN INTIMU","Perhatikan peringatan bos dan pergantian sektor. Setelah permainan selesai, rongsokan yang terkumpul menjadi Inti Rongsokan permanen. Kosmetik tidak memberi kekuatan tempur."]
  ], back:"KEMBALI", next:"LANGKAH BERIKUTNYA", skip:"LEWATI PANDUAN · MAIN", finish:"MULAI PERMAINAN PERTAMA", replay:"ULANGI PANDUAN 5 MENIT", close:"TUTUP PANDUAN", step:"LANGKAH" },
  de: { kicker:"ERSTER FLUG · 5-MINUTEN-GUIDE", title:"DEINE ERSTEN FÜNF MINUTEN", intro:"Eine kurze Einweisung: Steuerung, Ressourcen und dauerhafter Pilotenfortschritt.", steps:[
    ["01 · MIT ABSICHT BEWEGEN","Nutze am Computer WASD oder die Pfeiltasten. Auf Touchscreens ziehst du den Joystick. Halte einen freien Fluchtweg offen."],
    ["02 · AUTOMATISCHES FEUER IST AKTIV","Dein Schiff feuert automatisch. Konzentriere dich auf Bewegung und Positionierung; eine Feuertaste ist nicht nötig."],
    ["03 · SCHROTT SAMMELN","Nähern dich den leuchtenden Teilen, um sie einzusammeln. Schrott bringt dich im Lauf voran und hilft beim nächsten Upgrade."],
    ["04 · EIN UPGRADE WÄHLEN","Wenn der Levelbildschirm erscheint, lies die drei Optionen und wähle eine. Wiederholte Upgrades können denselben Wert weiter stärken."],
    ["05 · ÜBERLEBEN UND DEN KERN BEHALTEN","Achte auf Bosswarnungen und Sektorwechsel. Nach einem Lauf wird gesammelter Schrott zu dauerhaftem Schrottkern. Kosmetik bietet keinen Kampfvorteil."]
  ], back:"ZURÜCK", next:"NÄCHSTER SCHRITT", skip:"GUIDE ÜBERSPRINGEN · SPIELEN", finish:"ERSTEN LAUF STARTEN", replay:"5-MINUTEN-GUIDE WIEDERHOLEN", close:"GUIDE SCHLIESSEN", step:"SCHRITT" },
  fr: { kicker:"PREMIER VOL · GUIDE DE 5 MINUTES", title:"VOS CINQ PREMIÈRES MINUTES", intro:"Un bref briefing : commandes, collecte de ressources et progression permanente du pilote.", steps:[
    ["01 · BOUGEZ AVEC INTENTION","Sur ordinateur, utilisez WASD ou les flèches. Sur écran tactile, faites glisser le joystick. Gardez une voie de sortie libre."],
    ["02 · TIR AUTOMATIQUE ACTIVÉ","Votre vaisseau tire automatiquement. Concentrez-vous sur les déplacements et le positionnement ; aucun bouton de tir n'est nécessaire."],
    ["03 · COLLECTEZ LA FERRAILLE","Approchez-vous des fragments lumineux pour les ramasser. La ferraille fait progresser votre partie et vous rapproche du prochain choix d'amélioration."],
    ["04 · CHOISISSEZ UNE AMÉLIORATION","Lorsque l'écran de niveau apparaît, lisez les trois options et choisissez-en une. Reprendre une amélioration peut la renforcer."],
    ["05 · SURVIVEZ ET GARDEZ VOTRE NOYAU","Surveillez les alertes de boss et les changements de secteur. À la fin, la ferraille devient un Noyau de ferraille permanent. Les cosmétiques n'offrent aucun avantage au combat."]
  ], back:"RETOUR", next:"ÉTAPE SUIVANTE", skip:"IGNORER LE GUIDE · JOUER", finish:"LANCER LA PREMIÈRE PARTIE", replay:"REVOIR LE GUIDE DE 5 MINUTES", close:"FERMER LE GUIDE", step:"ÉTAPE" },
  ja: { kicker:"初飛行 · 5分ガイド", title:"最初の5分間", intro:"操作方法、資源の収集、パイロットに保存される進行状況を学ぶ短いガイドです。", steps:[
    ["01 · 目的を持って移動","PCではWASDまたは矢印キーを使用します。タッチ画面ではジョイスティックをドラッグします。逃げ道を確保しましょう。"],
    ["02 · オート射撃が有効","機体は自動で射撃します。射撃ボタンを押す必要はありません。移動と位置取りに集中してください。"],
    ["03 · スクラップを集める","光る破片に近づいて回収します。スクラップはランの進行を助け、次のアップグレード選択につながります。"],
    ["04 · アップグレードを1つ選ぶ","レベルアップ画面が表示されたら3つの選択肢を読み、1つ選びます。同じ強化を再選択するとさらに強くできます。"],
    ["05 · 生き残り、コアを保持","ボス警告とセクター移行に注意しましょう。ラン終了後、集めたスクラップは恒久的なスクラップコアになります。コスメティックは戦闘力に影響しません。"]
  ], back:"戻る", next:"次のステップ", skip:"ガイドをスキップ · プレイ", finish:"最初のランを開始", replay:"5分ガイドをもう一度見る", close:"ガイドを閉じる", step:"ステップ" }
};

const language = () => {
  try { return localStorage.getItem("cosmic-scrap-language") || "en"; } catch { return "en"; }
};

export class Onboarding {
  constructor() {
    this.index = 0;
    this.onFinish = null;
    this.returnFocus = null;
    this.root = document.createElement("section");
    this.root.className = "onboarding-overlay";
    this.root.hidden = true;
    this.root.setAttribute("role", "dialog");
    this.root.setAttribute("aria-modal", "true");
    this.root.setAttribute("aria-labelledby", "onboarding-title");
    this.root.innerHTML = `
      <div class="onboarding-panel">
        <div class="onboarding-top"><span class="onboarding-kicker"></span><button class="onboarding-close" type="button" aria-label="Close">×</button></div>
        <div class="onboarding-progress" role="group" aria-label="Guide progress"><span class="onboarding-progress-label"></span><div class="onboarding-progress-track"><i></i></div></div>
        <h2 id="onboarding-title"></h2><p class="onboarding-intro"></p>
        <article class="onboarding-step"><span class="onboarding-step-number"></span><h3></h3><p></p></article>
        <div class="onboarding-actions"><button class="onboarding-back" type="button"></button><button class="onboarding-skip" type="button"></button><button class="onboarding-next" type="button"></button></div>
      </div>`;
    document.body.append(this.root);
    this.root.querySelector(".onboarding-close").addEventListener("click", () => this.dismiss(false));
    this.root.querySelector(".onboarding-back").addEventListener("click", () => this.move(-1));
    this.root.querySelector(".onboarding-next").addEventListener("click", () => {
      if (this.index === 4) this.dismiss(true);
      else this.move(1);
    });
    this.root.querySelector(".onboarding-skip").addEventListener("click", () => this.dismiss(true));
    document.addEventListener("keydown", event => {
      if (!this.root.hidden && event.key === "Escape") { event.preventDefault(); this.dismiss(false); }
    });
    window.addEventListener("cosmic-scrap:language-changed", () => this.render());
    this.render();
    const guide = document.querySelector(".field-guide");
    if (guide) {
      const replay = document.createElement("button");
      replay.type = "button";
      replay.className = "onboarding-replay";
      replay.addEventListener("click", () => this.show());
      guide.append(replay);
      this.replayButton = replay;
      this.renderReplay();
    }
  }

  shouldShow() {
    try { return localStorage.getItem("taviro-onboarding-complete") !== "1"; }
    catch { return false; }
  }

  show(onFinish = null) {
    this.index = 0;
    this.onFinish = typeof onFinish === "function" ? onFinish : null;
    this.returnFocus = document.activeElement;
    this.root.hidden = false;
    this.render();
    this.root.querySelector(".onboarding-next").focus({ preventScroll: true });
  }

  move(delta) {
    this.index = Math.max(0, Math.min(4, this.index + delta));
    this.render();
  }

  dismiss(complete) {
    this.root.hidden = true;
    if (complete) {
      try { localStorage.setItem("taviro-onboarding-complete", "1"); } catch {}
      this.renderReplay();
    }
    const callback = complete ? this.onFinish : null;
    this.onFinish = null;
    if (callback) callback();
    else if (this.returnFocus?.isConnected && !this.returnFocus.closest("[hidden]")) this.returnFocus.focus({ preventScroll: true });
    this.returnFocus = null;
  }

  renderReplay() {
    if (this.replayButton) this.replayButton.textContent = COPY[language()]?.replay || COPY.en.replay;
  }

  render() {
    const copy = COPY[language()] || COPY.en;
    const step = copy.steps[this.index];
    const q = selector => this.root.querySelector(selector);
    q(".onboarding-kicker").textContent = copy.kicker;
    q("#onboarding-title").textContent = copy.title;
    q(".onboarding-intro").textContent = copy.intro;
    q(".onboarding-progress-label").textContent = `${copy.step} ${this.index + 1} / 5`;
    q(".onboarding-progress-track i").style.width = ((this.index + 1) * 20) + "%";
    q(".onboarding-step-number").textContent = String(this.index + 1).padStart(2, "0");
    q(".onboarding-step h3").textContent = step[0];
    q(".onboarding-step p").textContent = step[1];
    q(".onboarding-back").textContent = copy.back;
    q(".onboarding-back").disabled = this.index === 0;
    q(".onboarding-next").textContent = this.index === 4 ? copy.finish : copy.next;
    q(".onboarding-skip").textContent = this.index === 4 ? copy.close : copy.skip;
    q(".onboarding-close").setAttribute("aria-label", copy.close);
    if (this.replayButton) this.replayButton.textContent = copy.replay;
  }
}
