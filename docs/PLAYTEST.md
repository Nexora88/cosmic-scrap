# Cosmic Scrap: repeatable playtest protocol

## What the browser harness measures

Open `tests/playtest.html` on the deployed site or through a local HTTP server. Run each scenario at least three times on each target device and save the JSON report.

- **Baseline:** unassisted normal build; observe survival and whether the first elite arrives around 110 seconds.
- **Stacked build:** injects a deliberately powerful combined build at each level-up (multi-shot, crit, chain, orbit, slow, nova and cascade) to probe the “screen clears itself” failure mode.
- **Low-end stress:** applies the game's low-end caps (180 enemies, 320 player shots, 100 hostile shots, 180 particles), then records update+draw timings and entity peaks.

Metrics include simulated duration, kill/level/score, boss encounters and kills, enemy/projectile/particle peaks, checkpoint snapshots, average and 95th-percentile frame cost, and percentage of measured frames above 16.7 ms / 33 ms.

## How to interpret results

- A boss that rarely appears because the run ends first is still a useful balance signal; record survival time and the last checkpoint.
- The stacked build is a stress probe, not a fair player build. If enemy counts repeatedly collapse toward zero after upgrades, the build is likely over-clearing.
- Browser timings are not FPS guarantees: they are the combined JavaScript update + canvas draw cost measured by this harness. Browser scheduling, display refresh, thermal throttling and background activity can change results.
- On a phone, use the same browser, orientation and power mode, close background apps, and repeat three times. Compare p95 and >33 ms share, not just the average.
- Test reduced-flash both on and off. Confirm the low-end profile remains responsive during storms, boss spawn/death effects and dense projectile patterns.

## Release gate / manual checklist

- [ ] At least 3 baseline runs on a representative desktop.
- [ ] At least 3 stacked-build runs; note whether late-game enemy pressure remains meaningful.
- [ ] At least 3 low-end stress runs on a physical low-end Android phone.
- [ ] Record actual device/browser, test date, power mode, average and p95 frame cost, >16.7 ms and >33 ms percentages.
- [ ] Fight at least two bosses manually: record time-to-kill, health remaining, deaths and whether warnings/volleys were readable.
- [ ] Verify boss spawn, boss defeat, low-health feedback and storm visuals with reduced-flash on/off.
- [ ] Only tune balance after results are repeatable across runs.

## Not implemented by this task

Daily Challenge and global leaderboards remain intentionally deferred. Before shipping them, specify a versioned deterministic score formula and seeded run generator, then add server-side run verification/rate limiting and a shared database. A client-side signature or score submission alone is not anti-cheat; secrets embedded in a static browser app can be extracted.
