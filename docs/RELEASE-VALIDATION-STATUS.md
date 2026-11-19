# TAVIRO release validation status

Last reviewed: 2026-11-19

This document separates automated source/browser checks from evidence that requires people, real devices or a deployed backend. An empty evidence record is **not** a pass. Do not fill records with estimates or generated values.

## Automated checks

| Check | Evidence | Status |
|---|---|---|
| Deterministic regression suite | GitHub Actions test output for the exact commit | Run on PR; inspect results |
| JavaScript syntax check | GitHub Actions syntax output | Run on PR; inspect results |
| Nine-locale dictionary coverage | `tests/globalization.test.js` plus first-release scope tests | Automated source coverage; visual review still required |
| Legal/support locale dictionaries | `tests/legal-pages.test.js` and browser test | Automated source/browser coverage; human language review still required |
| Music scene transitions and loop configuration | `tests/music-playtest.mjs` | Browser automation only; physical audio quality not certified |
| Mobile navigation, HUD and input | `tests/mobile-playtest.mjs` | Pixel 7 Chromium emulation only; not physical Android evidence |
| Desktop browser smoke test | Desktop Playwright run artifacts | Run and review for the tested commit |
| Leaderboard trust labels | `tests/leaderboard-trust.test.js` | Static contract coverage; not a proof of production backend security |
| PWA manifest/service-worker source checks | `tests/pwa-release.test.js` | Run on the release candidate |
| Android Chrome / iOS Safari install and offline launch | Physical device evidence | Open — no physical-device sign-off recorded |

## Human and physical-device gates

| Gate | Required evidence | Status |
|---|---|---|
| Full localization review | Open every menu, overlay, dynamically generated panel, profile, privacy and support page in all nine languages; check clipping, missing strings and incorrect context | **Open — automated key coverage is not a native-speaker visual review** |
| Music loop and transitions | Listen on a real Android phone and iPhone; confirm loop boundaries, no silence/clicks, correct scene return, volume and background/resume behaviour | **Open — browser test cannot certify device audio** |
| Mobile performance | At least 3 sessions on a named low-end Android device; record FPS/frame-time, memory trend, thermal behaviour, battery impact and errors | **Open — browser emulation is not hardware evidence** |
| Extended session | At least one 30-minute session per target platform; record pauses, background/foreground, audio, timer drift, memory growth and any freezes | **Open — no physical long-session evidence recorded** |
| Human playtest | At least 5 willing testers, each 4–6 minutes; anonymized completed logs using `docs/PLAYTEST-LOG-TEMPLATE.md` | **Open — no new verified sessions recorded here** |
| Boss kill time | 10 manually timed encounters across baseline and stacked builds; investigate every kill under 5 seconds | **Open — manual timings required** |
| Stacked-build fairness | At least 3 seeded runs plus human observations that movement and threat-reading still matter | **Open — automation alone is not sign-off** |
| Manual accessibility | Complete the checklist in `docs/PLAYTEST.md` on desktop and a real phone | **Open — checklist must be performed** |
| Account and leaderboard integration | Two test accounts; verify auth, ownership, casual label, Ranked server simulation and denial of unauthorized writes against the configured Supabase project | **Open — source code alone does not prove deployed configuration** |

## Score integrity policy

- Casual scores are client-reported and must remain labelled **unverified**. They are not suitable for prizes or claims of cheat-proof competition.
- Ranked results may be labelled verified only when the server simulation, deployed migrations, RPC grants, match lifecycle and end-to-end tests all pass together.
- Local saves and browser UI values are not trusted evidence.
- Do not silently promote legacy client-submitted scores into verified Ranked records.
- Any suspected score manipulation must be handled through server-side logs and authoritative match data, not client-provided screenshots or values.

## First-release scope

- First release: solo survival, local progression and supported optional account/leaderboard features.
- Co-op: **not included in the first release**. The in-game “Coming Soon” notice is informational; room creation, matchmaking and chat are not advertised as live features.
- Promotion: community and social channels; no paid ad campaign or third-party ad network is planned for the first release.
- Domain: purchase/configuration is deferred until release validation and publication details are complete.

## Recording rules

1. Use `docs/PLAYTEST-LOG-TEMPLATE.md` once per real session. Use tester codes, never names or contact details.
2. Record the tested commit and distinguish physical Android/iOS from browser emulation.
3. Attach CI JSON reports and logs to the run or release record; a missing artifact is not a pass.
4. Change balance only after repeated evidence, then rerun comparable seeds.
5. Keep competitive features gated on server-authoritative verification and reviewed integration evidence.

## Release decision

**No release sign-off is asserted by this document.** Automated checks, human sessions, manually timed encounters, physical-device profiling, manual accessibility review, phone-speaker checks and deployed-backend verification are separate evidence gates. A green CI run cannot substitute for the human or physical-device checks.
