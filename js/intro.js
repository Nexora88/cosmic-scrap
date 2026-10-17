(() => {
  const intro = document.getElementById("cinematic-intro");
  const enter = document.getElementById("intro-enter");
  const skip = document.getElementById("intro-skip");
  if (!intro || !enter || !skip) return;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    intro.classList.add("is-leaving");
    window.setTimeout(() => { intro.hidden = true; }, 750);
    try { sessionStorage.setItem("cosmic-scrap-intro-seen", "1"); } catch (_) {}
  };
  enter.addEventListener("click", dismiss);
  skip.addEventListener("click", dismiss);
  intro.addEventListener("keydown", event => {
    if (event.key === "Escape") dismiss();
  });
  try {
    if (sessionStorage.getItem("cosmic-scrap-intro-seen") === "1") {
      intro.hidden = true;
    }
  } catch (_) {}
})();