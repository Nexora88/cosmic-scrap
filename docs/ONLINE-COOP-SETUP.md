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

- One global leaderboard shows each account's best solo-run score.
- Signed-in pilots submit a completed run automatically. The online module is loaded only after a run ends and a saved Supabase session is detected.
- The profile page shows pilot identity, career statistics and trophies; friend lists, chat, invite rooms and matchmaking are intentionally not exposed in the current game UI. Cloud save writes use an optimistic revision check and retry one concurrent-device conflict by merging both snapshots.
- Legacy friend/room tables and RPCs remain in the Supabase schema but are dormant in the current player-facing flow.

## Important limits and honest status

- Legacy room APIs represent **asynchronous score challenges**, not real-time co-op. They are not exposed in the current player-facing game flow.
- Score and run duration originate in the browser. RPC validation bounds values and room membership, but this is not a server-authoritative anti-cheat system. Do not use it for prizes or high-stakes competition until simulation/results are validated server-side.
- Automated merge tests cover non-additive currency, achievements, unlock collections and career XP. Two-device browser synchronization and live account confirmation still require end-to-end testing before claiming full production validation.
- Leaderboard records are best-effort personal bests. Account features are designed to remain free; no paid tier or payment flow is included.
