# Steam and cross-platform readiness

This document is an implementation and evidence checklist. A checked item means the corresponding test or packaging work exists; it does not imply physical-device certification.

## Current delivery boundary
- The shipped project is a browser-first HTML/Canvas game with localStorage progression.
- Current automated platform coverage is Chromium desktop and mobile-device emulation. It is not native Android, iOS, macOS or Windows certification.
- Steam packaging, native controller certification, platform achievements and cloud-save integration are not yet release-ready.

## Gameplay acceptance
- [ ] Fresh launch reaches the main menu without console or network errors
- [ ] Start enters an active run; movement and automatic fire work
- [ ] Enemy spawn, hit, defeat, scrap pickup and level-up choice work
- [ ] Death summary, return to menu and restart work repeatedly
- [ ] Seeded early/mid/late runs produce reproducible telemetry
- [ ] No progression or cosmetic state is lost after death/restart

## Input and accessibility
- [x] Keyboard movement and Escape pause/resume have desktop browser smoke coverage
- [x] Touch joystick drag/release and left/right placement have mobile browser emulation coverage
- [ ] Gamepad API input mapping and controller disconnect/reconnect tests
- [ ] Steam Input / SDL mapping validation with Xbox, PlayStation and generic controllers
- [ ] Keyboard-only and screen-reader manual review
- [ ] Confirm all controls remain reachable at narrow and ultrawide aspect ratios

## Performance and stability
- [x] Fixed-step simulation has regression coverage at 10 FPS
- [x] Fixed-step simulation now has regression coverage at 5 FPS and bounded 300ms stalls
- [ ] Run 10–30 minute soak tests on desktop and mobile
- [ ] Capture memory growth, entity counts, update/draw cost and frame-time p50/p95
- [ ] Profile physical low-end Android and representative iPhone/iPad hardware
- [ ] Test background/foreground, orientation change, tab suspension and audio resume

## UI and progression
- [x] Existing browser smoke checks navigate the seven menu sections
- [ ] Verify all right-side panel states and HUD at 320px, 375px, 412px, tablet, 1080p and ultrawide
- [ ] Verify shop ownership, equip, currency spend, flags, achievements and career progression after reload
- [ ] Add storage migration, quota-exceeded, corrupt-save and export/import recovery tests
- [ ] Add explicit save schema versioning and backup/restore UX before cloud sync

## Steam release gates
- [ ] Choose desktop runtime (recommended evaluation: Tauri or Electron) and document trade-offs
- [ ] Build signed Windows, macOS and Linux packages on native CI runners
- [ ] Add Steamworks SDK integration only after Steam app credentials and legal/account setup are available
- [ ] Map achievements to stable, versioned gameplay events
- [ ] Implement Steam Cloud with conflict handling and schema migration
- [ ] Validate controller navigation, remapping, hot-plug and Steam Deck layout
- [ ] Test 16:9, 16:10, 21:9, windowed, borderless and fullscreen modes
- [ ] Test audio focus, mute, volume persistence and device changes
- [ ] Add crash reporting, build version display, release channel and rollback plan
- [ ] Complete store assets, privacy disclosures, age/content questionnaire and release checklist

## Platform evidence matrix
| Target | Automated check currently available | Still required |
|---|---|---|
| Android | Chromium touch emulation | Physical Android devices, Chrome/WebView, thermal and long-session tests |
| iOS/iPadOS | Not currently evidenced | Safari on real iPhone/iPad, touch, safe areas, audio and orientation |
| Windows | Chromium desktop smoke test | Native package, Windows versions, GPU/input/audio and controller |
| macOS | Not currently evidenced | Safari/Chrome and native package on Apple Silicon/Intel where supported |
| Linux / Steam Deck | Not currently evidenced | Native package, Proton/SteamOS, controller and 16:10 verification |

## Evidence rule
Every release-gate result must include date, commit SHA, platform/device/browser, test type (unit, browser emulation, native CI or physical hardware), outcome and artifact/log link. Never label emulation as a physical-device test.
