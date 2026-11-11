# Pilot 01 — composition control experiment

## What changed

This experiment deliberately DID NOT ask a language model to rewrite the landing page.

The optional \`src/composition-lab.mjs\` uses two pre-authored, bounded hero layouts. It starts with the pinned, verified Pass 2 source from GitHub Actions artifact \`candidate-v2\` (run \`42884884229\`). It modifies only:

- \`src/routes/index.tsx\` — the hero JSX plus a new scoped CSS import.
- \`src/sloppertizer-composition.css\` — a separate, hero-scoped stylesheet.

The engine checks and hashes the content from \`<section id="features">\` to the end of the source, confirming it remains **byte-identical** in both variants. Auth, Supabase, feature tabs, FAQ, the rest of the application and the original Sloppertizer engine are untouched.

## Locked design-system constraints

The patterns were drawn from the earlier image-grounded study of Superhuman, Sunsama and Granola, then intentionally bounded rather than copied:

- **Product-first:** a substantial real-feeling workday/schedule preview, instead of gradients, invented statistics or generic feature cards.
- **Typographic hierarchy:** contemporary sans-serif, deliberate 2–3 line headline, readable paragraphs and a single dominant CTA.
- **Color roles:** controlled warm-neutral paper \`#F5F6F1\`, dark ink \`#172521\`, muted green signal \`#4B705E\`, dark workbench \`#1A3027\`. These are experimental, not established brand colors.
- **Composition choices:** a wider right-side product stage (\`stage-led\`) or a full-width application canvas below a compact editorial header (\`product-canvas\`).
- **Viewport contract:** desktop \`1440x900\`, mobile \`390x844\`, no overflow/broken images/runtime errors. Preserve capability tabs, FAQ and navigation.
- **Preservation:** no repeated full-page AI rewrites. Only a narrow area changes so visual causes can be isolated.

## Actual outcomes

[GitHub Actions run 42973379855](https://github.com/Davemafy/seo/actions/runs/42973379855) compiled both variants in separate no-secret workers, captured real Chromium screenshots, ran desktop/mobile interaction tests, and checked headline geometry/page length against Pass 2.

| Candidate | Desktop height | Mobile height | Desktop H1 | Mobile H1 | Functional tests | Objective regression gate |
| --- | ---: | ---: | --- | --- | --- | --- |
| Pass 2 — accepted baseline | 2748px | 4046px | — | — | Passed | Reference |
| Stage-led | **2682px** (−66px) | **3758px** (−288px) | 3 lines, 60px | 2 lines, 39px | Passed | Passed |
| Product canvas | 2904px (+156px) | **3739px** (−307px) | 2 lines, 69px | 2 lines, 39px | Passed | Passed |

Both new compositions compiled without errors, had zero browser errors and missing images, no horizontal overflow, and functional auth navigation, six capability tabs and FAQ on both viewports.

**Qualitative judgment:** Stage-led is the preferred experiment. It makes the product preview more prominent while keeping the hero compact. The product-canvas option has a high-impact headline but produces excessive, underutilized whitespace in its full-width product panel. Neither is the final taste bar: the inherited mockup remains simplistic, and the experimental green color system does not yet carry through the other page sections.

## Approval and next step

**Stage-led: proposed for human review.** Do not automatically deploy or promote it. Pass 2 remains the last accepted baseline. A human can inspect the desktop and mobile comparisons, approve the composition, or request another bounded variant. Only after approval should the system consider changing the rest of the page. The next improvement should increase the fidelity of the real product demonstration and align a complete design-system palette with the existing brand — without adding page height.
