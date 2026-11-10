# Screenshot-grounded visual design experiment

## Goal

Test whether using **actual screenshots** rather than text descriptions improves Sloppertizer's design output for the MIT-licensed WorkFlow AI Pro pilot. Do not change working \`src/pilot.mjs\` or automatically promote a model output that looks different but is not better.

The real reference screenshots were captured at 1440x900 by Chromium and fed to Vultr GLM-5.2:
- Superhuman: layered product interfaces and strong product-led composition
- Sunsama: a legible, believable planner app window beside a focused proposition
- Granola: typography, controlled whitespace and app-context framing
- Pass 2 screenshot: actual existing baseline for direct comparison

Captured images are **transient GitHub Actions artifacts**, not checked into the repository. Future captures dismiss visible consent overlays when offered; copies are only used for design analysis, never to reproduce branding or assets.

## Method A — Vision director, then code generation (Pass 4)

[Workflow run 42907884151](https://github.com/Davemafy/seo/actions/runs/42907884151)

1. \`src/reference-capture.mjs\` captured three live website screenshots.
2. \`src/visual-director.mjs\` sent all three JPEG screenshots and Pass 2 PNG to the model, returning a visually grounded art-direction brief.
3. The unchanged \`src/pilot.mjs\` generated TSX/CSS from that brief.
4. A separate no-secret worker compiled and rendered the candidate. The initial UI interaction assertion used full tab text while the candidate displayed abbreviated labels; the semantic test was corrected without weakening the checks.
5. A second job rebuilt the exact candidate, tested all six capability tabs and FAQ behavior, and evaluated geometry against Pass 2: [verification run 42909179277](https://github.com/Davemafy/seo/actions/runs/42909179277).

**Result:** Generated and compiled. Screenshots and interactions passed; quality gate rejected excessive page height. Visual critic verdict: **iterate**.

## Method B — Screenshots sent directly to code generator (Pass 5)

[Workflow run 42909739963](https://github.com/Davemafy/seo/actions/runs/42909739963)

1. \`src/vision-pilot.mjs\` sent **all four actual images in the same Vultr model request as the React source and desired code changes**.
2. The script verified the allowlisted image manifest and SHA-256s and reused existing \`lib.mjs\` validation and import normalization.
3. A separate no-key runner compiled, exercised capability tabs/FAQ and captured two viewports.
4. The measured gate compared it against Pass 2; a separate screenshot critique was run even though the gate failed.

**Result:** Generated and compiled; functional smoke tests passed; geometry gate rejected. Visual critic verdict: **iterate**.

## Measurements

| Candidate | Desktop page height | Mobile page height | Build | Interactions | Model critique | Promotion |
|---|---:|---:|---|---|---|---|
| Pass 2 (baseline) | 2,748px | 4,046px | Pass | Pass | Original baseline | **Retain** |
| Pass 4 (visual analysis then code) | 3,563px (+30%) | 4,377px (+8%) | Pass | Pass (retested) | Iterate | Reject |
| Pass 5 (images directly in code request) | 3,348px (+22%) | 4,701px (+16%) | Pass | Pass | Iterate | Reject |

The browser reports for Pass 4 and Pass 5 show no horizontal page overflow, missing images or JavaScript runtime errors at the two tested viewport sizes. Visual critique observations about unreachability or possible overflow must be confirmed by DOM/browser tests, not accepted as facts.

## Interpretation

**Actual reference images are now integrated.** Both screenshot interpretation and direct image-conditioned code generation work and preserve the functioning engine and security boundaries.

However, screenshots alone did **not** solve the taste problem. The model repeated Pass 2's headline/copy and large parts of its visual architecture, changed UI presentation, and added whitespace/page length. Do not call it a win. This is the central empirical result.

### Next meaningful experiment (not yet implemented)

Instead of another blind full-page generation, split visual design into design-system extraction, bounded composition prototypes (hero only first), and layout comparison at matched viewport sizes. Have a human approve or reject the art direction before generating the remaining page. Keep Pass 2 until an objectively better candidate clears functional and visual acceptance.
