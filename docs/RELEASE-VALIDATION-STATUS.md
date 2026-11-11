# Release Validation Status

Last reviewed: 2026-10-14

This page separates automated checks from evidence that requires real people or physical hardware. Empty evidence is **not** a pass. Do not fill records with estimates or generated values.

## Automated checks

| Check | Evidence location | Status |
|---|---|---|
| Deterministic regression suite | GitHub Actions run artifact: `regression-tests.log` | Pending next CI run |
| Main JavaScript syntax | GitHub Actions run artifact: `syntax-check.log` | Pending next CI run |
| Seeded baseline / stacked / low-cap scenarios | `docs/PLAYTEST.md` and the existing playtest harness artifacts | Must inspect retained reports; no result asserted here |
| Mobile browser emulation | GitHub Actions / playtest harness | Emulation only; not a physical-phone result |

The workflow uploads test logs with `if: always()`, so failures retain diagnostic output. This does not by itself prove that every stress scenario ran or that its JSON report is complete; inspect the run and artifacts before checking off those gates.

## Human and physical-device gates

| Gate | Required evidence | Status |
|---|---|---|
| Human playtest | At least 5 willing testers, each 4–6 minutes; anonymized completed logs | **Open — no verified sessions recorded here** |
| Boss kill time | 10 manually timed encounters; baseline and stacked builds represented; investigate every kill under 5 seconds | **Open — no verified timings recorded here** |
| Stacked-build fairness | At least 3 seeded runs plus human observations that movement and threat-reading still matter | **Open — automation alone is not sign-off** |
| Physical low-end Android | At least 3 sessions of 4–6 minutes on a named real device, with device/browser/thermal state and performance observations | **Open — emulation is not hardware evidence** |
| Manual accessibility | Complete every checkbox in `docs/PLAYTEST.md` on desktop and narrow-screen/phone layouts | **Open — checklist must be performed, not pre-checked** |
| Phone-speaker audio QA | Complete the procedural-audio checklist in `docs/PLAYTEST.md` on a physical phone | **Open — browser tests cannot judge audio quality** |

## Recording rules

1. Use `docs/PLAYTEST-LOG-TEMPLATE.md` once per real session. Use tester codes, never names or personal contact details.
2. Record the tested commit/revision and distinguish physical Android from emulation.
3. Attach CI JSON artifacts and logs to the run/release report; do not treat a missing artifact as a pass.
4. Only change balance after repeated evidence. Re-run comparable seeds after any change.
5. Keep Daily Challenge, global leaderboard, cosmetics, and Steam deferred until the core loop passes these gates.

## Release decision

**Not validated for a balance/performance release claim yet.** Automated test infrastructure is useful, but the human sessions, manually timed bosses, physical low-end Android profiling, manual accessibility review, and phone-speaker checks require actual play and cannot be truthfully manufactured by CI.
