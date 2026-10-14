# Cosmic Scrap — Online Roadmap

Offline endless survival remains available without an account.

## Phase 1 — Pilot profile
- [x] Account and profile UI foundation exists in the current branch.
- [ ] Verify sign-up, confirmation, sign-in and profile persistence using two fresh accounts.
- [ ] Add a complete career history to the profile.

## Phase 2 — Rooms and matchmaking
- [x] Room/invite and matchmaking UI foundations exist.
- [ ] Verify join-by-code, room expiry, presence cleanup and reconnect with two real accounts.

## Phase 3 — Real-time co-op
- [x] Realtime room channel broadcasts normalized pilot positions while a room run is active.
- [x] Remote pilot marker is interpolated on the same canvas and expires after 5 seconds without updates.
- [ ] Still not implemented: one authoritative gameplay simulation shared by both players.
- [ ] Host owns enemies, damage, upgrades, boss phases and run clock.
- [ ] Validate movement on the host and reject implausible snapshots.
- [ ] Reconnect restores room and wave state.

### Presence preview limits
The current milestone is a real-time position/presence preview, not full co-op combat. Each client still runs its own enemies, projectiles, upgrades, damage and score. Broadcasts are cosmetic, not trusted gameplay input; two-account and reconnect testing is still required.

## Phase 4 — Co-op polish
- [ ] Measure two-player spawn pressure and boss kill time.
- [ ] Decide shared versus individual score.
- [ ] Test disconnect/reconnect on two physical devices.

## Current truth
The online hub and room records are not yet a shared real-time arena. Until Phase 3 is implemented and tested, describe the online feature as community/room foundations and asynchronous score challenges.