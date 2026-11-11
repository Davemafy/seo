# Cactus — final source-grounded plan interaction benchmark

**Date:** 11 November 2026

## Proven result

The independent [MIT-licensed Cactus React landing page](https://github.com/traintocode/landing-page-react-tailwind) was tested with the Sloppertizer engine. A React AST extractor reads the original plan names, literal prices, billing periods and list facts, rejects ambiguous/dynamic facts, and adds a selected-plan interface. The original checkout links and plan content are retained, and the result is tested in Chromium at desktop and mobile sizes.

- [Final verified workflow](https://github.com/Davemafy/seo/actions/runs/43023785200)
- [Unit test workflow](https://github.com/Davemafy/seo/actions/runs/43023785237)

| Metric | Verified |
| --- | --- |
| Generated React app builds | Yes |
| Browser interaction tests | Pass at 1440px and 390px |
| Desktop page height | 2609px |
| Mobile page height | 3404px |
| Horizontal overflow | None |
| Runtime page errors | None |
| Detected axe-core contrast failures | Zero |
| Plan selection | Shows one source plan at a time with matching original facts |
| Original checkout links | Preserved |
| Visual jury | Advisory pass |

The independent model review gave **4/5** for hierarchy, typography, product evidence, composition and mobile readability; **5/5** for brand identity. These are subjective rubric scores, not measurements of conversion uplift or proof of finished commercial quality.

## Remaining product problems

1. The original Cactus source itself mixes plant/living-area claims with software developer pricing (developer counts, premium support periods). Sloppertizer preserved those facts rather than fabricating a coherent new offering. That inconsistency remains and prevents claiming the site is truthful or ready for commercial use.
2. Pricing tabs show one plan at a time. This is compact and functional, but comparing all three requires interaction; the visual reviewer noted that trade-off.
3. The cactus illustration is an original asset from the source, visibly cartoon-like. Sloppertizer did not generate or license replacement artwork.
4. The extractors currently require a supported React JSX structure. They reject unsupported source shapes rather than silently rewriting behavior. One successful unrelated site plus the WorkFlow pilot does **not** establish broad site-agnostic coverage.
5. The tested prototype is an artifact, not an automatically deployed site. No public approval or rollout was made.

## Engine behavior to preserve

- Prioritize real visual quality and credible product explanation, not page-height reduction alone.
- Discover and retain existing assets, links, pricing and controls.
- Reject unsupported or dynamic source facts for automated feature composition.
- Audit the actual rendered mobile/desktop output and interactions, including WCAG contrast.
- Refrain from publishing merely because automated structural and subjective visual gates pass.
- Treat contradictory source claims as a product-content blocker requiring source-owner clarification, **not permission to invent replacement facts**.

The design quality bar improved measurably against the early Cactus output, but a production-quality claim still depends on coherent product information and human review.
