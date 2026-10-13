# Roadmap

## Phase 1 — playable foundation
- [x] Canvas arena, movement, auto-fire, four enemy archetypes
- [x] Scrap pickups, level choices, combo, score and best-run tracking
- [x] Basic permanent meta progression and idle reward
- [x] Responsive HUD and touch movement

## Phase 2 — gameplay and UX quality pass
- [x] Object pools and entity caps (280 enemies / 560 projectiles / 320 particles)
- [x] Orbiting shield, Chain Lightning, Ion Trail, Nova Burst, Kill Cascade and Gravity Well
- [x] Common / Rare / Epic upgrade presentation and differentiated power
- [x] Procedural audio cues for combat, combos, upgrades and danger
- [x] Pause overlay with run telemetry, settings and return-to-menu flow
- [x] Sound, vibration and reduced-flash settings
- [x] Mobile virtual joystick with pointer capture and cancel handling
- [x] Death diagnosis with cause, nearest threat, safe-zone margin and record gap
- [x] Save import/export, reset and local storage migration
- [x] Additional permanent speed/pickup progression and more noticeable idle rewards
- [x] README reflects current implemented systems
- [x] Automated deterministic regression tests for spawn pacing, archetype probabilities and rarity boundaries
- [ ] Automated browser playthrough, accessibility and full gameplay regression tests
- [ ] Profile low-end mobile devices and tune effects/particle caps (no physical-device benchmark yet)
- [ ] Run repeated 4–6 minute human playtests for early/mid/late-game pacing, stacked-build screen clearing and rarity odds
- [ ] Measure boss encounter duration and pressure in baseline and stacked-upgrade runs; flag bosses defeated in under 5 seconds for review
- [ ] Verify the automated 300-second seeded stress scenarios produce complete reports before tuning balance

## Phase 3 — content and portability
- [ ] Seeded runs and daily challenge mode
- [x] Elite boss encounter with warning, escort shooters, boss projectiles, reward burst and recurring spawn pacing
- [ ] Validate elite boss as a memorable set-piece; tune only after kill-time and survival measurements
- [ ] Evaluate Steam packaging and platform requirements
- [ ] Cosmetic collection only after core gameplay is stable

## Release gates
Implemented does not mean fully validated. Do not claim stable 60 FPS without representative-device profiling. Steam and monetization considerations require separate platform review; any future monetization should remain cosmetic-only.
