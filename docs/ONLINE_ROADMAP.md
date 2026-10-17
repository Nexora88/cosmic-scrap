# Cosmic Scrap — Online Roadmap

Offline endless survival remains available without an account. Online features are optional and must not break local play when Supabase is absent or unreachable.

## Phase 1 — Pilot profile
- [x] Account and profile UI foundation exists in the current branch.
- [ ] Verify sign-up, confirmation, sign-in and profile persistence using two fresh accounts.
- [ ] Add a complete career history to the profile (longest run, bosses defeated, play time and achievement chips).
- [ ] Verify authorization and row-level security prevent one user reading or changing another user's private profile data.

## Phase 2 — Rooms and matchmaking
- [x] Room/invite and matchmaking UI foundations exist.
- [ ] Verify join-by-code, room expiry, presence cleanup and reconnect with two real accounts.
- [ ] Test duplicate submissions, stale rooms, expired codes, refresh and network loss.
- [ ] Make UI copy explicit that current rooms are asynchronous score challenges, not shared-arena co-op.

## Phase 3 — Real-time co-op
- [ ] Not yet implemented: two players in one authoritative gameplay simulation.
- [ ] Host/server owns enemies, damage, upgrades, boss phases, loot outcomes and run clock; clients send validated input intents, not trusted score/state.
- [ ] Interpolate remote-player snapshots and validate movement on the host.
- [ ] Reconnect restores room and wave state; define behavior when host/server disappears.
- [ ] Add server-side rate limits, input validation, replay/duplicate protection and abuse monitoring before trusted ranked scores are offered.

## Phase 4 — Cloud save and co-op polish
- [ ] Design versioned cloud save for Core/upgrades with schema validation and migration.
- [ ] Define conflict resolution and last-write behavior before enabling cross-device sync; preserve export/import and offline play.
- [ ] Test offline edits, reconnect, concurrent devices, failed writes and recovery without silently losing local progress.
- [ ] Measure two-player spawn pressure and boss kill time.
- [ ] Decide shared versus individual score.
- [ ] Test disconnect/reconnect on two physical devices.

## UX / sound polish gates
- [ ] Verify ambient drone and sound-volume slider in the shipped build.
- [ ] Verify shake-intensity setting and test-sound control across menu, gameplay and death screen.
- [ ] Verify pilot profile stats (longest run, bosses, play time and achievement chips) against saved run data.
- [ ] Complete phone-speaker audio QA; avoid cues masking danger telegraphs.

## Current truth
The online hub and room records are not yet a shared real-time arena. Until Phase 3 is implemented and tested, describe the online feature as community/room foundations and asynchronous score challenges. Do not describe client-submitted scores as cheat-proof or local progression as fully cloud-synced.