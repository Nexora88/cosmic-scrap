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

window.cosmicScrapCountdown = () => {
  if (countdownPromise) return countdownPromise;
  countdownPromise = (async () => {
    countdown.hidden = false;
    const track = countdown.querySelector(".countdown-track");
    if (track) track.innerHTML = "<i></i>";
    for (let number = 3; number >= 1; number -= 1) {
      countNumber.textContent = String(number);
      countCopy.textContent = number === 3 ? "Pilotlar hazır. Arenaya giriş başlıyor." :
        number === 2 ? "Motorlar çalışıyor. Pozisyonunu al." : "3… 2… 1… HAYATTA KAL!";
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdown.hidden = true;
    countdownPromise = null;
  })();
  return countdownPromise;
};
