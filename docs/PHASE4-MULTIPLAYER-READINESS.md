# TAVIRO — Phase 4 multiplayer readiness audit

Reviewed: 2026-11-16

This document separates existing multiplayer source code from a verified, player-accessible multiplayer release. The presence of an Edge Function or migration does not prove that it is deployed, wired into the current UI or stable with two real clients.

## Verified repository findings

- `supabase/functions/online-match/index.ts` contains server-side simulation logic for Co-op and Ranked modes.
- The function authenticates bearer tokens, checks room/match participant membership, clamps movement inputs, throttles inputs using server timestamps and writes simulation state with optimistic version checks.
- Co-op result persistence and Ranked finalization are performed through server-side database operations.
- The current player-facing online page is a shared leaderboard, not a live multiplayer/social hub. Existing security tests intentionally assert that the removed room invitation, matchmaking and legacy chat controls are not present.
- No verified two-account end-to-end Co-op or Ranked session is recorded in the release validation document. The production deployment/configuration of the Edge Function has not been confirmed in this audit.

## Release conclusion

Phase 4 is **not complete**. The server simulation is a useful foundation, but there is no verified end-to-end path from two players in the current UI to a deployed, shared live session. Do not label the existing asynchronous leaderboard as multiplayer, Co-op or Ranked.

## Required work before enabling Co-op

1. Verify all required Supabase migrations, RLS policies, Edge Function deployment, environment variables and deployed function version in a test project.
2. Build a dedicated multiplayer client for room creation, friend join, leave, participant state and server snapshots.
3. Add bounded input transport, visible connection state, heartbeat and a documented reconnect/forfeit policy.
4. Verify both clients receive the same server-authoritative player positions, enemy waves, damage, shared lives, score, boss/end state and final result.
5. Test two separate accounts and clients through refresh, backgrounding, latency, duplicate requests, connection loss, reconnect and server restart.

## Required work before enabling Ranked

1. Keep matchmaking disabled until the trusted simulation and server-side rating finalization are confirmed in the deployed environment.
2. Use server-owned match IDs, seeds, participant membership and a single atomic result finalization.
3. Test disconnects, no-shows, simultaneous requests, duplicate ticks, ties, stale versions and rating updates with two real accounts.
4. Confirm that the browser cannot choose its score, winner, rating delta or match result.

## Release decision

Keep Co-op and Ranked unavailable in the player UI until deployment, client integration and two-client evidence pass. Do not use mocked users or static source checks as proof of a working multiplayer release.

No movement, firing, collision, enemy balance or core progression changes are proposed by this audit.
