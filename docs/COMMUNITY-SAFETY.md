# Cosmic Scrap — Community safety and moderation

## Player-facing rules

- Treat other pilots respectfully. Harassment, threats, hate speech, targeted insults, spam, and abusive usernames are not welcome.
- Messages are plain text, limited to 500 characters, and filtered server-side for a small list of common profanities. This filter is intentionally not described as perfect: users can evade keyword filters, and moderators still need to review reports.
- Players can block another player. A block prevents new direct messages between those accounts.
- Players can submit a report for harassment, profanity, hate speech, spam, suspected cheating, an inappropriate username, or another issue. Reports are rate-limited to ten per account per hour.
- A report is not an automatic ban. Moderation decisions should consider context and evidence, and should be applied consistently.

## Moderation actions

The player_moderation table supports active, temp_banned, and perma_banned states. Temporary suspensions accept 1–720 hours. Suspended accounts cannot send chat messages or use online rooms, matchmaking, friend requests, records, and ranked-stat write paths. Local offline play remains available.

The app does not expose moderator powers to ordinary clients. The project owner must explicitly assign trusted moderators from the Supabase SQL editor, after confirming the account UUID from the Auth dashboard:

```sql
insert into public.player_moderation (user_id, is_moderator, status, reason)
values ('REPLACE_WITH_TRUSTED_MODERATOR_UUID', true, 'active', 'Trusted community moderator')
on conflict (user_id) do update
set is_moderator = true, status = 'active', banned_until = null, updated_at = now();
```

After moderator assignment, a moderator can use the guarded public.moderate_player(...) RPC. The function supports temp_ban, perma_ban, and unban; only rows marked is_moderator = true can use it. Never grant moderator status based only on a client-editable profile field.

Review reports in the local moderator dashboard documented in docs/MODERATION-DASHBOARD.md, which uses moderator-only Supabase RPCs to list reports, save review notes, update report status, and apply or remove suspensions. The game does not yet include an in-game moderator dashboard, evidence attachment system, or appeal workflow. Do not promise that a report has been reviewed until a human moderator has actually reviewed it.

## Privacy and retention

- Chat is visible only to direct-message participants or players in the relevant room under database row-level security.
- Do not ask players to share passwords, addresses, phone numbers, or other sensitive personal information in chat.
- Profile photos are public on leaderboards if uploaded. The Atatürk tribute avatar is optional.
- Do not use unreviewed reports or keyword matches as the sole basis for a permanent suspension.

## Opening-screen identity and image attribution

Cosmic Scrap is presented as an independent game developed by **Ahmet Eymen Bakraç**. The opening message expresses respect for Atatürk's legacy of reason, science, and production without using hostility toward other countries or studios as a marketing tactic.

Atatürk portrait: [Ataturk1930s.jpg on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ataturk1930s.jpg). The file page identifies it as a public-domain portrait; the game links to the source page from the opening screen.
