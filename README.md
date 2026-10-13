# Cosmic Scrap

**A neon-minimal idle survivor in a black cosmic void.** Move a glowing white square, automatically fire at red enemies, collect blue scrap, choose upgrades, and survive escalating waves.

## Play

This is a dependency-free browser prototype. Open `index.html` locally or enable GitHub Pages from **Settings → Pages → Deploy from a branch → `main` / root**. The included GitHub Actions workflow can also publish the site automatically.

## Controls

- **WASD / Arrow keys:** move
- **Mouse / touch:** move toward the pointer while pressed
- **P / Escape:** pause
- **Space / Enter:** start, resume, or confirm a selected upgrade

## Current systems

- Canvas-based neon combat with nearest-target auto-fire
- Normal, fast, tank, and swarm enemies
- Scrap drops, leveling, three-card upgrade choices
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