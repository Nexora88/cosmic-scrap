# TAVIRO

**One core. Infinite void.** A browser-first, offline-capable cosmic survival game.

Move a glowing core, auto-fire at incoming threats, collect scrap, and build a different upgrade combination on every run.

## First release

- **Solo survival is the launch experience.** Offline play and local saves work without an account.
- Optional accounts support profile identity and online progress features where configured.
- The shared leaderboard displays client-reported casual records as provisional and unverified. Ranked competition remains locked until trusted server-side simulation is deployed.
- **Co-op is not part of the first release.** It is planned for a future update; its architecture and roadmap are retained, but no playable Co-op mode is advertised as available.
- No paid advertising campaign or custom domain is required for the current development phase. Initial discovery is planned through organic social posts and community sharing. Domain purchase is a final launch task.

## Controls

- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **Mobile joystick:** drag the left virtual stick; touch input resets on release/cancel
- **P / Escape:** pause or resume
- **Space / Enter:** start, resume, or choose the first upgrade

## Implemented solo systems

- Canvas-based auto-fire combat with capped entity counts and pooled objects
- Enemy archetypes, elite encounters and environmental events
- Scrap XP, upgrades, combos, storms and danger boundary
- Run directives, career achievements and persistent Scrap Core progression
- Local save import/export, accessibility settings and audio controls
- Nine-language localization foundation: English, Turkish, Brazilian Portuguese, Spanish, Russian, Indonesian, German, French and Japanese

## Leaderboard trust and anti-cheat status

The current casual leaderboard is **client-reported, provisional and unverified**. Authentication and database bounds do not prove that a submitted score came from an untampered game session. Ranked competition is deliberately hidden/locked: the repository's security migration blocks legacy client-score Ranked results and requires a trusted match server. Do not describe casual records as cheat-proof, prize-eligible or server-verified.

The first release displays an explicit provisional/unverified label for casual scores. Any future verified competitive mode must use server-authoritative simulation or independently validated replay/event evidence, strict per-run limits, duplicate/idempotency protection, rate limits, audit logging and abuse review. Client-side score increases must never be treated as proof. Do not promote casual scores to verified status without that evidence.

## Audio and device validation

Music tracks are configured to loop, and scene changes use the music controller's transition logic. Automated tests can validate code paths and browser-emulated behavior, but cannot establish gapless playback, thermal behavior, battery impact or long-session stability on physical devices.

Release evidence still required:
1. Real-device audio loop and scene-transition checks on Android and iOS browsers where available
2. Low-end Android performance, thermal and memory observations
3. Extended sessions with pause/resume, tab backgrounding and audio interruption
4. Human playtests on touch and keyboard controls
5. Regression checks for all nine locales across every screen and page

## Privacy, support and release information

- [Privacy notice](privacy.html)
- [Player support](support.html)
- [Online architecture and future roadmap](docs/ONLINE_ROADMAP.md)
- [Co-op architecture retained for future work](docs/ONLINE-COOP-ARCHITECTURE.md)

The privacy notice and support page describe the current web release. Before a public store release, confirm the actual data flows, account deletion process, retention periods, support contact route and applicable age/consent requirements. Do not treat a draft notice as legal approval.

## Run locally

Serve the repository root over HTTP so JavaScript modules can load.

```bash
npm test
npm run check
```

Browser playtest scripts and their reports are useful automated evidence, not substitutes for physical-device or human testing.

## Product principles

- Solo-first, offline-capable and free to access
- Organic community discovery before any paid promotion
- No pay-to-win mechanics
- Clearly labelled score trust levels; no unsupported anti-cheat claims
- Future features remain documented without being presented as shipped

## License

MIT — see [LICENSE](LICENSE).
