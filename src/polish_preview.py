#!/usr/bin/env python3
"""Optional visual-quality experiment for the verified Stage-led preview.

Changes a bespoke mark, copy, and only the illustrative HeroWorkspace component.
Keeps application routes, capabilities, tabs, FAQ and backend byte-identical.
Never executes untrusted repository code or reads environmental secrets.
"""
from pathlib import Path
import hashlib
import json
import shutil
import sys

MONOGRAM = r'''
function Monogram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="33" height="33" rx="9" fill="#193C2D" />
      <path
        d="M8 12.5 12.5 24.3 17.9 14.1 23.2 24.3 28.5 12.5"
        fill="none" stroke="#F6F7EE" strokeWidth="2.65"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M17.9 14.1 20.9 9.7" fill="none" stroke="#DAEF90" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="28.5" cy="12.5" r="2.4" fill="#DAEF90"/>
    </svg>
  );
}
'''
DEMO = r'''
function HeroWorkspace() {
  const [reviewed, setReviewed] = useState([false, false]);
  const reviewedCount = reviewed.filter(Boolean).length;
  const toggle = (index: number) =>
    setReviewed((current) => current.map((value, i) => i === index ? !value : value));

  return (
    <div className="slp-demo slp-demo--refined" aria-label="Interactive sample workspace. Review two example tasks; nothing is sent or saved.">
      <aside className="slp-demo-rail" aria-hidden="true">
        <div className="slp-demo-rail-brand"><Monogram className="slp-demo-logo" /><span>THE DESK</span></div>
        <span className="slp-demo-rail-heading">WORKSPACE</span>
        <span className="slp-demo-rail-item slp-demo-rail-active"><ListTodo size={14} /> Overview</span>
        <span className="slp-demo-rail-item"><FileText size={14} /> Meeting notes</span>
        <span className="slp-demo-rail-item"><ListTodo size={14} /> Action queue</span>
        <span className="slp-demo-rail-item"><Mail size={14} /> Drafts</span>
        <div className="slp-demo-rail-bottom"><span className="slp-demo-avatar">W</span><span>Sample desk</span></div>
      </aside>
      <div className="slp-demo-content">
        <div className="slp-demo-heading">
          <div>
            <span className="slp-demo-kicker">THE FOLLOW-THROUGH <span>/</span> SAMPLE SESSION</span>
            <h2>After the meeting<span className="slp-demo-period">.</span></h2>
          </div>
          <span className="slp-demo-ready" aria-live="polite">
            <span className="slp-demo-ready-dot" />
            {reviewedCount === 2 ? "ALL REVIEWED" : (2 - reviewedCount) + " TO REVIEW"}
          </span>
        </div>
        <div className="slp-demo-flow">
          <section className="slp-demo-pane slp-demo-input">
            <div className="slp-demo-pane-head"><span><FileText size={13} /> SOURCE NOTES</span><span>01 / CAPTURE</span></div>
            <div className="slp-polish-note-meta"><span className="slp-polish-note-icon">Q3</span><span>Launch check-in <small>Product team · 22 min</small></span></div>
            <p>Ship behind a feature flag. Check capacity and have a rollback plan ready by Friday.</p>
            <div className="slp-demo-extract">
              <span className="slp-demo-extract-label">DECISION CAPTURED</span>
              <strong>Stage the release behind a flag.</strong>
            </div>
          </section>
          <div className="slp-demo-connector" aria-hidden="true"><ArrowRight size={16} /></div>
          <section className="slp-demo-pane slp-demo-output" aria-label="Review sample actions">
            <div className="slp-demo-pane-head"><span><ListTodo size={13} /> ACTION QUEUE</span><span>02 / REVIEW</span></div>
            <button type="button"
              className={reviewed[0] ? "slp-demo-task slp-polish-action slp-polish-reviewed" : "slp-demo-task slp-polish-action"}
              aria-pressed={reviewed[0]}
              aria-label={reviewed[0] ? "Unmark rollback checklist reviewed" : "Mark rollback checklist reviewed"}
              onClick={() => toggle(0)}>
              <span className="slp-demo-check">{reviewed[0] ? <Check size={12} aria-hidden="true" /> : null}</span>
              <span className="slp-polish-task-copy"><strong>Write rollback checklist</strong><span>From launch check-in · due Friday</span></span>
              <span className="slp-demo-task-tag">P1</span>
            </button>
            <button type="button"
              className={reviewed[1] ? "slp-demo-task slp-polish-action slp-polish-reviewed" : "slp-demo-task slp-polish-action"}
              aria-pressed={reviewed[1]}
              aria-label={reviewed[1] ? "Unmark capacity check reviewed" : "Mark capacity check reviewed"}
              onClick={() => toggle(1)}>
              <span className="slp-demo-check">{reviewed[1] ? <Check size={12} aria-hidden="true" /> : null}</span>
              <span className="slp-polish-task-copy"><strong>Confirm launch capacity</strong><span>With platform team · due Thursday</span></span>
              <span className="slp-demo-task-tag slp-demo-task-tag-muted">P2</span>
            </button>
            <div className="slp-demo-output-note">
              <ShieldCheck size={12} aria-hidden="true" />
              {reviewedCount === 2 ? "Both sample tasks reviewed. Nothing was sent." : "Try reviewing a task. Nothing is sent."}
            </div>
          </section>
        </div>
        <div className="slp-demo-agenda">
          <div className="slp-demo-agenda-head"><span>THEN / MAKE TIME FOR IT</span><span>SAMPLE DAY PLAN</span></div>
          <div className="slp-demo-events">
            <div className="slp-demo-event"><time>09:00</time><span className="slp-demo-event-stripe" /><div><strong>Focus</strong><span>Launch proposal</span></div></div>
            <div className="slp-demo-event"><time>11:00</time><span className="slp-demo-event-stripe slp-demo-event-stripe-alt" /><div><strong>Standup</strong><span>Team sync</span></div></div>
            <div className="slp-demo-event"><time>14:00</time><span className="slp-demo-event-stripe slp-demo-event-stripe-muted" /><div><strong>Follow-ups</strong><span>Review drafts</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''
CSS = r'''
/* One identity from navigation to the product surface. No global selectors. */
.slp-root {
  --slp-paper: #FCFBF8;
  --slp-paper-2: #F3F6F1;
  --slp-ink: #15281F;
  --slp-ink-2: #45574B;
  --slp-muted: #6B7C70;
  --slp-line: #DCE4DB;
  --slp-line-2: #EAF0E8;
  --slp-accent: #2F6847;
  --slp-accent-2: #3D8058;
  --slp-accent-soft: #E6F1E5;
  --slp-accent-ink: #214C33;
}
.slp-root .slp-nav { backdrop-filter: none; background: #FCFBF8; }
.slp-root .slp-brand { gap: 9px; }
.slp-root .slp-brand-mark { width: 34px; height: 34px; }
.slp-root .slp-brand-name { font-weight: 720; letter-spacing: -.035em; }
.slp-root .slp-nav-cta,
.slp-root .slp-cta-primary { background: #17382A; border-color: #17382A; color: #F9FCF4; }
.slp-root .slp-hero.slp-cmp { background: #F5F7F1; }
.slp-root .slp-cmp-eyebrow { color: #4A6B55; }
.slp-root .slp-cmp-title { color: #14271D; }
.slp-root .slp-cmp-title span { color: #457251; }
.slp-root .slp-cmp-primary { background: #153D2C; }
.slp-root .slp-cmp-stage { border: 1px solid #47624B; background: #1B3026; box-shadow: 0 19px 40px -27px #1B30264A; }
.slp-root .slp-cmp-product-id { color: #E3EDE1; }
.slp-root .slp-demo--refined { border-color: #D5DDD3; background: #FCFDF9; }
.slp-root .slp-demo--refined .slp-demo-rail { background: #F0F2EC; border-right-color: #DCE4D9; }
.slp-root .slp-demo--refined .slp-demo-rail-brand { padding-bottom: 21px; font-size: 9px; color: #253C2F; letter-spacing: .09em; }
.slp-root .slp-demo--refined .slp-demo-rail-active { background: #D8E8D9; color: #1D4B30; }
.slp-root .slp-demo--refined .slp-demo-content { padding: 17px 18px 13px; }
.slp-root .slp-demo--refined .slp-demo-heading { padding-bottom: 10px; border-bottom: 1px solid #E4EAE1; margin-bottom: 11px; }
.slp-root .slp-demo--refined .slp-demo-heading h2 { margin-top: 4px; letter-spacing: -.035em; font-size: 19px; }
.slp-root .slp-demo--refined .slp-demo-kicker { font-size: 9px; color: #738578; }
.slp-root .slp-demo--refined .slp-demo-ready { font-size: 9px; border: 1px solid #D7E6D7; padding: 6px 7px; border-radius: 99px; background: #F1F8EF; color: #3F7547; }
.slp-root .slp-demo--refined .slp-demo-ready-dot { background: #5A9569; }
.slp-root .slp-demo--refined .slp-demo-pane { border-color: #DEE5DC; border-radius: 7px; box-shadow: 0 1px 0 #E9EEE8; background: #FFFFFF; }
.slp-root .slp-demo--refined .slp-demo-input { display: flex; flex-direction: column; }
.slp-root .slp-demo--refined .slp-demo-input p { font-size: 11.3px; color: #5A6A5F; line-height: 1.46; }
.slp-root .slp-polish-note-meta { display: flex; align-items: center; gap: 8px; margin: 10px 0 8px; }
.slp-root .slp-polish-note-icon { display: grid; place-items: center; flex: 0 0 26px; height: 26px; border-radius: 6px; background: #E4EEE3; font-size: 10px; font-weight: 750; color: #366443; }
.slp-root .slp-polish-note-meta > span:last-child { display: flex; flex-direction: column; gap: 2px; font-size: 11px; font-weight: 700; letter-spacing: -.015em; color: #24382B; }
.slp-root .slp-polish-note-meta small { color: #879589; font-size: 9px; font-weight: 500; letter-spacing: 0; }
.slp-root .slp-demo--refined .slp-demo-extract { margin-top: auto; border-left: 2px solid #79AD74; background: #EFF5EB; border-radius: 4px; }
.slp-root .slp-demo--refined .slp-demo-extract-label { color: #648A69; }
.slp-root .slp-demo--refined .slp-demo-extract strong { color: #335A3D; }
.slp-root .slp-polish-action { appearance: none; font: inherit; display: grid; grid-template-columns: 15px minmax(0,1fr) auto; align-items: start; gap: 7px; width: 100%; min-height: 51px; padding: 10px 5px; margin-top: 4px; border: 1px solid transparent; border-radius: 6px; background: transparent; text-align: left; cursor: pointer; transition: background-color .18s ease, border-color .18s ease; }
.slp-root .slp-polish-action:hover { background: #F5F8F3; border-color: #E4EDE1; }
.slp-root .slp-polish-action:focus-visible { outline: 2px solid #327B51; outline-offset: 2px; }
.slp-root .slp-polish-action .slp-demo-check { width: 15px; height: 15px; margin: 1px 0 0; display: grid; place-items: center; border-radius: 4px; color: #FFF; }
.slp-root .slp-polish-action.slp-polish-reviewed .slp-demo-check { background: #317B4E; border-color: #317B4E; }
.slp-root .slp-polish-task-copy { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.slp-root .slp-polish-task-copy strong { font-size: 11.2px; font-weight: 690; line-height: 1.28; color: #2E4234; }
.slp-root .slp-polish-task-copy > span { color: #7D8D81; font-size: 9.7px; line-height: 1.3; }
.slp-root .slp-polish-reviewed .slp-polish-task-copy strong { color: #5A8063; text-decoration: line-through; text-decoration-color: #97B7A0; }
.slp-root .slp-demo--refined .slp-demo-task-tag { margin-top: 1px; background: #FFF4DD; color: #967224; }
.slp-root .slp-demo--refined .slp-demo-task-tag-muted { background: #EEF3EC; color: #648068; }
.slp-root .slp-demo--refined .slp-demo-output-note { padding-top: 10px; margin-top: auto; color: #71897B; }
.slp-root .slp-demo--refined .slp-demo-agenda { margin-top: 9px; background: #F3F7F1; border-color: #E1E8DD; }
.slp-root .slp-demo--refined .slp-demo-agenda-head { font-size: 8.4px; color: #7D917F; }
.slp-root .slp-demo--refined .slp-demo-events { gap: 11px; }
.slp-root .slp-demo--refined .slp-demo-event-stripe { background: #3C8255; }
.slp-root .slp-demo--refined .slp-demo-event-stripe-alt { background: #8AA49D; }
.slp-root .slp-demo--refined .slp-demo-event-stripe-muted { background: #C6D3C4; }
.slp-root .slp-cap-tab-on { background: #E8F1E8; border-color: #CCDCCA; }
.slp-root .slp-cap-tab-on .slp-cap-tab-icon { color: #265F3B; }
.slp-root .slp-footer-mark { width: 24px; height: 24px; }
@media (max-width: 640px) {
  .slp-root .slp-demo--refined .slp-demo-content { padding: 12px 11px 11px; }
  .slp-root .slp-demo--refined .slp-demo-heading { margin-bottom: 9px; padding-bottom: 9px; }
  .slp-root .slp-demo--refined .slp-demo-flow { gap: 3px; }
  .slp-root .slp-demo--refined .slp-demo-pane { padding: 10px 11px; }
  .slp-root .slp-demo--refined .slp-demo-input p { font-size: 11.5px; }
  .slp-root .slp-polish-note-meta { margin: 8px 0 6px; }
  .slp-root .slp-demo--refined .slp-demo-extract { margin-top: 8px; padding: 8px; }
  .slp-root .slp-polish-action { min-height: 45px; padding: 8px 5px; margin-top: 0; }
  .slp-root .slp-demo--refined .slp-demo-agenda { padding: 9px 10px; }
  .slp-root .slp-demo--refined .slp-demo-events { margin-top: 8px; gap: 8px; }
  .slp-root .slp-demo--refined .slp-demo-event strong { font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .slp-root .slp-polish-action { transition: none; }
}
'''

def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()

def once(text, old, new):
    if text.count(old) != 1:
        raise RuntimeError("Expected one source anchor: " + old[:65])
    return text.replace(old, new, 1)

def change(source):
    original = source
    source = once(source, '  ShieldCheck,\n', '  ShieldCheck,\n  Check,\n')
    source = once(source, 'import "../sloppertizer-demo.css";',
                  'import "../sloppertizer-demo.css";\nimport "../sloppertizer-polish.css";')
    begin = source.index("function Monogram(")
    end = source.index("\nfunction PreviewEmail()", begin)
    source = source[:begin] + MONOGRAM.strip() + "\n" + source[end:]
    begin = source.index("function HeroWorkspace()")
    end = source.index("\nfunction Capabilities()", begin)
    untouched_capability_logic = source[end:source.index("\nfunction Landing()", end)]
    source = source[:begin] + DEMO.strip() + "\n" + source[end:]
    source = once(source, "WORKFLOW AI PRO / A BETTER WORKDAY", "FROM MEETING NOTES TO NEXT STEPS")
    source = once(source, "Less busywork.<span>More room to think.</span>",
                  "Meetings end.<span>The work moves.</span>")
    source = once(source, "Turn meeting notes into decisions, plan your day, and draft follow-ups in one workspace. WorkFlow AI Pro handles the repetitive steps so you can focus on work that needs you.",
                  "Pull decisions out of meeting notes, turn them into tasks to review, and make time for the follow-ups. One place for the work that happens next.")
    source = once(source, "WORKFLOW / DAILY PLAN", "WORKFLOW / ACTION DESK")
    source = once(source, "ILLUSTRATIVE WORKDAY", "INTERACTIVE SAMPLE")
    if source[source.index("\nfunction Capabilities()"):source.index("\nfunction Landing()")] != untouched_capability_logic:
        raise RuntimeError("Capabilities changed unexpectedly")
    if 'to="/auth"' not in source or 'to="/responsible-ai"' not in source or 'id="features"' not in source:
        raise RuntimeError("Critical navigation was changed")
    if original == source:
        raise RuntimeError("No change generated")
    return source

def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 src/polish_preview.py source_dir new_candidate_dir")
    src = Path(sys.argv[1]).resolve()
    dest = Path(sys.argv[2]).resolve()
    if not src.is_dir() or dest.exists() or src in dest.parents or dest in src.parents:
        raise RuntimeError("Source must exist; destination must be fresh and outside source")
    path = src/"src/routes/index.tsx"
    if not path.is_file() or path.is_symlink() or src not in path.resolve().parents:
        raise RuntimeError("Unsafe route input")
    current = path.read_text()
    if 'data-composition="stage-led"' not in current or 'className="slp-demo"' not in current:
        raise RuntimeError("Not verified Stage-led candidate")
    updated = change(current)
    shutil.copytree(src, dest, ignore=shutil.ignore_patterns(
        ".git", "node_modules", "dist", ".env", ".env.*", "coverage", ".output"),
        symlinks=False)
    (dest/"src/routes/index.tsx").write_text(updated)
    (dest/"src/sloppertizer-polish.css").write_text(CSS)
    report = {
        "experiment": "visual-identity-and-interactive-workbench",
        "changed": ["src/routes/index.tsx", "src/sloppertizer-polish.css"],
        "original_hash": sha(current),
        "modified_hash": sha(updated),
        "capabilities_preserved": True,
        "example_interactions_only": True,
        "status": "UNVERIFIED: run build, live viewport and interaction tests"
    }
    (dest/"polish-report.json").write_text(json.dumps(report, indent=2)+"\n")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
