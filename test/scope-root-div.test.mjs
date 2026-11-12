import test from "node:test";
import {strict as assert} from "node:assert";
import {addScope,unchangedOutsideScope,validateCss} from "../src/engine/scope.mjs";

const original=[
 'import React from "react";',
 'export function Landing(){',
 '  return (',
 '   <div className="min-h-screen bg-background">',
 '    <header><a href="/auth">Sign in</a></header>',
 '    <section><h1>Real app</h1><button onClick={() => null}>Launch</button></section>',
 '   </div>',
 '  );',
 '}'
].join("\n");

test("safe unique root div can receive scoped CSS without changing handlers or links",()=>{
 const scoped=addScope(original,"src/routes/index.tsx");
 assert.match(scoped.source,/className="min-h-screen bg-background slp-engine"/);
 assert(scoped.source.includes('href="/auth"'));
 assert(scoped.source.includes('onClick={() => null}'));
 assert(unchangedOutsideScope(original,scoped.source));
});
test("ambiguity and dynamic root class are rejected",()=>{
 const ambiguous=original.replace('export function Landing(){','export function Landing(){return <div className="another-root">One</div>;} export function Other(){');
 assert.throws(()=>addScope(ambiguous,"src/routes/index.tsx"),/exactly one verified returned div/);
 const dynamic=original.replace('className="min-h-screen bg-background"', 'className={rootClass}');
 assert.throws(()=>addScope(dynamic,"src/routes/index.tsx"),/exactly one verified returned div/);
});
test("story wrapper must remain explicitly authorized",()=>{
 const claimed=original.replace('className="min-h-screen bg-background"','className="slp-story" data-slp-story="source-preserved"');
 assert.throws(()=>addScope(claimed,"src/routes/index.tsx"),/verified story wrapper/);
});

test("dark-theme ancestor may style ONLY the existing scoped subtree",()=>{
 const css=[
  ".slp-engine { background: #faf9f5; color:#151515; }",
  ".dark .slp-engine, .slp-engine.dark { background: #101319; color: #eee; }",
  ".dark .slp-engine h1 { font-size:48px; }",
  ".slp-engine button { background: #891d20; }"
 ].join("\n").repeat(3);
 assert.equal(validateCss(css),css);
 assert.throws(()=>validateCss(css+"\n.dark button { color: red; }"),/escaped/);
 assert.throws(()=>validateCss(css+"\nbody { color: red; }"),/escaped/);
});
