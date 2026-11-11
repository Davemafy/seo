import test from "node:test";
import {strict as assert} from "node:assert";
import {inspectPlans,composePlanExplorer} from "../src/engine/plan-explorer.mjs";
const fixture=[
'import React from "react";',
'function App(){return <main className="slp-engine">',
'<section className="slp-exp-pricing">',
' <div className="slp-exp-pricing-intro"><h2>Pick a plan</h2><p>Plans for different groups.</p></div>',
' <div className="slp-exp-plan-grid">',
'  <div className="slp-exp-plan slp-exp-plan-1"><h3>Starter</h3><p>Individuals</p><span>$29</span><span>/month</span><ul><li>Team: <span>1 developer</span></li><li>Support: <span>6 months</span></li><li>No hidden fees</li></ul><a href="/starter">Buy</a></div>',
'  <div className="slp-exp-plan slp-exp-plan-2"><h3>Company</h3><span>$99</span><span>/month</span><ul><li>Team: <span>10 developers</span></li><li>Support: <span>24 months</span></li><li>No hidden fees</li></ul><a href="/company">Buy</a></div>',
'  <div className="slp-exp-plan slp-exp-plan-3"><h3>Enterprise</h3><span>$499</span><span>/month</span><ul><li>Team: <span>100+ developers</span></li><li>Support: <span>36 months</span></li><li>No hidden fees</li></ul><a href="/enterprise">Buy</a></div>',
' </div></section></main>}',
'export default App;'
].join("\n");
test("extracts verified source facts, prices and plan distinctions from unrelated brand",()=>{
 const a=inspectPlans(fixture);
 assert.equal(a.plans.length,3);
 assert.deepEqual(a.plans.map(x=>x.price),["$29","$99","$499"]);
 assert(a.plans[0].distinguishing.includes("Team: 1 developer"));
 assert(a.plans[0].distinguishing.includes("Support: 6 months"));
 assert(!a.plans[0].distinguishing.includes("No hidden fees"));
});
test("composition retains checkout links and source plan cards with accessible React state",()=>{
 const a=composePlanExplorer(fixture);
 for(const x of ["/starter","/company","/enterprise",'<SloppertizerPlanExplorer />','import "./sloppertizer.plan-explorer.css";','aria-pressed={active===i}','role="group"','id="slp-source-plan-3" data-slp-selected="false"'])assert(a.source.includes(x),x);
 assert(a.source.includes("slpPlanState(0)"));
 assert(a.source.includes("slpPlanEffect"));
 assert(a.source.includes("data-slp-selected"));
 assert(!a.source.includes("fake testimonial"));
});
test("refuses invented differentiated proof, dynamic prices and ambiguous structures",()=>{
 const weak=fixture.replace('Team: <span>10 developers</span>','Team: <span>1 developer</span>').replace('Support: <span>24 months</span>','Support: <span>6 months</span>');
 assert.throws(()=>inspectPlans(weak),/Too little real differentiation/);
 const dynamic=fixture.replace('<span>$29</span>','<span>{price}</span>');
 assert.throws(()=>inspectPlans(dynamic),/Ambiguous|Dynamic price/);
 assert.throws(()=>composePlanExplorer(fixture+'<section className="slp-exp-pricing"></section>'),/Ambiguous/);
});

test("ignores JSX comments in original plan lists but keeps actual text",()=>{
 const version=fixture.replace("<li>Team: <span>1 developer</span></li>","<li>{/* Original icon */}<svg strokeWidth={1.5}/><span>Team: </span><span>1 developer</span></li>");
 const parsed=inspectPlans(version);
 assert(parsed.plans[0].facts.includes("Team: 1 developer"));
});
