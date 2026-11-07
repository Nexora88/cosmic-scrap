// Mobile defaults: vibration ON. Do NOT force reduced effects — line-art game stays full quality.
(function () {
  try {
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (localStorage.getItem("cosmic-scrap-vibration") == null && coarse) {
      localStorage.setItem("cosmic-scrap-vibration", "on");
    }
    // Clear previous auto-reduced default so phones run full quality again
    if (localStorage.getItem("cosmic-scrap-effects-mode") === "reduced") {
      const forced = localStorage.getItem("cosmic-scrap-effects-forced-reduced");
      if (forced !== "1") {
        localStorage.setItem("cosmic-scrap-effects-mode", "auto");
      }
    }
  } catch (e) {}
})();
