# Cosmic Scrap — Playtest Log

## What is recorded
The game can save the last 200 run summaries locally and export them as `cosmic-scrap-playtest-log.json`. The log includes timestamp, score, level, survival time, kills, bosses defeated, scrap collected, maximum combo and new-record status. It stays on the device unless explicitly exported.

## Baseline — 2026-10-14
- Automated regression tests: run by GitHub Actions; inspect the PR checks for current status.
- Mobile-like CI: simulated/emulated, not a physical phone measurement.
- Human 2–4 minute runs: **not yet recorded**.
- Physical low-end Android FPS: **not yet measured**.
- Boss kill-time distribution: **not yet measured**.
- Stacked-upgrade AFK clear rate: **not yet measured**.

## Manual run template
| Field | Value |
|---|---|
| Date / build SHA | |
| Device + browser | |
| Run duration (seconds) | |
| Score / level | |
| Kills / bosses defeated | |
| Boss time-to-kill (seconds) | |
| Peak FPS / noticeable drops | |
| Upgrade build | |
| Screen readability (1–5) | |
| Freeze, disconnect or other issue | |
| Tester notes | |

## Minimum useful sample
- Five 2–4 minute runs on a mid-range device.
- Three runs on a lower-end Android device, including reduced-flash mode.
- Five boss encounters with spawn time, kill time, remaining player health and readability notes.
- Three stacked-upgrade runs to check whether the player can remain idle while clearing threats.
- Test rooms with two authenticated accounts; a single-browser smoke test is not co-op validation.