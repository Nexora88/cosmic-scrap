# Cosmic Scrap moderation dashboard

The local admin dashboard is `admin.html`; it uses the same Supabase Auth account as the game and moderator-only RPCs. It never includes a service-role key and cannot grant its own privileges.

## Local PC setup

1. Open the project folder and run `node admin-server.cjs` (or use the provided Windows launcher).
2. Open `http://127.0.0.1:4178/admin.html`.
3. Sign in with your Cosmic Scrap account. If the account is not yet a moderator, the dashboard shows the account UUID to send to the project owner for trusted moderator assignment.
4. Review reports in context. Available actions: open/reviewing/actioned/dismissed, no action, temporary suspension (1–720 hours), permanent suspension, and remove suspension.

## Safety

- Authorization is enforced in PostgreSQL; hiding UI controls is not considered security.
- Reports are not automatically bans. Human review is required.
- Permanent suspensions should be reserved for serious/repeated violations and require a reason.
- The game continues to support offline play without an account.
