# TAVIRO referral capsule reward gate

The email invitation flow may open an email draft, but it must not grant a capsule for opening the draft, copying a link, or sending an unverified client-side event.

A referral capsule may be granted only after all of the following are verified by trusted server code:

1. The invitee is a genuinely new account and has a unique, verified email address (`auth.users.email_confirmed_at IS NOT NULL`).
2. The invite attribution is bound to a one-time referral token and a single inviter/invitee pair.
3. The invitee has completed three finalized runs recorded by a server-authoritative run finalizer. Client localStorage, browser events, exported run logs, and client-reported scores are not proof.
4. The reward transaction is idempotent and enforces one reward per eligible inviter/invitee pair, with rate limits and self-referral/device-abuse checks.

## Current release gate

The current solo game still has client-reported casual runs and no deployed server-authoritative solo run finalizer. Therefore the capsule referral reward is intentionally **not enabled**. The existing share-by-email action is only an invitation draft. Do not expose a reward promise or grant capsules until the authoritative run pipeline and its tests exist.

This is a deliberate anti-abuse boundary, not a missing client-side button.
