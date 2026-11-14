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
const rarityText = {
  en: { epic: "✦ EPIC · 5% ROLL · DOUBLE POWER", rare: "◆ RARE · 22% ROLL · BOOSTED", common: "● COMMON · 73% ROLL" },
  tr: { epic: "✦ DESTANSI · %5 ŞANS · ÇİFT GÜÇ", rare: "◆ NADİR · %22 ŞANS · GÜÇLENDİRİLMİŞ", common: "● SIRADAN · %73 ŞANS" }
};

function currentLanguage() {
  try { return localStorage.getItem("cosmic-scrap-language") === "tr" ? "tr" : "en"; }
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
      title.textContent = lang === "tr" && upgradeText[u.name] ? upgradeText[u.name][0] : u.name;
      const description = document.createElement("p");
      description.textContent = lang === "tr" && upgradeText[u.name] ? upgradeText[u.name][1] : u.description;
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
