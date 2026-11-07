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

- The leaderboard has four tabs: Global, Türkiye, Friends and Season. The first three use best solo-run scores; Season uses the server-finalized Ranked rating RPC. Country flags come from `player_profiles.country_code`, never from the cosmetic ship flag.
- The top three entries use a podium; all entries show flag, avatar, pilot name, league, level and score/rating. Türkiye, Friends and Season require a signed-in account.
- Signed-in pilots submit a completed solo run automatically. The online module is loaded only after a run ends or the player opens the hub.
- The profile page shows pilot identity, career statistics and trophies. Friend requests and accepted-friend lists are available; chat, invite rooms and Co-op remain unavailable.
- Ranked Duel is wired to the trusted `online-match` Edge Function: pilots enter a rating-aware random queue, both clients must become ready, and the server runs a shared survival simulation. Last survivor wins; score and damage break ties. The server finalizer awards seasonal rating and provisional placement.
- Career saves use revision-checked cloud snapshots. Career progression, Scrap Core, upgrades, unlocks, cosmetics and daily status are merged; concurrent writes retry once against the latest revision. Offline progress remains local-first and sync retries after reconnect or tab return.
- These features are implemented in the client, but country/friends ranking correctness and full save restoration still require two-account, two-device end-to-end verification.

## Deployed server simulation (not player-facing)

- Supabase has an active online-match Edge Function, version 6, with JWT verification enabled, an explicit CORS origin allowlist and a streaming 8 KiB request-body cap. The source is mirrored in `supabase/functions/online-match/index.ts`.
- The function contains server-owned Co-op/Ranked simulation state, input bounds and throttling, version-checked state writes, Co-op result persistence and a service-role-only Ranked finalizer.
- The feature branch now calls this function for Ranked Duel. It remains a separate compact arena simulation rather than the solo game's full combat renderer. The match server owns player/enemy state and the final rating update; the browser sends bounded movement/fire input and renders the returned snapshot. Two-account end-to-end tests are still required. Co-op remains unavailable in the UI.
- The live database has an active 2026 October season through 2026-11-20 and a 2026 November season scheduled for 2026-11-20 to 2026-12-25. Validate rollover and match accounting before opening Ranked.
- The legacy `public.coop_matchmaking_queue` is now RLS-enabled, with all direct grants revoked from `anon`, `authenticated` and `service_role`. No direct browser code uses it; the only remaining reference is a `postgres`-owned `SECURITY DEFINER` cleanup RPC. The lack of direct RLS policies is intentional. Live schema verification confirmed only the `postgres` owner retains table privileges.
- The security advisor also reports 26 authenticated-callable SECURITY DEFINER functions and leaked-password protection disabled. Audit function-by-function; do not blanket-revoke intentional membership-gated functions.

## Important limits and honest status

- Legacy room APIs represent **asynchronous score challenges**, not real-time co-op. Ranked uses the separate server simulation function and is still beta until two accounts have completed a full match.
- Solo leaderboard score and run duration still originate in the browser. RPC validation bounds values and room membership, but this is not a server-authoritative anti-cheat system. Do not use solo scores for prizes or high-stakes competition.
- Automated merge tests cover non-additive currency, achievements, unlock collections, career XP and daily run-event de-duplication. Two-device browser synchronization, country/friends/season ranking correctness, live account confirmation and two-account Ranked results still require end-to-end testing before claiming full production validation. Daily login reward streaks now use an account-bound, server-claimed Pilot Points balance with a 7-day bonus. The points are tracked securely but are not yet spendable in the cosmetic shop.
- Leaderboard records are best-effort personal bests. Account features are designed to remain free; no paid tier or payment flow is included.
