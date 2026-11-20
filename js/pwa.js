const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";

// Keep TAVIRO installable as a standards-based PWA. Installation is initiated
// entirely by the browser UI (address-bar install affordance or browser menu);
// the game page intentionally contains no install button, banner, or helper copy.
if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => {
        const requestMusicCache = () => registration.active?.postMessage({ type: "TAVIRO_CACHE_MUSIC" });
        if (registration.active) requestMusicCache();
        else navigator.serviceWorker.addEventListener("controllerchange", requestMusicCache, { once: true });
      })
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  }, { once: true });
}
