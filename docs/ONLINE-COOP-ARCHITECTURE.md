# Cosmic Scrap accounts and online co-op

## Current status

- The dedicated Supabase project is confirmed: `hlefwvkgrpgcnobikhaq`.
- The initial schema migration is applied; `player_profiles` and `coop_rooms` exist with RLS enabled.
- Login/sign-up UI, room creation/join, matchmaking and shared simulation remain implementation work. The database foundation alone is not a playable online mode.

## Delivery plan

1. **Account foundation:** Supabase Auth email/password, persistent profile, unique username, avatar and rocket cosmetics, created-at date, trophies.
2. **Private invite rooms:** authenticated host creates a short-lived invite; guest joins atomically; presence indicates connection, not authority.
3. **Two-player co-op:** host runs the deterministic-ish combat simulation and sends compact snapshots/events; guest sends validated input at a capped rate. Never stream every bullet.
4. **Random matchmaking:** join queue with a server-validated atomic claim; remove stale queue entries and expire abandoned rooms.
5. **Fairness and recovery:** host disconnect handling, reconnect grace window, version mismatch, rate limiting, room expiry and abuse-resistant score/trophy writes.

## Netcode contract

- Host-authoritative: host simulates enemy AI, spawns, damage, boss phases, pickups and final score.
- Client sends only normalized movement/ability input with sequence number and timestamp. Server/host clamps rates and rejects stale/out-of-range input.
- Snapshots: room/run id, sequence, elapsed time, both player positions/health/downed state, bounded enemy summaries, boss state, score and level-up/death events.
- Do not synchronize each projectile. Use shared seed plus authoritative spawn/events where practical; transmit bounded enemy summaries at a modest rate and interpolate remote movement.
- Disconnects: mark a player disconnected; allow a short reconnect grace period. Do not silently transfer authority until host migration is explicitly implemented.
- Co-op balance initial hypothesis: enemy spawn pressure and health multiplier 1.5x, with player-specific XP to avoid loot disputes. Treat as a starting value only; validate with playtests.
- Revive is a later optional mechanic, not part of the first network slice.

## Security

- Browser config may contain only Supabase URL and publishable key. Never expose service_role/secret keys in GitHub Pages, source maps, logs, or chat.
- RLS is enabled for exposed tables. Room creation/joining and trophy writes must use server-validated functions; never trust a client-reported score.
- Use Supabase Realtime Presence for room membership and Broadcast for transient inputs/snapshots only after auth and room membership are verified. Realtime channels alone are not a trusted game server.
- Profile metadata such as username/avatar is user-editable and must never be used as authorization.
- Rate-limit room creation, invite joins and input packets. Use opaque random invite codes with expiry.

## Browser configuration

The public project URL is `https://hlefwvkgrpgcnobikhaq.supabase.co`. Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for the static browser build. The publishable key is intended for public clients when RLS is correctly configured; never use a service-role or secret key in the browser. Store Actions configuration as public variables or inject a placeholder-based config at build time.

## Acceptance gates

- Signup/login/logout and refresh persistence tested with two distinct accounts.
- RLS tests prove a player cannot update another profile or read unrelated rooms.
- Two browser sessions join one invite and exchange input/state.
- Random queue claims are atomic; expired rooms disappear.
- Simulate packet loss, tab close, host close, stale packets and repeated join attempts.
- Measure 4–6 minute runs on a physical low-end Android device and at least five human co-op playtests before claiming balanced co-op.
