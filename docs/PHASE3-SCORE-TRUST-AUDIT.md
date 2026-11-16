# TAVIRO — Phase 3 competitive-score trust audit

Reviewed: 2026-11-16

This audit records what is present in the repository and what is still required before global competitive scores can be described as trusted. Source files and static tests are not evidence that the Supabase migrations/functions are deployed or that the score path resists modified clients.

## Verified repository findings

- `js/online-hub.js` submits the values `score`, `level` and `survivalSeconds` supplied by the browser to `submit_run_record`.
- The existing SQL function in `202610140002_cosmic_scrap_online_hub.sql` is `SECURITY DEFINER` and grants execution to `authenticated`. It checks numeric bounds and a broad score/time plausibility ceiling, but it does not replay or independently simulate the run.
- `player_run_records` stores one best row per user and uses `greatest(best_score, excluded.best_score)`. This limits duplicate rows and prevents a lower repeat submission from reducing a record; it does not prove that a high client-submitted score is genuine.
- The repository contains seasonal/ranked tables and server-only finalization functions. The online security roadmap intentionally keeps Ranked locked until a trusted result source exists.

## Security conclusion

**Current browser-submitted scores must not be described as cheat-proof or server-verified.** Bounds checking is not authoritative validation. A modified client can still submit a fabricated value within the accepted bounds.

## Required work before verified global leagues

1. Choose a trusted source of run truth: server-authoritative solo simulation or a deterministic replay validator that reproduces the exact versioned game rules.
2. Create server-issued, single-use run IDs and record the ruleset/build version, seed and start time.
3. Validate the full result server-side; clients must not choose the accepted score, winner, rating change, season or league.
4. Finalize a run once in a database transaction with idempotency and replay/duplicate protection.
5. Separate legacy unverified records from verified competition records. Do not silently promote old browser-submitted scores.
6. Add rate limits, abuse monitoring, suspension handling, audit history and integration tests against a real Supabase test project.
7. Only then enable Global, Country and Friends competitive boards and seasonal rating changes.

Do not simply tighten the current numeric limits and call the result anti-cheat; that would still trust a client-provided score.

## Release decision

Phase 3 is **not complete**: the legacy score submission path still accepts browser-provided values and lacks replay validation. Keep competitive leagues and ranked rating changes gated until the trusted run pipeline is implemented and verified.

No gameplay or runtime code is changed by this audit.
