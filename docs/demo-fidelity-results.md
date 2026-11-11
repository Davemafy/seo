# Sloppertizer — product demonstration fidelity experiment

## Objective
Improve the **Stage-led** landing-page product preview without triggering another speculative full-page redesign. This is an optional, testable candidate, not a live deployment.

## Before / after
**Before:** a small generic "Brief → Generated Plan" window consisting of one sentence and a list of time slots.

**After:** a purposefully designed, believable sample workspace:
- A scoped application sidebar with context, navigation labels and a current desk.
- Realistic **meeting note → extracted decision → prepared actions** flow.
- Two editable-looking but deliberately noninteractive sample tasks, with priority labels and review state. The UI is explicitly labeled as an illustrative workday, not a connected AI demonstration.
- A compact schedule summarizing how the prepared actions fit into the rest of a workday.
- Product-specific typography, borders, density, active navigation styling and responsive composition within the existing dark Stage-led frame.

The example is **not functional AI**. All displayed work items are illustrative, no messages are sent, and the panel does not pretend to have real account data.

## Locked scope
Script: \`src/demo-fidelity.mjs\`.
- Input: previously compiled \`stage-led\` candidate from GitHub Actions run \`42973379855\`.
- Only edits: the \`HeroWorkspace\` TSX component in \`src/routes/index.tsx\` and newly added \`src/sloppertizer-demo.css\`.
- The suffix beginning with \`function Capabilities()\` is checked to be **byte-for-byte identical**.
- Original Sloppertizer redesign engine, authentication, Supabase, routes, six capability tabs and FAQ remain unchanged.

## Actual verification
[GitHub Actions run 42978114289](https://github.com/Davemafy/seo/actions/runs/42978114289) compiled the candidate in a separate uncredentialed worker, ran Chromium at \`1440×900\` and \`390×844\`, verified six functional capability tabs and FAQ interactions, checked the product demo content, clipping, font sizes, browser errors, broken images and layout regressions.

| Metric | Stage-led | Detailed Stage-led |
| --- | ---: | ---: |
| Desktop page height | 2682px | **2682px** |
| Mobile page height | 3758px | **4057px** (+299px, 8%) |
| JS runtime errors | 0 | **0** |
| Broken images | 0 | **0** |
| Horizontal overflow | None | **None** |
| Existing interactions | Passed | **Passed** |
| Product detail | One simple input and four plan rows | Meeting source, extracted decision, reviewable actions, planned schedule |

New browser semantic checks also passed: all three sample workflow panels exist, two prepared actions appear, essential preview text uses at least 11px, the sidebar disappears on 390px, and the sample UI does not overflow the stage.

## Assessment and limitation
The new demo is visibly richer and much more specific to WorkFlow AI Pro. Desktop height is unchanged. Mobile height grows 8% because the additional content stacks into readable cards rather than being compressed into tiny text.

**This passes engineering acceptance, not yet a human taste decision.** Stage-led remains the prior visual reference; the detailed version is a strong new candidate for review, not automatically promoted or deployed.

No inference credits were used for this experiment. The change is deterministic and was validated with a real app build and screenshots.
