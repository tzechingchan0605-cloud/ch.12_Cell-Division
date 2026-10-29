# Acceptance checks

## Automated biological rules — passed

`node --test tests/model.test.mjs`: **6 tests passed, 0 failed**.

| Checkpoint | Chromosomes | DNA molecules | Scope |
|---|---:|---:|---|
| Before replication | 4 | 4 | Per cell |
| After replication | 4 | 8 | Per cell |
| After mitosis | 4 | 4 | Per daughter |
| After meiosis I | 2 | 4 | Per daughter |
| After meiosis II | 2 | 2 | Per product |

All four orientation settings preserve paired sisters in I and separate them in II. Meiosis-I and pre-II model snapshots are identical: there is no second replication. Exchanges affect only M1-s1 and P1-s0, conserve M/P totals at each locus and preserve locus order. Mitosis ignores meiotic variation controls. Four origin combinations are reachable across runs, with two unique combinations in an individual run without crossing over. Display controls are not arguments to the biological model.

## Chromium functional checks — passed

Executed using Playwright with installed Chromium against the actual Python HTTP server, at desktop 1440 × 1000 and mobile 390 × 844:

- Application renders without JavaScript errors.
- Replication checkpoint displays eight DNA molecules; final meiosis renders eight individual chromosomes across four products.
- Language switch retains event, crossing-over selection, records and open explanation response; language preference survives reload.
- Two diagrams appear in comparison mode.
- A recorded result remains unchanged after replay and orientation changes.
- CSV download succeeds with the selected language filename.
- Challenge submit requires a prediction and then reveals the explanation.
- Playback advances the event; pause stops it.
- No horizontal document overflow at mobile width.

## Scope / limits

No 3D camera is included: the brief explicitly requests a large 2D model. Paused discrete conceptual events are the primary visualisation, not a claim about continuous biological timing. Reduced-motion styling avoids decorative motion, and playback is opt-in. Chromosome selectors support Enter/Space; the scrubber and buttons provide non-drag controls. Screen-reader labels use the active language. No live external content is required.

The textbook PDF and EDB documents were not available for independent reference verification. The app follows the explicit supplied specification and glossary; textbook page checks and formal curriculum review remain unperformed. GitHub Pages publication is separate from pushing source.
