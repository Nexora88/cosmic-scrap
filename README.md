# Cosmic Scrap

**A neon-minimal browser survivor in a black cosmic void.** Move a glowing core, auto-fire at enemies, collect scrap, and build a different weapon combination each run.

## Play
- Live game: https://nexora88.github.io/cosmic-scrap/
- **Offline / local play** works without an account (static site on GitHub Pages).
- **Competitive hub** (lazy-loaded): Global, Türkiye, Friends and Season tabs; country flags, pilot avatars, league/level details and a top-three podium. Free account required for country/friends/season rankings and Ranked.
- **Ranked Duel beta**: server-simulated random 1v1 survival. Both pilots enter the same arena; last survivor wins, then score and damage break ties. Seasonal rating and leagues are updated by the trusted match finalizer. Two-account and physical-device verification remain release gates; see [docs/ONLINE-COOP-SETUP.md](docs/ONLINE-COOP-SETUP.md).

## Controls
- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **Mobile joystick:** drag the left virtual stick; touch input resets on release/cancel
- **P / Escape:** pause or resume
- **Space / Enter:** start, resume, or choose the first upgrade

## Implemented systems (solo)
- Canvas-based auto-fire combat with capped entity counts and pooled objects
- Enemy archetypes including ranged shooter, sniper, exploder, spawner, tank+
- Elite and Rift Weaver bosses, Rift Surge event, Rift Echo build path
- Scrap XP, Common/Rare/Epic upgrades, combos, storms, danger boundary
- Run directives, career achievements, Scrap Core meta, idle rewards
- First-run field guide, daily objective panel, seven-sector / six-boss atlas, death diagnosis, pause telemetry, bilingual UI foundation
- Starfield atmosphere; sound / vibration / reduced-flash settings
- Local save import/export plus revision-checked account cloud saves; offline progress remains playable and queues for sync


## Shared galaxy (account-linked online frontier)
- The **Ortak Galaksi** button opens a responsive strategic map; Canvas is limited to the star/sector visualization while actions, stats, and accessible controls remain HTML.
- The proposed database migration `supabase/migrations/20261018000000_shared_galaxy.sql` adds account-bound home sectors, server-validated expansion/build RPCs, persistent resources, alliance requests, RLS, and Realtime publication.
- Requires a signed-in account and the migration applied to the connected Supabase project. Offline/local play remains available without it.
- This is a persistent shared sector map, not yet a server-run tactical battle simulation; NPC pressure is not running as a continuously hosted world process.

## Shared leaderboard
- Global, Türkiye and accepted-Friends tabs compare best solo-run scores. The Season tab uses the separate server-finalized Ranked rating.
- Every leaderboard entry shows country flag, avatar, pilot name, league, level and score/rating; the top three use a podium layout.
- Ranked pairs pilots with a nearby rating, simulates a shared survival arena on the server and awards seasonal rating after the match. The first ten matches are provisional.
- Solo leaderboard scores remain client-reported and are not cheat-proof or suitable for prizes. Ranked is a beta pending two-account / two-device verification.
- Co-op Defense, friend chat and invite rooms remain unavailable.

See [docs/ONLINE-COOP-SETUP.md](docs/ONLINE-COOP-SETUP.md) for setup and known limits.

## Progression
Permanent upgrades include starting health, damage, idle recycling, **Move Speed** and **Scrap Magnet**. Run scrap converts to banked Scrap Core at run end. Signed-in accounts use revision-checked full-save snapshots to merge career progression, cosmetics and daily objective progress across devices. Offline progress remains local-first and sync retries on reconnect or tab return.

## Run locally
Open `index.html` via a static server (ES modules). Offline play needs no backend.

```bash
npm test          # deterministic balance / regression checks
npm run check     # syntax check
```

Playtest lab: [tests/playtest.html](tests/playtest.html) — bot pressure probe, not a human difficulty rating.

## Quality and known gaps
Automated CI covers balance curves, mobile **browser emulation**, and stress JSON artifacts. The following remain open release gates (see [docs/PLAYTEST_LOG.md](docs/PLAYTEST_LOG.md) and [docs/ROADMAP.md](docs/ROADMAP.md)):

1. Human 4–6 minute playtest sessions logged
2. Boss kill-time sample (target: flag kills under ~5s for review)
3. Physical low-end Android FPS / thermal notes
4. Stacked-upgrade “screen clears while idle” check
5. Two-account verification of online auth and shared score submit
6. Real-time Co-op Defense shared simulation
7. Trusted real-time Ranked Duel and rating validation
8. Two-account verification of country privacy, all four leaderboard scopes and Ranked match results
9. Daily reward streaks and reward-wallet integration

Do not claim balanced, 60 FPS, or cheat-proof ranked play without the matching evidence.

## Roadmap
- Core loop & validation: [docs/ROADMAP.md](docs/ROADMAP.md)
- Online modes and phases: [docs/ONLINE_ROADMAP.md](docs/ONLINE_ROADMAP.md)
- Online trust boundaries: [docs/ONLINE-COOP-ARCHITECTURE.md](docs/ONLINE-COOP-ARCHITECTURE.md)
- Mechanics / design: [docs/MECHANICS.md](docs/MECHANICS.md), [docs/DESIGN.md](docs/DESIGN.md)

Daily objectives remain local-first and included in versioned cloud saves. Ranked matchmaking and its server-owned duel loop are now wired into the feature branch, but require two-account verification before release; daily claim streaks and reward-wallet integration remain the next progression task. The seven-destination hub uses focused in-page screens with a cinematic industrial hangar theme; Co-op remains unavailable.

## Product principles
- Free-to-play prototype; no third-party ad network or pay-to-win. The standalone build may show optional first-party Cosmic Scrap announcements.
- Offline-first; online is optional
- Cosmetic-only monetization only after retention is proven
- Browser-first, lightweight, portable

## License
MIT — see `LICENSE`.
