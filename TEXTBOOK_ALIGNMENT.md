# Textbook alignment

Primary source: the user-provided `te_12_c.pdf`, chapter 12. Printed page numbers correspond to the PDF page numbers for the pages inspected here. The phase diagrams on 12-8, 12-14 and 12-15 were rendered and inspected visually as well as reading extracted text. The PDF and scans are kept outside the repository and are not redistributed.

| Printed page | Checked content | Application treatment |
|---|---|---|
| 12-3–12-4 | Chromatin, chromosome, sister chromatid, centromere, parental origin, homologues and n/2n | Traceable M/P identity; distinct homologous pairs; correct joined centromeres; n = 2 and 2n = 4. Added chromatin and nuclear-envelope terms. |
| 12-7 | Active interphase: growth, proteins, organelles and DNA replication before division | Updated phase description; single initial nuclear envelope; wavy chromatin traces explicitly labelled as teaching aids. |
| 12-8, table 12.1 | Prophase condensation, nuclear-envelope breakdown and spindle formation; metaphase equatorial alignment/centromere attachment; sister separation into daughter chromosomes; telophase spindle breakdown, envelopes and chromatin | Updated bilingual paraphrases and printed-page citations. First envelope dissolves and spindle fibres appear during prophase; telophase traces uncoil while envelopes re-form. |
| 12-9 | Animal cleavage furrow; plant cell plate; cytoplasmic division near the end of mitosis | Uses the textbook's 胞質分裂, with 細胞質分裂 retained as a glossary synonym. Explains that the existing animated furrow is the animal-cell model and that plants use a cell plate. |
| 12-14, fig. 12.11 | Homologous pairing, possible crossing over, metaphase I, homologue separation and two haploid daughters | Retains reciprocal non-sister exchange and independent pair orientations. Descriptions now include nuclear-envelope and spindle changes. Sisters remain joined in I. |
| 12-15, fig. 12.11 continued | Prophase II envelope breakdown/spindle re-formation; metaphase II; sister separation; telophase II envelopes, chromatin and four haploid daughters | Re-forms the first two envelopes and removes them during prophase II; depicts final envelope formation and schematic uncoiling. No second DNA replication. |
| 12-17–12-18 | Independent assortment, four possible combinations for two homologous pairs, reciprocal crossing over | Preserves four possibilities across runs and does not force all four into a single non-crossing run. Exchanged segments and loci remain traceable. |
| 12-19–12-20 | One versus two nuclear divisions, chromosome reduction, DNA replication before division and the two different separations | Retains the side-by-side conceptual-event comparison and stable chromosome/DNA checkpoints. |

Descriptions are original concise paraphrases, not a transcription of the chapter. English text was translated for the app. Stage names are navigation aids rather than a graded nomenclature quiz.

## Counts and the separate annotated reference

The textbook explicitly calls separated sisters daughter chromosomes (12-8 and 12-15). It does not define the symbol t or provide the user's separate 46/92/0 counting table. The application therefore defines **t as joined sister chromatids only**, attributes that convention to the annotated reference, and counts DNA molecules separately. Zero joined sisters never means loss of DNA. The original chromosome/DNA checkpoints remain intact.

## Explicit model assumptions

- Timing, absolute orientation, nuclear shapes and equal daughter sizes are schematic. First separation remains vertical to match the user's requested axis; second meiosis is horizontal. Spindles use the same axes.
- Individual interphase chromosomes are not normally distinguishable with a light microscope (12-3, 12-7). Identity traces, origin labels and centromere markers are retained to make the model trackable.
- Wavy traces indicate chromatin; they are not molecular DNA geometry or measured chromosome lengths.
- Telophase and cytoplasmic division can overlap. The UI splits them into conceptual playback intervals rather than claiming discrete non-overlapping biological timings.
- Without crossing over, some products in this small model can share a combination. The general textbook statement about meiotic variation is not turned into an assertion that all four model products must differ in every run.
- The model illustrates an animal cleavage furrow; plant cell-plate animation is outside the supplied simulation scope.
- EDB supplementary documents were not independently checked. No broader curriculum or textbook-page certification is claimed beyond this review.

Validation: 17 automated tests and the Chromium functional checks in `ACCEPTANCE.md` passed after these changes.
