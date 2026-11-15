# TAVIRO audio assets

## Music and scene cues

- cosmic-pulse.mp3 ? main menu and hangar
- deep-space-assault.mp3 ? main gameplay soundtrack; the energetic movement/action bed for every normal run
- deep-space-drift.mp3 ? short, calmer post-boss interlude before returning to the main gameplay soundtrack
- unknown-planets.mp3 ? short planetary or sector discovery passage
- pulse-of-conflict.mp3 ? elite or boss warning before the boss appears
- cosmic-confrontation.mp3 ? boss encounter
- taviro-rarity-reveal.mp3 ? one-shot capsule rarity reveal

The music controller in js/systems/Music.js uses two audio decks and crossfades between tracks. A run starts on Deep Space Assault. Storm, raid and rift events keep the active gameplay soundtrack instead of replacing it with a calmer track. Discovery, boss warning, boss encounter and capsule reveal use their dedicated cues. After a boss is defeated, Deep Space Drift plays briefly as a calmer interlude, then returns to Deep Space Assault.

Playback begins from a user gesture for browser and mobile autoplay compatibility. Pause/resume preserves the current track position. The optional Nexora showcase pauses the game soundtrack and resumes the same scene after it closes. The shared sound toggle and master-volume setting apply to the soundtrack, effects and project video.

## Performance and accessibility

- Short procedural sound effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Do not change movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop for audio work.
