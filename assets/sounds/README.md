# Cosmic Scrap audio assets

## Music
Place the two user-created MP3 tracks here with these exact names:

- `cosmic-pulse.mp3` — main menu / hangar theme
- `deep-space-assault.mp3` — active gameplay / combat theme

## Commander voice pack
The commander voice supports three languages and two selectable voice types. In Settings, choose Auto, Turkish, English, or Brazilian Portuguese, then select Male or Female.

Each gender/language folder contains these six MP3 clips:

- `mission-start.mp3`
- `enemies-approaching.mp3`
- `boss-start.mp3`
- `boss-defeated.mp3`
- `level-up.mp3`
- `sector-secured.mp3`

Required folder layout (36 clips total):

- `voice/male/tr/`
- `voice/male/en/`
- `voice/male/pt-BR/`
- `voice/female/tr/`
- `voice/female/en/`
- `voice/female/pt-BR/`

Run `scripts/generate-voices.ps1` on Windows to generate all 36 clips through the ElevenLabs API. It requests the API key through a hidden secure prompt, does not save the key, retries temporary rate-limit/server errors, validates the output count, and commits/pushes the completed voice pack to the existing feature branch. Do not put API keys in source files, browser code, or Git.

The voice pack is optional. Keep `VOICE_ASSETS_READY = false` until all 36 valid clips are committed. Only then set it to `true` in `js/systems/VoiceAnnouncer.js`. Voice playback follows the master sound setting and volume, and can be disabled separately in Settings.

The music controller also remains disabled until both music MP3s are committed; then set `MUSIC_ASSETS_READY = true` in `js/systems/Music.js`.

## Performance and accessibility
- Short procedural sound effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Do not change movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop for audio work.
