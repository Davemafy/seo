# Portable engine benchmark — 11 November 2026

Sloppertizer's new reusable engine was tested against a second, unrelated MIT-licensed site: https://github.com/traintocode/landing-page-react-tailwind at pinned SHA 0c4fcbe4e98948bf4021384d582ef3865194d98b.

Implementation: src/engine/site.mjs discovers React entry and product context; scope.mjs preserves markup and adds an isolated stylesheet; generate.mjs uses Vultr inference and actual desktop/mobile screenshots; capture.mjs measures the browser; compare.mjs rejects broken pages; copy.mjs rewrites only literal placeholders. Two model-driven styling iterations and one source-grounded copy pass were executed.

| Version | Desktop height | Mobile height | Integrity |
| --- | ---: | ---: | --- |
| Original | 2,760px | 5,322px | Baseline |
| Style pass 1 | 2,241px | 4,290px | Passed |
| Style pass 2 | 2,171px | 3,715px | Passed |
| Style pass 2 + copy repair | 2,197px | 3,765px | Passed |

CI evidence: https://github.com/Davemafy/seo/actions/runs/42990093112 and https://github.com/Davemafy/seo/actions/runs/42991249150

Integrity passed means compilable React app, no page errors, broken images or overflow at tested viewports, and preservation of original link destinations and button count. It does not mean exceptional aesthetic quality.

Observed failures: hero animation remains too faint; model left placeholder copy until the separate copy repair; the CSS styling passes inserted unsupported marketing text via pseudo-elements (a Most Popular badge and tagline). The engine validator has subsequently been tightened to reject generated nonempty pseudo-element text. Pre-existing pass 2 artifacts predate that rule and must NOT be promoted to production.

The copy-repair text is source-grounded but not editorially excellent. This is a CSS-first generalization of the engine; fully autonomous component/TSX redesign has NOT been proven. WorkFlow hand-tuned output remains separate. No Cactus-specific script or manual patch was needed, and nothing was deployed.

Next engine milestone: safe, bounded React composition edits, source-grounded copy checking, and stronger visual acceptance that measures desktop/mobile design without confusing working code for good design.
