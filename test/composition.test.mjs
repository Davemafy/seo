import test from "node:test";
import { strict as assert } from "node:assert";
import { applyComposition, inspectComposition, COMPOSITION_STYLES, LAYOUTS } from "../src/engine/composition.mjs";
import { validateCss } from "../src/engine/scope.mjs";

const source=[
 'import React from "react";',
 'import Image from "./Image";',
 'export default function App() {',
 ' const count = 3;',
 ' return <main className="container">',
 '  <nav><a href="/">Loom</a><button onClick={() => alert(count)}>Explore</button></nav>',
 '  <div className="hero"><h2>Build with care <span>Grow with purpose.</span></h2><div><Image aria-label="Product illustration"/></div></div>',
 '  <section><p>Loom supports better planning for people who care about thoughtful work. More details follow below.</p><h2>Features</h2><a href="/pricing">Pricing</a></section>',
 ' </main>;',
 '}',
].join("\n");
test("source-preserving component blueprint selects real hero and retains assets",()=>{
 const inspector=inspectComposition(source,"Loom");
 assert.equal(inspector.heading.text,"Build with care Grow with purpose.");
 assert.equal(inspector.asset.tag,"Image");
});
test("two independent compositions preserve all source outside the selected hero",()=>{
 for(const layout of LAYOUTS) {
  const result=applyComposition(source,"Loom",layout);
  assert.match(result.source,/slp-cmp-hero/);
  assert.match(result.source,/sloppertizer.compose.css/);
  assert(result.source.includes('button onClick={() => alert(count)}'));
  assert(result.source.includes('href="/pricing"'));
  assert(result.source.includes('Image aria-label="Product illustration"'));
  assert(result.source.includes('id="slp-details"'));
  assert(result.source.includes("Loom supports better planning"));
 }
});
test("fails closed on ambiguous hero, multiple assets, controls",()=>{
 assert.throws(()=>inspectComposition(source.replace('className="hero"','className="hero" data-x="x"').replace('</h2><div><Image','</h2><button>Click</button><div><Image'),"Loom"),/Interactive/);
 assert.throws(()=>inspectComposition(source.replace('return <main','return <section><main').replace('</main>;','</main></section>;').replace('</main>','</main><main></main>'),"Loom"),/main landmark/);
});
test("composition CSS is isolated and includes mobile design",()=>{
 assert(COMPOSITION_STYLES.includes(".slp-engine .slp-cmp-wrapper"));
 assert(COMPOSITION_STYLES.includes("max-width:600px"));
 // All generated CSS passed into the model's CSS gate remains scoped.
 const base=COMPOSITION_STYLES.replace(/@media\([^)]+\)\{[^}]+\}/g,"");
 assert(base.includes(".slp-engine"));
});
