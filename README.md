# 細胞分裂實驗室 / Cell Division Lab

A self-contained Traditional Chinese / UK English chromosome simulation for the supplied HKDSE Biology chapter 12 brief. No account, external assets, build step, npm packages or API key required.

## Run

Use the existing checkout; cloud tasks are already isolated and do not need a Git worktree.

```sh
cd /workspace/ch.12_Cell-Division
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the served `index.html` using your local development browser. ES modules require HTTP rather than opening `file://` directly. Any static host can serve the four root assets (`index.html`, `style.css`, `app.mjs`, `model.mjs`, plus `i18n.mjs`). GitHub Pages: choose **Settings → Pages → Deploy from a branch → main / (root)**. Publishing Pages requires repository settings access and is not enabled by a source-code push alone.

## Use

Scrub the event slider or play/pause/single-step. Timing is schematic. Toggle mitosis/meiosis or compare conceptual events side by side. Flip either homologous pair before separation, or randomise independently and replay. Enable crossing over and allele markers to inspect reciprocal distal-segment exchange. Click or keyboard-activate any chromosome to highlight its identity and homologue. Labels, playback speed and language are display controls only.

Record checkpoints and final products, change settings and compare immutable snapshots. CSV includes the actual chromosome identities, sisters and loci. Records and challenge answers remain in memory until a page reload; only language preference is stored locally. Reset resets the biological model, replay keeps its settings, and clear removes recorded trials. Challenges reveal explanations after a submitted prediction or explicit reveal, with optional hints and an ungraded explanation field.

## Science and sources

`i18n.mjs` is the bilingual content-ID dictionary and contains the complete supplied glossary, including 着絲點. `model.mjs` is the biological state model, independent of display controls.

This uses the explicit supplied specification, not an inspected textbook: **te_12_c.pdf was not attached**. Printed pages 12-3–12-20 and the applicable EDB supplementary document have not been independently checked. No page-level textbook or curriculum certification is claimed. All diagrams are original. See the in-app bilingual model-information panel.

The model starts at 2n = 4. A replicated chromosome has two DNA molecules but one joined centromere. Homologues separate in I; sisters separate in II and mitosis. No DNA replication occurs between meiotic divisions. Counts at separation are per pole/forming nucleus, never whole-cell totals. Shapes are schematic; daughter-cell formation summarises cytoplasmic division. Equal meiotic products do not represent four functional human egg cells.

Crossing over exchanges the distal b-locus segment of M1-s1 and P1-s0 reciprocally; locus a remains proximal. Segment lengths and counts are conserved. M/P allele markers show ancestry rather than molecular sequence or linkage frequencies. With n = 2 and no crossing over, one meiosis produces two unique origin combinations; four are possible across independently oriented runs. Orientation determines products, not display speed or language.

## Validation

```sh
node --test tests/model.test.mjs
```

Six tests cover five stable checkpoints, all four orientation settings, I/II separation and absence of intervening replication, reciprocal exchange conservation, combinations across runs, mitotic identity and language-key parity. See [ACCEPTANCE.md](ACCEPTANCE.md) for executed browser checks and limitations.

## 完全離線 / Fully offline

Download `offline.html` and open it directly in a browser, with no server or Internet connection. It contains the same model, styles and bilingual content in one file. Rebuild after edits with `python3 tools/build-offline.py`. The modular `index.html` is the normal static-host entry point.
