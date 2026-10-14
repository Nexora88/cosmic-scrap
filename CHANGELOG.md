# Changelog

All notable changes are grouped under one unreleased heading until a tagged release is published. This avoids implying a release version or date that has not happened.

## [Unreleased]

### Gameplay
- Canvas-based auto-fire survival combat, enemy archetypes, scrap XP, upgrade choices, combos, storms, shrinking danger zone, local records and idle rewards.
- Elite boss encounters with warning telegraphs, escorts, phase-based movement and escalating spread volleys.
- Rift Weaver second boss with orbital movement, charge telegraphs and radial projectile patterns.
- Rift Surge arena event with three warning fields, a timed danger window and a bonus Scrap fragment.
- Rift Echo three-rank area-burst upgrade with protection against recursive kill chains.
- Three selectable run directives with live progress and persistent Scrap Core rewards.
- Six persistent career achievements and one-time Scrap Core rewards.

### UX, progression and accessibility
- Responsive HUD, mobile joystick, pause telemetry, death diagnosis and fast restart.
- Persistent Scrap Core upgrades, clearer distinction between run Scrap and banked Core, and a first-run field guide.
- Common/Rare/Epic upgrade presentation, build synergies and a subtle procedural starfield.
- Sound, vibration and reduced-flash settings; procedural audio cues for combat, bosses, Rift events and progression.
- Save import/export and local save migration.

### Quality and validation
- Deterministic regression tests for balance curves, spawn pacing, boss rotation, Rift field bounds, event states, upgrade caps, directives and achievements.
- Automated mobile-browser emulation and seeded baseline, stacked-upgrade and low-cap stress scenarios, with JSON artifacts retained by CI.
- The mobile CI uses a Playwright Pixel 7 profile in headless Chromium. This is browser emulation, **not physical Android hardware**.
- Human playtests, ten manually timed boss encounters, stacked-build fairness confirmation, a physical low-end Android profile, manual accessibility review and phone-speaker audio QA remain release gates.
- Daily Challenge, global leaderboards, cosmetics and Steam packaging remain intentionally deferred.

No general balance, low-end-phone performance or 60 FPS claim is made until the relevant evidence is recorded.
