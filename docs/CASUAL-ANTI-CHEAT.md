# TAVIRO casual score integrity

## Current security state

The browser previously submitted a score, level and survival duration to `public.submit_run_record`. Plausibility bounds and rate limits reduced malformed submissions, but they did not prove that a run had actually occurred. A modified client could still send a fabricated but plausible result.

That write path is now disabled in the live Supabase project. The same applies to the client-reported career-stat RPC (`record_player_run`) and the legacy room-score RPC (`submit_room_score`). Their execute privileges are revoked from `PUBLIC`, `anon`, `authenticated` and `service_role`. The browser no longer calls the score or career-stat write RPCs. Local play and local save data remain available.

The online casual leaderboard is intentionally paused. Existing rows are historical client-reported data and must remain labelled unverified; they are not evidence of fair play and must not be used for prizes or official competition.

## What is not yet complete

This is a fail-closed safety measure, not a finished anti-cheat implementation. TAVIRO's current deployed `online-match` function is a simplified multiplayer simulation and is not the main solo game's combat simulation. It is not currently wired into solo runs.

## Requirements before trusted online scores return

1. Port the actual solo ruleset to a server-owned deterministic simulation, with a versioned ruleset and server-generated run seed.
2. Start a short-lived authenticated run session on the server. The client sends bounded input intents, not score, level, kills, health, time, drops or reward totals.
3. Advance simulation state using server time and fixed bounded ticks. Never accept client timestamps or client-owned state as authority.
4. Validate movement, fire cadence, cooldowns, enemy spawns, damage, pickups, upgrades, boss phases, survival time and end conditions against the same ruleset.
5. Persist final results only from the trusted server process, atomically and idempotently. Bind every result to one user, one run ID and one ruleset version.
6. Enforce per-user and per-session rate limits, replay/duplicate protection, short session expiry, request-size limits and suspicious-run audit signals.
7. Add tests for impossible movement, accelerated time, fabricated kills, repeated pickups, forged level/score, stale sessions, duplicate finalization, reconnects and concurrent submissions.
8. Keep the public board disabled until server/client parity, integration tests and a review of the live database permissions pass.

## Trust labels

- Local/offline best score: stored on the device; editable by the device owner.
- Historical online casual rows: client-reported and unverified.
- Future verified result: generated and finalized by the server simulation only.

Never describe local or historical client-reported scores as cheat-proof or server-verified.
