# Cosmic Scrap online setup

The dedicated Supabase project is connected. The online schema and RPC functions are applied to project `hlefwvkgrpgcnobikhaq` (region `eu-central-1`). The feature branch contains matching migration files.

## Free/offline vs account

- Offline/local play does not require an account; the existing game save remains in this browser's local storage.
- A free Supabase account is required to publish a score to the shared global leaderboard and load the cloud profile.
- Account/online modules are lazy-loaded only when the player opens those features or a signed-in player finishes a run. The game boot path does not need the Supabase CDN.
- Signed-in career saves now sync automatically through revision-checked cloud snapshots. Scrap Core, permanent upgrades, career XP/level, best score, run totals, contracts and achievements are merged without adding currency balances together. Offline play remains local-first; reconnecting retries the cloud sync. Profile cosmetics remain in the account profile.
- Browser code uses only the project's publishable key. Never add a service-role or secret key to GitHub Pages.

## Supabase dashboard configuration still required

1. In Authentication settings, enable Email auth and choose whether email confirmation is required.
2. Set Site URL to `https://nexora88.github.io/cosmic-scrap/`.
3. Add that same URL to allowed redirect URLs.
4. Test sign-up, confirmation, sign-in, sign-out, refresh persistence and profile creation with two distinct accounts.
5. Test profile RLS, friend requests, invite creation/join, ranked queue, match result submission and expiry with separate sessions.

## Current player-facing online feature

- The leaderboard has Global, Türkiye and accepted-Friends scopes. Global uses the public score RPC; Türkiye filters profile country code; Friends uses the accepted-friend leaderboard RPC. Türkiye and Friends require a signed-in account.
- Signed-in pilots submit a completed solo run automatically. The online module is loaded only after a run ends and a saved Supabase session is detected.
- The profile page shows pilot identity, career statistics and trophies. The current game UI exposes friend requests and accepted-friend lists only to signed-in pilots; chat, invite rooms and matchmaking remain unavailable.
- Career saves use revision-checked cloud snapshots. Career progression, Scrap Core, upgrades, unlocks, cosmetics and daily status are merged; concurrent writes retry once against the latest revision. Offline progress remains local-first and sync retries after reconnect or tab return.
- These features are implemented in the client, but country/friends ranking correctness and full save restoration still require two-account, two-device end-to-end verification.

## Deployed server simulation (not player-facing)

- Supabase has an active online-match Edge Function, version 6, with JWT verification enabled, an explicit CORS origin allowlist and a streaming 8 KiB request-body cap. The source is mirrored in `supabase/functions/online-match/index.ts`.
- The function contains server-owned Co-op/Ranked simulation state, input bounds and throttling, version-checked state writes, Co-op result persistence and a service-role-only Ranked finalizer.
- The browser game does not call this function yet. It is a simplified HTTP-tick prototype, not the main game's combat simulation, and has not passed two-account end-to-end tests. Co-op and Ranked remain unavailable in the UI.
- The live database has an active 2026 October season through 2026-11-20 and a 2026 November season scheduled for 2026-11-20 to 2026-12-25. Validate rollover and match accounting before opening Ranked.
- The legacy `public.coop_matchmaking_queue` is now RLS-enabled, with all direct grants revoked from `anon`, `authenticated` and `service_role`. No direct browser code uses it; the only remaining reference is a `postgres`-owned `SECURITY DEFINER` cleanup RPC. The lack of direct RLS policies is intentional. Live schema verification confirmed only the `postgres` owner retains table privileges.
- The security advisor also reports 26 authenticated-callable SECURITY DEFINER functions and leaked-password protection disabled. Audit function-by-function; do not blanket-revoke intentional membership-gated functions.

## Important limits and honest status

- Legacy room APIs represent **asynchronous score challenges**, not real-time co-op. The separate server simulation prototype is not integrated into the current player-facing game flow.
- Solo leaderboard score and run duration still originate in the browser. RPC validation bounds values and room membership, but this is not a server-authoritative anti-cheat system. Do not use solo scores for prizes or high-stakes competition.
- Automated merge tests cover non-additive currency, achievements, unlock collections, career XP and daily run-event de-duplication. Two-device browser synchronization, country/friends ranking correctness, live account confirmation and two-account Co-op/Ranked flows still require end-to-end testing before claiming full production validation.
- Leaderboard records are best-effort personal bests. Account features are designed to remain free; no paid tier or payment flow is included.
