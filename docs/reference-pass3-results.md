# Sloppertizer Pilot 01 — Pass 3 experimental result

**Experimental question:** Do curated, product-relevant design references improve the visual output compared with Pass 2 when the core redesign engine and model stay the same?

**Input:** Pass 2 candidate `candidate-v2` (Vultr GLM-5.2).  
**Treatment:** reference-conditioned art direction at `docs/reference-conditioned-pass3.md` (Superhuman, Sunsama, Granola, Linear; refer to design principles only).  
**Code engine:** unchanged (`src/pilot.mjs`, `src/lib.mjs` remain the same).  
**Execution:** [GitHub Actions Pass 3, run 42904644571](https://github.com/Davemafy/seo/actions/runs/42904644571).  
**Review basis:** real Chromium 1440px desktop and 390px mobile screenshots, source/browser checks, interaction tests, and manual visual review.

## Results

| Criterion | Pass 2 | Pass 3 |
| --- | --- | --- |
| Desktop page height | 2,748px | 3,763px (+1,015px / +37%) |
| Mobile page height | 4,046px | 4,590px (+544px / +13%) |
| Build | Passed | Passed |
| Browser runtime errors | None | None |
| Broken images | None | None |
| Horizontal overflow | None | None |
| Auth / responsible-AI links | Present | Present |
| Capability tabs / FAQ | Passed | Passed |
| Model visual critique | Pass (prior round) | **Iterate** |
| Manual promotion decision | **Baseline retained** | **Rejected for now** |

## What changed
- Better contrast and a richer dark product-stage mockup with restrained celery accents.
- An illustrated single-workday workflow with meeting actions next to a task schedule.
- Stronger CTA contrast and more deliberate brand color than Pass 2.

## Why it has not beaten Pass 2
- The desktop headline is awkwardly split into ~seven short lines by a 40/60 hero grid. It overpowers the page rather than providing a clear entry point.
- The headline and much of the section architecture remain virtually the same as Pass 2 despite extensive token use. The model mostly changed palette, proportions and mockup ornamentation.
- The workbench demo uses very small text; product detail does not survive a normal full-page screenshot.
- Page height increased by 37% on desktop and 13% on mobile without equivalent added content.
- The model visual critic correctly requested iteration, but some stated defects were speculative: browser evidence confirms no horizontal page overflow, and mobile mockup panels stack. **Treat model critique as hypotheses; verify in the browser.**
- Mobile capability tabs are scrollable; all six passed interaction tests, but the affordance for discovering offscreen tabs can be improved.

## Conclusion

**The engine worked; the design-conditioning hypothesis did not clear the bar.** Curated *text descriptions* of excellent reference websites were not sufficient to produce a consistently stronger result. Do not replace Pass 2 with Pass 3. Keep Pass 3 as evidence and candidate source, not a production upgrade.

## Next controlled experiment

Capture actual licensed/permitted reference visual examples and use a **multimodal art-direction stage**, with measured typography/layout constraints and browser-grounded feedback. Evaluate at equivalent viewports; reject any candidate that does not improve both visual composition and core usability. Keep the existing engine functioning while developing this as an optional experiment. No need for speculative user-facing SaaS features.
