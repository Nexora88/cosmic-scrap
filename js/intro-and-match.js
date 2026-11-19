const intro = document.getElementById("intro-screen");
const countdown = document.getElementById("match-countdown");
const countNumber = document.getElementById("match-count-number");
const countCopy = document.getElementById("match-count-copy");
let countdownPromise = null;

function markIntroSeen() {
  try { localStorage.setItem("cosmic-scrap-intro-seen", "1"); } catch {}
}
function showIntro() {
  if (!intro) return;
  intro.hidden = false;
  const continueButton = document.getElementById("intro-continue");
  continueButton?.focus({ preventScroll: true });
}
function closeIntro() {
  intro.hidden = true;
  markIntroSeen();
}
document.getElementById("intro-continue")?.addEventListener("click", closeIntro);
document.getElementById("intro-create-account")?.addEventListener("click", () => {
  closeIntro();
  window.dispatchEvent(new Event("cosmic-scrap:request-account"));
});
window.addEventListener("cosmic-scrap:show-intro", showIntro);
try {
  if (localStorage.getItem("cosmic-scrap-intro-seen") !== "1") showIntro();
} catch { showIntro(); }

const COUNTDOWN_COPY = {
  en: ["Pilots ready. Entering the arena.", "Engines online. Take your position.", "3… 2… 1… SURVIVE!"],
  tr: ["Pilotlar hazır. Arenaya giriş başlıyor.", "Motorlar çalışıyor. Pozisyonunu al.", "3… 2… 1… HAYATTA KAL!"],
  "pt-BR": ["Pilotos prontos. Entrando na arena.", "Motores ligados. Prepare sua posição.", "3… 2… 1… SOBREVIVA!"],
  es: ["Pilotos listos. Entrando en la arena.", "Motores encendidos. Toma tu posición.", "3… 2… 1… ¡SOBREVIVE!"],
  ru: ["Пилоты готовы. Входим на арену.", "Двигатели запущены. Займите позицию.", "3… 2… 1… ВЫЖИВАЙТЕ!"],
  id: ["Pilot siap. Memasuki arena.", "Mesin menyala. Bersiaplah.", "3… 2… 1… BERTAHAN!"],
  de: ["Piloten bereit. Eintritt in die Arena.", "Triebwerke laufen. Position einnehmen.", "3… 2… 1… ÜBERLEBE!"],
  fr: ["Pilotes prêts. Entrée dans l’arène.", "Moteurs activés. Prenez position.", "3… 2… 1… SURVIVEZ !"],
  ja: ["パイロット準備完了。アリーナへ進入します。", "エンジン始動。位置についてください。", "3… 2… 1… 生き残れ！"]
};

window.cosmicScrapCountdown = () => {
  if (countdownPromise) return countdownPromise;
  countdownPromise = (async () => {
    countdown.hidden = false;
    const track = countdown.querySelector(".countdown-track");
    if (track) track.innerHTML = "<i></i>";
    let locale = "en";
    try { locale = localStorage.getItem("cosmic-scrap-language") || "en"; } catch {}
    const copy = COUNTDOWN_COPY[locale] || COUNTDOWN_COPY.en;
    for (let number = 3; number >= 1; number -= 1) {
      countNumber.textContent = String(number);
      countCopy.textContent = copy[3 - number];
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdown.hidden = true;
    countdownPromise = null;
  })();
  return countdownPromise;
};
