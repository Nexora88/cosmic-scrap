const CACHE_PREFIX = "taviro-shell-";
// Bump this version when shipping a new shell so stale cached modules are replaced.
const CACHE_NAME = CACHE_PREFIX + "v10";
const AUDIO_CACHE_NAME = "taviro-audio-v1";
const OFFLINE_AUDIO_ASSETS = ["./assets/sounds/deep-space-drift.mp3","./assets/sounds/deep-space-assault.mp3","./assets/sounds/cosmic-pulse.mp3","./assets/sounds/unknown-planets.mp3","./assets/sounds/pulse-of-conflict.mp3","./assets/sounds/cosmic-confrontation.mp3","./assets/sounds/taviro-rarity-reveal.mp3"];

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./profile.html",
  "./privacy.html",
  "./support.html",
  "./about.html",
  "./manifest.webmanifest",
  "./css/variables.css",
  "./css/style.css",
  "./css/ui.css",
  "./css/intro.css",
  "./css/loadouts.css",
  "./css/coop.css",
  "./css/legal.css",
  "./profile.css",
  "./profile.js",
  "./js/cloud-account.js",
  "./js/config.js",
  "./js/core/Camera.js",
  "./js/core/EventBus.js",
  "./js/core/Game.js",
  "./js/core/Input.js",
  "./js/core/Loop.js",
  "./js/entities/Enemy.js",
  "./js/entities/Particle.js",
  "./js/entities/Player.js",
  "./js/entities/Projectile.js",
  "./js/entities/XPOrb.js",
  "./js/intro-and-match.js",
  "./js/language.js",
  "./js/legal-pages.js",
  "./js/legal-translations.js",
  "./js/about-translations.js",
  "./js/main.js",
  "./js/online-hub.js",
  "./js/optional-online-loader.js",
  "./js/pwa.js",
  "./js/systems/Achievements.js",
  "./js/systems/Balance.js",
  "./js/systems/CapsuleCollection.js",
  "./js/systems/CosmeticCatalog.js",
  "./js/systems/CloudSave.js",
  "./js/systems/CombatSystem.js",
  "./js/systems/ComboSystem.js",
  "./js/systems/Contracts.js",
  "./js/systems/Cosmetics.js",
  "./js/systems/DailyMissions.js",
  "./js/systems/DailyStreak.js",
  "./js/systems/Encounters.js",
  "./js/systems/EnemySpatialGrid.js",
  "./js/systems/FrontierCommand.js",
  "./js/systems/FrontierMap.js",
  "./js/systems/IdleSystem.js",
  "./js/systems/MetaProgression.js",
  "./js/systems/Music.js",
  "./js/systems/Planetary3D.js",
  "./js/systems/PlanetaryTravel.js",
  "./js/systems/PromoCampaigns.js",
  "./js/systems/RegionBackdrop.js",
  "./js/systems/RegionProgress.js",
  "./js/systems/Regions.js",
  "./js/systems/ScoreSystem.js",
  "./js/systems/SocialShare.js",
  "./js/systems/SectorTransition.js",
  "./js/systems/SharedGalaxy.js",
  "./js/systems/SpawnSystem.js",
  "./js/systems/UpgradeEffects.js",
  "./js/systems/UpgradeSystem.js",
  "./js/ui/ClassicSections.js",
  "./js/ui/DeathScreen.js",
  "./js/ui/HUD.js",
  "./js/ui/HousePromoOverlay.js",
  "./js/ui/HousePromos.js",
  "./js/ui/HubPages.js",
  "./js/ui/LevelUpScreen.js",
  "./js/ui/MainMenu.js",
  "./js/ui/ScrapCapsules.js",
  "./js/ui/UpgradeMenu.js",
  "./js/utils/Audio.js",
  "./js/utils/MathUtils.js",
  "./js/utils/Neon.js",
  "./js/utils/ObjectPool.js",
  "./js/utils/Random.js",
  "./js/utils/Storage.js",
  "./assets/taviro-logo.svg",
  "./assets/taviro-mark.svg",
  "./assets/flags/br.svg",
  "./assets/flags/de.svg",
  "./assets/flags/es.svg",
  "./assets/flags/fr.svg",
  "./assets/flags/id.svg",
  "./assets/flags/jp.svg",
  "./assets/flags/ru.svg",
  "./assets/flags/tr.svg",
  "./assets/flags/us.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (let offset = 0; offset < CORE_ASSETS.length; offset += 12) {
      await cache.addAll(CORE_ASSETS.slice(offset, offset + 12));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type !== "TAVIRO_CACHE_OFFLINE_AUDIO") return;
  const port = event.ports?.[0];
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      let completed = 0;
      for (const asset of OFFLINE_AUDIO_ASSETS) {
        const request = new Request(asset, { cache: "reload" });
        const existing = await cache.match(request);
        if (!existing) {
          const response = await fetch(request);
          if (!response.ok) throw new Error("Audio download failed: " + asset);
          await cache.put(request, response);
        }
        completed += 1;
        port?.postMessage({ type: "progress", completed, total: OFFLINE_AUDIO_ASSETS.length });
      }
      port?.postMessage({ type: "complete", total: OFFLINE_AUDIO_ASSETS.length });
    } catch (error) {
      port?.postMessage({ type: "error", message: error?.message || "Offline music download failed." });
    } finally {
      port?.close();
    }
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match("./index.html"));
      }
    })());
    return;
  }

  const isAudio = request.destination === "audio" || /\.mp3$/i.test(url.pathname);
  if (isAudio) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const fullRequest = new Request(url.href, { method: "GET", credentials: "same-origin" });
      let cached = await cache.match(fullRequest);
      if (!cached) {
        try {
          const response = await fetch(fullRequest);
          if (!response.ok) return response;
          await cache.put(fullRequest, response.clone());
          cached = response;
        } catch {
          return Response.error();
        }
      }
      const range = request.headers.get("range");
      if (!range) return cached;
      const match = /^bytes=(\\d*)-(\\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416 });
      const body = await cached.arrayBuffer();
      const total = body.byteLength;
      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : total - 1;
      if (!match[1] && match[2]) start = Math.max(0, total - Number(match[2]));
      end = Math.min(end, total - 1);
      if (start > end || start >= total) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total } });
      const headers = new Headers(cached.headers);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Range", "bytes " + start + "-" + end + "/" + total);
      headers.set("Content-Length", String(end - start + 1));
      return new Response(body.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
    })());
    return;
  }

  const isStaticAsset = ["script", "style", "image", "font", "worker"].includes(request.destination)
    || /\.(?:js|css|svg|png|webp|woff2?)$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
