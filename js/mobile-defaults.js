// Mobile-friendly defaults: vibration on + reduced effects on coarse pointers when unset.
(function () {
  try {
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (localStorage.getItem("cosmic-scrap-vibration") == null && coarse) {
      localStorage.setItem("cosmic-scrap-vibration", "on");
    }
    if (localStorage.getItem("cosmic-scrap-effects-mode") == null && coarse) {
      localStorage.setItem("cosmic-scrap-effects-mode", "reduced");
    }
  } catch (e) {}
})();
