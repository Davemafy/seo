# Sloppertizer model benchmark — 11 November 2026

## Tested, not assumed

Used Vultr's public live model catalog to confirm advertised image input. Then sent **two different synthetic PNG screenshots**, each with a unique brand, tiny verification code, color, and selected pricing plan. Required exact JSON answers; actual serving model IDs were checked. **All four models scored 8/8**:

| Image-reading model | Exact visual facts | Estimated cost for two requests |
| --- | ---: | ---: |
| GLM-5.2 | 8/8 | $0.002518 |
| GLM-5.3 | 8/8 | $0.002197 |
| Muse Glimmer 30B | 8/8 | $0.001235 |
| DeepSeek V4.1 Flash 1017 | 8/8 | $0.000412 |

Source: [paired-image calibration workflow](https://github.com/Davemafy/seo/actions/runs/43036342842). This tests **Vultr's end-to-end screenshot interpretation**, not the internal architecture of the model, and does not establish artistic taste.

## Three code models, identical source and evidence

Ran GLM-5.2, GLM-5.3, and Qwen3.8-27B on the **same pinned Cactus React source, identical generated-site screenshots, same prompts and acceptance gates**. All generated CSS candidate source successfully. Model-specific browser builds were then rendered in Chrome at 1440px desktop and 390px mobile. One independent image-calibrated critic, **Muse Glimmer 30B**, judged all three.

| Code model | Browser structure | Desktop contrast failures | Mobile contrast failures | Visual jury: mobile | Overall approval |
| --- | --- | ---: | ---: | ---: | --- |
| GLM-5.2 | Eligible for visual review | 0 | 0 | **2/5** | **Rejected**: mobile pricing heading and paragraph overlap |
| GLM-5.3 | Rejected | 3 | 3 | 3/5 | **Rejected**: illegible pricing details, weaker product evidence |
| Qwen3.8-27B | Rejected | 3 | 3 | 3/5 | **Rejected**: illegible Company pricing text |

There were zero JavaScript errors and zero horizontal overflow in the three tested candidates. Those results do **not** imply the designs are ready to publish.

Sources: [full candidate-generation experiment](https://github.com/Davemafy/seo/actions/runs/43034692874), [completed calibrated browser/jury comparison](https://github.com/Davemafy/seo/actions/runs/43036678898).

## Engineering decision

- **Keep GLM-5.2 as the current generator**: only candidate to clear technical acceptance, though **its mobile visual failure means that candidate must not be shipped**. No evidence that switching to GLM-5.3 or Qwen3.8 produces consistently better designs.
- **Use Muse Glimmer 30B as the independent default screenshot critic**, avoiding same-model self-evaluation; its critique correctly identified the severe mobile overlap seen in the real screenshot. This is a role-separation decision, not proof Muse is inherently more artistic.
- **Fail closed on quality regressions**: a pass requires the responsive build, real screenshot checks, accessibility, independent visual review, and eventually human approval. No model migration was deployed automatically.
- **Do not pay repeatedly for the same experiment**: model benchmark Actions workflows are manual by default. Production model IDs can be overridden with `SLOPPERTIZER_DESIGN_MODEL` and `SLOPPERTIZER_VISION_MODEL`.

Next evaluation should include several unrelated sites (not just Cactus), adversarial layout problems, and multi-seed replicates before changing the default coding model. Current performance is one-site evidence only.
