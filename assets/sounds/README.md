# TAVIRO audio assets

## Music and scene cues

- `cosmic-pulse.mp3` — main menu / hangar
- `deep-space-drift.mp3` — normal run and exploration bed; the default gameplay soundtrack
- `unknown-planets.mp3` — short planetary / sector discovery passage (about 9 seconds before returning to the run theme)
- `deep-space-assault.mp3` — temporary high-intensity combat, storm, raid and rift passages
- `pulse-of-conflict.mp3` — elite / boss warning before the boss appears
- `cosmic-confrontation.mp3` — boss encounter
- `taviro-rarity-reveal.mp3` — one-shot capsule rarity reveal

The music controller in `js/systems/Music.js` uses two audio decks and crossfades between tracks instead of cutting abruptly. A run starts on Deep Space Drift. High-intensity events temporarily select Deep Space Assault; sector discovery, boss warning, boss fight and capsule reveal each have their own cue. Temporary tracks return to the current run soundtrack. Boss music returns to the current gameplay bed when the boss is defeated.

Playback begins from a user gesture for browser and mobile autoplay compatibility. Pause/resume preserves the current track position. The Nexora showcase pauses the music and resumes the same track after it closes. The existing sound toggle and master-volume setting apply to the soundtrack.

## Performance and accessibility

- Weapon fire uses one short, quiet synthesized pulse so repeated auto-fire does not compete with the soundtrack. Other short effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Do not change movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop for audio work.
