import test from "node:test";
import { strict as assert } from "node:assert";
import { detectEditorialIssue,validateEditorialSuggestion,applyEditorialCopy } from "../src/engine/editorial-copy.mjs";
const repeated="Orchard grows with the work you do and supports projects with flexible choices.";
const source=[
 'import React from "react";',
 'function Page(){return <main className="slp-engine">',
 ' <div className="slp-cmp-hero"><p>'+repeated+'</p></div>',
 ' <section className="slp-exp-pricing"><div className="slp-exp-pricing-intro">',
 ' <h2>For homes and offices</h2><p>'+repeated+'</p></div>',
 ' <div><div><h3>Starter</h3><p>Personal use and individual work</p><span>$29</span><a href="/start">Join</a></div>',
 ' <div><h3>Team</h3><p>For multiple users with support</p><span>$99</span><a href="/team">Team</a></div></div></section>',
 ' </main>} export default Page;'
].join("\n");
test("discovers evidence problem in an unrelated React product",()=>{
 const p=detectEditorialIssue(source);
 assert.deepEqual(p.tiers,["Starter","Team"]);
 assert.equal(p.repeated,true);assert.equal(p.mismatched,true);
});
test("rewrites only source facts, preserving all links and amounts",()=>{
 const problem=detectEditorialIssue(source);
 const draft=validateEditorialSuggestion({heading:"Choose the Orchard plan that fits",
   description:"Starter is for personal use and individual work, while Team supports multiple users with support options."},problem);
 const out=applyEditorialCopy(source,problem,draft);
 assert(out.includes('href="/start"')&&out.includes('href="/team"')&&out.includes("$29")&&out.includes("$99"));
 assert(out.includes("Orchard grows with the work you do"));
 assert(out.includes("Choose the Orchard plan that fits"));
});
test("rejects invented plan facts and hype",()=>{
 const p=detectEditorialIssue(source);
 assert.throws(()=>validateEditorialSuggestion({heading:"Choose an Orchard plan",
  description:"Starter supports a million customers and Team offers guaranteed instant results with no risks."},p),/Unsafe/);
 assert.throws(()=>validateEditorialSuggestion({heading:"The ultimate power",
  description:"Starter handles small work and Team helps with multiple users across growing teams."},p),/mismatched/);
});
