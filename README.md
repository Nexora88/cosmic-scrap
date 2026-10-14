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
- Canvas-based auto-fire combat with capped entity counts and pooled objects
- Normal, fast, swarm, tank, heavy tank, ranged shooter, long-range sniper, explosive runner, squad spawner and timed elite boss encounters
- Elite warnings before boss arrivals, boss health bars, three-shot volleys, escort shooter squads and bonus scrap for boss kills
- Scrap pickups, quick first level (12 XP), then steeper 12 × level^1.65 progression and per-card rarity odds: Common 73%, Rare 22%, Epic 5%
- Orbiting Shield, Chain Lightning, Ion Trail, Nova Burst, Kill Cascade and Gravity Well, including Chain + Crit and Orbit + Slow synergies
- Thicker neon projectile trails, large boss death bursts, critical-hit effects, stronger storm pulses and low-health red-edge feedback
- Procedural sound cues for combat, combos, upgrades, storm warnings, boss arrivals/defeats and low-health danger
- Escalating storm cycles, shrinking danger boundary and sharper late-game ranged/summoner pressure
- Pause telemetry, settings, sound, vibration and reduced-flash options
- Death diagnosis, closest-threat distance, safe-zone margin, run stats and record gap
- Scrap Core meta progression, offline idle rewards, save import/export and reset
- First-run field guide for movement, scrap collection, and build-synergy choices
- Subtle animated starfield that adds depth while preserving the low-distraction neon-minimal look
- Death recap explicitly reports Scrap Core earned and the persistent banked balance
- Responsive HUD and touch-friendly joystick controls

## Progression
Permanent upgrades include starting health, damage, idle recycling, **Move Speed** and **Scrap Magnet**. For new players, prioritize movement to preserve escape routes, then pickup range to collect without walking into danger; adapt this order if survival is already comfortable. Try different in-run combinations such as Orbit + Gravity Well or Chain Lightning + Critical Spark to reduce repetition.

Run scrap is converted to permanent Scrap Core at run end (currently one Core per 10 collected scrap, with a minimum of one Core per completed run). The banked Core and permanent ranks survive death and are stored locally in the browser. Idle rewards are capped at eight hours. Export a save before clearing browser data.

## Run locally
Open index.html in a modern browser or serve the repository with any static file server. ES modules may require a local HTTP server depending on browser policy.

## Quality and performance
Standard profile caps at 280 enemies, 560 player projectiles and 320 active particles; low-end devices use reduced limits. Run `npm test` for deterministic pacing and rarity checks and `npm run check` for the main entry syntax check. Open [the browser Balance Playtest Lab](tests/playtest.html) for repeatable seeded baseline-bot, stacked-upgrade and low-end-cap simulations; see [the playtest protocol](docs/PLAYTEST.md) for metrics and the physical-phone checklist. The bot is a repeatable pressure probe, not a human difficulty rating. Harness timings sample JavaScript update + canvas draw cost every 12 simulated frames to keep automated runs bounded; they are not display FPS and are not a substitute for manual gameplay or real-device profiling.

## Roadmap
See docs/ROADMAP.md, docs/DESIGN.md and docs/MECHANICS.md. Daily seeded runs and global leaderboards remain future work because they need a trusted shared-score service.

## Product principles
- Free-to-play prototype; no ads or pay-to-win purchases
- No real-money economy; cosmetic-only monetization is a future possibility
- Browser-first, lightweight and portable

## License
MIT — see LICENSE.
