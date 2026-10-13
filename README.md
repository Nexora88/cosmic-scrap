# Cosmic Scrap

**A neon-minimal browser survivor in a black cosmic void.** Move a glowing core, auto-fire at enemies, collect scrap, and build a different weapon combination each run.

## Play
- Live game: https://nexora88.github.io/cosmic-scrap/
- Dependency-free static web app; no build step or third-party runtime packages.
- GitHub Pages publishes the main branch through the repository workflow to gh-pages.

## Controls
- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **Mobile joystick:** drag the left virtual stick; touch input resets on release/cancel
- **P / Escape:** pause or resume
- **Space / Enter:** start, resume, or choose the first upgrade

## Implemented systems
- Canvas-based combat with auto-fire target range and projectile lifetime limits
- Normal, fast, tank, swarm and ranged shooter enemies; shooters hold distance and fire violet projectiles, with ranged pressure increasing later in a run
- Scrap pickups, a steeper 18 × level^1.45 XP curve, three-card upgrades and explicit per-card rarity odds: Common 73%, Rare 22%, Epic 5% (about 14.3% chance of at least one Epic in a three-card offer)
- Orbiting shield, Chain Lightning, Ion Trail, Nova Burst, Kill Cascade and Gravity Well
- Hit/kill particles, shockwaves, critical-hit effects, screen shake and procedural sound cues
- Cosmic Storm and shrinking danger boundary with damage feedback
- Pause overlay with run telemetry, settings menu, sound, vibration and reduced-flash options
- Death diagnosis: cause, closest enemy distance, safe-zone margin, run stats and record gap
- Scrap Core meta progression, offline idle rewards, save import/export and reset
- Responsive HUD and touch-friendly joystick controls

## Progression
Permanent upgrades include starting health, damage, idle recycling, movement speed and pickup range. Idle rewards are capped at eight hours. Progress is stored locally in the browser; export a save before clearing browser data.

## Run locally
Open index.html in a modern browser or serve the repository with any static file server. ES modules may require a local HTTP server depending on browser policy.

## Quality and performance
Entity caps are up to 280 enemies, 560 projectiles and 320 active particles, with object pools for frequently reused entities. Devices reporting 4 or fewer logical CPU cores or 4 GB or less memory use a reduced profile (180 enemies, 320 projectiles, 180 particles, and a 1× canvas pixel ratio). A deterministic Node test suite covers spawn pacing, ranged probability growth, difficulty scaling, XP thresholds and rarity boundaries. These checks do not simulate browser rendering and are not proof of stable 60 FPS on low-end devices; representative device profiling and hands-on playtests remain release gates.

## Roadmap
See docs/ROADMAP.md, docs/DESIGN.md and docs/MECHANICS.md. The roadmap distinguishes implemented work from items awaiting browser/device validation.

## Product principles
- Free-to-play prototype; no ads or pay-to-win purchases
- No real-money economy; cosmetic-only monetization is a future possibility
- Browser-first, lightweight and portable

## License
MIT — see LICENSE.
