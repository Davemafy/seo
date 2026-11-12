import test from "node:test";
import {strict as assert} from "node:assert";
import {validateStructuralProposal} from "../src/engine/structural-studio.mjs";
const original='import {createFileRoute} from "@tanstack/react-router"; export const Route=createFileRoute("/")({component:()=> <div>Old source</div>});';
const landing=[
'import React from "react";',
'import {createFileRoute, Link} from "@tanstack/react-router";',
'import "../sloppertizer-landing.css";',
'export const Route = createFileRoute("/")({component: Landing});',
'function Landing(){',
' const [tab,setTab]=React.useState(0);',
' const [faq,setFaq]=React.useState(false);',
' return <div className="slp-creative">',
'  <nav><Link to="/auth">Try it</Link><Link to="/responsible-ai">Responsible AI</Link></nav>',
'  <main><h1>WorkFlow AI Pro</h1>',
'  <section id="features"><h2>Creative workplace tools</h2>',
'  <p>Draft an email, summarize a meeting, manage a task, conduct research, workplace chat and browse a prompt library.</p>',
'  </section>',
'  <section><h2>Working with email</h2><p>Write a clear subject and a useful message. Choose the audience, purpose, tone and level of detail. Make edits before sending. The result should be a draft that an actual person can review rather than a fictional completion or a claim about measured performance.</p></section>',
'  <section><h2>Meeting summaries and planning</h2><p>Use the meeting assistant to organize notes, identify decisions and list follow-up tasks. Keep ownership and accountability visible. Make it clear which aspects of the interface are illustrative rather than live customer data.</p></section>',
'  <section><h2>Research and prompts</h2><p>Research tools can help structure findings, but users still need to inspect the source and interpret the result. The prompt library provides a place to start common work without inventing endorsements or extraordinary statistics.</p></section>',
'  <div role="tablist" aria-label="Workflows">',
'   <button role="tab" aria-selected={tab===0} onClick={()=>setTab(0)}>Email</button>',
'   <button role="tab" aria-selected={tab===1} onClick={()=>setTab(1)}>Meeting</button>',
'  </div>',
'  <div role="tabpanel">{tab===0?"Email writing":"Meeting notes"}</div>',
'  <button aria-expanded={faq} onClick={()=>setFaq(v=>!v)}>FAQ</button>',
'  {faq&&<p>Review your work</p>}</main>',
' </div>;',
'}'
].join("\n");
const css=[
'.slp-creative{background:#f5f2eb;color:#1f3329;min-height:100vh;}',
'.slp-creative h1{font-size:clamp(2rem,4vw,5rem);line-height:1.05;}',
'.slp-creative button{background:#192f25;color:white;border:1px solid #395447;padding:12px;}',
'@media(max-width:640px){.slp-creative h1{font-size:36px;}.slp-creative nav{display:flex;}}'
].join("\n");
const ok=()=>({direction:"An original editorial workspace with visible source-based product evidence.",files:{"src/routes/index.tsx":landing,"src/sloppertizer-landing.css":css}});
test("accepts full, different JSX architecture and accessible behavior without CSS-only limitation",()=>{
 const v=validateStructuralProposal(ok(),original);
 assert.equal(v.paths.length,2);assert(v.imports.includes("react"));
});
test("refuses network/browser escape and unauthorized dependencies",()=>{
 for(const bad of [
  landing.replace('import React from "react";','import React from "react"; import axios from "axios";'),
  landing.replace('const [tab,setTab]=React.useState(0);','fetch("https://malicious.invalid"); const [tab,setTab]=React.useState(0);'),
  landing.replace('const [tab,setTab]=React.useState(0);','localStorage.setItem("x","y");const [tab,setTab]=React.useState(0);')
 ]){
  const p=ok();p.files["src/routes/index.tsx"]=bad;
  assert.throws(()=>validateStructuralProposal(p,original),/Unexpected/);
 }
});
test("rejects missing actual routes, capability or root and CSS global scope",()=>{
 for(const replaced of [
  landing.replace('to="/auth"','to="/login"'),
  landing.replace(/\bprompt\b/gi,'template'),
  landing.replace('className="slp-creative"','className="ordinary"')
 ]){
  const p=ok();p.files["src/routes/index.tsx"]=replaced;
  assert.throws(()=>validateStructuralProposal(p,original));
 }
 for(const extra of ["body{color:red}",".outside{color:red}", "@import url(https://evil.invalid/style.css);"]){
  const p=ok();p.files["src/sloppertizer-landing.css"]+="\n"+extra;
  assert.throws(()=>validateStructuralProposal(p,original));
 }
});
