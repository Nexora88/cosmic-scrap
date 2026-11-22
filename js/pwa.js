const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";

// Leave installation to the browser's native PWA UI. Do not intercept
// native install event: supported browsers can then show their own install
// affordance in the address bar or browser menu.
if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .then(registration => {
        // Soundtracks are optional and must never delay installation or startup.
        const requestMusicCache = () => registration.active?.postMessage({ type: "TAVIRO_CACHE_MUSIC" });
        if (registration.active) requestMusicCache();
        else navigator.serviceWorker.addEventListener("controllerchange", requestMusicCache, { once: true });
      })
      .catch(error => console.warn("[TAVIRO] Service worker registration failed:", error));
  }, { once: true });
}
