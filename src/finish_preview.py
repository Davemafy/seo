#!/usr/bin/env python3
"""Polish the lower half of the verified WorkFlow preview.

Requires the already-verified Stage-led + interactive-workbench source.
Edits copy, section labeling and a separate scoped stylesheet. Does not
change the hero, reusable product demo, capability logic, FAQ logic or backend.
"""
from pathlib import Path
import hashlib
import json
import shutil
import sys

STYLE = r"""
/* Sloppertizer editorial finish. Scoped to the landing page; no global resets. */
.slp-root #features {
  background: #FCFBF8;
  border-top: 1px solid #E2E8E0;
  scroll-margin-top: 76px;
}
.slp-root .slp-section-head {
  width: min(1180px, calc(100% - 48px));
  max-width: none;
  margin: 0 auto;
  padding: 69px 0 36px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  column-gap: 72px;
  row-gap: 12px;
  align-items: end;
}
.slp-root .slp-section-head > .slp-mono {
  grid-column: 1 / -1;
  margin-bottom: 9px;
  color: #487856;
}
.slp-root .slp-section-head .slp-section-title {
  grid-column: 1;
  margin: 0;
  font-size: clamp(34px, 3.6vw, 48px);
  line-height: 1.075;
  letter-spacing: -.054em;
  max-width: 640px;
  font-weight: 680;
  text-wrap: balance;
}
.slp-root .slp-section-head .slp-section-title .slp-italic {
  font-style: normal;
  font-weight: 570;
  color: #4B7656;
}
.slp-root .slp-section-head .slp-section-desc {
  grid-column: 2;
  align-self: end;
  margin: 0;
  padding-bottom: 5px;
  max-width: 400px;
  color: #667669;
  font-size: 15px;
  line-height: 1.64;
}
.slp-root .slp-cap {
  width: min(1180px, calc(100% - 48px));
  max-width: none;
  margin: 0 auto 68px;
  padding: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  align-items: stretch;
  gap: 0;
  border: 1px solid #DCE4D9;
  border-radius: 13px;
  background: #FFFFFF;
  overflow: hidden;
  box-shadow: 0 9px 32px -25px #254E351F, 0 1px 0 #EEF2EC;
}
.slp-root .slp-cap-list {
  padding: 17px 11px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #F1F4EE;
  border-right: 1px solid #DCE4D9;
  min-width: 0;
}
.slp-root .slp-cap-tab {
  display: grid;
  grid-template-columns: 22px 21px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 57px;
  padding: 9px 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  transition: background .18s ease, border-color .18s ease;
}
.slp-root .slp-cap-tab:hover { background: #E8EFE5; }
.slp-root .slp-cap-tab:focus-visible {
  outline: 2px solid #337C4C;
  outline-offset: 2px;
  z-index: 1;
}
.slp-root .slp-cap-tab-on {
  background: #DEEDDC;
  border-color: #C1D8C1;
  box-shadow: inset 3px 0 0 #3B8354;
}
.slp-root .slp-cap-tab-num { font-size: 10px; color: #799080; }
.slp-root .slp-cap-tab-icon { color: #577565; }
.slp-root .slp-cap-tab-icon svg { width: 17px; height: 17px; stroke-width: 1.7; }
.slp-root .slp-cap-tab-on .slp-cap-tab-num { color: #38704B; }
.slp-root .slp-cap-tab-on .slp-cap-tab-icon { color: #265F3B; }
.slp-root .slp-cap-tab-title {
  font-size: 12px;
  font-weight: 620;
  line-height: 1.4;
  letter-spacing: -.012em;
}
.slp-root .slp-cap-tab-short {
  font-size: 10px;
  margin-top: 3px;
  color: #748578;
}
.slp-root .slp-cap-detail {
  min-width: 0;
  padding: 24px 29px 26px;
  gap: 21px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
}
.slp-root .slp-cap-detail-text { padding: 0; gap: 9px; max-width: 760px; }
.slp-root .slp-cap-detail-text > .slp-mono { font-size: 10px; color: #3A7B50; }
.slp-root .slp-cap-title {
  font-size: 26px;
  line-height: 1.12;
  letter-spacing: -.045em;
  font-weight: 680;
}
.slp-root .slp-cap-desc {
  max-width: 590px;
  color: #607166;
  font-size: 14px;
  line-height: 1.56;
}
.slp-root .slp-cap-detail-visual { min-width: 0; }
.slp-root .slp-prev {
  border-radius: 10px;
  border: 1px solid #DEE6DD;
  box-shadow: 0 9px 27px -24px #163B261C;
  background: #FFFFFF;
  overflow: hidden;
}
.slp-root .slp-prev-head {
  background: #F2F6F0;
  border-bottom: 1px solid #E0E9DE;
}
.slp-root .slp-prev-dot { background: #45895B; }
.slp-root .slp-prev-tag { background: #F2F7F1; }
.slp-root .slp-prev-tagdot { background: #3E8155; }

/* A quiet trust chapter with strong typography and a readable policy link. */
.slp-root .slp-approach {
  background: #ECF2E9;
  border-top: 1px solid #DEE9DD;
  border-bottom: 1px solid #DEE9DD;
  padding: 65px 24px;
}
.slp-root .slp-approach-inner {
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 80px;
  align-items: center;
}
.slp-root .slp-approach .slp-mono.slp-accent { color: #477652; }
.slp-root .slp-approach-title {
  font-size: clamp(34px, 3.65vw, 49px);
  line-height: 1.08;
  letter-spacing: -.055em;
}
.slp-root .slp-approach-title .slp-italic {
  font-style: normal;
  font-weight: 560;
  color: #54785B;
}
.slp-root .slp-approach-body {
  font-size: 15px;
  line-height: 1.7;
  max-width: 620px;
  color: #4B6151;
}
.slp-root .slp-approach-link {
  font-size: 13px;
  color: #215D39;
  font-weight: 670;
  width: fit-content;
  text-decoration: none;
  border-bottom: 1px solid #8EAD92;
  padding-bottom: 6px;
}
.slp-root .slp-approach-link:hover { border-color: #215D39; }
.slp-root .slp-approach-link:focus-visible { outline: 2px solid #337C4C; outline-offset: 4px; }

/* FAQs read as a useful editorial page, not a form field stack. */
.slp-root .slp-faq { background: #FCFBF8; padding: 65px 24px; }
.slp-root .slp-faq-inner { gap: 62px; }
.slp-root .slp-faq .slp-mono.slp-accent { color: #487856; }
.slp-root .slp-faq .slp-section-title {
  font-size: clamp(33px, 3.3vw, 45px);
  line-height: 1.09;
  letter-spacing: -.052em;
}
.slp-root .slp-faq-item { border-bottom: 1px solid #DCE5DB; }
.slp-root .slp-faq-trigger {
  min-height: 56px;
  padding: 15px 4px;
  color: #243E2F;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 580;
  text-decoration: none !important;
}
.slp-root .slp-faq-trigger:hover { color: #2E8050; }
.slp-root .slp-faq-trigger:focus-visible { outline: 2px solid #337C4C; outline-offset: 2px; }

/* The close is deliberately dark, balancing the dark application stage in the hero. */
.slp-root .slp-cta-section {
  background: #173C2C;
  color: #ECF5EA;
  border-top: 1px solid #234F3B;
  padding: 72px 24px;
}
.slp-root .slp-cta-inner { gap: 56px; }
.slp-root .slp-cta-title {
  color: #F0F8EE;
  font-size: clamp(36px, 3.8vw, 51px);
  line-height: 1.09;
  letter-spacing: -.054em;
  font-weight: 690;
}
.slp-root .slp-cta-title .slp-italic {
  color: #CFE9B2;
  font-style: normal;
  font-weight: 550;
}
.slp-root .slp-cta-desc {
  color: #C1D7C3;
  font-size: 15px;
  line-height: 1.65;
  max-width: 405px;
}
.slp-root .slp-cta-primary {
  background: #D8F1B7 !important;
  color: #173928 !important;
  border-color: #D8F1B7 !important;
  border-radius: 7px;
  box-shadow: none;
  font-size: 14px;
  font-weight: 690;
}
.slp-root .slp-cta-primary:hover { background: #ECFBD5 !important; }
.slp-root .slp-cta-primary:focus-visible {
  outline: 2px solid #ECFBD5;
  outline-offset: 4px;
}
.slp-root .slp-footer {
  background: #142D22;
  border-top: 1px solid #30513D;
}
.slp-root .slp-footer .slp-mono.slp-dim,
.slp-root .slp-footer-link { color: #C7D8C8; }
.slp-root .slp-footer-link:hover { color: #F1F9E7; }
.slp-root .slp-footer-mark { border: 1px solid #47674F; border-radius: 7px; }

@media (max-width: 960px) {
  .slp-root .slp-section-head { grid-template-columns: minmax(0,1fr) minmax(0,.9fr); column-gap: 32px; }
  .slp-root .slp-cap { grid-template-columns: 225px minmax(0,1fr); }
  .slp-root .slp-cap-detail { padding: 20px; }
  .slp-root .slp-cap-list { padding: 12px 8px; }
  .slp-root .slp-approach-inner { gap: 32px; }
}
@media (max-width: 720px) {
  .slp-root .slp-section-head {
    width: calc(100% - 36px);
    grid-template-columns: minmax(0,1fr);
    row-gap: 15px;
    padding: 43px 0 24px;
  }
  .slp-root .slp-section-head > .slp-mono,
  .slp-root .slp-section-head .slp-section-title,
  .slp-root .slp-section-head .slp-section-desc { grid-column: 1; }
  .slp-root .slp-section-head > .slp-mono { margin-bottom: 0; }
  .slp-root .slp-section-head .slp-section-title {
    font-size: clamp(32px, 8.4vw, 42px);
    max-width: 490px;
    line-height: 1.1;
  }
  .slp-root .slp-section-head .slp-section-desc { font-size: 14px; line-height: 1.58; padding: 0; max-width: 480px; }
  .slp-root .slp-cap {
    width: calc(100% - 36px);
    grid-template-columns: minmax(0,1fr);
    margin-bottom: 46px;
    border-radius: 12px;
  }
  .slp-root .slp-cap-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    gap: 7px;
    padding: 11px;
    border-right: 0;
    border-bottom: 1px solid #DCE4D9;
    overflow: visible;
    background: #F1F4EE;
    max-height: none;
    flex-wrap: initial;
  }
  .slp-root .slp-cap-tab {
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 53px;
    display: grid;
    grid-template-columns: 17px 18px minmax(0,1fr);
    gap: 7px;
    padding: 10px 7px;
    background: #FCFDF9;
    border: 1px solid #DDE6DD;
    border-radius: 8px;
    box-shadow: none;
  }
  .slp-root .slp-cap-tab-on { background: #DDECDD; border-color: #A8C9AE; box-shadow: inset 3px 0 #398455; }
  .slp-root .slp-cap-tab-num { font-size: 9px; }
  .slp-root .slp-cap-tab-icon svg { width: 16px; height: 16px; }
  .slp-root .slp-cap-tab-title { display: none; }
  .slp-root .slp-cap-tab-short {
    display: block;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 640;
    color: #334A3A;
    margin: 0;
  }
  .slp-root .slp-cap-detail { padding: 18px 14px 19px; gap: 18px; }
  .slp-root .slp-cap-title { font-size: 25px; }
  .slp-root .slp-cap-desc { font-size: 13px; line-height: 1.56; }
  .slp-root .slp-approach, .slp-root .slp-faq { padding: 46px 18px; }
  .slp-root .slp-approach-inner, .slp-root .slp-faq-inner {
    grid-template-columns: minmax(0,1fr);
    gap: 22px;
  }
  .slp-root .slp-approach-title, .slp-root .slp-faq .slp-section-title {
    font-size: clamp(33px, 8.3vw, 41px);
  }
  .slp-root .slp-approach-body { font-size: 14px; line-height: 1.65; }
  .slp-root .slp-faq-trigger { min-height: 55px; font-size: 13px; }
  .slp-root .slp-cta-section { padding: 49px 18px 53px; }
  .slp-root .slp-cta-title { font-size: clamp(35px, 9vw, 43px); }
  .slp-root .slp-cta-desc { font-size: 14px; }
  .slp-root .slp-footer { padding: 27px 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .slp-root .slp-cap-tab { transition: none; }
}
"""

REPLACEMENTS = [
    ("Six tools, one workspace —", "Write it. Plan it."),
    ("not six more tabs.", "Follow through."),
    (
        "Each capability takes a specific kind of repetitive work off your plate, without asking you to learn a new interface for every task. Select one to see it work.",
        "Email drafts, meeting summaries, task plans, research, chat and reusable prompts. Choose a tool below to explore a sample."
    ),
    ("Responsible AI", "AI prepares."),
    ("is the product.", "You decide."),
    (
        "WorkFlow AI Pro is built on a simple principle: the AI should reduce your workload without compromising your judgment. Your data stays scoped to your account, is never used to train public models, and every output is designed to be reviewed before it ships. We use Google Gemini 3 Flash by default for low-latency, high-quality results, with smart fallbacks for complex tasks.",
        "Automation should make the next decision easier, not make it for you. Summaries, drafts and plans are starting points. Check the details, make your edits, and decide what moves forward. For privacy and model-processing information, read the product policy."
    ),
    ("Start working", "Make room for"),
    ("on the work that matters.", "the next big thing."),
    (
        "Free for individuals. No contracts, no credit card. Your account stays yours.",
        "A meeting to summarize? A follow-up to draft? Start with the tool that fits what is next."
    ),
]

def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()

def apply_finish(text):
    if 'import "../sloppertizer-polish.css";' not in text or 'data-composition="stage-led"' not in text:
        raise RuntimeError("Expected verified polished Stage-led source")
    original = text
    for old, new in REPLACEMENTS:
        count = text.count(old)
        if count != 1:
            raise RuntimeError(f"Expected one copy anchor ({count}): {old[:75]!r}")
        text = text.replace(old, new, 1)
    before = text.index("function Capabilities()")
    after = text.index("function Landing()", before)
    # Ensure the interaction definitions, routes and FAQ semantics were not changed by this pass.
    if len(text[before:after]) < 1000:
        raise RuntimeError("Capability definitions were unexpectedly modified")
    text = text.replace('import "../sloppertizer-polish.css";',
                        'import "../sloppertizer-polish.css";\nimport "../sloppertizer-finish.css";', 1)
    for required in ['id="features"', 'to="/auth"', 'to="/responsible-ai"', 'function HeroWorkspace()', 'function Capabilities()']:
        if required not in text:
            raise RuntimeError("Missing important source invariant: " + required)
    return text, {
        "previous_hash": sha(original),
        "new_hash": sha(text),
        "copy_replacements": len(REPLACEMENTS),
        "scoped_css_only": True
    }

def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 src/finish_preview.py polished_dir finished_dir")
    source = Path(sys.argv[1]).resolve()
    dest = Path(sys.argv[2]).resolve()
    if not source.is_dir() or dest.exists() or source in dest.parents or dest in source.parents:
        raise RuntimeError("Source must exist; destination must be fresh and disjoint")
    route = source/"src/routes/index.tsx"
    if not route.is_file() or route.is_symlink() or source not in route.resolve().parents:
        raise RuntimeError("Unexpected input route")
    revised, report = apply_finish(route.read_text(encoding="utf-8"))
    shutil.copytree(source, dest, ignore=shutil.ignore_patterns(
        ".git","node_modules","dist",".env",".env.*","coverage",".output"),
        symlinks=False)
    (dest/"src/routes/index.tsx").write_text(revised, encoding="utf-8")
    (dest/"src/sloppertizer-finish.css").write_text(STYLE, encoding="utf-8")
    report["changed_files"] = ["src/routes/index.tsx","src/sloppertizer-finish.css"]
    report["status"] = "UNVERIFIED: run browser and visual checks before deployment"
    (dest/"finish-report.json").write_text(json.dumps(report, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
