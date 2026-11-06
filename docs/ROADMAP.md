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
- [x] Implement the pre-run pilot-skin and flag collection; cosmetics remain visual-only and never change combat power. Continue validating unlock pacing and usability during playtests.
- [ ] Evaluate Steam packaging only if player feedback and usage justify it; not a current release requirement

## Release gates
- [ ] No “balanced”, “smooth on low-end phones” or “60 FPS” claim without documented evidence on named test environments
- [ ] Boss encounter has readable warnings/attacks and is not routinely erased by stacked builds in under 5 seconds
- [ ] Stacked builds feel powerful without removing movement, threat-reading and survival decisions
- [ ] Human sessions report no blocker-level control, pause, restart or readability issues
- [ ] Accessibility checklist and known limitations are documented
- [ ] CHANGELOG reflects actual shipped changes, not planned work

## Explicitly deferred
Daily Challenge, global leaderboard and Steam packaging remain deferred. The cosmetic collection is implemented; further expansion waits for playtest evidence. First establish a compelling, fair core loop with repeatable evidence. Browser-first scope remains the default.


## Product navigation direction — 2026-11-02
The main hub now has a seven-destination navigation rail: Home, Battle, Galaxy, Rankings, Skin Shop, Career and Settings. It routes to existing features without pretending unfinished online modes are playable. Co-op and trusted Ranked remain locked until their online roadmap release gates are met.


## Release implementation — 2026-11-02

- [x] Removed the obsolete Cosmic Scrap trailer path. The only menu video feature is an optional Nexora project showcase with explicit playback, skip, Escape, focus return, focus containment, media-error feedback, Turkish/English copy and campaign rotation.
- [x] Cosmetic ownership/equipment validation centralized; unsupported cosmetic values and unowned equipment requests are rejected. Automated tests cover equip + reload persistence and invalid records.
- [x] Add an optional Nexora project showcase to the original one-page menu. The uploaded 33.9-second MP4 was SHA-256 matched to the local `Nexora AI Reklam Türkçe.mp4` and is stored as `assets/promos/nexora-ai.mp4`; `Nexora Quant reklam.mp4` is a second campaign. The player can skip or switch projects, and the next opening rotates away from the last campaign. These are cross-project introductions, not Cosmic Scrap advertising or a game trailer.
- [ ] Collect five anonymized 4–6 minute human sessions. Automated testing separately produced ten boss kill-time records; these are bot telemetry, not human balance evidence.
- [ ] Complete three 4–6 minute physical low-end Android runs with frame-time p50/p95, long frames, input latency and thermal state. No Android device was attached to the Windows PC during this session; Playwright Pixel 7 emulation is not physical-device evidence.
- [x] Mirror the active Supabase online-match Edge Function v6 source in the repository and add static contract tests for JWT auth, origin allowlisting, bounded input, participant checks, throttling, versioned writes and trusted result finalization. This is not a player-facing Co-op/Ranked release.
- [x] Add a Windows Microsoft Edge desktop smoke test for seven-section navigation, no horizontal overflow, game start, keyboard pause/resume and settings return.
- [x] Run baseline, stacked and low-end 300-second-target stress scenarios five times each on the Windows host: 15/15 reports completed with deterministic same-seed outcomes and zero browser errors. Baseline and low-end runs ended at 163.1s and 112.3s; all stacked runs reached 300s. Ten automated boss kill-time records were captured (2.2s first boss, 5.2s second boss in each stacked run); the under-5-second review threshold is flagged. No balance/HP change was made without human feedback.
- [ ] Verify the expanded 15-report harness on repeated GitHub Actions runs and review the retained artifacts.
- [x] Lock down legacy `public.coop_matchmaking_queue`: RLS enabled; all direct grants removed from `anon`, `authenticated` and `service_role`; verified against live Supabase. The no-policy state is intentional because browser clients must not access the table directly.
- [x] Deploy online-match Edge Function v6 with a production/local origin allowlist and a streaming 8 KiB request-body limit. Live preflight checks confirmed the GitHub Pages origin is allowed and an unlisted origin is denied CORS access.
- [ ] Integrate the simplified HTTP-tick simulation with the browser UI, then complete two-account Co-op/Ranked reconnect, disconnect, result-finalization and isolation tests. Keep both modes unavailable until these pass.


## Steam and cross-platform release readiness
See [docs/STEAM-READINESS.md](STEAM-READINESS.md) for platform-by-platform acceptance criteria, current evidence boundaries and the Steam release checklist. Do not mark physical-device or native-platform gates complete based on browser emulation.
