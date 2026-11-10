# Pilot 01 — mandatory second-pass art direction

The first candidate is a good start, not an accepted redesign. Correct the actual browser evidence.

## Structural and visual defects to fix
- **Theme continuity:** The desktop render is near-white, while the 390px mobile render is near-black. This happened because the landing CSS inherits global dark-mode tokens. Own a deliberate, consistent landing-page palette **inside .slp-root**, independent of site/user dark mode. Mobile and desktop must share the same intentional visual system.
- **Broken brand imagery:** The imported BrandMark currently renders broken PNGs in the local candidate (two image failures). Do not use BrandMark in the redesigned landing. Use a clean CSS or inline SVG monogram with no external image URLs; maintain accessible brand text.
- **Too much scrolling:** Desktop candidate was 5230px tall (original 3284px), mobile candidate 6972px (original 5401px). Compress vertical whitespace, feature presentation and mobile flows. Keep all six product capabilities discoverable, but avoid six identical giant sections.
- **Repeated examples:** The hero and Email feature repeat exactly the same email composer, wasting space. Create an effective new hero demonstration and compact varied feature examples.
- **Small UI text:** Keep operational mockup labels readable on a 390px viewport. Aim at 14px or larger for meaningful body text with proper responsive widths. No horizontal overflow at 390px.
- **Keep real navigation:** Preserve functional root, /auth and /responsible-ai routes, the #features anchor and real FAQ accordion interactions.
- **Copy accuracy:** Product-specific examples are good. Do not invent new integrations, made-up results, fabricated screenshots, false promises or fake operational controls.

## Important correction to prior model critique
The previous model critic proposed restoring the original 120K+ users, 8.4M tasks, 47% gains and testimonials. **These marketing numbers and testimonials are not verified. Do NOT restore them.** Prefer credible product demonstrations, specific use cases and trustworthy claims. Better design must never mean fabricated trust signals.

## Taste bar
Build an interface a top product designer could endorse. Careful typographic hierarchy, ownable identity, focused composition, subtle color and purposeful contrast. No gradients/glass/simulated terminal fluff. Respect alignment, negative space, and real user purpose. No aesthetically fake click targets. Improve desktop and mobile, not only one.
