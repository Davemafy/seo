# Pass 3 — reference-conditioned art direction

## Why this experiment exists
Pass 2 of WorkFlow AI Pro is a functioning baseline, but its output is still too anonymous: tasteful, clean, flat and editorial without an unmistakable visual system. The hero's miniature UI mockup does not feel like a convincing centerpiece; too much of the page is warm-white and ruled lines; the product demonstration competes poorly against huge whitespace. This pass tests whether SPECIFIC external reference patterns improve visual quality instead of merely changing colors.

## Source references — study the principles, not layouts, copy or assets
- **Superhuman** — https://superhuman.com/ — Observe the immediate product-first expression of usefulness: prominent conversational action, actual-feeling software surfaces, concise proposition, disciplined contrast. Borrow **product-dominant composition** and the sense that software is the hero. Do not copy its branded colors, imagery or visual assets.
- **Sunsama** — https://www.sunsama.com/ — Observe how a planner interface can communicate a clear job-to-be-done through a confident typographic headline, restrained warmth and an intelligible calendar/workspace demonstration. Borrow the **explanatory quality of a realistic daily schedule**, not its actual UI.
- **Granola** — https://www.granola.ai/ — Observe the humanity of concise, product-specific language, editorial tension and tactile app-window presentation. Borrow **typographic conviction and purposeful section choreography**. Do not copy its distinctive serif/olive palette or composition.
- **Linear's recent interface design review** — https://linear.app/now/behind-the-latest-design-refresh — Observe a high-information workspace that remains readable through disciplined hierarchy, precise placement and reduced interaction clutter. Borrow **control density and alignment**, not the brand.

## One art direction for WorkFlow AI Pro
**A focused workbench, not another AI marketing page.**

*Positioning:* WorkFlow AI Pro turns six disconnected work chores into one deliberate rhythm — write, meet, plan, research and act. The story is a single coherent workday, not "six superpowers."

*Visual personality:* Quiet confidence with sharp, specific utility. Use an original, carefully designed PRODUCT interface as the visual identity. Avoid the generic light-editorial look of Pass 2 AND the blue-purple glowing glass of the Lovable original. Give the page contrast and a visual pulse.

*Suggested palette:* warm near-white #F7F5F0, ink #171A19, cool graphite #252E2D as one contained product-stage surface, electric celery #C6EA58 as a sparingly used signal color; light stone dividers. Use the accent on a small number of controls/timeline signals, not fills across the page. Keep the brand visually identifiable without leaning on gradients or glass. You may choose a more effective palette if you can explain its purpose.

*Typography:* Headline uses a single strong contemporary sans-serif with high contrast and confident size (desktop target 72–88 px; mobile 44–52 px). Mix serif only if it is doing real narrative work and never as arbitrary italic decoration. Operational UI should remain legible at 13–15 px. Body 17–19 px. Micro-labels minimum 12 px. Prefer system font stack for reliability.

*Hero:* Make one convincing, large interactive-looking yet honestly labeled **illustrative demo** of a real workflow. Avoid a tiny fake browser beside generic left aligned text. Give the demo significant visual area and hierarchy, with credible data and rich spatial relationships (inbox -> notes -> tasks or meeting -> action plan). Align its layout on a coherent grid. Avoid implying that unauthenticated demo widgets actually execute AI.

*Story sequence:* 
1. A bold, specific promise + action / sign in.
2. A substantial illustration of one working-day flow: raw meeting note -> extracted actions -> planned schedule. Provide clearly labeled static sample data, no fabricated external integrations.
3. Six actual capabilities in an accessible, interactive component with genuinely distinct previews, not six repeated icon cards.
4. One differentiated trust/privacy explanation linking to the existing responsible-AI route, without unverifiable company claims.
5. Compact FAQ and strong finish.

*Spacing and composition:* max content width 1180–1240 px; 12-column system or coherent split; 72–112px section rhythm on desktop, compress on mobile. Rebalance the oversized upper whitespace and ensure visual detail doesn't shrink to miniature in screenshots. Vary composition purposely between sections. A strong product showcase can occupy 55–65% of hero visual impact. No invisible split-screen asymmetry just for novelty.

*Interaction details:* Maintain functional /auth and /responsible-ai links, all six accessible capability tabs, FAQ accordion, and #features anchor. Visible hover/focus/active states; all touch targets comfortably usable; respect prefers-reduced-motion. Do NOT show a mouse-pointer cursor on noninteractive demo labels.

*Credibility:* Do not assert invented metrics/testimonials, fake partnerships, nonexistent integrations, or features beyond the supplied source. Demo content must be explicitly illustrative. The URL is the actual WorkFlow AI Pro pilot; preserve the public identity.

*Technical constraints:* Keep existing root TanStack Router route, import ../sloppertizer-landing.css, use .slp- scoped CSS only. No modification to backend, .env or auth. Do not paste or cite reference source code, designs or copyrighted assets. Generate your own implementation.

## Direct comparison against Pass 2
Pass 3 should WIN on:
- A visually distinctive ownable brand/product stage rather than a generic beige template.
- Stronger, better proportioned hero; visual impact at 1440 x 900.
- Product demonstrations with legible text and believable workflow structure.
- Section pacing and visual depth; not an artificially long page.
- Desktop and 390px mobile quality simultaneously.
- Intact working tabs/FAQ/navigation, zero broken imagery, zero overflow, no runtime errors.

If the result merely changes color or makes the layout busier, it loses. Prefer Pass 2 over a worse Pass 3.