# Roadmap

Product goal: make Cosmic Scrap a highly replayable, instantly understandable, browser-first survivor game that feels great on desktop and mobile. Prioritize strong moment-to-moment combat, readable danger, meaningful build choices, fast restarts and proven performance over feature count. Do not claim balance or device performance without evidence.

## Phase 1 — playable foundation
- [x] Canvas arena, movement, auto-fire, four enemy archetypes
- [x] Scrap pickups, level choices, combo, score and best-run tracking
- [x] Basic permanent meta progression and idle reward
- [x] Responsive HUD and touch movement

## Phase 2 — gameplay and UX quality pass
- [x] Object pools and entity caps (280 enemies / 560 projectiles / 320 particles)
- [x] Orbiting Shield, Chain Lightning, Ion Trail, Nova Burst, Kill Cascade and Gravity Well
- [x] Common / Rare / Epic upgrade presentation and differentiated power
- [x] Procedural audio cues for combat, combos, upgrades and danger
- [x] Pause overlay with run telemetry, settings and return-to-menu flow
- [x] Sound, vibration and reduced-flash settings
- [x] Mobile virtual joystick with pointer capture and cancel handling
- [x] Death diagnosis with cause, nearest threat, safe-zone margin and record gap
- [x] Save import/export, reset and local storage migration
- [x] Additional permanent speed/pickup progression and more noticeable idle rewards
- [x] Deterministic regression tests for spawn pacing, archetype probabilities and rarity boundaries
- [x] Automated mobile-browser emulation harness for layout, controls, console errors, frame-cost samples and seeded scenarios
- [ ] Run repeated 4–6 minute human playtests (at least 5 sessions across early/mid/late game); log build choices, deaths, downtime, confusion and “screen clears itself” moments
- [ ] Boss kill-time validation: manually time at least 10 boss encounters across baseline and stacked builds; flag any kill under 5 seconds for review, but do not tune from one outlier
- [ ] Stacked-upgrade validation: run the seeded stacked scenario at least 3 times and review checkpoint enemy counts, damage taken, survival and boss duration; verify the game still asks players to move and react
- [ ] Physical low-end Android profiling: at least 3 runs of 4–6 minutes per representative device; record browser/device, thermal/power state, frame-time p50/p95, long frames, input lag and crashes
- [ ] Accessibility manual pass: keyboard-only start/pause/restart, visible focus, touch target reachability, text/health contrast, reduced-flash behavior, sound/vibration toggles and readable warnings at small viewport sizes
- [ ] Add a repeatable human-test results log and attach anonymized findings before changing balance
- [x] Add CI checks for required stress-report fields, all three scenario JSON reports, artifact presence and basic mobile keyboard/accessibility smoke checks (physical-device and human checks remain open)
- [ ] Verify the automated 300-second seeded stress scenarios produce complete reports on repeated CI runs and review retained artifacts
- [ ] Review procedural sound quality on phone speakers/headphones; replace or layer cues only when it materially improves combat readability

## Phase 3 — replayability and content (after Phase 2 evidence)
- [x] Add a distinct second boss, the Rift Weaver, with orbital movement, charge telegraph and expanding radial projectile rings
- [x] Add a limited Rift Surge event with three telegraphed hazard fields, readable counterplay and a bonus scrap fragment
- [x] Add a three-rank Rift Echo combat build path with bounded area bursts and recursion protection
- [ ] Validate boss kill times, event fairness and Rift Echo power across repeated human sessions before calling balance complete
- [ ] Validate progression and rarity over repeated runs before adding more upgrades or raising enemy counts
- [ ] Seeded daily challenge only after deterministic runs and a versioned scoring formula are stable
- [ ] Global leaderboard only after server-side score validation, rate limiting, abuse monitoring and a trusted shared database exist
- [ ] Cosmetic skins only after core loop and retention are validated; cosmetics must not change combat power
- [ ] Evaluate Steam packaging only if player feedback and usage justify it; not a current release requirement

## Release gates
- [ ] No “balanced”, “smooth on low-end phones” or “60 FPS” claim without documented evidence on named test environments
- [ ] Boss encounter has readable warnings/attacks and is not routinely erased by stacked builds in under 5 seconds
- [ ] Stacked builds feel powerful without removing movement, threat-reading and survival decisions
- [ ] Human sessions report no blocker-level control, pause, restart or readability issues
- [ ] Accessibility checklist and known limitations are documented
- [ ] CHANGELOG reflects actual shipped changes, not planned work

## Explicitly deferred
Daily Challenge, global leaderboard, Steam packaging and cosmetic collection are intentionally not current priorities. First establish a compelling, fair core loop with repeatable evidence. Browser-first scope remains the default.
