import { translateText } from "./language.js";

const secureContext = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
let deferredInstallPrompt = null;
let installButton = null;
let installHint = null;

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
}

function renderInstallCopy() {
  if (!installButton || !installHint) return;
  installButton.textContent = translateText("INSTALL TAVIRO · OFFLINE");
  installHint.textContent = translateText("Install TAVIRO on your device for an app-like offline experience.");
}

function mountInstallControl() {
  const startButton = document.getElementById("start");
  if (!startButton || document.getElementById("taviro-install-control")) return;
  const wrapper = document.createElement("section");
  wrapper.id = "taviro-install-control";
  wrapper.className = "taviro-install-control";
  wrapper.setAttribute("aria-label", "TAVIRO app installation");
  installButton = document.createElement("button");
  installButton.id = "taviro-install-button";
  installButton.className = "taviro-install-button";
  installButton.type = "button";
  installHint = document.createElement("p");
  installHint.id = "taviro-install-hint";
  installHint.className = "taviro-install-hint";
  installHint.setAttribute("role", "status");
  installHint.setAttribute("aria-live", "polite");
  wrapper.append(installButton, installHint);
  startButton.insertAdjacentElement("afterend", wrapper);
  renderInstallCopy();

  if (isStandalone()) {
    wrapper.hidden = true;
    return;
  }

  installButton.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      installButton.disabled = true;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        installHint.textContent = choice?.outcome === "accepted"
          ? translateText("TAVIRO installation started.")
          : translateText("You can install TAVIRO later from your browser menu.");
      } catch {
        installHint.textContent = translateText("Open your browser menu and choose Install app or Add to Home screen.");
      } finally {
        installButton.disabled = false;
      }
      return;
    }

    const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
    installHint.textContent = translateText(isAppleMobile
      ? "On iPhone or iPad: tap Share, then Add to Home Screen."
      : "Open your browser menu and choose Install app or Add to Home screen.");
  });
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton) installButton.disabled = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const wrapper = document.getElementById("taviro-install-control");
  if (wrapper) wrapper.hidden = true;
});

window.addEventListener("cosmic-scrap:language-changed", renderInstallCopy);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountInstallControl, { once: true });
} else {
  mountInstallControl();
}

if (secureContext && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" })
      .catch(error => console.warn("TAVIRO offline shell registration failed:", error));
  }, { once: true });
}
