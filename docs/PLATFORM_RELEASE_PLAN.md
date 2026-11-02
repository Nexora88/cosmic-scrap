# Cosmic Scrap — Platform Release Plan

## Product direction

Keep the browser game platform-neutral at its core. Add a small platform adapter boundary so each portal build can use its own approved SDK without mixing ad providers or breaking the standalone GitHub Pages build.

## Proposed navigation

| Destination | Scope |
|---|---|
| Home | Pilot profile summary, quick start and daily status when a daily system exists |
| Battle | Solo, Co-op and Ranked |
| Galaxy | Sectors, regions and boss encounters |
| Rankings | Global, Türkiye and Friends |
| Skin Shop | Country flags, special banners and cosmetic collection |
| Career | Statistics, achievements and league |
| Settings | Audio, controls, graphics and accessibility |

Current-state honesty:
- Solo is playable.
- The existing online score board/challenge is asynchronous; it is not real-time Co-op or Ranked Duel.
- Co-op and Ranked must remain visibly marked as unavailable until their online release gates are satisfied.
- Region progress and bosses currently belong to run progression; a dedicated Galaxy browser is a future screen.
- Career/profile foundations exist, but the full career and league experience is not complete.

## Recommended implementation order

1. Verify existing gameplay bugs and mobile performance with repeatable evidence.
2. Complete account, versioned cloud save, conflict recovery and two-device sync.
3. Finish the skin shop, collection ownership and pre-run equip flow.
4. Build an actual two-player shared Co-op simulation.
5. Build trusted Ranked Duel, rating, seasons and leagues; keep ranked disabled until results are validated by trusted server logic.
6. Add seasonal content and new galaxy regions only after the core loop and online modes are stable.
7. Finish the original game identity: final name decision, custom logo, favicon, store thumbnail, screenshots and platform cover art.
8. Prepare portal-specific builds and complete each portal's QA and publishing requirements.

## Advertising and platform SDK policy

Do not ship a generic third-party ad network inside a portal build. Use the SDK approved by the destination platform and keep the standalone build ad-free unless a separate distribution plan is deliberately approved.

### CrazyGames

- Follow the current [CrazyGames SDK introduction](https://docs.crazygames.com/sdk/intro/) and [advertisement requirements](https://docs.crazygames.com/requirements/ads/).
- Basic Launch and Full Launch have different requirements; monetization is not enabled during Basic Launch.
- Only ads requested through the CrazyGames SDK are allowed on CrazyGames.
- Ads must not interrupt active gameplay or be triggered deceptively.
- Rewarded ads must be explicit, optional, infrequent and presented outside active gameplay. A button must not be shown if the integration cannot actually deliver the reward.
- Test the game with ads unavailable/blocked and ensure the run, pause, retry and menu flows still work.

### Poki

- Follow the current [Poki HTML5 SDK guide](https://developers.poki.com/guide/sdk-html5) and [monetization overview](https://developers.poki.com/guide/how-monetization-works).
- Poki controls ad delivery through its SDK; do not add a separate ad network to the Poki build.
- Use commercial breaks only at natural breaks. A commercial-break call does not guarantee an ad will be shown.
- Rewarded video must follow a clear player action and grant the reward only when the SDK confirms success.
- Stop gameplay input and mute game audio while an ad is active, then restore them safely.
- Keep core progression playable without watching an ad.

### Cosmic Scrap rewarded continue — design proposal, not implemented

- Offer at most one optional continue per run, only after the run has ended.
- Clearly state the reward before the player chooses to watch.
- Never auto-open an ad and never require an ad to continue normal progression.
- Grant the continue only after the platform SDK confirms the rewarded ad completed successfully.
- If no ad is available, the player skips, or the SDK reports failure, return to the normal game-over screen with no penalty.
- The game must first implement and test a safe run checkpoint/restore path. Do not add a non-functional rewarded button before that exists.
- Apply a conservative cooldown/frequency cap and follow the selected portal's stricter rule.

## Platform test gates

- [ ] Standalone GitHub Pages build remains fully playable with no portal SDK present.
- [ ] CrazyGames build uses only its approved SDK for platform ads.
- [ ] Poki build uses only Poki SDK for platform ads.
- [ ] Ad unavailable, blocked, skipped, failed and completed paths all return to a usable game state.
- [ ] Audio and input are suspended during ads and restored on every exit path.
- [ ] Reward is granted once, only on confirmed success; duplicate callbacks cannot duplicate rewards.
- [ ] No rewarded prompt appears during active gameplay.
- [ ] Test desktop, touch phone, private/incognito session, refresh, pause, death and retry.
- [ ] Cover art, screenshots, description, controls and age/content metadata meet the portal's current submission requirements.
- [ ] Review publishing terms and account requirements with a parent/guardian where required; do not bypass age or identity checks.

## Brand and cover art

Branding is intentionally a late-stage polish item, after gameplay, saves, cosmetics and online foundations are stable. The final identity should be original and recognisable at small thumbnail sizes. Deliver one coherent logo system (SVG master, favicon/app icon, monochrome variant and cover-art lockup); avoid multiple competing logos.


## Standalone house-promotion prototype — 2026-11-02

The standalone build may show first-party Cosmic Scrap announcements only; this is not an ad network and does not generate advertising revenue.

- After returning to the main menu, a short, dismissible 3-second house announcement may promote the game's own upcoming platform availability and official X profile.
- At game over, the player may choose one free continue per run. The X profile opens in a separate tab, but following is optional and is not verified or required. The continue is granted by the game's own one-time mechanic, not by an ad view or a claimed social-follow conversion.
- The continue restores the same run, grants a temporary shield and partial health, clears nearby pressure, and rolls back the provisional run-end career counters before play resumes so the final run is counted once.
- The house announcement is skippable, appears only at a natural menu break, and has no third-party tracking, ad SDK, forced redirect or external monetization.
- This is a first-party promotional UI prototype, not a commercial rewarded-ad integration. Any future portal submission must follow that portal's rules and may require removing or adapting these panels.
