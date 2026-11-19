# TAVIRO release validation status

Last reviewed: 2026-11-15

This page separates automated checks from evidence that requires people or physical hardware. An empty evidence record is **not** a pass. Do not fill records with estimates or generated values.

## Automated checks

| Check | Evidence location | Status |
|---|---|---|
| Deterministic regression suite | GitHub Actions artifact: `regression-tests.log` | Pending next workflow run |
| JavaScript syntax check | GitHub Actions artifact: `syntax-check.log` | Pending next workflow run |
| Seeded baseline / stacked / low-end scenarios | `docs/PLAYTEST.md` and retained JSON reports | Review reports for the tested commit |
| Mobile browser emulation | GitHub Actions / playtest harness | Emulation only; not physical-device evidence |
| Desktop browser smoke test | Desktop Playwright run artifacts | Must be run and reviewed for the tested commit |
| PWA manifest/service-worker source checks | `tests/pwa-release.test.js` | Added to the final test set; not yet run |
| Android Chrome / iOS Safari install and offline launch | Physical device evidence | Open — no physical-device sign-off recorded |

The workflow retains test output with `if: always()`, including when a check fails. Artifact presence does not prove that every stress scenario ran or that its report is complete; inspect the run and artifacts before marking a gate complete.

## Human and physical-device gates

| Gate | Required evidence | Status |
|---|---|---|
| Human playtest | At least 5 willing testers, each 4–6 minutes; anonymized completed logs using `docs/PLAYTEST-LOG-TEMPLATE.md` | **Open — no new verified sessions recorded here** |
| Boss kill time | 10 manually timed encounters across baseline and stacked builds; investigate every kill under 5 seconds | **Open — manual timings required** |
| Stacked-build fairness | At least 3 seeded runs plus human observations that movement and threat-reading still matter | **Open — automation alone is not sign-off** |
| Physical low-end Android | At least 3 sessions of 4–6 minutes on a named real device, including browser and thermal conditions | **Open — emulation is not hardware evidence** |
| Manual accessibility | Complete the checklist in `docs/PLAYTEST.md` on desktop and a real phone | **Open — checklist must be performed** |
| Phone-speaker audio QA | Complete the procedural-audio checklist in `docs/PLAYTEST.md` on a physical phone | **Open — browser tests cannot judge audio quality** |

## Recording rules

1. Use `docs/PLAYTEST-LOG-TEMPLATE.md` once per real session. Use tester codes, never names or contact details.
2. Record the tested commit and distinguish physical Android from browser emulation.
3. Attach CI JSON reports and logs to the run or release record; a missing artifact is not a pass.
4. Change balance only after repeated evidence, then rerun comparable seeds.
5. Keep online competitive features gated on server-authoritative verification and reviewed integration evidence.

## Release decision

**No new release sign-off is asserted by this document.** Automated checks, human sessions, manually timed encounters, physical low-end Android profiling, manual accessibility review, and phone-speaker checks are separate evidence gates. A green CI run cannot substitute for the human or physical-device checks.
