# Sloppertizer — portable redesign engine experiment

Sloppertizer is a visual redesign system for existing React websites. It is still experimental: a successful build and screenshot check do not guarantee beautiful design.

## Reusable engine

- `src/engine/site.mjs`: detect the actual product and supported React entry.
- `src/engine/scope.mjs`: preserve JSX, handlers and routes while adding a scoped CSS layer; reject fabricated pseudo-element copy.
- `src/engine/generate.mjs`: generate a product-specific visual redesign through Vultr inference using original desktop and mobile screenshots.
- `src/engine/capture.mjs` and `compare.mjs`: render and check browser integrity, original destinations, heading geometry and overflow.
- `src/engine/copy.mjs`: repair only recognized placeholder JSX paragraphs using source-grounded product facts.
- `.github/workflows/portable-cactus.yml`: independent benchmark, live critique, one automatic iteration and separate no-secret build runners.

## Evidence and current limits

The original manually guided WorkFlow AI Pro experiment is separate from the portable engine. An unrelated MIT-licensed Cactus React landing page passed the automated discovery, two screenshot-led CSS design passes, builds and integrity checks, and a bounded copy-repair experiment.

Read [the exact independent results and failures](docs/portable-engine-results.md). Current output still needs human visual review, and the portable engine has not demonstrated fully autonomous premium component-level redesign.

Run `npm test` to execute guardrail tests. Configure `VULTR_INFERENCE_API_KEY` only as an Actions secret; never commit or paste it. No generated candidate is auto-deployed.

## Model-directed React benchmark (12 November 2026)

MiMo V2.6 Pro, MiniMax M3.1 Flash and GLM-5.2 were tested across Cactus and WorkFlow AI Pro with source-preserving React composition plus CSS. **None passed every design/accessibility gate.** The current defaults remain unchanged. [Read the two-site results](docs/model-benchmark-2026-11-12-composition.md).

## Model roles (benchmarked 11 November 2026)

The **design generator remains GLM-5.2**. The independent default screenshot jury is **Muse Glimmer 30B**. Both roles are overrideable with `SLOPPERTIZER_DESIGN_MODEL` and `SLOPPERTIZER_VISION_MODEL`. No model candidate from the Cactus A/B test met the full premium output bar; do not auto-publish or claim a visual win based only on the model name.

See [controlled model comparison](docs/model-benchmark-2026-11-11.md). Cost-bearing model benchmark workflows are manual by default to avoid unexpected inference charges.
