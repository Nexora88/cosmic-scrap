# Cosmic Scrap online architecture

## Product modes

Cosmic Scrap has two planned real-time modes with different trust and progression rules:

1. **Co-op Defense:** friend/invite room, two players in one shared survival simulation, team score and friend-room history; no ranked points.
2. **Ranked Duel:** random 1v1, same server-assigned seed and wave pacing, last pilot standing, server-controlled MMR and seasonal league.

These are separate from the existing asynchronous score challenge, where each player runs solo and compares submitted results.

## Existing foundation

- Dedicated Supabase project: `hlefwvkgrpgcnobikhaq`.
- Existing tables include `player_profiles`, `coop_rooms`, `coop_matchmaking_queue`, `player_run_records`, `player_friends` and `player_rank_stats`.
- RLS is enabled for the existing profile, room, leaderboard record, friend graph and ranked-stat data; room and match operations use membership-checking RPCs.
- Browser account/online modules are lazy-loaded, so local play and localStorage saves do not require an online account or Supabase CDN request at startup.
- Friend requests use exact usernames; invite rooms use short codes and expiry.
- Existing matchmaking/rating code belongs to the legacy asynchronous challenge flow. It must not be represented as the new real-time Ranked Duel or mixed into its seasonal rating without a deliberate migration.
- X sharing is user-initiated; posts are never submitted automatically.

## Co-op Defense contract

- First release: two players, friends/invite code, one shared arena and one shared result.
- The simulation owns enemy spawning, movement, damage, boss phases, drops/upgrades and match clock.
- Prototype transport: host sends validated input intents; guest receives bounded snapshots and interpolates remote state.
- Initial team rule: shared team-life pool. The exact down/revive, disconnect, abandonment and host-exit behavior must be specified and tested before release.
- Result fields: ruleset/version, duration survived, team kills, bosses defeated, end reason and participants. Co-op results never award Ranked Duel MMR.
- A player-hosted simulation is not trusted against a modified host. It is acceptable for an early friends-only prototype, not as the authority for ranked results or valuable rewards.

## Ranked Duel contract

- First release is 1v1 only; do not build four-player free-for-all into the first version.
- A trusted server assigns the seed, ruleset version and synchronized start. Both clients receive the same seed and wave pacing.
- The trusted authority determines enemy/damage state, elimination, winner, timer and final result. Clients send input intents, never authoritative health, score, rank delta or winner.
- Winner: opponent eliminated first. If the timer expires and both survive, compare score, then lower damage taken; if still equal, record a draw.
- Rating: starting tuning proposal is +25 win / -18 loss adjusted by opponent MMR; first 10 completed matches are provisional. Values are configurable and must be tuned with real results.
- Season: 30–45 days; proposed soft reset carries 70% of rating. Store season ID and rating history; never trust a client-provided season or league.
- League tiers use a versioned threshold table: Bronze, Silver, Gold, Void.
- Country code is optional and user-selected, validated as ISO 3166-1 alpha-2. Any country suggestion must be consent-based and editable. Country/flag is cosmetic and never affects gameplay.
- Public leaderboards: Global, Country, Friends; only trusted Ranked Duel results are eligible.

## Trust and abuse boundary

Client-submitted scores are currently checked for broad bounds, membership and duplicate submissions. That protects against some malformed requests but is not anti-cheat; a modified browser can submit a plausible false score.

Before Ranked Duel is enabled:
- authoritative simulation or robust server-side deterministic replay validation is required;
- validate input shape, movement, fire/input rates and session membership;
- enforce rate limits, short-lived session tokens, idempotent result writes and replay/duplicate protection;
- commit match outcome and both players' rating changes atomically;
- define disconnect/forfeit/grace-period policy and monitor suspicious matches;
- clients must not write their own MMR, wins, league, season, winner or match result.

Supabase Auth/Database/Realtime may support identity, persistence and transport, but Supabase Realtime alone is not an authoritative game server. Do not place service-role keys or other server secrets in browser code or GitHub Pages.

## Profile and cloud save

- Public profile: nickname, optional country code, selected cosmetic flag, career stats and achievement chips.
- Career stats: longest run, bosses defeated, play time and achievements must be derived from saved/validated records, not editable client claims.
- Keep private account fields out of public profile queries and verify RLS using two independent accounts.
- Full cloud sync of Scrap Core/upgrades is a separate versioned-save workstream. Preserve offline play, local export/import and conflict recovery.

## Verification required

1. Two-account sign-up, confirmation, sign-in/out, refresh, profile RLS and friend/room flows.
2. Async challenge expiry, duplicate submission, stale room and reconnect tests; label this flow accurately.
3. Two-client Co-op Defense consistency: same wave/boss/death/end state, latency, background tab, disconnect and reconnect.
4. Ranked server-authority tests: seed agreement, identical rules, winner/tie-breaks, timeout, forfeit, duplicate results, rating transaction and provisional matches.
5. Country privacy/editing, global/country/friends leaderboard correctness, season rollover and league threshold tests.
6. Physical low-end Android and human playtests; no test result is claimed until observed and logged.

## Security scan and implementation status — 2026-10-17

### Findings addressed in the security branch
- The legacy Ranked queue accepted player-selected rating/level hints in earlier migrations, and the old result path could award rating based on browser-submitted solo scores. Bounds and duplicate checks do not prove that a run actually happened.
- Ranked queue RPC now fails closed; the UI labels Ranked Duel as locked. A database trigger also rejects client-authenticated completion of legacy `room_mode='ranked'` rooms, preventing those scores from changing ranked results.
- Added dedicated seasonal Ranked tables, participant-only match history reads, a service-role-only atomic result finalizer, opponent-adjusted rating deltas, provisional-match markers, 70% rating soft carry-over, league labels and global/country/friends leaderboard RPC.
- Added room presence heartbeats and reconnect-by-saved-room-ID, with retry behavior during transient connection failures. Presence is advisory and is not proof of gameplay or match validity.

### Remaining release blockers
- The new migration must be applied to the Supabase project before the browser changes are deployed.
- A trusted backend still needs to create Ranked sessions, run/validate the simulation, and invoke the finalizer. Until that exists and is tested, Ranked intentionally remains unavailable.
- Room heartbeat/reconnect does not yet implement a shared Co-op Defense world. The current invite room remains an asynchronous solo-score challenge; no same-arena combat is claimed.
- The seasonal schema has no active season seeded automatically. Season creation and rollover must be operated by trusted server tooling and tested against real validated matches.
- Automated repository tests can guard the security contract, but they do not replace SQL integration tests, two-account browser tests, or a live Supabase migration run.

## Current truth

Account/profile/friends/invite-room and asynchronous score-challenge foundations exist. Real-time shared simulation, trusted Ranked Duel, seasonal world league and full local progression cloud sync are not claimed as shipped until implemented and verified.
