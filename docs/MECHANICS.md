# Mechanics Reference

## Combat
The player automatically targets the nearest living enemy. Projectiles travel in a straight line, can pierce enemies and show a longer neon trail; critical hits deal double damage. Enemy contact and hostile shots damage the player followed by a brief invulnerability window.

## Scrap and levels
Defeated enemies drop scrap orbs. Orbs gravitate toward the player inside pickup range. Collected value is multiplied by the active combo multiplier. XP requirements start at 12, then rise as ceil(12 × level^1.65); level-up pauses combat until an upgrade is selected.

## Build synergies
- **Chain Lightning + Critical Spark:** critical hits improve the chain chance and chained damage, with an additional visible arc.
- **Orbiting Shield + Gravity Well:** the orbiting shards deal increased contact damage while Gravity Well slows nearby enemies.
Synergy effects activate from the run's currently owned upgrades; they do not require a separate unlock.

## Boss events
The first Elite arrives around 110 seconds with a three-second warning, ranged escorts, a health bar and a three-phase aimed spread. Boss encounters alternate between the Elite and the **Rift Weaver**. The Weaver keeps lateral orbital distance and fires expanding six-, eight- or ten-projectile violet rings; a visible charge ring warns before each burst. Both bosses award bonus scrap and a large defeat burst. Encounters recur after a scaled interval, scheduled after the current boss is defeated.

## Difficulty
Spawn intervals shrink toward a 0.205-second floor. Health, movement speed and incoming damage scale with elapsed time. Enemy types include normal, fast, swarm, tank, heavy tank, shooter, sniper, exploder, spawner and boss. Shooters hold mid-range firing lanes; snipers telegraph high-damage shots; exploders damage nearby units when defeated; spawners release three swarm units. Ranged and summoner odds rise as the run progresses, while the normal-enemy share declines. The red boundary closes after the opening minute; remaining outside it can cause damage.

## Rift Surge event
A Rift Surge first appears after about 205 seconds, provided a boss encounter is not underway. Three violet fields telegraph for 2.5 seconds, then remain dangerous for 10 seconds. Standing inside a live field periodically damages the player; leaving the marked circles is the intended counterplay. Sealing the event releases a bonus scrap fragment. Events recur on a long interval and use low-flash-safe outlines rather than full-screen flashes.

## Rift Echo build path
Rift Echo is a run-only upgrade with three ranks. Every few kills, it creates a violet area burst around the defeated enemy, rewarding aggressive routing without requiring the player to stand still. The effect has a recursion guard so a chain of echo kills cannot create an unbounded recursive trigger.

## Cosmic Storm and danger feedback
Storm cycles begin after 150 seconds. The interval tightens over time and the active window grows. Storm visuals pulse more aggressively unless reduced-flash is enabled. At 30% health or lower, a pulsing red edge and throttled warning tone make the critical state readable. Reduced-flash settings soften the screen effects.

## Meta and idle
Runs convert collected run scrap into permanent Scrap Core (currently floor(collected scrap / 10), with a minimum of one Core per run). The death recap shows both Core earned and the banked balance; banked Core and purchased permanent ranks are not removed when a run ends. Local storage records best score and permanent ranks. Returning later grants a capped offline scrap bonus of up to eight hours. Progress is local-device only, not cloud-synced.\n\n## Career achievements
Six one-time achievements track meaningful milestones across individual runs: surviving 30 seconds, collecting 180 scrap, earning 12 storm kills, defeating an Elite, surviving 180 seconds, and reaching a 20-kill combo. Each achievement awards its listed Scrap Core reward once. Unlocks are stored locally and shown in the end-of-run recap; clearing browser data without an exported save can remove this progress.

## Run directives and Elite phases
Choose one directive before a run: Salvage Run (180 scrap, +2 Core), Elite Hunter (defeat one boss, +3 Core), or Stormbreaker (12 storm kills, +2 Core). Progress is tracked in the HUD and the end-of-run report; rewards are granted once per completed run. Directive selection and completion totals are stored locally. These are local single-player objectives, not online daily challenges or leaderboard records.

Elite bosses now have three phases. At 66% health they begin a lateral pursuit pattern and fire a three-shot spread; at 33% they move faster and fire a five-shot fan with a shorter cooldown. Phase transitions are signaled with color, a toast, and a pulse. The projectile cap still applies, and damage is tuned to stay below full-strength sniper hits in the final fan.

## Beginner priorities and replay variety\nThe main-menu field guide recommends Move Speed early to preserve escape routes, then Scrap Magnet to collect from a safer distance. These are suggestions, not mandatory builds. Experiment with Orbiting Shield + Gravity Well or Chain Lightning + Critical Spark; other combinations should be tested for balance before being promoted as strongest. The visual field uses a restrained animated starfield for depth while keeping combat silhouettes and telegraphs readable.

## Input
WASD / arrow keys move. Hold pointer or touch on the arena to move toward it. P or Escape pauses/resumes. Space or Enter selects the first upgrade while the level-up choice is open.
