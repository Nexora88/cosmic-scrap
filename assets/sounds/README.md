# Cosmic Scrap audio assets

## Music
Place the two user-created MP3 tracks here with these exact names:

- `cosmic-pulse.mp3` — main menu / hangar theme
- `deep-space-assault.mp3` — active gameplay / combat theme

## Commander voice pack
Voice announcements use the currently selected game language (`cosmic-scrap-language`):

- `voice/tr/mission-start.mp3`
- `voice/tr/enemies-approaching.mp3`
- `voice/tr/boss-start.mp3`
- `voice/tr/boss-defeated.mp3`
- `voice/tr/level-up.mp3`
- `voice/tr/sector-secured.mp3`
- `voice/en/mission-start.mp3`
- `voice/en/enemies-approaching.mp3`
- `voice/en/boss-start.mp3`
- `voice/en/boss-defeated.mp3`
- `voice/en/level-up.mp3`
- `voice/en/sector-secured.mp3`

The voice pack is optional. If a clip is missing, the game continues silently for that announcement. Voice playback follows the master sound setting and volume, and can be disabled separately in Settings.

## Performance and accessibility
- Short procedural sound effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Do not change movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop for audio work.
