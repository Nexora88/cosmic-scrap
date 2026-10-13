# Cosmic Scrap

**A neon-minimal idle survivor in a black cosmic void.** Move a glowing white square, automatically fire at red enemies, collect blue scrap, choose upgrades, and survive escalating waves.

## Play

This is a dependency-free browser prototype. Open `index.html` locally. The GitHub Actions workflow publishes the static site to the `gh-pages` branch. To make the public site live, configure **Settings → Pages → Deploy from a branch → `gh-pages` / `/(root)`** once. Subsequent pushes to `main` publish automatically.

## Controls

- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **P / Escape:** pause
- **Space / Enter:** start, resume, or confirm a selected upgrade

## Current systems

- Canvas-based neon combat with auto-fire limited to 400 px and targets near the visible arena
- Short-lived projectiles with a 440 px travel cap and closer, screen-aware enemy spawns
- Normal, fast, tank, and swarm enemies
- Scrap drops, leveling, and three-card upgrade choices that avoid capped upgrades
- Combo multiplier, score and best-run tracking
- Cosmic Storm events and a gradually shrinking danger boundary
- Local meta progression and offline idle rewards
- Responsive HUD and touch controls

## Run locally

No build step or third-party dependencies are required. Use any static web server, or open `index.html` directly in a modern browser.

## Product principles

- Free-to-play prototype, no ads, no pay-to-win mechanics
- Cosmetic-only monetization is a possible future direction, not implemented
- Browser-first, lightweight, and portable
- Performance target: stable 60 FPS; benchmark before claiming large-scale enemy counts

## Development

See [DESIGN](docs/DESIGN.md), [MECHANICS](docs/MECHANICS.md), and [ROADMAP](docs/ROADMAP.md). Balance values live in `js/config.js` and `assets/data/`.

## License

MIT — see `LICENSE`.