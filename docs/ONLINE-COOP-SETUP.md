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
4. The browser now has an account panel using the project's URL and publishable key; no secret/service-role key is included. The public key is intended for browser use under RLS.
5. Set the Site URL and allowed redirect URL before testing email confirmation. Then test sign-up, confirmation, sign-in, sign-out, refresh persistence and profile creation with two test accounts.
6. Profile UI supports username/avatar/rocket selection and displays join date/trophy count. Trophy edits from authenticated browser clients are blocked by a database trigger; trophy awards need trusted server-side logic.
7. Implement and deploy server-validated room create/join and matchmaking before exposing public room actions. The migration intentionally does not grant direct client writes to rooms.
8. Test RLS with separate users. Confirm one player cannot update another profile or read a room where they are not host/guest.

The account UI and database foundation are in the feature branch. Live auth remains unverified until redirect/email settings are configured and a real signup/sign-in test succeeds. Room matchmaking and shared game simulation are not implemented; do not describe co-op as playable.
