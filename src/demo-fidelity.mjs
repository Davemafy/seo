#!/usr/bin/env node
// Sloppertizer: a fixed-scope product-demonstration experiment.
// Replaces only HeroWorkspace in the Stage-led pilot. No model calls, no route edits.
import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export const ROUTE = "src/routes/index.tsx";
export const CSS = "src/sloppertizer-demo.css";
const START = "function HeroWorkspace() {";
const END = "function Capabilities() {";
const IMPORT = 'import "../sloppertizer-demo.css";';
const digest = text => createHash("sha256").update(text).digest("hex");

export function partitionRoute(code) {
  const a = code.indexOf(START), b = code.indexOf(END);
  if (a < 0 || b <= a || code.indexOf(START, a + 1) >= 0 || code.indexOf(END, b + 1) >= 0) {
    throw Error("Expected exactly one HeroWorkspace and Capabilities boundary");
  }
  if (!code.includes('data-composition="stage-led"') || !code.includes('import "../sloppertizer-composition.css";')) {
    throw Error("Source must be the verified Stage-led experiment");
  }
  return { before: code.slice(0, a), demo: code.slice(a, b), after: code.slice(b) };
}

export const DEMO = String.raw`function HeroWorkspace() {
  return (
    <div className="slp-demo" aria-label="Illustrative WorkFlow AI Pro workspace: meeting notes, prepared actions, and a daily plan">
      <aside className="slp-demo-rail" aria-hidden="true">
        <div className="slp-demo-rail-brand"><Monogram className="slp-demo-logo" /><span>WORKSPACE</span></div>
        <span className="slp-demo-rail-heading">YOUR DESK</span>
        <span className="slp-demo-rail-item slp-demo-rail-active"><ListTodo size={14} /> Overview</span>
        <span className="slp-demo-rail-item"><FileText size={14} /> Meetings</span>
        <span className="slp-demo-rail-item"><ListTodo size={14} /> Tasks</span>
        <span className="slp-demo-rail-item"><Mail size={14} /> Drafts</span>
        <div className="slp-demo-rail-bottom"><span className="slp-demo-avatar">A</span><span>Alex's desk</span></div>
      </aside>
      <div className="slp-demo-content">
        <div className="slp-demo-heading">
          <div>
            <span className="slp-demo-kicker">TODAY'S WORKSPACE <span>·</span> YOUR WORKDAY</span>
            <h2>From meeting to momentum<span className="slp-demo-period">.</span></h2>
          </div>
          <span className="slp-demo-ready"><span className="slp-demo-ready-dot" /> DRAFTS TO REVIEW</span>
        </div>
        <div className="slp-demo-flow">
          <section className="slp-demo-pane slp-demo-input">
            <div className="slp-demo-pane-head"><span><FileText size={13} /> MEETING NOTES</span><span>01 / INPUT</span></div>
            <h3>Q3 release review</h3>
            <p>Keep the rollout behind a flag. Confirm infrastructure capacity and prepare a rollback checklist before Friday.</p>
            <div className="slp-demo-extract">
              <span className="slp-demo-extract-label">DECISION EXTRACTED</span>
              <strong>Stage the launch behind a feature flag.</strong>
            </div>
          </section>
          <div className="slp-demo-connector" aria-hidden="true"><ArrowRight size={16} /></div>
          <section className="slp-demo-pane slp-demo-output">
            <div className="slp-demo-pane-head"><span><ListTodo size={13} /> PREPARED ACTIONS</span><span>02 / REVIEW</span></div>
            <div className="slp-demo-task">
              <span className="slp-demo-check" />
              <div><strong>Prepare rollback checklist</strong><span>From Q3 release review</span></div>
              <span className="slp-demo-task-tag">HIGH</span>
            </div>
            <div className="slp-demo-task">
              <span className="slp-demo-check" />
              <div><strong>Confirm infra capacity</strong><span>Check with platform team</span></div>
              <span className="slp-demo-task-tag slp-demo-task-tag-muted">THU</span>
            </div>
            <div className="slp-demo-output-note"><ShieldCheck size={12} /> Nothing is sent without your review.</div>
          </section>
        </div>
        <div className="slp-demo-agenda">
          <div className="slp-demo-agenda-head"><span>TIME-BLOCKED DAY</span><span>EXAMPLE SCHEDULE</span></div>
          <div className="slp-demo-events">
            <div className="slp-demo-event"><time>09:00</time><span className="slp-demo-event-stripe" /><div><strong>Deep work</strong><span>Q3 proposal</span></div></div>
            <div className="slp-demo-event"><time>11:00</time><span className="slp-demo-event-stripe slp-demo-event-stripe-alt" /><div><strong>Team standup</strong><span>Decisions</span></div></div>
            <div className="slp-demo-event"><time>14:00</time><span className="slp-demo-event-stripe slp-demo-event-stripe-muted" /><div><strong>Follow-ups</strong><span>Review drafts</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

`;

export const STYLE = String.raw`/* Product demonstration fidelity experiment. Scoped to Stage-led only. */
.slp-root .slp-cmp--stage-led .slp-demo{display:grid;grid-template-columns:108px minmax(0,1fr);background:#f9faf7;border:1px solid #d7dfd5;border-radius:7px;overflow:hidden;min-height:355px;color:#243128;font-family:var(--slp-font-sans);}
.slp-root .slp-demo *{box-sizing:border-box}
.slp-root .slp-demo-rail{background:#edf1eb;border-right:1px solid #dbe3da;display:flex;flex-direction:column;gap:3px;padding:15px 8px 10px}
.slp-root .slp-demo-rail-brand{display:flex;align-items:center;gap:7px;padding:0 4px 20px;color:#2f493c;font:700 9px/1 var(--slp-font-mono);letter-spacing:.045em}
.slp-root .slp-demo-logo{width:18px;height:18px;color:#376e4e;flex-shrink:0}
.slp-root .slp-demo-rail-heading{font:600 9px/1.4 var(--slp-font-mono);letter-spacing:.06em;color:#7a897c;padding:0 7px 10px}
.slp-root .slp-demo-rail-item{display:flex;align-items:center;gap:8px;padding:10px 7px;color:#67776b;font-size:11px;font-weight:500;border-radius:5px;white-space:nowrap}
.slp-root .slp-demo-rail-item svg{flex-shrink:0;stroke-width:1.7}
.slp-root .slp-demo-rail-active{background:#dbe8d9;color:#214b34;font-weight:650}
.slp-root .slp-demo-rail-bottom{margin-top:auto;display:flex;align-items:center;gap:7px;padding:11px 3px 0;border-top:1px solid #d8e1d5;font-size:10px;color:#718172}
.slp-root .slp-demo-avatar{height:19px;width:19px;display:grid;place-items:center;flex-shrink:0;border-radius:5px;background:#c9ded0;color:#355e44;font-size:10px;font-weight:700}
.slp-root .slp-demo-content{min-width:0;padding:16px 18px 13px;display:flex;flex-direction:column}
.slp-root .slp-demo-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:14px}
.slp-root .slp-demo-kicker,.slp-root .slp-demo-pane-head,.slp-root .slp-demo-extract-label,.slp-root .slp-demo-agenda-head{font:650 9px/1.35 var(--slp-font-mono);letter-spacing:.075em}
.slp-root .slp-demo-kicker{color:#74857a}
.slp-root .slp-demo-kicker span{padding:0 2px;color:#9dad9f}
.slp-root .slp-demo-heading h2{font-size:19px;font-weight:670;line-height:1.12;letter-spacing:-.045em;color:#26372a;margin:6px 0 0}
.slp-root .slp-demo-period{color:#64a274}
.slp-root .slp-demo-ready{display:flex;align-items:center;gap:6px;color:#5f8066;font:650 9px/1.2 var(--slp-font-mono);letter-spacing:.025em;white-space:nowrap}
.slp-root .slp-demo-ready-dot{height:5px;width:5px;border-radius:50%;background:#67a371}
.slp-root .slp-demo-flow{display:grid;grid-template-columns:minmax(0,1fr) 18px minmax(0,1fr);gap:7px;align-items:stretch;min-width:0}
.slp-root .slp-demo-pane{min-width:0;border:1px solid #dfe5dc;border-radius:6px;background:#fff;padding:12px 12px 10px}
.slp-root .slp-demo-pane-head{display:flex;justify-content:space-between;align-items:center;gap:6px;color:#728779;font-size:8px}
.slp-root .slp-demo-pane-head>span:first-child{display:inline-flex;align-items:center;gap:5px}
.slp-root .slp-demo-pane-head svg{color:#698878;stroke-width:1.8}
.slp-root .slp-demo-input h3{font-size:13px;font-weight:670;line-height:1.2;letter-spacing:-.02em;color:#2b392f;margin:12px 0 7px}
.slp-root .slp-demo-input p{color:#536257;font-size:11px;line-height:1.5;margin:0}
.slp-root .slp-demo-extract{margin-top:12px;background:#f0f5ec;border-left:2px solid #79ad77;border-radius:2px;padding:9px 9px 8px}
.slp-root .slp-demo-extract-label{font-size:8px;color:#628569;display:block;margin-bottom:5px}
.slp-root .slp-demo-extract strong{font-size:11px;line-height:1.35;display:block;color:#34523a;font-weight:630}
.slp-root .slp-demo-connector{display:flex;align-items:center;justify-content:center;color:#7b9c81}
.slp-root .slp-demo-connector svg{stroke-width:1.7}
.slp-root .slp-demo-output{padding-bottom:9px}
.slp-root .slp-demo-task{display:grid;grid-template-columns:13px minmax(0,1fr) auto;gap:7px;align-items:start;margin-top:14px}
.slp-root .slp-demo-check{height:12px;width:12px;border-radius:3px;border:1px solid #95ad96;display:block;background:#fafcf8;margin-top:1px}
.slp-root .slp-demo-task div{display:flex;flex-direction:column;gap:4px;min-width:0}
.slp-root .slp-demo-task strong{font-size:11px;font-weight:650;line-height:1.25;color:#354b3a}
.slp-root .slp-demo-task div span{font-size:10px;color:#7c8b80;line-height:1.25}
.slp-root .slp-demo-task-tag{font:700 8px/1.3 var(--slp-font-mono);color:#5c6e27;background:#eff2d6;padding:3px 4px;border-radius:3px}
.slp-root .slp-demo-task-tag-muted{background:#eef2ec;color:#778778}
.slp-root .slp-demo-output-note{display:flex;align-items:center;gap:5px;border-top:1px solid #e9eee6;margin-top:15px;padding-top:10px;color:#789180;font-size:9px;line-height:1.3}
.slp-root .slp-demo-output-note svg{flex-shrink:0}
.slp-root .slp-demo-agenda{margin-top:10px;background:#f1f5ee;border:1px solid #dfe9dc;border-radius:6px;padding:10px 12px 9px}
.slp-root .slp-demo-agenda-head{display:flex;justify-content:space-between;color:#718576;font-size:8px;gap:10px}
.slp-root .slp-demo-events{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:11px}
.slp-root .slp-demo-event{display:grid;grid-template-columns:30px 3px minmax(0,1fr);gap:7px;align-items:start;min-width:0}
.slp-root .slp-demo-event time{font:600 9px/1.4 var(--slp-font-mono);color:#7a8b7e;padding-top:1px}
.slp-root .slp-demo-event-stripe{display:block;height:25px;background:#689775;border-radius:2px}
.slp-root .slp-demo-event-stripe-alt{background:#94a8b0}
.slp-root .slp-demo-event-stripe-muted{background:#c0cbbd}
.slp-root .slp-demo-event div{display:flex;flex-direction:column;gap:3px;min-width:0}
.slp-root .slp-demo-event strong{font-size:10px;font-weight:650;color:#3d4b40;white-space:nowrap}
.slp-root .slp-demo-event div span{font-size:9px;color:#7e8c80;white-space:nowrap}
@media(max-width:950px){
 .slp-root .slp-cmp--stage-led .slp-demo{grid-template-columns:113px minmax(0,1fr)}
 .slp-root .slp-demo-content{padding:17px}
}
@media(max-width:640px){
 .slp-root .slp-cmp--stage-led .slp-demo{grid-template-columns:1fr;min-height:0}
 .slp-root .slp-demo-rail{display:none}
 .slp-root .slp-demo-content{padding:13px 11px 11px}
 .slp-root .slp-demo-heading{align-items:flex-start;margin-bottom:12px}
 .slp-root .slp-demo-heading h2{font-size:18px}
 .slp-root .slp-demo-ready{font-size:8px;padding-top:6px}
 .slp-root .slp-demo-flow{grid-template-columns:minmax(0,1fr);gap:5px}
 .slp-root .slp-demo-pane{padding:12px}
 .slp-root .slp-demo-input h3{margin-top:10px;font-size:14px}
 .slp-root .slp-demo-input p{font-size:12px;max-width:35ch}
 .slp-root .slp-demo-extract{margin-top:9px}
 .slp-root .slp-demo-connector{height:20px}
 .slp-root .slp-demo-connector svg{transform:rotate(90deg)}
 .slp-root .slp-demo-task{margin-top:11px}
 .slp-root .slp-demo-task strong{font-size:12px}
 .slp-root .slp-demo-task div span{font-size:10px}
 .slp-root .slp-demo-output-note{margin-top:11px}
 .slp-root .slp-demo-agenda{margin-top:9px;padding:10px}
 .slp-root .slp-demo-events{grid-template-columns:1fr 1fr;gap:12px 8px}
 .slp-root .slp-demo-event strong{font-size:10px}
}
`;

export function replaceDemo(source) {
  const { before, after } = partitionRoute(source);
  if (before.includes(IMPORT)) throw Error("Demo already installed");
  const head = before.replace(
    'import "../sloppertizer-composition.css";',
    'import "../sloppertizer-composition.css";\n' + IMPORT
  );
  if (head === before) throw Error("Missing composition import");
  const result = head + DEMO + after;
  if (partitionRoute(result).after !== after) throw Error("Capability implementation was modified");
  if ((result.match(/<h1\b/g) || []).length !== 1 || !result.includes('id="features"')) throw Error("Landing invariants lost");
  return result;
}
function safeRead(root,path) {
  const file = resolve(root,path);
  if (!file.startsWith(root+sep) || !existsSync(file) || !lstatSync(file).isFile() || lstatSync(file).isSymbolicLink() || !realpathSync(file).startsWith(root+sep))
    throw Error("Unsafe source file: "+path);
  return readFileSync(file,"utf8");
}
function safeCopy(source,target) {
  cpSync(source,target,{recursive:true,errorOnExist:true,force:false,filter:path=>{
    const r=relative(source,path);
    if (!r) return true;
    const parts=r.split(sep);
    if(parts.some(p=>[".git","node_modules","dist",".next","coverage",".output"].includes(p))) return false;
    if(parts.some(p=>p===".env"||p.startsWith(".env."))) return false;
    return !lstatSync(path).isSymbolicLink();
  }});
}
export function applyDemo(source,target) {
  const original = safeRead(source,ROUTE), changed = replaceDemo(original);
  if (existsSync(target) || source === target || target.startsWith(source+sep) || source.startsWith(target+sep))
    throw Error("Output must be a fresh directory outside the source");
  safeCopy(source,target);
  writeFileSync(join(target,ROUTE),changed);
  writeFileSync(join(target,CSS),STYLE);
  const unchanged = partitionRoute(original).after === partitionRoute(changed).after;
  if (!unchanged) throw Error("Feature routes changed");
  const manifest = {
    experiment:"product-demonstration-fidelity",
    source:"Stage-led from composition experiment",
    files:[ROUTE,CSS],
    originalRoute:digest(original),candidateRoute:digest(changed),
    lockedFeaturesAndRoutes:digest(partitionRoute(changed).after),
    unchanged,
    status:"UNVERIFIED: do not promote without screenshot, browser, interaction and quality checks"
  };
  writeFileSync(join(target,"demo-fidelity-report.json"),JSON.stringify(manifest,null,2)+"\n");
  return manifest;
}
if(process.argv[1]?.endsWith("demo-fidelity.mjs")) {
  try {
    const args={};
    for(let i=2;i<process.argv.length;i+=2) args[process.argv[i].slice(2)]=process.argv[i+1];
    if(!args.project||!args.output)throw Error("Usage: node src/demo-fidelity.mjs --project stage-led --output detailed-stage");
    console.log(JSON.stringify(applyDemo(realpathSync(resolve(args.project)),resolve(args.output)),null,2));
  }catch(e){console.error("Demo fidelity: "+e.message);process.exitCode=1;}
}
