# Expanded Sloppertizer model and artwork benchmark — 11 November 2026

## Question and method
Can a stronger paid coding model, plus bespoke image generation, raise Sloppertizer's Cactus redesign beyond the existing visual quality bar?

Three coding models received the **same pinned Cactus React source**, the same rendered desktop/mobile images, identical engine prompts, bounded scoped-CSS output requirements, and the same browser gates. Browser testing happened on jobs **without inference credentials**. An independently calibrated Muse Glimmer 30B vision model judged the actual candidate screenshots. Nothing was promoted automatically.

Source and artifacts: [expanded benchmark Actions run](https://github.com/Davemafy/seo/actions/runs/43041096563).

## Coding-model results

| Model | CSS generation | Build + browser | Desktop contrast | Mobile contrast | Independent visual score | Rejection reason |
| --- | --- | --- | ---: | ---: | --- | --- |
| GLM-5.2 | Success, 25.1 s | Build and screenshots succeeded | 0 | 0 | 4/5 on all 6 dimensions; advisory pass | Automated overlap detector found one heading/paragraph collision on both viewports |
| MiMo V2.6 Pro | Success, 29.1 s | Build and screenshots succeeded | 0 | 0 | 4/5 on all 6 dimensions; iterate | Mobile hero has excessive headline wrapping; mobile page exceeds previous candidate height by >5%; reviewer flagged tiny, noisy feature navigation |
| MiniMax M3.1 Flash | Success, 14.6 s | Build and screenshots succeeded | 4 | 4 | 3/5 on product evidence and mobile readability; iterate | Company plan details are almost invisible against the light card |

All three had **zero reported JavaScript runtime errors and zero horizontal overflow**. These technical successes did not imply that the designs were good.

Heights from real full-page Chromium screenshots:
- GLM-5.2: desktop 2,804 px; mobile 4,355 px.
- MiMo V2.6 Pro: desktop 2,830 px; mobile 4,724 px.
- MiniMax M3.1 Flash: desktop 2,869 px; mobile 4,479 px.

No candidate passed every gate. This is one website with one generation per model, not a cross-domain or multi-seed quality ranking. In particular, the detected GLM overlap requires manual browser inspection before deciding whether it is a false positive or a genuine layout regression.

## Artwork-model results

Identical **Cactus**-grounded art-direction prompt, 1 image per model, 1,024 × 1,024 output, seed 20261111. The generated samples were **not inserted into source or deployed**.

| Model | Produced image | Observed result | API-reported cost | Licensing |
| --- | --- | --- | --- | --- |
| Qwen Image 2.1 | Yes | Clean, centered sculptural cactus on terracotta platform; followed no-text requirement | $0 in this evaluation response | **Evaluation-only (Qwen Research License) per Vultr model catalog; not for commercial Sloppertizer deployment** |
| Z-Image Turbo | Yes | Cactus photograph, but invented a fake branded navigation/header despite explicit no-text instruction | $0.02097152 | Commercial reuse terms were **not verified**, so do not publish without checking |

Vultr's image-generation API: https://api.vultrinference.com/docs/reference/create-image

## Decision

- Keep GLM-5.2 as the existing **default design generator**, not because it looks premium but because no tested alternative cleared the gates.
- Keep Muse Glimmer 30B as the independent **visual critic**. Its 8/8 calibrated screenshot-reading accuracy supports basic perception, not objective artistic authority.
- **Do not automatically deploy** the three rejected CSS candidates or the evaluation-licensed artwork.
- The next substantial quality intervention is **component-level composition, genuine product visuals, and source-grounded storytelling** instead of repeated global CSS polish. Benchmark at least one unrelated second site and multiple seeds before promoting a different coding model.
- A page with contradictory source product claims (Cactus plant marketing versus developer-seat pricing) needs a product-content blocker rather than model-generated fictional facts.

All numbers above are attributable to the single benchmark run; no conversion-rate or long-run model superiority claims are made.
