import {rarityAt} from "../systems/Balance.js";

const upgradeText = {
  "Rapid Protocol": ["Hızlı Atış Protokolü", "Daha hızlı ateş et."],
  "Heavy Payload": ["Ağır Mühimmat", "Daha fazla hasar ver; üst sınır 180."],
  "Twin Signal": ["Çift Sinyal", "Bir ek mermi ateşle (en fazla 4)."],
  "Reinforced Core": ["Güçlendirilmiş Çekirdek", "Canını yenile ve azami canını artır."],
  "Phase Drive": ["Faz Motoru", "%12 daha hızlı hareket et (üst sınır 420)."],
  "Scrap Magnet": ["Hurda Mıknatısı", "Toplama menzilini %25 artır."],
  "Critical Spark": ["Kritik Kıvılcım", "Kritik vuruş şansını 6 yüzde puan artır."],
  "Phase Piercer": ["Faz Delici", "Mermiler bir düşmanı daha delip geçsin (en fazla 3)."],
  "Orbiting Shield": ["Yörünge Kalkanı", "Etrafında dönen parçalar yakın düşmanlara düzenli hasar verir (en fazla 4). Kütle Çekimi bu hasarı artırır."],
  "Chain Lightning": ["Zincirleme Yıldırım", "Her isabette yakındaki bir düşmana yıldırım sıçrama şansı kazan. Kritik vuruşlar ikinci bir sıçrama oluşturabilir."],
  "Ion Trail": ["İyon İzi", "Hareket ederken düşmanlara zarar veren bir enerji izi bırak."],
  "Nova Burst": ["Nova Patlaması", "Belirli aralıklarla yakındaki düşmanları patlamayla vur (en fazla 3)."],
  "Kill Cascade": ["İmha Zinciri", "Yenilen düşmanlar yakındakilere hasar vererek patlasın (en fazla 2)."],
  "Gravity Well": ["Kütle Çekimi", "Çevrendeki düşmanları belirgin biçimde yavaşlatır (en fazla 2). Yörünge Kalkanı parçalarına ek hasar kazandırır."],
  "Rift Echo": ["Yarık Yankısı", "Birkaç düşman öldürdüğünde yakındakilere zarar veren mor bir yankı oluştur (en fazla 3)."],
  "Support Drones": ["Destek Drone", "Yakındaki tehditlere ateş eden otonom bir drone kazan (en fazla 3)."],
  "Singularity Overclock": ["Tekillik Aşırı Yüklemesi", "Her seçim hasarını, hızını ve çekirdek kapasiteni daha da güçlendirir."]
};
const upgradeTextPt = {
  "Rapid Protocol":["Protocolo de Disparo Rápido","Dispare 15% mais rápido."],
  "Heavy Payload":["Carga Pesada","Cause mais dano com crescimento gradual."],
  "Twin Signal":["Sinal Duplo","Dispare um projétil adicional (máx. 4)."],
  "Reinforced Core":["Núcleo Reforçado","Recupere vida e aumente a vida máxima."],
  "Phase Drive":["Motor de Fase","Mova-se 12% mais rápido."],
  "Scrap Magnet":["Ímã de Sucata","Aumente o alcance de coleta em 25%."],
  "Critical Spark":["Faísca Crítica","Aumente a chance de crítico em 6 pontos percentuais."],
  "Phase Piercer":["Perfurador de Fase","Seus projéteis atravessam mais um inimigo."],
  "Orbiting Shield":["Escudo Orbital","Fragmentos giratórios causam dano aos inimigos próximos."],
  "Chain Lightning":["Relâmpago em Cadeia","Seus acertos podem saltar para inimigos próximos."],
  "Ion Trail":["Rastro de Íons","Deixe um rastro de energia que causa dano."],
  "Nova Burst":["Explosão Nova","Exploda inimigos próximos periodicamente."],
  "Kill Cascade":["Cascata de Eliminações","Inimigos derrotados explodem e ferem os próximos."],
  "Gravity Well":["Poço Gravitacional","Reduza a velocidade dos inimigos próximos."],
  "Rift Echo":["Eco da Fenda","Crie uma onda violeta após algumas eliminações."],
  "Support Drones":["Drones de Apoio","Adicione um drone autônomo que ataca ameaças."],
  "Singularity Overclock":["Sobrecarga da Singularidade","Cada nível aumenta dano, velocidade e capacidade do núcleo."]
};
const upgradeTextLocales = {
 es:{
  titles:"Protocolo rápido|Carga pesada|Señal doble|Núcleo reforzado|Motor de fase|Imán de chatarra|Chispa crítica|Perforador de fase|Escudo orbital|Relámpago en cadena|Estela iónica|Explosión nova|Cascada de bajas|Pozo gravitatorio|Eco de la grieta|Drones de apoyo|Sobrecarga de singularidad",
  descriptions:"Dispara más rápido.|Aumenta el daño (máx. 180).|Añade un proyectil (máx. 4).|Recupera vida y aumenta la vida máxima.|Muévete un 12% más rápido (máx. 420).|Aumenta el alcance de recogida un 25%.|Aumenta la probabilidad crítica 6 puntos.|Los proyectiles atraviesan un enemigo más (máx. 3).|Los fragmentos giratorios dañan enemigos cercanos (máx. 4).|Los impactos pueden saltar a enemigos cercanos.|Deja un rastro de energía dañino.|Golpea periódicamente a enemigos cercanos (máx. 3).|Los enemigos derrotados dañan a los cercanos.|Ralentiza a enemigos cercanos (máx. 2).|Crea una onda dañina tras varias bajas (máx. 3).|Añade un dron autónomo de ataque (máx. 3).|Cada elección mejora daño, velocidad y núcleo."
 },
 ru:{
  titles:"Быстрый протокол|Тяжёлый заряд|Двойной сигнал|Укреплённое ядро|Фазовый двигатель|Магнит лома|Критическая искра|Фазовый пробойник|Орбитальный щит|Цепная молния|Ионный след|Вспышка новой|Цепь уничтожения|Гравитационная яма|Эхо разлома|Дроны поддержки|Перегрузка сингулярности",
  descriptions:"Увеличивает скорострельность.|Увеличивает урон (макс. 180).|Добавляет снаряд (макс. 4).|Восстанавливает здоровье и повышает его максимум.|Увеличивает скорость движения на 12% (макс. 420).|Увеличивает радиус сбора на 25%.|Повышает шанс критического удара на 6 п. п.|Снаряды пробивают ещё одного врага (макс. 3).|Вращающиеся осколки наносят урон рядом (макс. 4).|Попадания могут перескочить на ближайшего врага.|Оставляет энергетический след, наносящий урон.|Периодически поражает ближайших врагов (макс. 3).|Побеждённые враги повреждают соседних.|Замедляет ближайших врагов (макс. 2).|Создаёт волну урона после нескольких убийств (макс. 3).|Добавляет автономный атакующий дрон (макс. 3).|Каждый выбор усиливает урон, скорость и ядро."
 },
 id:{
  titles:"Protokol Cepat|Muatan Berat|Sinyal Kembar|Inti Diperkuat|Penggerak Fase|Magnet Rongsokan|Percikan Kritis|Penembus Fase|Perisai Orbit|Petir Berantai|Jejak Ion|Ledakan Nova|Rantai Eliminasi|Sumur Gravitasi|Gema Retakan|Drone Pendukung|Overclock Singularitas",
  descriptions:"Menembak lebih cepat.|Meningkatkan damage (maks. 180).|Menambah satu proyektil (maks. 4).|Memulihkan kesehatan dan menaikkan batas maksimum.|Bergerak 12% lebih cepat (maks. 420).|Meningkatkan jangkauan pengambilan 25%.|Menaikkan peluang kritis 6 poin.|Proyektil menembus satu musuh tambahan (maks. 3).|Pecahan berputar melukai musuh sekitar (maks. 4).|Serangan dapat memantul ke musuh terdekat.|Meninggalkan jejak energi yang melukai musuh.|Menyerang musuh sekitar secara berkala (maks. 3).|Musuh yang dikalahkan melukai musuh di dekatnya.|Memperlambat musuh sekitar (maks. 2).|Menciptakan gelombang serangan setelah beberapa eliminasi (maks. 3).|Menambah drone otomatis penyerang (maks. 3).|Setiap pilihan meningkatkan damage, kecepatan, dan inti."
 },
 de:{
  titles:"Schnellfeuer-Protokoll|Schwere Ladung|Doppelsignal|Verstärkter Kern|Phasenantrieb|Schrottmagnet|Kritischer Funke|Phasendurchbohrer|Orbitalschild|Kettenblitz|Ionenspur|Nova-Ausbruch|Kaskadenabschuss|Gravitationsfeld|Rissecho|Unterstützungsdrohnen|Singularitäts-Overdrive",
  descriptions:"Erhöht die Feuerrate.|Erhöht den Schaden (max. 180).|Fügt ein Projektil hinzu (max. 4).|Stellt Gesundheit wieder her und erhöht den Maximalwert.|Erhöht die Bewegungsgeschwindigkeit um 12% (max. 420).|Erhöht die Sammelreichweite um 25%.|Erhöht die kritische Chance um 6 Prozentpunkte.|Projektile durchdringen einen weiteren Gegner (max. 3).|Rotierende Splitter schädigen nahe Gegner (max. 4).|Treffer können auf nahe Gegner überspringen.|Hinterlässt eine schädigende Energiespur.|Trifft regelmäßig nahe Gegner (max. 3).|Besiegte Gegner schädigen Gegner in ihrer Nähe.|Verlangsamt nahe Gegner (max. 2).|Erzeugt nach mehreren Abschüssen eine Schadenswelle (max. 3).|Fügt eine autonome Angriffsdrohne hinzu (max. 3).|Jede Wahl stärkt Schaden, Tempo und Kern."
 },
 fr:{
  titles:"Protocole rapide|Charge lourde|Signal double|Noyau renforcé|Propulseur de phase|Aimant à ferraille|Étincelle critique|Perceur de phase|Bouclier orbital|Éclair en chaîne|Trace ionique|Explosion nova|Cascade d'éliminations|Puits gravitationnel|Écho de faille|Drones de soutien|Surcharge de singularité",
  descriptions:"Augmente la cadence de tir.|Augmente les dégâts (max. 180).|Ajoute un projectile (max. 4).|Restaure la santé et augmente le maximum.|Augmente la vitesse de 12% (max. 420).|Augmente la portée de collecte de 25%.|Augmente les chances critiques de 6 points.|Les projectiles traversent un ennemi de plus (max. 3).|Les fragments tournoyants blessent les ennemis proches (max. 4).|Les impacts peuvent atteindre un ennemi voisin.|Laisse une traînée d'énergie qui blesse.|Frappe périodiquement les ennemis proches (max. 3).|Les ennemis vaincus blessent leurs voisins.|Ralentit les ennemis proches (max. 2).|Crée une onde offensive après plusieurs éliminations (max. 3).|Ajoute un drone autonome d'attaque (max. 3).|Chaque choix améliore dégâts, vitesse et noyau."
 },
 ja:{
  titles:"高速射撃プロトコル|重装弾|ツインシグナル|強化コア|フェーズドライブ|スクラップ磁石|クリティカルスパーク|フェーズピアサー|軌道シールド|連鎖雷撃|イオントレイル|ノヴァバースト|撃破連鎖|グラビティウェル|リフトエコー|支援ドローン|特異点オーバークロック",
  descriptions:"連射速度を上げる。|ダメージを増加（上限180）。|追加の弾を1発発射（最大4発）。|体力を回復し、最大体力を増やす。|移動速度を12%上げる（上限420）。|回収範囲を25%広げる。|クリティカル率を6ポイント上げる。|弾が追加で敵1体を貫通（最大3）。|回転する破片が近くの敵にダメージ（最大4）。|命中時に近くの敵へ雷が連鎖する。|敵にダメージを与えるエネルギーの軌跡を残す。|一定間隔で近くの敵を攻撃（最大3）。|倒した敵が周囲の敵にダメージを与える。|周囲の敵を減速（最大2）。|複数撃破後にダメージ波を発生（最大3）。|脅威を攻撃する自律ドローンを追加（最大3）。|選択するたびに攻撃力、速度、コアを強化。"
 }
};

const rankText = {
 en:"RANK",tr:"KADEME", "pt-BR":"NÍVEL", es:"RANGO", ru:"РАНГ", id:"PERINGKAT", de:"RANG", fr:"RANG", ja:"ランク"
};

const rarityText = {
  en: { epic: "✦ EPIC · 5% ROLL · DOUBLE POWER", rare: "◆ RARE · 22% ROLL · BOOSTED", common: "● COMMON · 73% ROLL" },
  tr: { epic: "✦ DESTANSI · %5 ŞANS · ÇİFT GÜÇ", rare: "◆ NADİR · %22 ŞANS · GÜÇLENDİRİLMİŞ", common: "● SIRADAN · %73 ŞANS" },
  "pt-BR": { epic: "✦ ÉPICO · 5% DE CHANCE · PODER DUPLO", rare: "◆ RARO · 22% DE CHANCE · REFORÇADO", common: "● COMUM · 73% DE CHANCE" },
  es:{epic:"✦ ÉPICO · 5% · PODER DOBLE",rare:"◆ RARO · 22% · POTENCIADO",common:"● COMÚN · 73%"},
  ru:{epic:"✦ ЭПИЧЕСКИЙ · 5% · ДВОЙНАЯ СИЛА",rare:"◆ РЕДКИЙ · 22% · УСИЛЕННЫЙ",common:"● ОБЫЧНЫЙ · 73%"},
  id:{epic:"✦ EPIK · 5% · KEKUATAN GANDA",rare:"◆ LANGKA · 22% · DIPERKUAT",common:"● UMUM · 73%"},
  de:{epic:"✦ EPISCH · 5% · DOPPELTE KRAFT",rare:"◆ SELTEN · 22% · VERSTÄRKT",common:"● GEWÖHNLICH · 73%"},
  fr:{epic:"✦ ÉPIQUE · 5% · PUISSANCE DOUBLE",rare:"◆ RARE · 22% · RENFORCÉ",common:"● COMMUN · 73%"},
  ja:{epic:"✦ エピック · 5% · パワー2倍",rare:"◆ レア · 22% · 強化",common:"● コモン · 73%"}
};

function currentLanguage() {
  try { const lang=localStorage.getItem("cosmic-scrap-language");return ["en","tr","pt-BR","es","ru","id","de","fr","ja"].includes(lang)?lang:"en"; }
  catch { return "en"; }
}

export class LevelUpScreen {
  constructor() {
    this.root = document.getElementById("upgrade-screen");
    this.cards = document.getElementById("upgrade-cards");
  }
  show(choices, onChoose, player = null) {
    const lang = currentLanguage();
    this.cards.replaceChildren();
    let choiceCommitted = false;
    if (!choices || !choices.length) {
      this.root.hidden = true;
      if (typeof onChoose === "function") onChoose(null, "common");
      return;
    }
    choices.forEach(u => {
      const rarity = rarityAt(Math.random());
      const b = document.createElement("button");
      b.className = "upgrade-card rarity-" + rarity;
      b.dataset.rarity = rarity;
      b.dataset.upgradeId = u.id || "";
      const icon = document.createElement("span");
      icon.className = "card-icon";
      icon.textContent = u.icon;
      const title = document.createElement("h3");
      const index = Object.keys(upgradeText).indexOf(u.name);
      const localeCopy = lang === "tr" ? upgradeText[u.name] : lang === "pt-BR" ? upgradeTextPt[u.name] : upgradeTextLocales[lang] && index >= 0 ? [upgradeTextLocales[lang].titles.split("|")[index], upgradeTextLocales[lang].descriptions.split("|")[index]] : null;
      title.textContent = localeCopy?.[0] || u.name;
      const description = document.createElement("p");
      description.textContent = localeCopy?.[1] || u.description;
      const rank = document.createElement("span");
      rank.className = "upgrade-rank";
      const currentRank = Math.max(0, Number(player?.upgradeRanks?.[u.id]) || 0);
      const roman = value => value < 1 ? "I" : value < 2 ? "II" : value < 3 ? "III" : value < 4 ? "IV" : String(value + 1);
      rank.textContent = rankText[lang] + " " + roman(currentRank) + " → " + roman(currentRank + 1);
      const tag = document.createElement("span");
      tag.className = "rarity-label";
      tag.textContent = rarityText[lang][rarity];
      b.append(icon, title, description, rank, tag);
      b.addEventListener("click", () => {
        if (choiceCommitted || b.disabled) return;
        choiceCommitted = true;
        this.cards.querySelectorAll("button").forEach(card => { card.disabled = true; card.setAttribute("aria-disabled", "true"); });
        b.classList.add("chosen");
        onChoose(u, rarity);
      }, { once: true });
      this.cards.append(b);
    });
    this.root.hidden = false;
  }
  hide() { this.root.hidden = true; }
}
