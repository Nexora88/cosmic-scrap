# Cosmic Scrap — Playtest Log

## Evidence policy
This file records observed results, not planned or simulated results. Never invent test results or mark a release gate complete from browser emulation alone. Keep personal identifiers out of exported logs; record device model and browser version only when useful.

The game can save the last 200 run summaries locally and export them as `cosmic-scrap-playtest-log.json`. The log includes timestamp, score, level, survival time, kills, bosses defeated, scrap collected, maximum combo and new-record status. It remains on the device unless explicitly exported.

## Baseline — 2026-10-17
- Automated regression tests: check current GitHub Actions results before release.
- Mobile-like CI: simulated/emulated; not a physical-phone measurement.
- Human 4–6 minute playtests: **not yet evidenced here**.
- Boss kill-time sample (minimum 10 encounters): **not yet evidenced here**.
- Stacked-upgrade AFK screen-clear check (minimum 3 runs): **not yet evidenced here**.
- Physical low-end Android FPS and thermal notes (minimum 3 runs per representative device): **not yet evidenced here**.
- Manual accessibility pass: **not yet evidenced here**.
- Phone-speaker audio QA: **not yet evidenced here**.
- Two-account online flow tests: **not yet evidenced here**.

## Human run template
Copy one section per session. Aim for at least five sessions of 4–6 minutes covering early, mid and late run states.

| Field | Value |
|---|---|
| Date / build SHA | |
| Session number (1–5+) | |
| Device + OS + browser | |
| Run duration (seconds) | |
| Score / level | |
| Kills / bosses defeated | |
| Build choices / upgrade stack | |
| Death cause / confusing moment | |
| Downtime or “screen clears itself” observation | |
| Readability (1–5) | |
| Control / pause / restart issues | |
| Tester notes (no personal identifiers) | |

## Boss kill-time template
Record at least 10 encounters across baseline and stacked builds. Flag every kill under 5 seconds for review; a flag is not by itself proof of a balance bug.

| # | Date / build SHA | Boss / build | Time to kill (s) | Player health remaining | Attack readability (1–5) | Review needed / notes |
|---:|---|---|---:|---:|---:|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |
| 8 | | | | | | |
| 9 | | | | | | |
| 10 | | | | | | |

## Physical low-end Android template
Run for 4–6 minutes at least three times per representative device. Do not infer physical performance from emulation.

| Run | Device / OS / browser | Power / thermal state | Frame-time p50 / p95 | Long frames / FPS drops | Input lag / crash |
|---:|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Stacked-build AFK check
Run the seeded stacked scenario at least three times. Record checkpoint enemy counts, damage taken, survival, boss duration and whether threats are cleared without movement. Include the build SHA and scenario seed so results can be reproduced.

| Run | Build SHA / seed | Checkpoint enemy count | Damage taken | Boss duration | Cleared while idle? | Notes |
|---:|---|---:|---:|---:|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

## Accessibility and audio checklist
- [ ] Start, pause, resume and restart using keyboard only
- [ ] Visible focus and understandable control hints
- [ ] Touch targets reachable on a small viewport
- [ ] Text, health and danger contrast remains readable
- [ ] Reduced-flash setting reduces effects as expected
- [ ] Sound and vibration toggles work and persist as intended
- [ ] Warnings remain readable at small viewport sizes
- [ ] Phone speaker test: cues distinguish danger, upgrade and boss events without clipping or masking important feedback

## Online two-account test
Use two genuinely separate authenticated accounts and preferably two devices/browsers. Do not record email addresses or tokens.
- [ ] Sign-up / confirmation / sign-in for both accounts
- [ ] Profile persistence after refresh and new session
- [ ] Join-by-code and invalid/expired room behavior
- [ ] Room expiry and presence cleanup
- [ ] Disconnect / reconnect behavior
- [ ] Both async challenge results submit and resolve correctly

## Sign-off
A release gate is complete only when the corresponding dated results, tested build SHA, and reviewer decision are recorded. Open gates remain open until evidence is attached.