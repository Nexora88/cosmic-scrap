const CACHE_PREFIX = "taviro-shell-";
// Bump this version when shipping a new shell so stale cached modules are replaced.
const CACHE_NAME = CACHE_PREFIX + "v7";
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
