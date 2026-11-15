# Changelog

All notable changes are grouped under one unreleased heading until a tagged release is published. This avoids implying a release version or date that has not happened.

## [Unreleased]

### Gameplay
- Boss-gated sector expeditions: five themed regions rotate the arena atmosphere and introduce a region-specific enemy encounter; sector changes require both the 3.5-minute expedition mark and a boss victory.
- Sector transitions grant a small Scrap pickup and keep the existing combat, upgrade, and boss loop intact.
- Canvas-based auto-fire survival combat, enemy archetypes, scrap XP, upgrade choices, combos, storms, shrinking danger zone, local records and idle rewards.
- Elite boss encounters with warning telegraphs, escorts, phase-based movement and escalating spread volleys.
- Rift Weaver second boss with orbital movement, charge telegraphs and radial projectile patterns.
- Rift Surge arena event with three warning fields, a timed danger window and a bonus Scrap fragment.
- Rift Echo three-rank area-burst upgrade with protection against recursive kill chains.
- Three selectable run directives with live progress and persistent Scrap Core rewards.
- Six persistent career achievements and one-time Scrap Core rewards.
- UTC-rotating daily and weekly career missions (three daily, two weekly), cumulative run progress, claim-once Scrap Core rewards and nine-language mission copy.
- Daily mission progress participates in the versioned cloud-save merge; casual mission results are not trusted Ranked evidence.
- Add authenticated UTC daily-reward claims with row locking and same-day idempotency, separate account-bound Signal Points, and one-time 7-day / 30-day streak badges.
- Expand the pilot profile with server-earned badge collection, daily streak/points summary, total completed-run playtime and best level. Add all new profile and reward copy in nine locales.
- Keep offline guest streak rewards local; career run summaries remain casual client-reported stats and are not Ranked proof. The matching Supabase migration is prepared but not applied to production.

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
- The seeded Daily Challenge, seasonal cosmetic expansion and Steam packaging remain deferred. The existing shared solo-score board is a casual leaderboard, not trusted Ranked.

No general balance, low-end-phone performance or 60 FPS claim is made until the relevant evidence is recorded.
