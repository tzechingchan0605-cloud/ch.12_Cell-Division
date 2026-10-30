# 細胞分裂實驗室 / Cell Division Lab

A self-contained Traditional Chinese / UK English chromosome simulation for the supplied HKDSE Biology chapter 12 brief. No account, external assets, build step, npm packages or API key required.

## Run

Use the existing checkout; cloud tasks are already isolated and do not need a Git worktree.

```sh
cd /workspace/ch.12_Cell-Division
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the served `index.html` using your local development browser. ES modules require HTTP rather than opening `file://` directly. Any static host can serve the root assets (`index.html`, `style.css`, `app.mjs`, `model.mjs`, plus `i18n.mjs`, `animation.mjs` and `phases.mjs`). GitHub Pages: choose **Settings → Pages → Deploy from a branch → main / (root)**. Publishing Pages requires repository settings access and is not enabled by a source-code push alone.

## Use

Scrub continuously between events or play/pause/single-step. Chromatids retain stable identities and move on every animation frame; pause freezes the exact position, and Next step animates to the next checkpoint. Timing is schematic. The first division uses upper/lower spindle poles; meiosis II uses left/right poles within each daughter. The centromeres lead while chromatid arms trail. Membranes progressively pinch during cytoplasmic division. A reduced-motion option defaults to the system preference and shows discrete checkpoints. Toggle mitosis/meiosis or compare conceptual events side by side. Flip either homologous pair before separation, or randomise independently and replay. Enable crossing over and allele markers to inspect reciprocal distal-segment exchange. Click or keyboard-activate any chromosome to highlight its identity and homologue. Labels, playback speed and language are display controls only.

Record checkpoints and final products, change settings and compare immutable snapshots. CSV includes the actual chromosome identities, sisters and loci. Records and challenge answers remain in memory until a page reload; only language preference is stored locally. Reset resets the biological model, replay keeps its settings, and clear removes recorded trials. Challenges reveal explanations after a submitted prediction or explicit reveal, with optional hints and an ungraded explanation field.

## Science and sources

`i18n.mjs` is the bilingual content-ID dictionary and contains the complete supplied glossary, including 着絲點. `model.mjs` is the biological state model, independent of display controls. `animation.mjs` provides deterministic, continuous geometry without changing its biological outcomes. The compact canvas has a bilingual phase badge for prophase, metaphase, anaphase, telophase and cytokinesis, with I/II for meiosis. Nuclear envelopes re-form during telophase. The playback bar and scrubber fit alongside the animation at 1366 × 768; detailed hints expand below the controls. Chromosomes are labelled M1/P1/M2/P2 without internal sister suffixes. Counts show each whole cell and, during separation, each pole. `n = 2` denotes one chromosome set and `t` explicitly counts only **joined sister chromatids**, following the red annotations in the supplied reference. Once sisters separate they are daughter chromosomes: t = 0, while the DNA molecules remain. For example, mitotic anaphase has 8 chromosomes, t = 0 and 8 DNA molecules in the undivided cell, with 2n = 4, t = 0 and 4 DNA molecules per pole. Before replication, there are 4 single-chromatid chromosomes and 4 DNA molecules, but no joined sisters (t = 0). This convention is explicitly distinguished from broader chromatid-equivalent counts. This is not a claim of tetraploidy. Recorded states include the fractional event position and the full scene snapshot; CSV includes the position alongside the model settings.

This uses the explicit supplied specification, not an inspected textbook: **te_12_c.pdf was not attached**. Printed pages 12-3–12-20 and the applicable EDB supplementary document have not been independently checked. No page-level textbook or curriculum certification is claimed. All diagrams are original. See the in-app bilingual model-information panel.

The model starts at 2n = 4. A replicated chromosome has two DNA molecules but one joined centromere. Homologues separate in I; sisters separate in II and mitosis. No DNA replication occurs between meiotic divisions. At separation, whole undivided-cell totals and per-pole/forming-nucleus counts are explicitly distinguished. Shapes are schematic; daughter-cell formation summarises cytoplasmic division. Equal meiotic products do not represent four functional human egg cells.

Crossing over exchanges the distal b-locus segment of M1-s1 and P1-s0 reciprocally; locus a remains proximal. Segment lengths and counts are conserved. M/P allele markers show ancestry rather than molecular sequence or linkage frequencies. With n = 2 and no crossing over, one meiosis produces two unique origin combinations; four are possible across independently oriented runs. Orientation determines products, not display speed or language.

## Validation

```sh
node --test tests/*.test.mjs
```

Fifteen tests cover stable checkpoints, all four orientation settings, I/II separation without intervening replication, reciprocal exchange conservation, combinations across runs, mitotic identity, language-key parity, continuous geometry at stage boundaries, spindle direction, arm lengths, final visual lineage and frame-rate independence. The optional `tests/browser.mjs` checks actual intermediate animation frames and interactions using Playwright; install that tool outside the checkout, supply its `PLAYWRIGHT_MODULE` path and optionally `CHROMIUM_PATH`, then run `node tests/browser.mjs` with the HTTP server running. See [ACCEPTANCE.md](ACCEPTANCE.md) for executed browser checks and limitations.

## 完全離線 / Fully offline

Download `offline.html` and open it directly in a browser, with no server or Internet connection. It contains the same model, styles and bilingual content in one file. Rebuild after edits with `python3 tools/build-offline.py`. The modular `index.html` is the normal static-host entry point.

`phases.mjs` maps the schematic playback positions to phase names. These labels are navigation aids; stages can overlap biologically, and the schematic does not assign measured durations.

## Supplied counting reference and stage descriptions

The in-app expandable reference table adapts the supplied human 2n = 46 table to the model's 2n = 4 and separates chromosomes, joined sister chromatids (t), and DNA molecules. A test checks all 15 reference rows, including whole-cell anaphase/telophase totals and post-cytoplasmic-division per-daughter counts. CSV exports use the same explicitly named columns.

Each animation shows a large centred phase heading, with explanatory text describing chromosome behaviour. Descriptions follow the supplied specification and glossary; they have **not** been compared with the unavailable textbook PDF. Files sent to a different chatbot are not accessible here. Exact textbook alignment remains pending the relevant pages being attached to this conversation.
