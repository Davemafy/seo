# Structural Studio — first real-site breakthrough trial (12 November 2026)

## Decision
**Preserve the full JSX creative architecture experiment. Reject the first output as premium.** This is a measurable leap beyond CSS-only conditioning, not proof that Sloppertizer can autonomously produce excellent commercial design.

## Source and method
- Source: MIT-licensed `TinyikoMamban/workflowai-pro`, pinned revision `1ab6e6fba96ad6cadec64bfa9132398313b40986`.
- Inputs: authentic 1440px and 390px Chromium screenshots of original website, original TSX and styles, source-backed product capabilities, and archived Daybook creative exploration.
- Generator: Vultr `glm-5.2` writes a *complete replacement landing React component and scoped stylesheet*. The model can change composition, copy hierarchy, interactive demos, typography and architecture, without changing other routes, auth, dependencies or app secrets.
- Safeguards: source facts, safe imports, no secret-bearing target-code execution, explicit auth/responsible-AI destinations, six capability names, interactive tabs, FAQ, strict generated-file allowlist.
- Generation run: https://github.com/Davemafy/seo/actions/runs/43273641134
- Replay and browser/jury run: https://github.com/Davemafy/seo/actions/runs/43274522232

## Observed results

| Gate | Result |
| --- | --- |
| Full JSX generation | Yes, complete alternative route and 36 KB stylesheet |
| Static candidate validation | Initial reject: standalone `.slp-*` selectors and named `@keyframes` mistakenly treated as unsafe |
| Exact archived response replay | Accepted without new generation spending after rule correction |
| Actual TanStack app compilation | Passed |
| Page runtime errors | Zero on desktop and mobile |
| Horizontal overflow | Zero at 1440px and 390px |
| Missing images | Zero |
| Axe AA contrast violations | Zero, but automated axe alone missed visually invisible CTA text |
| Interactive tabs | Three working distinct panels on both viewports |
| FAQ | Expanded on click |
| Keyboard tab arrows | **Rejected**: no arrow-key behavior |
| Desktop full-page height | 4738px vs original 3284px (+44%) |
| Mobile full-page height | 6525px vs original 5401px (+21%) |
| Premium approval | **Rejected / iterate** |

## Independent jury
Muse Glimmer 30B, judging actual screenshots, gave:
- Visual hierarchy: 3/5
- Typography: 4/5
- Product evidence: 2/5
- Brand identity: 2/5
- Section composition: 4/5
- Mobile readability: 4/5
- Verdict: **iterate**, not better than baseline.

**Calibration caveat:** The judge penalized the intentional move away from the original purple-gradient brand. That is not sufficient grounds to reject a deliberate Sloppertizer rebrand. The jury prompt was amended to evaluate coherence and product fit instead of color matching.

## Human visual inspection
- The editorial broadsheet layout is a new actual composition, not a recolor of the previous landing page.
- The hero has modest product evidence; large portions read like an article *about* the product rather than a credible software site.
- Some authored newsroom language implies an editorial team that is not established by the source.
- **Critical false negative:** Black CTA backgrounds appear blank in screenshots. A higher-specificity `.slp-creative a` rule overrides a lower-specificity `.slp-cta-primary` or `.slp-cta-inline` foreground. Automated axe reported zero contrast violations yet failed to expose the disappearance. A regression gate now rejects this cascade pattern.
- Vertical density is still weak. More page length is not inherently wrong, but additional sections must justify it with substance or product evidence.

## What the experiment changes
1. The generator may author complete React structure. **The CSS-only ceiling has been removed for this isolated studio.**
2. Behavior preservation is checked after rendering, not achieved by prohibiting layout changes.
3. Raw model responses are archived before validation, and can be replayed without another costly inference call.
4. Product truth, secure execution, keyboard behavior, visible CTA text, accessibility and independent visual judgment remain the real limits.
5. The latest generator saves token usage and model-price estimates before candidate rejection; browser compute and other services are excluded.

## Next research problem
Not more hero gradients or template presets. Develop an evidence-led visual iteration loop: capture the actual browser output, identify objective interaction/readability defects, inspect real product surfaces, have the agent repair full JSX/CSS, then re-run browser tests and human visual selection. Compare multiple genuinely different compositional proposals without equating model scores with taste.

No candidate was published or deployed. Existing production state is unchanged.
