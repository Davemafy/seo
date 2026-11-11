#!/usr/bin/env node
// Constrained hero composition: no model is allowed to rewrite application logic.
import {createHash} from "node:crypto";
import {cpSync,existsSync,lstatSync,readFileSync,realpathSync,writeFileSync} from "node:fs";
import {join,relative,resolve,sep} from "node:path";
export const PRESETS=Object.freeze(["stage-led","product-canvas"]);
export const ROUTE="src/routes/index.tsx";
export const CSS="src/sloppertizer-composition.css";
const OPEN='<section className="slp-hero">';
const END='<section id="features" className="slp-capabilities">';
const IMPORT='import "../sloppertizer-composition.css";';
const hash=x=>createHash("sha256").update(x).digest("hex");
export function splitSource(s){
  const markers=[...s.matchAll(/<section className="slp-hero(?: slp-cmp [^"]+)?"/g)];
  const a=markers.length===1?markers[0].index:-1,b=s.indexOf(END);
  if(markers.length!==1||a<0||b<=a||s.indexOf(END,b+1)!==-1)throw Error("Expected exactly one verified hero and section marker");
  if(!s.includes('import "../sloppertizer-landing.css";'))throw Error("Source must be Pass 2");
  return {before:s.slice(0,a),hero:s.slice(a,b),after:s.slice(b)};
}
export function hero(preset){
  if(!PRESETS.includes(preset))throw Error("Invalid composition preset");
  return [
    '<section className="slp-hero slp-cmp slp-cmp--'+preset+'" data-composition="'+preset+'">',
    '<div className="slp-cmp-grid">',
    '<div className="slp-cmp-copy">',
    '<span className="slp-cmp-eyebrow"><span className="slp-cmp-led" /> WORKFLOW AI PRO / A BETTER WORKDAY</span>',
    '<h1 className="slp-cmp-title">Less busywork.<span>More room to think.</span></h1>',
    '<p className="slp-cmp-desc">Turn meeting notes into decisions, plan your day, and draft follow-ups in one workspace. WorkFlow AI Pro handles the repetitive steps so you can focus on work that needs you.</p>',
    '<div className="slp-cmp-actions">',
    '<Link to="/auth"><Button size="lg" className="slp-cmp-primary">Start free <ArrowRight size={17} aria-hidden="true" /></Button></Link>',
    '<a href="#features" className="slp-cmp-secondary">Explore the tools <ArrowRight size={16} aria-hidden="true" /></a>',
    '</div>',
    '<p className="slp-cmp-footnote"><ShieldCheck size={16} aria-hidden="true" /> Review every AI output before using it.</p>',
    '</div>',
    '<div className="slp-cmp-stage">',
    '<div className="slp-cmp-topbar"><span><span className="slp-cmp-status" /> WORKFLOW / DAILY PLAN</span><span className="slp-cmp-illustrative">ILLUSTRATIVE WORKDAY</span></div>',
    '<HeroWorkspace />',
    '<div className="slp-cmp-steps"><span>01 <strong>Capture the brief</strong></span><span>02 <strong>Build a plan</strong></span><span>03 <strong>Take action</strong></span></div>',
    '</div>',
    '</div>',
    '</section>',''
  ].join("\n");
}
export function transform(src,preset){
  const p=splitSource(src);
  const head=p.before.replace('import "../sloppertizer-landing.css";','import "../sloppertizer-landing.css";\n'+IMPORT);
  const result=head+hero(preset)+p.after;
  if(splitSource(result).after!==p.after)throw Error("Frozen sections changed");
  return result;
}
export const STYLE=[
'.slp-root .slp-hero.slp-cmp{padding:0;background:#f5f6f1;color:#172521;border-bottom:1px solid #d6dfd6;}',
'.slp-root .slp-cmp-grid{width:min(1230px,calc(100% - 48px));margin:auto;display:grid;min-width:0;}',
'.slp-root .slp-cmp-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0;}',
'.slp-root .slp-cmp-eyebrow{display:flex;gap:10px;align-items:center;font:600 11px/1.4 var(--slp-font-mono);letter-spacing:.06em;color:#547360;}',
'.slp-root .slp-cmp-led{width:8px;height:8px;flex-shrink:0;border-radius:50%;background:#588f70;box-shadow:0 0 0 3px #d5e7d9;}',
'.slp-root .slp-cmp-title{font-family:var(--slp-font-sans);color:#142420;font-size:clamp(43px,4.2vw,63px);font-weight:680;letter-spacing:-.064em;line-height:1.045;text-wrap:balance;margin:22px 0 0;max-width:660px;}',
'.slp-root .slp-cmp-title span{display:block;color:#4b705e;}',
'.slp-root .slp-cmp-desc{color:#4d6156;font-size:16px;line-height:1.62;max-width:470px;margin:22px 0 0;}',
'.slp-root .slp-cmp-actions{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-top:28px;}',
'.slp-root .slp-cmp-primary{min-height:46px;padding:0 21px;background:#16382b;color:#fff;border-radius:7px;display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:13px;}',
'.slp-root .slp-cmp-primary:hover{background:#2e6046;}',
'.slp-root .slp-cmp-secondary{display:inline-flex;align-items:center;gap:8px;color:#29493a;font-size:13px;font-weight:600;text-decoration:none;border-bottom:1px solid #a0b4a4;padding-bottom:4px;}',
'.slp-root .slp-cmp-footnote{margin:29px 0 0;font-size:12px;color:#6b7d70;display:flex;align-items:center;gap:9px;}',
'.slp-root .slp-cmp-footnote svg{color:#55896b;flex-shrink:0;}',
'.slp-root .slp-cmp-stage{min-width:0;padding:12px 13px 13px;background:#1a3027;border:1px solid #3a5e4b;border-radius:12px;box-shadow:0 20px 46px -25px #142e2a70;}',
'.slp-root .slp-cmp-topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:2px 4px 12px;color:#d1e4d2;font:600 10px/1.4 var(--slp-font-mono);letter-spacing:.075em;}',
'.slp-root .slp-cmp-topbar>span{display:inline-flex;gap:8px;align-items:center;}',
'.slp-root .slp-cmp-status{width:6px;height:6px;border-radius:50%;background:#b8ed91;}',
'.slp-root .slp-cmp-illustrative{font-size:9px;color:#b6cbbd;white-space:nowrap;}',
'.slp-root .slp-cmp-stage .slp-hero-mock{background:#fafbf7;border-color:#506b59;border-radius:7px;box-shadow:none;}',
'.slp-root .slp-cmp-stage .slp-mock-body{grid-template-columns:110px minmax(0,1fr);min-height:315px;}',
'.slp-root .slp-cmp-stage .slp-mock-rail{background:#e9eee8;}',
'.slp-root .slp-cmp-stage .slp-mock-main{padding:18px 20px;gap:14px;}',
'.slp-root .slp-cmp-stage .slp-mock-brief{padding:13px 15px;background:#fff;}',
'.slp-root .slp-cmp-stage .slp-mock-brief p{font-size:15px;}',
'.slp-root .slp-cmp-stage .slp-mock-plan{gap:11px;}',
'.slp-root .slp-cmp-stage .slp-mock-plan-row{grid-template-columns:47px 11px minmax(0,1fr);gap:10px;}',
'.slp-root .slp-cmp-stage .slp-mock-plan-label{font-size:13px;}',
'.slp-root .slp-cmp-stage .slp-mock-plan-bar{background:#53906b;}',
'.slp-root .slp-cmp-stage .slp-mock-plan-row .slp-bar-muted{background:#c9d8ce;}',
'.slp-root .slp-cmp-steps{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#9fb7a6;font:500 10px/1.4 var(--slp-font-mono);padding:13px 3px 0;}',
'.slp-root .slp-cmp-steps strong{font-family:var(--slp-font-sans);font-size:11px;color:#e0eee0;font-weight:500;margin-left:4px;}',
'.slp-root .slp-cmp--stage-led .slp-cmp-grid{grid-template-columns:minmax(0,.8fr) minmax(0,1.45fr);gap:42px;align-items:center;padding:58px 0;}',
'.slp-root .slp-cmp--stage-led .slp-cmp-title{font-size:clamp(44px,4.2vw,60px);}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-grid{grid-template-columns:1fr;gap:28px;padding:42px 0 47px;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-copy{display:grid;grid-template-columns:1fr 1fr;gap:0 55px;align-items:end;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-eyebrow{grid-column:1/-1;margin-bottom:18px;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-title{grid-column:1;font-size:clamp(48px,4.8vw,70px);margin:0;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-desc{grid-column:2;grid-row:2;margin:0;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-actions{grid-column:1;}',
'.slp-root .slp-cmp--product-canvas .slp-cmp-footnote{grid-column:2;grid-row:3;margin:23px 0 0;}',
'.slp-root .slp-cmp--product-canvas .slp-mock-body{grid-template-columns:170px minmax(0,1fr);}',
'.slp-root .slp-cmp--product-canvas .slp-mock-main{padding:25px 32px;}',
'@media(max-width:920px){.slp-root .slp-cmp--stage-led .slp-cmp-grid{grid-template-columns:1fr;gap:30px;}.slp-root .slp-cmp--product-canvas .slp-cmp-copy{display:flex;align-items:flex-start;}.slp-root .slp-cmp-title{font-size:clamp(41px,6vw,58px);}}',
'@media(max-width:600px){.slp-root .slp-cmp-grid{width:calc(100% - 36px);}.slp-root .slp-cmp--stage-led .slp-cmp-grid,.slp-root .slp-cmp--product-canvas .slp-cmp-grid{padding:30px 0 34px;gap:24px;}.slp-root .slp-cmp--stage-led .slp-cmp-title,.slp-root .slp-cmp--product-canvas .slp-cmp-title{font-size:clamp(38px,10.1vw,45px);line-height:1.04;}.slp-root .slp-cmp-desc{font-size:14px;margin-top:17px;}.slp-root .slp-cmp-actions{margin-top:22px;gap:16px;}.slp-root .slp-cmp-footnote{margin-top:21px;}.slp-root .slp-cmp-stage{padding:9px;}.slp-root .slp-cmp-stage .slp-mock-body,.slp-root .slp-cmp--product-canvas .slp-mock-body{grid-template-columns:1fr;min-height:0;}.slp-root .slp-cmp-stage .slp-mock-rail{display:none;}.slp-root .slp-cmp-stage .slp-mock-main,.slp-root .slp-cmp--product-canvas .slp-mock-main{padding:12px;}.slp-root .slp-cmp-stage .slp-mock-brief p{font-size:13px;}.slp-root .slp-cmp-stage .slp-mock-plan-label{font-size:11px;}.slp-root .slp-cmp-steps{flex-wrap:wrap;font-size:9px;}.slp-root .slp-cmp-steps strong{font-size:10px;}.slp-root .slp-cmp-topbar{font-size:9px;}.slp-root .slp-cmp-illustrative{font-size:8px;}}',
'@media(prefers-reduced-motion:reduce){.slp-root .slp-cmp-primary{transition:none;}}'
].join("\n");
function readSafe(root,path){
  const f=resolve(root,path);
  if(!f.startsWith(root+sep)||!existsSync(f)||!lstatSync(f).isFile()||lstatSync(f).isSymbolicLink()||!realpathSync(f).startsWith(root+sep))throw Error("Unsafe or missing source");
  return readFileSync(f,"utf8");
}
function copySafe(a,b){
  cpSync(a,b,{recursive:true,errorOnExist:true,force:false,filter:p=>{
    const rel=relative(a,p);if(!rel)return true;
    const parts=rel.split(sep);
    if(parts.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)))return false;
    if(parts.some(x=>x===".env"||x.startsWith(".env.")))return false;
    return !lstatSync(p).isSymbolicLink();
  }});
}
export function apply(source,target,preset){
  const orig=readSafe(source,ROUTE),newRoute=transform(orig,preset);
  if(existsSync(target)||source===target||target.startsWith(source+sep)||source.startsWith(target+sep))throw Error("Separate new output required");
  copySafe(source,target);
  writeFileSync(join(target,ROUTE),newRoute);
  writeFileSync(join(target,CSS),STYLE);
  const report={
    experiment:"bounded hero composition",preset,changedFiles:[ROUTE,CSS],
    originalHash:hash(orig),newHash:hash(newRoute),
    lockedTailHash:hash(splitSource(orig).after),
    tailPreserved:hash(splitSource(orig).after)===hash(splitSource(newRoute).after),
    status:"UNVERIFIED - no promotion before browser quality tests"
  };
  if(!report.tailPreserved)throw Error("Locked sections changed");
  writeFileSync(join(target,"composition-report.json"),JSON.stringify(report,null,2)+"\n");
  return report;
}
if(process.argv[1]?.endsWith("composition-lab.mjs")){
  try{
    const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
    if(!args.project||!args.output||!args.preset)throw Error("Usage: node src/composition-lab.mjs --project pass2 --output experiment --preset stage-led|product-canvas");
    console.log(JSON.stringify(apply(realpathSync(resolve(args.project)),resolve(args.output),args.preset),null,2));
  }catch(e){console.error("Composition: "+e.message);process.exitCode=1;}
}