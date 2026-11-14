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
const upgradeTextLocales={"es":{"Rapid Protocol":["Protocolo Rápido","Dispara más rápido."],"Heavy Payload":["Carga Pesada","Inflige más daño; límite de 180."],"Twin Signal":["Señal Doble","Dispara un proyectil adicional (máx. 4)."],"Reinforced Core":["Núcleo Reforzado","Recupera salud y aumenta la salud máxima."],"Phase Drive":["Motor de Fase","Muévete un 12% más rápido (límite de 420)."],"Scrap Magnet":["Imán de Chatarra","Aumenta el alcance de recogida un 25%."],"Critical Spark":["Chispa Crítica","Aumenta la probabilidad crítica en 6 puntos porcentuales."],"Phase Piercer":["Perforador de Fase","Los proyectiles atraviesan a un enemigo adicional (máx. 3)."],"Orbiting Shield":["Escudo Orbital","Los fragmentos giratorios dañan a enemigos cercanos (máx. 4). La Gravedad aumenta su daño."],"Chain Lightning":["Relámpago en Cadena","Cada impacto puede saltar a un enemigo cercano. Los críticos pueden crear un segundo salto."],"Ion Trail":["Estela Iónica","Deja una estela de energía que daña a los enemigos al moverte."],"Nova Burst":["Explosión Nova","Golpea periódicamente a los enemigos cercanos con una explosión (máx. 3)."],"Kill Cascade":["Cascada de Eliminaciones","Los enemigos derrotados explotan y dañan a los cercanos (máx. 2)."],"Gravity Well":["Pozo Gravitatorio","Ralentiza notablemente a los enemigos cercanos (máx. 2). Aumenta el daño de los fragmentos orbitales."],"Rift Echo":["Eco de la Grieta","Tras varias eliminaciones, crea un eco violeta que daña a los enemigos cercanos (máx. 3)."],"Support Drones":["Drones de Apoyo","Obtén un dron autónomo que ataca amenazas cercanas (máx. 3)."],"Singularity Overclock":["Sobrecarga de Singularidad","Cada elección mejora aún más el daño, la velocidad y la capacidad del núcleo."]},"ru":{"Rapid Protocol":["Быстрый протокол","Увеличьте скорострельность."],"Heavy Payload":["Тяжёлый заряд","Наносите больше урона; предел — 180."],"Twin Signal":["Двойной сигнал","Выпускайте дополнительный снаряд (макс. 4)."],"Reinforced Core":["Усиленное ядро","Восстановите здоровье и увеличьте его максимум."],"Phase Drive":["Фазовый двигатель","Двигайтесь на 12% быстрее (предел — 420)."],"Scrap Magnet":["Магнит лома","Увеличьте радиус сбора на 25%."],"Critical Spark":["Критическая искра","Увеличьте шанс критического удара на 6 процентных пунктов."],"Phase Piercer":["Фазовый пробойник","Снаряды пробивают ещё одного врага (макс. 3)."],"Orbiting Shield":["Орбитальный щит","Вращающиеся осколки регулярно наносят урон ближайшим врагам (макс. 4). Гравитация усиливает их урон."],"Chain Lightning":["Цепная молния","Попадание может вызвать разряд по ближайшему врагу. Критические удары могут создать второй разряд."],"Ion Trail":["Ионный след","Оставляйте энергетический след, наносящий урон врагам."],"Nova Burst":["Вспышка Нова","Периодически поражайте ближайших врагов взрывом (макс. 3)."],"Kill Cascade":["Цепная реакция","Побеждённые враги взрываются и повреждают соседних (макс. 2)."],"Gravity Well":["Гравитационная яма","Сильно замедляет ближайших врагов (макс. 2). Усиливает урон орбитальных осколков."],"Rift Echo":["Эхо разлома","После нескольких побед создаёт фиолетовую волну, повреждающую ближайших врагов (макс. 3)."],"Support Drones":["Дроны поддержки","Получите автономный дрон, атакующий ближайшие угрозы (макс. 3)."],"Singularity Overclock":["Разгон сингулярности","Каждый выбор дополнительно усиливает урон, скорость и ёмкость ядра."]},"id":{"Rapid Protocol":["Protokol Cepat","Tingkatkan kecepatan tembakan."],"Heavy Payload":["Muatan Berat","Berikan lebih banyak kerusakan; batas 180."],"Twin Signal":["Sinyal Ganda","Tembakkan satu proyektil tambahan (maks. 4)."],"Reinforced Core":["Inti Diperkuat","Pulihkan kesehatan dan tingkatkan kesehatan maksimum."],"Phase Drive":["Penggerak Fase","Bergerak 12% lebih cepat (batas 420)."],"Scrap Magnet":["Magnet Rongsokan","Tingkatkan jangkauan pengumpulan sebesar 25%."],"Critical Spark":["Percikan Kritis","Tingkatkan peluang kritis sebesar 6 poin persentase."],"Phase Piercer":["Penembus Fase","Proyektil menembus satu musuh tambahan (maks. 3)."],"Orbiting Shield":["Perisai Orbit","Pecahan yang berputar memberi kerusakan berkala pada musuh dekat (maks. 4). Gravitasi meningkatkan kerusakannya."],"Chain Lightning":["Petir Berantai","Setiap serangan dapat memantul ke musuh terdekat. Serangan kritis dapat memicu pantulan kedua."],"Ion Trail":["Jejak Ion","Tinggalkan jejak energi yang merusak musuh saat bergerak."],"Nova Burst":["Ledakan Nova","Ledakkan musuh terdekat secara berkala (maks. 3)."],"Kill Cascade":["Rantai Eliminasi","Musuh yang dikalahkan meledak dan merusak musuh di dekatnya (maks. 2)."],"Gravity Well":["Sumur Gravitasi","Perlambat musuh terdekat secara signifikan (maks. 2). Tingkatkan kerusakan pecahan orbit."],"Rift Echo":["Gema Celah","Setelah beberapa eliminasi, ciptakan gema ungu yang merusak musuh dekat (maks. 3)."],"Support Drones":["Drone Pendukung","Dapatkan drone otonom yang menyerang ancaman terdekat (maks. 3)."],"Singularity Overclock":["Overclock Singularitas","Setiap pilihan semakin meningkatkan kerusakan, kecepatan, dan kapasitas inti."]},"de":{"Rapid Protocol":["Schnellfeuerprotokoll","Erhöhe die Feuerrate."],"Heavy Payload":["Schwere Ladung","Verursache mehr Schaden; Obergrenze 180."],"Twin Signal":["Doppelsignal","Feuere ein zusätzliches Projektil ab (max. 4)."],"Reinforced Core":["Verstärkter Kern","Stelle Gesundheit wieder her und erhöhe den Maximalwert."],"Phase Drive":["Phasenantrieb","Bewege dich 12% schneller (Obergrenze 420)."],"Scrap Magnet":["Schrottmagnet","Erhöhe die Sammelreichweite um 25%."],"Critical Spark":["Kritischer Funke","Erhöhe die kritische Chance um 6 Prozentpunkte."],"Phase Piercer":["Phasendurchbohrer","Projektile durchdringen einen weiteren Gegner (max. 3)."],"Orbiting Shield":["Umlaufschild","Rotierende Splitter fügen nahen Gegnern regelmäßig Schaden zu (max. 4). Gravitation erhöht ihren Schaden."],"Chain Lightning":["Kettenblitz","Treffer können auf einen nahen Gegner überspringen. Kritische Treffer können einen zweiten Sprung auslösen."],"Ion Trail":["Ionenspur","Hinterlasse beim Bewegen eine Energiespur, die Gegner beschädigt."],"Nova Burst":["Nova-Ausbruch","Triff nahe Gegner regelmäßig mit einer Explosion (max. 3)."],"Kill Cascade":["Abschusskaskade","Besiegte Gegner explodieren und beschädigen nahe Gegner (max. 2)."],"Gravity Well":["Gravitationsfeld","Verlangsamt nahe Gegner deutlich (max. 2). Erhöht den Schaden der Orbit-Splitter."],"Rift Echo":["Rissecho","Erzeuge nach mehreren Abschüssen ein violettes Echo, das nahe Gegner beschädigt (max. 3)."],"Support Drones":["Unterstützungsdrohnen","Erhalte eine autonome Drohne, die nahe Bedrohungen angreift (max. 3)."],"Singularity Overclock":["Singularitäts-Overclock","Jede Wahl verstärkt Schaden, Tempo und Kernkapazität weiter."]},"fr":{"Rapid Protocol":["Protocole rapide","Augmentez la cadence de tir."],"Heavy Payload":["Charge lourde","Infligez plus de dégâts ; limite de 180."],"Twin Signal":["Signal double","Tirez un projectile supplémentaire (max. 4)."],"Reinforced Core":["Noyau renforcé","Récupérez de la santé et augmentez la santé maximale."],"Phase Drive":["Propulseur de phase","Déplacez-vous 12% plus vite (limite de 420)."],"Scrap Magnet":["Aimant à ferraille","Augmentez la portée de collecte de 25%."],"Critical Spark":["Étincelle critique","Augmentez les chances de critique de 6 points de pourcentage."],"Phase Piercer":["Perce-phase","Les projectiles traversent un ennemi supplémentaire (max. 3)."],"Orbiting Shield":["Bouclier orbital","Des fragments tournoyants blessent régulièrement les ennemis proches (max. 4). La Gravité augmente leurs dégâts."],"Chain Lightning":["Éclair en chaîne","Chaque impact peut atteindre un ennemi proche. Les coups critiques peuvent créer un second rebond."],"Ion Trail":["Trace ionique","Laissez une traînée d’énergie qui blesse les ennemis en mouvement."],"Nova Burst":["Explosion Nova","Frappez périodiquement les ennemis proches avec une explosion (max. 3)."],"Kill Cascade":["Cascade d’éliminations","Les ennemis vaincus explosent et blessent leurs voisins (max. 2)."],"Gravity Well":["Puits gravitationnel","Ralentit fortement les ennemis proches (max. 2). Augmente les dégâts des fragments orbitaux."],"Rift Echo":["Écho de faille","Après plusieurs éliminations, créez un écho violet qui blesse les ennemis proches (max. 3)."],"Support Drones":["Drones de soutien","Obtenez un drone autonome qui attaque les menaces proches (max. 3)."],"Singularity Overclock":["Surcharge de singularité","Chaque choix renforce encore les dégâts, la vitesse et la capacité du noyau."]},"ja":{"Rapid Protocol":["高速プロトコル","連射速度を上げます。"],"Heavy Payload":["ヘビーペイロード","ダメージを増加します。上限180。"],"Twin Signal":["ツインシグナル","追加の弾を1発発射します（最大4）。"],"Reinforced Core":["強化コア","体力を回復し、最大体力を増やします。"],"Phase Drive":["フェーズドライブ","移動速度を12%上げます（上限420）。"],"Scrap Magnet":["スクラップマグネット","回収範囲を25%広げます。"],"Critical Spark":["クリティカルスパーク","クリティカル率を6ポイント上げます。"],"Phase Piercer":["フェーズピアサー","弾が追加で1体の敵を貫通します（最大3）。"],"Orbiting Shield":["オービタルシールド","回転する破片が近くの敵に継続ダメージを与えます（最大4）。重力でダメージが増加。"],"Chain Lightning":["チェインライトニング","命中時に近くの敵へ電撃が跳ねることがあります。クリティカル時は2回目の連鎖も発生。"],"Ion Trail":["イオントレイル","移動中、敵にダメージを与えるエネルギーの軌跡を残します。"],"Nova Burst":["ノヴァバースト","一定間隔で近くの敵を爆発で攻撃します（最大3）。"],"Kill Cascade":["キルカスケード","倒した敵が爆発し、近くの敵にもダメージを与えます（最大2）。"],"Gravity Well":["グラビティウェル","近くの敵を大幅に減速させます（最大2）。オービタルシールドの破片ダメージも増加。"],"Rift Echo":["リフトエコー","数体倒すと紫の波動が発生し、近くの敵にダメージを与えます（最大3）。"],"Support Drones":["サポートドローン","近くの脅威を攻撃する自律ドローンを獲得します（最大3）。"],"Singularity Overclock":["シンギュラリティ・オーバークロック","選ぶたびにダメージ、速度、コア容量がさらに強化されます。"]}};
const rarityText={"en":{"epic":"✦ EPIC · 5% ROLL · DOUBLE POWER","rare":"◆ RARE · 22% ROLL · BOOSTED","common":"● COMMON · 73% ROLL"},"tr":{"epic":"✦ DESTANSI · %5 ŞANS · ÇİFT GÜÇ","rare":"◆ NADİR · %22 ŞANS · GÜÇLENDİRİLMİŞ","common":"● SIRADAN · %73 ŞANS"},"pt-BR":{"epic":"✦ ÉPICO · 5% DE CHANCE · PODER DUPLO","rare":"◆ RARO · 22% DE CHANCE · REFORÇADO","common":"● COMUM · 73% DE CHANCE"},"es":{"epic":"✦ ÉPICO · 5% · PODER DOBLE","rare":"◆ RARO · 22% · MEJORADO","common":"● COMÚN · 73%"},"ru":{"epic":"✦ ЭПИЧЕСКИЙ · 5% · ДВОЙНАЯ СИЛА","rare":"◆ РЕДКИЙ · 22% · УСИЛЕННЫЙ","common":"● ОБЫЧНЫЙ · 73%"},"id":{"epic":"✦ EPIK · 5% · DAYA GANDA","rare":"◆ LANGKA · 22% · DIPERKUAT","common":"● UMUM · 73%"},"de":{"epic":"✦ EPISCH · 5% · DOPPELTE KRAFT","rare":"◆ SELTEN · 22% · VERSTÄRKT","common":"● HÄUFIG · 73%"},"fr":{"epic":"✦ ÉPIQUE · 5% · PUISSANCE DOUBLE","rare":"◆ RARE · 22% · RENFORCÉ","common":"● COURANT · 73%"},"ja":{"epic":"✦ エピック · 5% · パワー2倍","rare":"◆ レア · 22% · 強化","common":"● コモン · 73%"}};

function currentLanguage() {
  try { const lang=localStorage.getItem("cosmic-scrap-language");return ["en","tr","pt-BR","es","ru","id","de","fr","ja"].includes(lang)?lang:"en"; }
  catch { return "en"; }
}

export class LevelUpScreen {
  constructor() {
    this.root = document.getElementById("upgrade-screen");
    this.cards = document.getElementById("upgrade-cards");
  }
  show(choices, onChoose) {
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
      const localizedUpgrade=lang==="tr"?upgradeText[u.name]:lang==="pt-BR"?upgradeTextPt[u.name]:upgradeTextLocales[lang]?.[u.name];
      title.textContent = localizedUpgrade?.[0] || u.name;
      const description = document.createElement("p");
      description.textContent = localizedUpgrade?.[1] || u.description;
      const tag = document.createElement("span");
      tag.className = "rarity-label";
      tag.textContent = rarityText[lang][rarity];
      b.append(icon, title, description, tag);
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

export const UPGRADE_CARD_TRANSLATIONS=Object.freeze({tr:upgradeText,"pt-BR":upgradeTextPt,...upgradeTextLocales});
export const UPGRADE_CARD_LOCALE_CODES=Object.freeze(["en","tr","pt-BR","es","ru","id","de","fr","ja"]);
export const REQUIRED_UPGRADE_CARD_NAMES=Object.freeze(Object.keys(upgradeText));
