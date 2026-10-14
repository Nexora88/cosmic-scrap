# Supabase setup checklist

This repository currently serves a static browser game from GitHub Pages. Online accounts require an explicitly selected Supabase project.

1. In Supabase, enable Email auth and decide whether email confirmation is required.
2. Add `https://nexora88.github.io/cosmic-scrap/` to Authentication URL Configuration's Site URL and allowed redirect URLs.
3. Review and apply `supabase/migrations/202610140001_cosmic_scrap_accounts_coop.sql` to the dedicated Cosmic Scrap project.
4. Configure only the project URL and publishable key for the browser build. Never use `service_role` or secret keys in the browser or GitHub Pages.
5. Test sign-up, email confirmation, sign-in, sign-out, profile creation and RLS using two test accounts.
6. Implement and deploy server-validated room create/join and matchmaking before exposing public room actions. The migration intentionally does not grant direct client writes to rooms.
7. Configure GitHub Pages deployment to inject public build configuration. Keep local `.env.local` ignored and provide a placeholder-only `.env.example`.

Do not use an unrelated Supabase project just because it is already connected to the account. Choose a dedicated project for this game first.
