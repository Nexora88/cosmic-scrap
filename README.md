# Cosmic Scrap

**A neon-minimal browser survivor in a black cosmic void.** Move a glowing core, auto-fire at enemies, collect scrap, and build a different weapon combination each run.

## Play
- Live game: https://nexora88.github.io/cosmic-scrap/
- **Offline / local play** works without an account (static site on GitHub Pages).
- **Optional online** (lazy-loaded): account, profile, friends, invite rooms, async score challenges. Requires Supabase configuration; see [docs/ONLINE-COOP-SETUP.md](docs/ONLINE-COOP-SETUP.md).
- Real-time shared-arena co-op (two players in one simulation) is **not** shipped yet — see [docs/ONLINE_ROADMAP.md](docs/ONLINE_ROADMAP.md).

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
- First-run field guide, death diagnosis, pause telemetry, bilingual UI foundation
- Starfield atmosphere; sound / vibration / reduced-flash settings
- Local save import/export (device-local; not full cloud sync of Core/upgrades yet)

## Optional online foundation
- Supabase Auth + profiles, friend requests, invite codes, matchmaking queue UI
- Asynchronous room challenges: each player runs solo, submits a score; room closes when both results arrive
- Global / friends leaderboard from submitted personal bests
- **Not yet:** host-authoritative real-time co-op, trusted anti-cheat, full local-save cloud sync

Details: [ONLINE-COOP-ARCHITECTURE.md](docs/ONLINE-COOP-ARCHITECTURE.md), [ONLINE_ROADMAP.md](docs/ONLINE_ROADMAP.md), [COMMUNITY-AND-MATCHES.md](docs/COMMUNITY-AND-MATCHES.md).

## Progression
Permanent upgrades include starting health, damage, idle recycling, **Move Speed** and **Scrap Magnet**. Run scrap converts to banked Scrap Core at run end (locally). Online profile data can persist across devices when configured; the full local progression blob is still primarily device-local.

## Run locally
Open `index.html` via a static server (ES modules). Offline play needs no backend.

```bash
npm test          # deterministic balance / regression checks
npm run check     # syntax check
```

Playtest lab: [tests/playtest.html](tests/playtest.html) — bot pressure probe, not a human difficulty rating.

## Quality and known gaps
Automated CI covers balance curves, mobile **browser emulation**, and stress JSON artifacts. The following remain **open release gates** (see [docs/PLAYTEST_LOG.md](docs/PLAYTEST_LOG.md) and [docs/ROADMAP.md](docs/ROADMAP.md)):

1. Human 4–6 minute playtest sessions logged
2. Boss kill-time sample (target: flag kills under ~5s for review)
3. Physical low-end Android FPS / thermal notes
4. Stacked-upgrade “screen clears while idle” check
5. Two-account verification of online auth, rooms, and score submit
6. Real-time co-op simulation (Phase 3)
7. Cloud sync of full local save

Do not claim balanced, 60 FPS, or cheat-proof ranked play without the matching evidence.

## Roadmap
- Core loop & validation: [docs/ROADMAP.md](docs/ROADMAP.md)
- Online phases: [docs/ONLINE_ROADMAP.md](docs/ONLINE_ROADMAP.md)
- Mechanics / design: [docs/MECHANICS.md](docs/MECHANICS.md), [docs/DESIGN.md](docs/DESIGN.md)

Daily Challenge with server-authoritative scoring, cosmetics, and Steam packaging stay deferred until the solo loop is evidence-backed.

## Product principles
- Free-to-play prototype; no ads or pay-to-win
- Offline-first; online is optional
- Cosmetic-only monetization only after retention is proven
- Browser-first, lightweight, portable

## License
MIT — see `LICENSE`.
