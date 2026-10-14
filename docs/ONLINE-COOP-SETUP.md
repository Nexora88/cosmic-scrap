# Cosmic Scrap online setup

The dedicated Supabase project is connected. The online schema and RPC functions are applied to project `hlefwvkgrpgcnobikhaq` (region `eu-central-1`). The feature branch contains matching migration files.

## Free/offline vs account

- Offline/local play does not require an account; the existing game save remains in this browser's local storage.
- A free Supabase account is required for cloud profile, online record submission, friends, invite rooms, and matchmaking.
- Account/online modules are lazy-loaded only when the player opens those features. The game boot path does not need the Supabase CDN.
- Cross-device cloud sync currently covers the online identity/profile and leaderboard record, not the entire local progression save. Do not promise that Scrap Core, upgrades and all local progress sync across devices yet.
- Browser code uses only the project's publishable key. Never add a service-role or secret key to GitHub Pages.

## Supabase dashboard configuration still required

1. In Authentication settings, enable Email auth and choose whether email confirmation is required.
2. Set Site URL to `https://nexora88.github.io/cosmic-scrap/`.
3. Add that same URL to allowed redirect URLs.
4. Test sign-up, confirmation, sign-in, sign-out, refresh persistence and profile creation with two distinct accounts.
5. Test profile RLS, friend requests, invite creation/join, ranked queue, match result submission and expiry with separate sessions.

## Implemented in the feature branch

- Player profile: username, allowlisted avatar/rocket, joined date and read-only trophy total.
- Global best-score leaderboard and friends leaderboard.
- Friend requests by exact username, with incoming request acceptance.
- Invite room with 8-character code and URL query invite; X post intent and copy-invite action.
- Random ranked matchmaking with nearby level brackets and server-owned rating, wins, losses and draws.
- Asynchronous challenge matches: each pilot plays their own solo run; the second submitted score completes the result and updates ranked stats.
- Prepared X post for a new record, a general record challenge, a room invite, and a friendly welcome/community invitation.

## Important limits and honest status

- These matches are **asynchronous score challenges**, not real-time co-op. Both players do not occupy the same live arena.
- Score and run duration originate in the browser. RPC validation bounds values and room membership, but this is not a server-authoritative anti-cheat system. Do not use it for prizes or high-stakes competition until simulation/results are validated server-side.
- No browser end-to-end test with two real accounts has been run from this connector session. Live email confirmation and the complete user flow remain unverified until tested in a browser.
- Leaderboard records are best-effort personal bests. Account features are designed to remain free; no paid tier or payment flow is included.
