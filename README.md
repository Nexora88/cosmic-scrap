# TAVIRO

**One core. Infinite void.**

TAVIRO is an offline-first, browser-based space-survival game. Pilot a glowing core, survive escalating enemy waves, collect scrap and shape a different build during every run.

## Play

- Web build: https://nexora88.github.io/cosmic-scrap/
- Solo survival is the first-release experience.
- The game can be played without creating an account. Local progress remains on the device.
- An optional account enables supported online profile, cloud and leaderboard features when the connected services are available.
- The first release does **not** include playable Co-op. Co-op is shown as a future-update announcement; no release date is promised.
- No custom domain has been purchased or configured yet. Domain selection and purchase are intentionally deferred until the final release checks.

## Languages

The interface offers nine locales: English, Türkçe, Português (Brasil), Español, Русский, Bahasa Indonesia, Deutsch, Français and 日本語. Translation coverage is validated across the game shell, dynamically rendered screens, profile, support and privacy pages. Any remaining untranslated string is a release defect, not an accepted fallback.

## Controls

- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **Mobile joystick:** drag the left virtual stick
- **P / Escape:** pause or resume
- **Space / Enter:** start, resume or choose the first upgrade

## Current systems

- Canvas-based auto-fire combat with pooled objects and bounded entity counts
- Enemy archetypes, elite encounters, bosses and escalating regions
- Scrap XP, upgrades, combos, storms and run directives
- Career achievements, permanent Scrap Core progression and local saves
- Audio scenes with looping music beds and crossfaded transitions
- Vibration and reduced-flash accessibility settings
- Optional account, profile and shared leaderboard integration

## Score integrity and fair play

TAVIRO distinguishes score sources instead of presenting every number as equally trustworthy:

- **Casual records** are submitted by the game client. They are useful for personal/community comparison but are not replay-verified and must never be described as cheat-proof.
- **Ranked results** are intended to come from server-simulated matches. They must remain unavailable unless the server-side simulation, database migrations, permissions and end-to-end integration are deployed and verified together.
- A browser-side score, local save or client-reported statistic is never proof of a legitimate competitive result.
- Server-side ownership checks, bounded inputs, single-use match state, idempotent finalization, restricted database grants and abuse monitoring are part of the security boundary. Static source tests alone do not prove that production configuration is secure.

The project does not support score editing, injected results or unfair leaderboard manipulation. Suspected abuse should be reviewed through server-side evidence; client UI values must not be trusted as authority.

## Co-op and future development

Co-op is intentionally outside the first-release scope. The current game flow focuses on a stable solo experience. The codebase and design notes may retain future architecture, but the player-facing build must not expose inactive room creation, matchmaking or chat as shipped functionality. The “Coming Soon” notice is informational only.

Future updates remain possible after launch validation. This first release is a foundation, not a promise that development ends here.

## Run locally

Serve the repository as a static site so ES modules load correctly:

```bash
npm install
npm test
npm run check
npm run test:music
npm run test:desktop
npm run test:onboarding
npm run test:legal
```

Playtest lab: [tests/playtest.html](tests/playtest.html).

## Release validation

Automated browser tests and real-device evidence are tracked separately in [docs/RELEASE-VALIDATION-STATUS.md](docs/RELEASE-VALIDATION-STATUS.md).

Open release gates include:

1. Complete nine-locale visual review on every screen and secondary page.
2. Real-device music loop, gap and scene-transition checks (Android Chrome and iOS Safari).
3. Low-end physical Android performance, thermal behaviour and extended-session stability.
4. Human playtests and accessibility checks on desktop and phone.
5. Two-account verification of supported account and leaderboard flows.
6. Production Supabase migration, permission and server-authoritative Ranked verification.
7. Final privacy, support and publication disclosures.

Playwright mobile emulation is not a physical phone test. A passing automated suite does not certify real-device performance, audio quality or cheat-proof scoring.

## Community-led promotion

The initial launch plan is organic: social media, game communities and word of mouth. No paid advertising campaign or ad-network integration is planned for this first release. A domain purchase is a final launch task after the game and its publication information are ready.

## Project documents

- [Release validation status](docs/RELEASE-VALIDATION-STATUS.md)
- [Online roadmap](docs/ONLINE_ROADMAP.md)
- [Score trust audit](docs/PHASE3-SCORE-TRUST-AUDIT.md)
- [Playtest guide](docs/PLAYTEST.md)
- [Playtest log](docs/PLAYTEST_LOG.md)
- [Community safety](docs/COMMUNITY-SAFETY.md)

## License

MIT — see [LICENSE](LICENSE).
