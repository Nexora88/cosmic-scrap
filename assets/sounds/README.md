# Cosmic Scrap soundtrack map

## Music and scene cues

- `deep-space-drift.mp3` — **Deep Space**: calm, deep-space main-menu atmosphere
- `deep-space-assault.mp3` — **Deep Space Assault**: normal gameplay bed
- `pulse-of-conflict.mp3` — **Combat Drive**: combat and elite-warning cue
- `cosmic-pulse.mp3` — **Cosmic Pulse**: active storm
- `cosmic-confrontation.mp3` — **Cosmic Confrontation**: boss encounter
- `unknown-planets.mp3` — **Beyond the Belt**: short discovery cue, played only when entering a new galaxy
- `taviro-rarity-reveal.mp3` — **The Revelation**: one-shot capsule reward reveal

The soundtrack follows a priority-based scene controller with two audio decks and crossfades. The main menu stays on Deep Space; starting a run switches to Deep Space Assault. Ordinary sector changes use a short synthesized sting instead of repeatedly replacing the gameplay music. Beyond the Belt is reserved for actual galaxy discoveries.

Storm, combat and warning cues are temporary. Combat takes priority over discovery, storm takes priority over discovery, and boss music takes priority over every ordinary gameplay event. A boss theme remains active until the boss-end event, then returns to the active storm or normal gameplay bed. A level-up picker cannot be interrupted by a discovery cue, and discovery cannot replace a boss encounter.

Playback begins from a user gesture for browser and mobile autoplay compatibility. Pause/resume preserves the current track position. The optional Nexora showcase pauses the game soundtrack and resumes the same scene after it closes. The shared sound toggle and master-volume setting apply to the soundtrack, effects and project video.

## Performance and accessibility

- Short procedural sound effects remain synthesized by the existing AudioSystem; no extra SFX downloads are needed.
- Mobile vibration uses the existing opt-in setting and browser vibration support. Devices/browsers without vibration support safely ignore haptics.
- Audio changes do not alter movement, weapon timing, enemy behaviour, damage, spawn pacing, or the game loop.
