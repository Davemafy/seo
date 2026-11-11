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
