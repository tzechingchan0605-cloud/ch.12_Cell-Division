# Acceptance checks

## Automated biological and animation rules — passed

`node --test tests/*.test.mjs`: **15 tests passed, 0 failed**.

| Checkpoint | Chromosomes | DNA molecules | Scope |
|---|---:|---:|---|
| Before replication | 4 | 4 | Per cell |
| After replication | 4 | 8 | Per cell |
| After mitosis | 4 | 4 | Per daughter |
| After meiosis I | 2 | 4 | Per daughter |
| After meiosis II | 2 | 2 | Per product |

All four orientation settings preserve paired sisters in I and separate them in II. There is no second DNA replication. Reciprocal exchanges affect only M1-s1 and P1-s0, conserve M/P totals at each locus and preserve locus order. Four origin combinations are reachable across runs, with two unique combinations in an individual run without crossing over.

Animation checks verify continuous chromosome and distal-segment paths across every event boundary in both divisions, with all four orientations and crossing over on/off. Sampled frames preserve arm lengths throughout the animation. The first separation follows upper/lower spindle poles; sister centromeres remain together in meiosis I. Final visual positions and distal ancestry match the biological products for every orientation. Different frame rates and display speeds reach identical final scenes.

## Chromium functional checks — passed

`tests/browser.mjs` was executed using Playwright and installed Chromium against the actual Python HTTP server at desktop 1440 × 1100 and mobile 390 × 844:

- More than eight distinct intermediate chromosome positions are observed within 500 ms of playback; movement is towards the upper pole during first separation.
- Persistent SVG chromosome nodes survive frames, language switches and display changes.
- Pause freezes a fractional event position; language/labels retain it. Changing speed does not reset or jump the animation.
- Next step animates from a fractional position to exactly the next checkpoint, then stops.
- In meiosis I, sisters remain joined while homologues separate towards opposite upper/lower poles.
- Recorded states do not change after scrubbing and orientation changes. CSV download succeeds.
- Bilingual challenge explanations and written responses work across language switches.
- No JavaScript errors or horizontal document overflow on mobile.
- The system reduced-motion preference is honoured and permits immediate discrete stepping.
- The regenerated standalone offline edition supports fractional scrubbing without networking.

Screenshots at events 3, 3.5, 4, 4.65, 7.5 and 8 were captured for inspection. The central SVG viewport remains fixed across these events.

## Scope / limits

The model uses a continuous 2D schematic, not measured biological time, physical forces or molecular mechanisms. First division is drawn vertically, second meiosis horizontally, for traceable lineage and consistent spindle attachment. Counts distinguish each whole undivided cell from each pole/forming nucleus. Mitotic anaphase shows 8 chromosomes, t = 0 and 8 DNA molecules per undivided cell, with 2n = 4 and t = 0 per pole. Meiosis I shows 2n = 4 and t = 8 per undivided cell, with n = 2 and t = 4 per pole; meiosis II shows 4 chromosomes, t = 0 and 4 DNA molecules per undivided cell, with n = 2, t = 0 and 2 DNA molecules per pole. Following the supplied reference, t now counts only joined sister chromatids; separated sisters are daughter chromosomes. DNA molecules are counted separately, so t = 0 never implies loss of DNA. The optional reduced-motion mode deliberately shows discrete checkpoints.

All chromosome selectors support Enter/Space; the slider and event-step controls provide alternatives to dragging. No runtime external content is required. The textbook PDF and EDB documents remain unavailable for independent source verification. GitHub Pages activation remains separate from pushing source.

## Offline edition — passed

Generated `offline.html` was loaded into Chromium with networking disabled. Language switching, final meiosis rendering and state recording passed without JavaScript errors. Direct `file://` navigation is blocked by this cloud browser's administrator policy, so validation injected the exact generated HTML with `setContent`; a direct file-open check in this managed browser remains unrun.

## Delivery

Source and generated offline edition were pushed to GitHub `main`. The GitHub Pages settings API returned `Forbidden`, so automated Pages activation was not possible with the provided access. No live Pages deployment is claimed.

## Compact view, phase badges and n/t counters — passed

Additional automated checks cover phase labels I/II, nuclear-envelope re-formation, and per-cell/per-pole counts during replication, metaphase, anaphase, telophase and final daughter formation. The 15-test total includes these checks.

Chromium checks at 1366 × 768 verify that the entire transport panel (playback buttons and scrubber) remains within the viewport in both English and Traditional Chinese throughout both meiotic divisions. Each phase badge is checked against prophase, metaphase, anaphase, telophase and cytokinesis at representative fractional positions. Internal s0/s1 suffixes are absent from displayed chromosome labels; M/P origin and chromosome-pair identity remain. Detailed observation notes are expandable below the transport panel. Offline checks expand those notes explicitly.

## Annotated reference and descriptions — passed

All 15 rows of the supplied 46-chromosome reference were checked against the scaled 4-chromosome model, including the red-zero naming convention. The in-app reference table, counters, immutable recordings and CSV distinguish joined sisters (t) from DNA molecules. Nuclear daughter totals remain separate from the whole undivided cell.

Large centred phase headings and phase-specific action descriptions are bilingual. Descriptions are based on the provided specification; exact textbook wording remains unverified because the PDF was supplied to another chatbot, not this conversation. It is not claimed as inspected.
