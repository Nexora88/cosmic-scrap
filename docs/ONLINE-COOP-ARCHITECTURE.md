# Cosmic Scrap online architecture

## Implemented foundation

- Dedicated Supabase project: `hlefwvkgrpgcnobikhaq`.
- `player_profiles`, `coop_rooms`, `coop_matchmaking_queue`, `player_run_records`, `player_friends`, and `player_rank_stats` tables.
- RLS enabled for profile, room, leaderboard record, friend graph and ranked stats. Room creation/join and match score submission go through membership-checking RPCs; clients do not receive direct room write policies.
- Browser account/online modules are lazy-loaded, so local play and localStorage saves do not require an online account or a Supabase CDN request at startup.
- Global and friends leaderboards use saved online personal-best scores.
- Friend requests can be sent by exact username and accepted by the recipient.
- Invite rooms use 8-character codes and short expiries. A URL `?invite=CODE` can prefill and join the room after sign-in.
- Ranked matchmaking purges stale queue entries and matches players within adjacent level brackets and a server-owned rating window.
- Ranked wins/losses/draws update server-owned rating and match stats when both players submit a result.
- X post intents are user-initiated and prefilled for room invites, new records, record challenges and welcome/community messages.

## Match model and security boundary

The current challenge is asynchronous: each pilot plays a normal solo run and submits a score. The room closes when both results are received. This is not real-time co-op and does not synchronize player positions, enemies, bullets, upgrades or bosses.

Run results originate in the client and are checked against broad bounds, membership and one-result-per-player rules. That reduces accidental/malformed submissions but is not anti-cheat: a modified browser can still falsify a plausible score. Do not use ranked results for prizes or valuable rewards until score generation is validated by trusted server-side simulation or replay validation.

The rating used for matchmaking is server-owned. Client parameters cannot directly choose a rating. A level bracket is derived from the player's best recorded level for ranked search; friend rooms can choose a bracket.

## UX and data policy

- Offline/local play is always available without registration.
- Online identity, friends, cross-device profile and leaderboard require a free account.
- The complete local save (Scrap Core, upgrades, contracts and all local progression) is **not** cloud-synced yet. Only profile/online record data is persistent across devices at this stage.
- X opens only when the player clicks a share action; text is prefilled but never auto-posted.
- No paid tier, payment flow or premium gate is present.

## Remaining verification / next engineering phase

1. Configure Supabase Site URL and allowed redirect URLs for GitHub Pages; test email confirmation and auth persistence.
2. Run a two-account browser test for friendship, invite creation/join, room expiry, score submission, ties, wins/losses, and friend/global leaderboards.
3. Add authoritative score verification and rate limits before calling ranked mode cheat-resistant.
4. If real-time co-op is desired, implement a server/host-authoritative shared simulation with input rate limits, reconnect handling and bounded snapshots.
5. Validate on physical low-end Android and conduct 4–6 minute human playtests. No such test results are claimed here.
