import test from "node:test";
import { strict as assert } from "node:assert";
import { annotateSections } from "../src/engine/sections.mjs";

const source = [
 'import React from "react";',
 'import Feature from "./Feature";',
 'function Product(){return <main className="slp-engine">',
 ' <div><a href="/">Orchard</a><button onClick={submit}>Join</button></div>',
 ' <div><h1>Orchard makes tools</h1><img src="/photo.png"/></div>',
 ' <div className="marketing"><div><div className="title"><h2>Features</h2><p>Useful tools</p><p>Everything in one place.</p></div><div><div className="grid"><Feature name="Planning"/><Feature name="Research"/><Feature name="Support"/></div></div></div></div>',
 ' <section><div><div className="price-title"><h2>Choose a plan</h2><p>Clear prices</p></div><div className="prices">',
 ' <div className="offer"><h3>Starter</h3><p>$29</p><ul><li>One user</li></ul><a href="/start">Start</a></div>',
 ' <div className="offer"><h3>Team</h3><p>$99</p><ul><li>Five users</li></ul><a href="/team">Team</a></div>',
 ' </div></div></section>',
 ' <section><figure><blockquote><p>Thoughtful tools work better.</p></blockquote></figure></section>',
 ' <footer><a href="https://example.com/license">License</a></footer>',
 ' </main>}',
 'export default Product'
].join("\n");
test("automatically annotates unrelated product sections without rewriting links or prices",()=>{
 const result=annotateSections(source);
 assert.equal(result.featureCount,3);
 assert.equal(result.planCount,2);
 for(const marker of ["slp-exp-features","slp-exp-pricing","slp-exp-feature-grid","slp-exp-plan-1","slp-exp-plan-2","slp-exp-quote","slp-exp-footer"]) assert(result.source.includes(marker));
 for(const literal of ['onClick={submit}','href="/start"','href="/team"','$29','$99','Planning','Research','Support']) assert(result.source.includes(literal));
 assert.match(result.source,/import "\.\/sloppertizer\.sections\.css"/);
});
test("fails closed when requested composition is absent or repeated",()=>{
 assert.throws(()=>annotateSections(source.replace(/<footer[\s\S]*?<\/footer>/,"")),/unambiguous/);
 assert.throws(()=>annotateSections(source.replace('className="marketing"','className={dynamicClass}')),/Dynamic className/);
});

test("recomposition invalidates stale color patches instead of overriding a new background",()=>{
 const previous='import "./sloppertizer.contrast.css";\n'+source;
 const result=annotateSections(previous);
 assert.equal(result.hadStaleContrast,true);
 assert(!result.source.includes('import "./sloppertizer.contrast.css";'));
 assert(result.source.includes('sloppertizer.sections.css'));
 assert(result.source.includes('href="/start"'));
});
