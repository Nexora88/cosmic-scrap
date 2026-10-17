# Cosmic Scrap — Online Modes Roadmap

Offline endless survival remains available without an account. Online features are optional and must not break local play when Supabase is absent or unreachable.

## Product decision: two distinct online modes

### Co-op Defense — friends, shared survival
- Invite a friend or join by short room code; launch a two-player shared arena.
- Both players survive the same waves and bosses in one simulation.
- Initial scoring is a shared result: survival time plus team kills. It contributes to friend/room history, **never ranked rating**.
- First playable implementation uses a shared team-health pool and three team lives; when the pool empties, one life is spent and health resets, and the run ends at zero lives or the four-minute cap.
- A third player is a later expansion, not a launch requirement.

### Ranked Duel — random 1v1, last pilot standing
- Matchmaking pairs two eligible players; both play simultaneously in the same seeded match with identical wave pacing and rules.
- First player eliminated loses; the remaining player wins.
- If the match timer expires with both alive, higher score wins; if equal, lower damage taken wins. If still equal, record a draw.
- Rating starts with a tunable baseline of +25 for a win and -18 for a loss, adjusted by opponent MMR. First 10 matches are provisional.
- Seasons last 30–45 days. Soft reset example: carry 70% of rating into the next season; finalize exact values only after playtesting.
- League thresholds are a fixed, versioned table: Bronze → Silver → Gold → Void.
- Leaderboards: Global, Country and Friends. Profile country is an optional user-selected ISO 3166-1 alpha-2 code; IP may suggest a country only with clear consent and must never force it. A flag is cosmetic and grants no gameplay benefit.
- The legacy browser-score Ranked queue remains locked. A new server-owned simulation and rating path is deployed, but keep Ranked as a controlled beta until two-account smoke tests, abuse/rate-limit checks and operational monitoring pass.

## Current state — honest boundary
- [x] Offline/local solo play without account.
- [x] Supabase account/profile, friends, invite-room and online leaderboard foundations exist.
- [x] Existing room challenge lets each player play a separate solo run and compare submitted scores.
- [ ] Existing async score challenge is not Co-op Defense and not the new real-time Ranked Duel. Keep its UI label explicit and do not mix its rating/results with the new ranked season.
- [ ] No verified two-account end-to-end run is claimed; this remains a release gate.
- [x] Shared real-time arena and trusted server-side simulation code are implemented and deployed; cross-account gameplay still needs live verification.

## Phase 1 — account, profile and async foundation
- [ ] Verify sign-up, email confirmation, sign-in/out, refresh persistence and profile creation with two fresh accounts.
- [ ] Add nickname and optional country code with validation; do not expose email or sensitive account fields on public profiles.
- [ ] Add career stats: longest run, bosses defeated, total play time and achievement chips; verify values against saved run records.
- [ ] Verify RLS prevents one account reading or changing another account's private data.
- [ ] Test room join-by-code, expiry, stale room cleanup, reconnect, duplicate result submission, wins/losses/draws and network loss using two accounts.
- [ ] Label the current asynchronous feature as a score challenge. Separate its data/rating from real-time Ranked Duel.

## Phase 2 — real-time transport and session lifecycle
- [x] Server topology: authenticated Supabase Edge Function with server-owned simulation state in Postgres; database tables reject direct client writes.
- [x] Input intents are bounded and snapshots contain server-owned state; reconnect restores the saved room ID and retries polling.
- [x] Room/match membership is checked on every Edge Function action; heartbeat, 60ms per-player input throttle, 8 KiB body cap and stale-input handling are in place. [ ] Run abuse/load tests.
- [ ] Test two physical/browser clients under latency, packet loss, refresh, tab backgrounding and host/server departure.
- [ ] Keep solo play usable if the realtime service is down.

## Security gate applied in the implementation branch

- [x] Disable the legacy Ranked queue until trusted simulation exists.
- [x] Prevent client-authenticated legacy Ranked rooms from reaching a finished ranked result.
- [x] Add dedicated seasonal match/history/rating tables and service-role-only atomic finalization.
- [x] Add room presence heartbeat and room-ID restoration/retry after reconnect.
- [x] Add static regression tests for the Ranked lock and access-control contract.
- [x] Apply both security migrations to Supabase and verify the new tables/functions exist.
- [ ] Run SQL integration tests and two-account room/reconnect tests.
- [x] Deploy trusted Edge Function `online-match`; its service role owns simulation state and calls the server-only rating finalizer. [ ] Complete two-account end-to-end validation before broad release.
- [x] Implement shared server simulation with common health, three team lives, enemies, bullets, shared score, kills and saved Co-op history.
- [x] Seed an initial 35-day season and implement server-owned seasonal stats, match history, league thresholds and Global/Country/Friends queries. [ ] Test season rollover and standings with completed real matches.

## Phase 3A — Co-op Defense
- [x] Implemented two-player shared simulation first; no three-player lobby.
- [x] Edge Function owns enemy spawning/movement, damage, health, bullets, score, waves and run clock; both clients send bounded inputs and render the same authoritative snapshots. This is a focused online arena MVP, not yet the full solo-game entity/boss/upgrade system.
- [ ] Treat player-host authority as a prototype trust boundary only. Do not use host-reported outcomes for ranked rating or valuable rewards.
- [ ] Use the shared team-life pool rule; specify what happens when one player is down, disconnects or abandons the run.
- [x] Record shared survival time, team kills, remaining team lives and finish reason in participant-readable room history; no league points.
- [ ] Verify both clients see consistent waves, hits, deaths, boss phases, end result and reconnect behavior.

## Phase 3B — Ranked Duel (1v1 only)
- [x] Ranked simulation runs in the trusted `online-match` Edge Function; browser-supplied scores are not used for rating.
- [x] Service-role-only atomic 1v1 matchmaking uses MMR and a widening search window, with client cancellation and stale queue expiry.
- [x] Server creates one match row, seed and ruleset version; both players consume the same persisted simulation and wave clock.
- [x] Server determines elimination, 180-second timer, score/damage tiebreaks and 25-second disconnect forfeit.
- [x] Client cannot submit results; service-only finalizer locks the match row and only finalizes a `playing` match.
- [x] Finalizer stores both players' before/after ratings and deltas atomically with match completion.
- [x] First 10 matches are marked provisional and use a 1.5× rating-change multiplier; baseline deltas are also adjusted by opponent rating.
- [ ] Do not ship ranked until abuse monitoring, rate limits, duplicate/replay defense and operational alerts are tested.

## Phase 4 — world league and seasons
- [x] Global/Country/Friends tabs query the separate seasonal Ranked stats table.
- [x] Optional editable two-letter ISO-style country code; no IP lookup or forced selection.
- [x] Country flag is cosmetic only; no gameplay logic uses it.
- [x] Fixed thresholds implemented: Bronze < 1200, Silver ≥ 1200, Gold ≥ 1500, Void ≥ 1900.
- [x] Initial 35-day season and next scheduled season seeded; pg_cron runs season activation every five minutes and carries 70% of rating. [ ] Validate rollover in an isolated integration test and check ties/archive behavior.
- [ ] Add seasonal rollover tests, ties, country changes, deleted/suspended accounts, and leaderboard pagination.
- [ ] Consider 3–4 player free-for-all only after 1v1 stability and population justify it.

## Cloud save and progression (separate workstream)
- [ ] Design versioned cloud save for Core/upgrades with schema validation and migration.
- [ ] Define conflict resolution before cross-device sync; preserve export/import and offline play.
- [ ] Test offline edits, reconnect, concurrent devices, failed writes and recovery without silent local progress loss.

## Release gates
- [ ] Two-account smoke tests pass for auth, friends, invite room, async challenges, shared simulation, reconnect and privacy policies.
- [ ] Co-op consistency, reconnect and disconnect policy pass on two separate clients.
- [ ] Ranked is disabled unless the result source is trusted and result/rating updates are server-controlled.
- [x] Static regression tests cover the security contract; [ ] automated integration tests still need two accounts and live match fixtures.
- [ ] Global/Country/Friends boards only show validated Ranked Duel results; async scores remain separate.
- [ ] Physical-device and human playtests are documented; do not claim latency, balance or anti-cheat quality without evidence.

## UX / sound polish gates
- [ ] Verify ambient drone and volume slider in the shipped build.
- [ ] Verify shake-intensity setting and test-sound control across menu, gameplay and death screen.
- [ ] Verify profile stats against saved run data.
- [ ] Complete phone-speaker audio QA; avoid cues masking danger telegraphs.

## Security and architecture notes
- Supabase Auth/Database/Realtime can provide identity, persistence and message transport, but Realtime by itself is not an authoritative game simulation.
- A browser-hosted host-authoritative simulation can be useful for a co-op prototype but remains vulnerable to a modified host client. Ranked requires a trusted server or robust server-side replay validation.
- Never put a Supabase service-role key or any server secret in GitHub Pages/browser code.
- Do not describe client-submitted scores as cheat-proof or local progression as fully cloud-synced.
