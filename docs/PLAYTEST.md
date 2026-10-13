# Cosmic Scrap: repeatable balance playtest protocol

## Purpose and limits

Open `tests/playtest.html` on the deployed site or through a local HTTP server. This harness uses a deterministic kiting bot rather than a stationary player: it orbits around the arena, avoids nearby enemies and hostile shots, and steers away from the shrinking boundary. It is a repeatable pressure probe, not a human player model or proof that the game is balanced.

Run each scenario at least three times on each target device and save every JSON report. Each scenario has a fixed seed (baseline 1337, stacked 2026, low-end 9090), so gameplay results can be compared on the same code revision. Performance timing naturally varies by device and system load.

## Scenarios

- **Baseline bot:** normal progression and no injected upgrades; useful for survival time, boss cadence and the shape of incoming pressure.
- **Stacked upgrades:** injects a deliberately powerful combined build at every level-up (multi-shot, crit, chain, orbit, slow, nova and cascade). This is an intentionally extreme stress probe for the “screen clears itself” failure mode, not a fair build a player is guaranteed to obtain.
- **Low-end caps:** uses 180 enemies, 320 player shots, 100 hostile shots and 180 particles to compare update/draw cost under capped entity pressure.

## Metrics and how to read them

Reports include seed, controller, survival time, kills, level, score, damage taken, boss appearances/defeats and timestamps, enemy/projectile/particle peaks, checkpoint snapshots, nearby threats, average and 95th-percentile frame cost, and percentage of measured frames above 16.7 ms / 33 ms.

- **Balance:** compare survival time, health/damage, boss spawn and kill times, and checkpoint enemy counts. A stacked run that repeatedly leaves almost no nearby threats for long periods is evidence worth investigating, not automatic proof of a defect.
- **Boss cadence:** the first warning is expected around 107 seconds and the first boss around 110 seconds if the run survives. Record whether bosses appear and are defeated before drawing conclusions from runs that end early.
- **Performance:** compare p95 and the share of frames above 33 ms, not only average cost. These are JavaScript update + canvas draw timings, not FPS guarantees.
- **Repeatability:** compare the same scenario, seed, code revision, viewport, browser and device. Save each JSON report; do not tune from a single run.
- **Mobile:** on a physical low-end Android phone, use the same browser, orientation and power mode, close background apps, and repeat at least three times. Browser simulations on desktop do not establish phone performance.
- **Human boss check:** fight at least two bosses manually and record time-to-kill, remaining health, deaths and whether warnings/volleys are readable. Repeat with reduced-flash on and off.

## Release gate / manual checklist

- [ ] At least 3 baseline-bot runs; save reports.
- [ ] At least 3 stacked-upgrade runs; inspect whether late-game pressure remains meaningful.
- [ ] At least 3 low-end stress runs on a physical low-end Android phone.
- [ ] Record code revision, device/browser, test date, power mode, average and p95 frame cost, >16.7 ms and >33 ms percentages.
- [ ] Manually fight at least two bosses and check warning/volley readability.
- [ ] Check boss spawn/defeat, low-health feedback and storm visuals with reduced-flash on/off.
- [ ] Tune balance only after results are repeatable; re-run the same seeds after each balance change.

## Not implemented by this task

Daily Challenge and global leaderboards remain deferred. Before building them, specify a versioned deterministic score formula and seeded run generator, then add server-side run verification, rate limiting and a shared database. A client-side signature or score submission alone is not anti-cheat; secrets embedded in a static browser app can be extracted.
