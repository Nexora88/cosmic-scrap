# Account security deployment checklist

This change is intentionally split between repository code and hosted Supabase configuration.

## Repository changes

- `js/systems/AccountScopedStorage.js` partitions every `cosmic-scrap-*` player-data key by the authenticated Supabase user UUID, while retaining a separate guest partition. Language and audio/accessibility preferences remain device-wide.
- `js/account-recovery.js` includes a resend-confirmation action. Signup confirmation is still governed by the hosted Auth settings.
- `js/account-deletion.js` requires the signed-in email/password to be revalidated and the user to type `DELETE` before invoking the server function.
- `supabase/functions/delete-account/index.ts` derives the account UUID from a verified bearer token. The service-role key is used only inside the Edge Function.
- `supabase/migrations/20261128120000_secure_account_deletion.sql` provides the service-role-only database cleanup routine.

## Required hosted Supabase steps

Do not consider account deletion live until both the migration and Edge Function are deployed to project `hlefwvkgrpgcnobikhaq`.

1. Apply the migration named `secure_account_deletion`.
2. Deploy Edge Function `delete-account` from `supabase/functions/delete-account/index.ts` with JWT verification enabled.
3. Confirm the function has the standard `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` environment values. Never expose the service-role key to browser code.
4. In Supabase Auth URL Configuration, allow the app callback URL `https://nexora88.github.io/cosmic-scrap/` and the local development callback `http://localhost:4173/` (plus any actual local host/port used by the project).
5. Confirm email confirmation is enabled if the product requires verified addresses. Test signup, confirmation, expired/invalid links, resend, login before confirmation, and password recovery.

The current hosted project was inspected read-only. Its migration history does not yet include this migration, and its active Edge Function list did not include `delete-account`. No hosted configuration, migration, function deployment, or user data was changed by this PR.

## Two-account acceptance test

Use two separate test accounts and a clean browser profile:

1. Play as guest and create a small local save.
2. Sign into account A, make distinct save/capsule/cosmetic changes, then sign out.
3. Sign into account B and confirm A's values are absent; make different changes.
4. Sign out, sign into A again, and confirm only A's values return.
5. Sign out and confirm the original guest save returns.
6. Repeat after a full page reload between each account switch.
7. Confirm each account's cloud row is readable only through its own authenticated session.

The automated storage tests cover the local partition transitions. The live cloud round-trip test still requires two real test accounts after the hosted Auth and database setup is complete.
