# Cosmic Scrap: repeatable balance playtest protocol

## Purpose and limits
Open `tests/playtest.html` on the deployed site or through a local HTTP server. The automated harness uses a deterministic kiting bot; it is a repeatable pressure probe, not a human player model or proof that the game is balanced.

Run each automated scenario at least three times and save every JSON report. Fixed seeds make gameplay outcomes comparable on the same code revision; performance timing still varies by device and system load.

## Automated scenarios
- **Baseline bot:** normal progression and no injected upgrades; inspect survival, boss cadence and incoming pressure.
- **Stacked upgrades:** injects a deliberately powerful combined build at level-ups (multi-shot, crit, chain, orbit, slow, nova and cascade). This stress probe targets the “screen clears itself” failure mode.
- **Low-end caps:** uses reduced entity caps to compare update/draw cost under pressure.
- **Mobile-browser emulation:** checks mobile viewport/layout, canvas sizing, pause interaction, browser errors and sampled frame cost. Emulation is not physical-device evidence.

## Metrics and interpretation
The deterministic lab advances the simulation at 30 fixed steps per simulated second and renders/times canvas drawing every 6 steps (5 samples per simulated second) to keep automated runs bounded. The report records `simulationHz: 30` and `drawSampleEveryNSteps: 6`; average/p95 and long-frame shares describe sampled update+draw cost in this test harness, not real display FPS or 60 Hz device performance. Mobile viewport smoke-test RAF measurements are reported separately, and neither metric replaces physical-phone profiling.

Reports can include seed, controller, survival time, kills, level, score, damage taken, boss appearances/defeats and timestamps, entity peaks, checkpoints, nearby threats, average and p95 frame cost, and the share of frames above 16.7 ms / 33 ms.
- Compare p95 and long-frame share, not just average frame cost.
- If a stacked run repeatedly has almost no nearby threats, inspect pressure and decision-making before adjusting numbers.
- First boss warning is expected around 107 seconds and first boss around 110 seconds if the run survives; early-ended runs are not evidence of a missing boss.
- Flag boss kills under 5 seconds for review. This is an investigation threshold, not an automatic requirement to add HP.
- Never convert JavaScript update/draw timing into an FPS guarantee.

## Human playtest protocol (required)
1. Recruit willing testers with a mix of desktop and Android devices; do not tell them the “correct” build to pick.
2. Each session lasts 4–6 minutes, with at least five sessions total and repeated sessions after material balance changes.
3. Ask testers to think aloud where comfortable. Observe whether they understand movement, scrap, upgrade choices, storm danger, boss warning and restart without coaching.
4. Log chosen upgrades/synergies, time of first boss, boss kill duration, damage/deaths, periods where the screen feels empty or unreadable, missed telegraphs, control friction and the tester’s own difficulty rating.
5. Run baseline and stacked-upgrade comparisons. A strong build should feel powerful while still rewarding movement and threat-reading.
6. Do not infer a population-wide difficulty conclusion from one player or one run; look for repeated patterns across sessions.

## Physical Android performance protocol
- Use at least one genuinely low-end Android phone and repeat the 4–6 minute run at least three times.
- Record exact device model, Android version, browser version, viewport/orientation, power mode, battery/thermal state and background-app conditions.
- Measure perceived input lag, stutter, long frames, overheating warnings, browser reloads/crashes and control reachability.
- Keep emulation results and physical-phone results in separate records. Do not claim stable 60 FPS without representative-device profiling.

## Accessibility manual checklist
- [ ] Start, pause, resume and restart are possible using keyboard alone.
- [ ] Focus is visible and keyboard actions are not trapped.
- [ ] HUD, health, upgrade rarity and danger warnings remain readable at narrow mobile sizes.
- [ ] Critical information is not conveyed by color alone.
- [ ] Reduced-flash setting reduces intense screen effects; verify it during boss/storm sequences.
- [ ] Sound and vibration can be toggled independently and settings persist as intended.
- [ ] Touch controls remain usable without covering important HUD or upgrade choices.
- [ ] Pause/menu overlays can be opened and dismissed reliably; no controls are obscured by browser safe areas.

## Release checklist
- [ ] At least 3 baseline-bot runs with reports saved.
- [ ] At least 3 stacked-upgrade runs with reports saved and reviewed.
- [ ] At least 3 low-end-cap runs with reports saved.
- [ ] At least 5 human sessions of 4–6 minutes logged.
- [ ] At least 10 manually timed boss encounters across baseline and stacked builds; review every kill under 5 seconds.
- [ ] At least 3 physical low-end Android runs, each 4–6 minutes.
- [ ] Record code revision and test environment for each result.
- [ ] Re-run the same seeds after each balance change and compare reports.

## Deferred online features
Daily Challenge and global leaderboards remain deferred. Before implementation, define a versioned deterministic score formula and seeded run generator, then add server-side run verification, rate limiting, abuse monitoring and a shared database. A client-side signature or secret in a static browser app is not anti-cheat.
