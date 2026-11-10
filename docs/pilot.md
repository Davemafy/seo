# Pilot 01: WorkFlow AI Pro

Input: https://github.com/TinyikoMamban/workflowai-pro (MIT)
Pinned upstream commit: 1ab6e6fba96ad6cadec64bfa9132398313b40986
Baseline: https://workflowai-pro.lovable.app

## Goal
Generate a distinctive landing-page redesign while keeping the application behavior and routes. Judge on actual desktop/mobile screenshots. This repo implements an experimental engine, not a finished SaaS.

## Procedure
1. Clone the target repo separately; check out the pinned upstream commit.
2. Inspect: node src/pilot.mjs --project ./workflowai-pro --audit
3. In a trusted inference-only environment with the Vultr key: node src/pilot.mjs --project ./workflowai-pro --output ./candidate-v1
4. In a separate disposable no-secret sandbox, run candidate dependencies and app locally. Capture: node src/capture.mjs --url http://localhost:3000 --output ./shots
5. Compare screenshots using: node src/critique.mjs --before baseline.png --after shots/desktop.png --mobile shots/mobile.png --output feedback.json
6. Re-run pilot on the prior candidate with --feedback feedback.json --output ./candidate-v2. Continue only if improvements are verified.

Never execute third-party source or install its dependencies where VULTR_INFERENCE_API_KEY is available. Never run authenticated Supabase write tests on third-party data. Our copy excludes tracked .env files, symlinks, credentials, .git and build outputs. Treat code-generated pages as untrusted until built and browser-tested in the isolated worker.

Acceptance: no build errors; working /auth and /responsible-ai routes; no overflow at 390px; no runtime errors; no fabricated product claims; clear structural visual improvement.

Status: engine implementation and unit tests only; no completed redesign has been verified yet.
