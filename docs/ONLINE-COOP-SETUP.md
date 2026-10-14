# Supabase setup checklist

The dedicated Cosmic Scrap Supabase project is connected and the initial database migration has been applied.

- Project ref: `hlefwvkgrpgcnobikhaq`
- Region: `eu-central-1`
- Tables created: `public.player_profiles`, `public.coop_rooms`
- RLS: enabled on both tables
- Migration name recorded by Supabase: `cosmic_scrap_accounts_coop`

## Remaining setup

1. In Supabase Authentication settings, enable Email auth and decide whether email confirmation is required.
2. Add `https://nexora88.github.io/cosmic-scrap/` to the Site URL and allowed redirect URLs.
3. Configure the browser with the project URL and publishable key only. Never use `service_role` or secret keys in the browser or GitHub Pages.
4. Add a safe public-config injection step to the GitHub Pages workflow (or use a committed placeholder config that users fill locally). Do not commit secret keys.
5. Implement the login/sign-up UI and wire it to Supabase Auth, then test sign-up, email confirmation, sign-in, sign-out, refresh persistence and profile creation using two test accounts.
6. Implement and deploy server-validated room create/join and matchmaking before exposing public room actions. The migration intentionally does not grant direct client writes to rooms.
7. Test RLS with separate users. Confirm one player cannot update another profile or read a room where they are not host/guest.

The database foundation is deployed, but the browser UI, live authentication flow, room matchmaking and shared game simulation are not yet complete. Do not describe co-op as playable until those pieces are implemented and tested.
