# Cosmic Scrap audio assets

## Music

- cosmic-pulse.mp3 — main menu / hangar theme
- deep-space-assault.mp3 — active gameplay / combat theme

Both tracks are loaded by js/systems/Music.js. Playback starts from a user gesture to respect browser and mobile autoplay policies. The controller handles menu/combat transitions, pause/resume, page visibility, the sound toggle, and master volume.

## Performance and accessibility

- Short procedural sound effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Do not change movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop for audio work.
