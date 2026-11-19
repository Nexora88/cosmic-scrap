const CACHE_PREFIX = "taviro-shell-";
// Bump this version when shipping a new shell so stale cached modules are replaced.
const CACHE_NAME = CACHE_PREFIX + "v10";
const MUSIC_CACHE_NAME = CACHE_PREFIX + "music-v1";
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

const MUSIC_ASSETS = [
  "./assets/sounds/deep-space-drift.mp3",
  "./assets/sounds/deep-space-assault.mp3",
  "./assets/sounds/cosmic-pulse.mp3",
  "./assets/sounds/unknown-planets.mp3",
  "./assets/sounds/pulse-of-conflict.mp3",
  "./assets/sounds/cosmic-confrontation.mp3",
  "./assets/sounds/taviro-rarity-reveal.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (let offset = 0; offset < CORE_ASSETS.length; offset += 12) {
      await cache.addAll(CORE_ASSETS.slice(offset, offset + 12));
    }
    // Keep large audio downloads independent from the essential shell install.
    const musicCache = await caches.open(MUSIC_CACHE_NAME);
    await Promise.allSettled(MUSIC_ASSETS.map(async asset => {
      if (await musicCache.match(asset)) return;
      await musicCache.add(asset);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME && key !== MUSIC_CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function cachedAudioResponse(request, cached) {
  const range = request.headers.get("range");
  if (!range) return cached;
  const bytes = await cached.arrayBuffer();
  const size = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match || (!match[1] && !match[2])) {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
  }
  let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  let end = match[1] ? (match[2] ? Number(match[2]) : size - 1) : size - 1;
  end = Math.min(end, size - 1);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
  }
  const headers = new Headers(cached.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", "bytes " + start + "-" + end + "/" + size);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
}

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

  const isStaticAsset = ["script", "style", "image", "font", "worker", "audio"].includes(request.destination)
    || /\.(?:js|css|svg|png|webp|woff2?|mp3|ogg|wav|m4a)$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith((async () => {
    const cached = await caches.match(request) || (request.headers.has("range") ? await caches.match(new Request(url.href)) : null);
    if (cached) return request.headers.has("range") ? cachedAudioResponse(request, cached) : cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.status === 200) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
