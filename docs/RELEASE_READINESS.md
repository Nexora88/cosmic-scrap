# TAVIRO release readiness

This checklist separates verified implementation from release gates requiring real devices, accounts, signing credentials or legal review.

## Implemented
- Server-owned seasonal reward catalogue and per-player inventory.
- RLS limits inventory reads to its owner; authenticated clients cannot insert or update inventory rows.
- claim_season_cosmetic(text) checks active-season server-maintained Ranked wins/matches and is idempotent.
- Seasonal rewards are shown in the account panel and merge into the cosmetic collection without entering the client-controlled capsule cloud-save payload.
- Five-step onboarding and Co-op client integration are in main.
- Casual client-submitted scores remain explicitly unverified; Ranked match results use the server simulation.
- PWA shell v4 includes profile, privacy and support pages.
- Capacitor configuration and native asset staging are prepared.
- CI workflows build an Android debug APK and an iOS Simulator app artifact.

## Must pass before public store release

### Score integrity
- [ ] Implement deterministic server replay validation for the solo game, or permanently keep solo records outside verified Ranked leaderboards.
- [ ] Never show a verified badge for client-reported Casual runs.

### Seasonal rewards
- [ ] Verify claim, duplicate claim, cross-account inventory isolation and season rollover with a real authenticated account that has server-recorded wins.
- [ ] Test the live UI in all nine locales.

### Co-op
- [ ] Test two separately authenticated real accounts against the deployed online-match function.
- [ ] Test invite expiry, simultaneous joins, network loss, reconnect, forfeit and server restart.
- [ ] Confirm both clients render the same server-authoritative snapshots.

### Android
- [ ] Download and install the CI debug APK on physical Android 8+ devices.
- [ ] Check back navigation, touch/keyboard input, sound/haptics, offline launch, account auth and deep links.
- [ ] Configure release signing outside the repository and build a signed AAB.
- [ ] Complete Play Console listing, content rating, data-safety form and screenshots.

### iOS
- [ ] Capacitor 8 requires iOS 15+ and Xcode 26+; iOS 12 devices are not supported by this maintained runtime.
- [ ] Build and sign on macOS with Xcode and the responsible account's Apple Developer credentials.
- [ ] Install on physical iPhone hardware and test safe areas, audio, touch, offline launch, account auth and reconnect.
- [ ] Complete App Store privacy labels, age rating, screenshots and review notes.

### Privacy and support
- [ ] Add an official support/privacy contact address before store submission.
- [ ] Provide an in-app account deletion and data request path or a verified private request channel.
- [ ] Review data retention, Supabase processors, public profile/avatar visibility and local storage with a responsible adult/legal reviewer.
- [ ] Confirm target age rating and parental-consent requirements for distribution regions.
- [ ] Verify accessibility, localization, crash handling and low-storage behavior.

## Native CI artifacts
- Android workflow uploads a debug APK for 14 days. It is for testing, not a store-ready signed release.
- iOS workflow uploads a simulator .app for 14 days. It cannot be installed on a physical iPhone and is not an IPA.
- Store signing keys and provisioning profiles must be created and controlled by the project owner.
