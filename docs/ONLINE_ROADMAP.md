# Cosmic Scrap — Online Modes Roadmap

Offline endless survival remains available without an account. Online features are optional and must not break local play when Supabase is absent or unreachable.

## Product decision: two distinct online modes

### Co-op Defense — friends, shared survival
- Invite a friend or join by short room code; launch a two-player shared arena.
- Both players survive the same waves and bosses in one simulation.
- Initial scoring is a shared result: survival time plus team kills. It contributes to friend/room history, **never ranked rating**.
- First release uses a shared team-life pool; define its exact revive/loss behavior in the gameplay spec before implementation.
- A third player is a later expansion, not a launch requirement.

### Ranked Duel — random 1v1, last pilot standing
- Matchmaking pairs two eligible players; both play simultaneously in the same seeded match with identical wave pacing and rules.
- First player eliminated loses; the remaining player wins.
- If the match timer expires with both alive, higher score wins; if equal, lower damage taken wins. If still equal, record a draw.
- Rating starts with a tunable baseline of +25 for a win and -18 for a loss, adjusted by opponent MMR. First 10 matches are provisional.
- Seasons last 30–45 days. Soft reset example: carry 70% of rating into the next season; finalize exact values only after playtesting.
- League thresholds are a fixed, versioned table: Bronze → Silver → Gold → Void.
- Leaderboards: Global, Country and Friends. Profile country is an optional user-selected ISO 3166-1 alpha-2 code; IP may suggest a country only with clear consent and must never force it. A flag is cosmetic and grants no gameplay benefit.
- **Ranked stays disabled until authoritative result validation, rate limits, replay/duplicate protection and abuse monitoring are live.** A player-hosted browser simulation alone is not a trusted source for ranked results.

## Current state — honest boundary
- [x] Offline/local solo play without account.
- [x] Supabase account/profile, friends, invite-room and online leaderboard foundations exist.
- [x] Existing room challenge lets each player play a separate solo run and compare submitted scores.
- [ ] Existing async score challenge is not Co-op Defense and not the new real-time Ranked Duel. Keep its UI label explicit and do not mix its rating/results with the new ranked season.
- [ ] No verified two-account end-to-end run is claimed.
- [ ] No shared real-time arena or trusted ranked simulation is claimed.

## Phase 1 — account, profile and async foundation
- [ ] Verify sign-up, email confirmation, sign-in/out, refresh persistence and profile creation with two fresh accounts.
- [ ] Add nickname and optional country code with validation; do not expose email or sensitive account fields on public profiles.
- [ ] Add career stats: longest run, bosses defeated, total play time and achievement chips; verify values against saved run records.
- [ ] Verify RLS prevents one account reading or changing another account's private data.
- [ ] Test room join-by-code, expiry, stale room cleanup, reconnect, duplicate result submission, wins/losses/draws and network loss using two accounts.
- [ ] Label the current asynchronous feature as a score challenge. Separate its data/rating from real-time Ranked Duel.

## Phase 2 — real-time transport and session lifecycle
- [ ] Choose and document a realtime transport/server topology, authoritative owner, deployment target and operating limits before implementing gameplay.
- [ ] Define versioned, bounded messages for input intents, snapshots, session start/end, disconnect and reconnect.
- [ ] Add room membership checks, short-lived session credentials, input rate limits, snapshot size limits, heartbeat/timeouts and duplicate/replay protection.
- [ ] Test two physical/browser clients under latency, packet loss, refresh, tab backgrounding and host/server departure.
- [ ] Keep solo play usable if the realtime service is down.

## Phase 3A — Co-op Defense
- [ ] Implement a two-player shared simulation first; do not add three-player lobbies yet.
- [ ] For the first playable prototype, the host simulation owns enemies, damage, boss phases, drops, upgrades and run clock; the guest sends validated input intents and interpolates received snapshots.
- [ ] Treat player-host authority as a prototype trust boundary only. Do not use host-reported outcomes for ranked rating or valuable rewards.
- [ ] Use the shared team-life pool rule; specify what happens when one player is down, disconnects or abandons the run.
- [ ] Record shared survival time, team kills, boss results and room history; no league points.
- [ ] Verify both clients see consistent waves, hits, deaths, boss phases, end result and reconnect behavior.

## Phase 3B — Ranked Duel (1v1 only)
- [ ] Use a trusted server-authoritative simulation or deterministic replay validation before enabling rating changes.
- [ ] Matchmaking queue uses MMR with a gradually expanding search window and queue timeout/cancel behavior.
- [ ] Server assigns the seed and ruleset version; both players receive the same seed, wave tempo and match start.
- [ ] Server determines elimination, timer expiry, score/damage tiebreakers, disconnect/forfeit policy and final result.
- [ ] Make result submission idempotent; clients cannot set winner, score, rank delta, season or league.
- [ ] Keep rating changes in a transaction with match completion. Store match history and rating before/after for both players.
- [ ] Apply provisional status for the first 10 completed matches; tune opponent-adjusted changes around the +25/-18 baseline.
- [ ] Do not ship ranked until abuse monitoring, rate limits, duplicate/replay defense and operational alerts are tested.

## Phase 4 — world league and seasons
- [ ] Add Global, Country and Friends leaderboard tabs backed by server-validated ranked results.
- [ ] Add opt-in ISO country code, editable by the player; validate against an allowlist and avoid exposing IP/location details.
- [ ] Display flags as cosmetic profile metadata only; never modify damage, health, matchmaking power or rewards based on country.
- [ ] Add versioned fixed league thresholds: Bronze, Silver, Gold, Void.
- [ ] Add 30–45 day seasons, visible start/end dates, archived results and a documented soft-reset rule (initial proposal: carry 70%).
- [ ] Add seasonal rollover tests, ties, country changes, deleted/suspended accounts, and leaderboard pagination.
- [ ] Consider 3–4 player free-for-all only after 1v1 stability and population justify it.

## Cloud save and progression (separate workstream)
- [ ] Design versioned cloud save for Core/upgrades with schema validation and migration.
- [ ] Define conflict resolution before cross-device sync; preserve export/import and offline play.
- [ ] Test offline edits, reconnect, concurrent devices, failed writes and recovery without silent local progress loss.

## Release gates
- [ ] Two-account smoke tests pass for auth, friends, invite room, async challenges and privacy policies.
- [ ] Co-op consistency, reconnect and disconnect policy pass on two separate clients.
- [ ] Ranked is disabled unless the result source is trusted and result/rating updates are server-controlled.
- [ ] Matchmaking, tie-breaks, disconnects, duplicate submissions, provisional matches and season rollover have automated tests.
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
