# Model-directed React composition benchmark — 12 November 2026

## Decision

**Do not switch the Sloppertizer default model. No candidate met the premium visual acceptance threshold on both independent sites.** Keep `glm-5.2` as the provisional code/style generator and `muse-glimmer-30b` as the independent screenshot critic. The model name itself is not a substitute for credible product storytelling.

## Method

Six planned candidates were given the same pinned source per site, real original desktop/mobile screenshots, the same source-preserving React composition engine, and the same scoped-CSS policy. Three models: `mimo-v2.6-pro`, `minimax-m3.1-flash`, `glm-5.2`. Two sites:

- Cactus: `traintocode/landing-page-react-tailwind`, revision `0c4fcbe4e98948bf4021384d582ef3865194d98b` (4 source features)
- WorkFlow AI Pro: `TinyikoMamban/workflowai-pro`, revision `1ab6e6fba96ad6cadec64bfa9132398313b40986` (6 source features)

The code model was allowed to **choose one verified React layout** and generate supplementary CSS. The original React feature subtrees, feature copy, handlers, routes and links were retained. This is a *bounded composition-plus-CSS experiment*, **not unconstrained AI-authored JSX**. A separate no-secret worker built and rendered the candidates in Chromium at 1440px and 390px, exercised the original feature cards, and ran axe-core contrast, runtime, link and overlap checks. Muse Glimmer 30B then assessed the real screenshots without automatically approving publication.

All **five valid generated candidates chose `editorial-rail`**. Thus this experiment mostly tested how the models styled the same permitted composition, not varied React structures.

## Verified model results

| Site | Model | Generation / React build | Desktop AA contrast failures | Mobile AA contrast failures | Browser compatibility | Independent visual outcome |
| --- | --- | --- | ---: | ---: | --- | --- |
| Cactus | GLM-5.2 | Success / success | 12 | 12 | Rejected: contrast regression | Iterate: typography 3/5, product evidence 2/5 |
| Cactus | MiMo V2.6 Pro | Success / success | 2 | 2 | Compatible only with inherited defects | Iterate: hierarchy 3/5, evidence 2/5 |
| Cactus | MiniMax M3.1 Flash | Success / success | 1 | 1 | Compatible only with inherited defects | Iterate: hierarchy 3/5, evidence 2/5 |
| WorkFlow AI Pro | GLM-5.2 | Success / success | 0 | 0 | Compatible with inherited defects | Iterate: hero/features alignment 3/5; no uplift over baseline |
| WorkFlow AI Pro | MiMo V2.6 Pro | Success / success | 7 | 7 | Rejected: contrast regression; one feature interaction/style assertion failed | Iterate: mobile readability 2/5, critical illegibility |
| WorkFlow AI Pro | MiniMax M3.1 Flash | Rejected by bounded CSS validator | — | — | No app generated for browser verification | No visual claim |

All five compilable builds had **zero JavaScript page errors and zero horizontal overflow**, but passing the build does not mean satisfying visual taste, accessibility or factual quality. Some original-source defects were preserved; compatibility with inherited issues does not mean production readiness.

### What the screenshots show

- Cactus contains **Lorem ipsum** and contradictory plant-versus-developer-seat messaging in its pinned source. Recoloring or rearranging that content cannot manufacture authentic product proof. Its hero artwork remains simplistic.
- MiMo's WorkFlow feature area is nearly invisible on both viewports. This is a concrete example of failed visual direction despite working source code.
- GLM-5.2 kept WorkFlow text readable but its left-aligned feature section conflicts with the remaining centered layout; the judge found no actual improvement over the original.
- All three models independently chose the same `editorial-rail` structure for both unrelated sites. The tightly bounded design vocabulary and CSS-first refinement remain the main limitation.

## Image model experiment

Previously completed in [expanded Vultr model/art benchmark](https://github.com/Davemafy/seo/actions/runs/43041096563) with the *same grounded cactus art prompt*:

- **Qwen Image 2.1:** a clean, coherent studio botanical still life. **Evaluation-only/Qwen Research License per Vultr's catalog**; do not ship it as a commercial Sloppertizer asset.
- **Z-Image Turbo:** visually plausible cactus, but fabricated a brand/navigation bar despite explicit no-text instructions. Commercial reuse rights were not verified; also not approved for product export.

No generated artwork was injected into the React source.

## Provenance and acceptance

- [Model-directed source generation](https://github.com/Davemafy/seo/actions/runs/43250739608) — valid source artifacts and a documented MiniMax rejection
- [Keyless browser builds and independent Muse jury](https://github.com/Davemafy/seo/actions/runs/43251177109) — per-model desktop/mobile image and report artifacts
- [Earlier pure-CSS model comparison](https://github.com/Davemafy/seo/actions/runs/43041096563)

**Acceptance: 0/6**. The result is not a cross-model league table; this is one attempt per model/site, two source sites and a single independent model's qualitative assessment. Aesthetic preference should be independently reviewed by a human, and source contradictions require product-owner clarification, not generated fictional claims.

The next bottleneck is a richer verified composition vocabulary and source-grounded product demonstrations, not changing the LLM default without evidence.
