import test from "node:test";
import { strict as assert } from "node:assert";
import { audit, parseJsonReply, validate, landingPath, scopedCssPath } from "../src/lib.mjs";
const jsx=[
  'import "../sloppertizer-landing.css";',
  'import {createFileRoute} from "@tanstack/react-router";',
  'export const Route=createFileRoute("/")({component:Landing});',
  'function Landing(){return <main><div id="features"/><a to="/auth"/><a to="/responsible-ai"/>',
  "x".repeat(1500),'</main>}'
].join("\n");
const css=(".slp-hero{display:grid;}\n").repeat(15);
const candidate=()=>({direction:"Editorial",files:{[landingPath]:jsx,[scopedCssPath]:css}});
test("audits generic patterns and unsupported marketing signals",()=>{
  const r=audit('<Card className="bg-gradient-primary glass text-center" /><Card />const data=[{value:"120K+",quote:"wow"}]','linear-gradient(red,blue)');
  assert.equal(r.cards,2);assert.equal(r.glass,1);assert.equal(r.hardcodedStats,1);assert.equal(r.hardcodedTestimonials,1);
});
test("parses model JSON fences",()=>{
  assert.deepEqual(parseJsonReply("\x60\x60\x60json\n{\"files\":{}}\n\x60\x60\x60"),{files:{}});
});
test("accepts scoped candidate",()=>{
  assert.equal(validate(candidate(),"original").direction,"Editorial");
});
test("rejects path escape",()=>{
  const c=candidate();c.files[".env"]="exfiltration";
  assert.throws(()=>validate(c,"original"),/outside landing/);
});
test("rejects route regressions",()=>{
  const c=candidate();c.files[landingPath]=jsx.replace('to="/auth"','to="/gone"');
  assert.throws(()=>validate(c,"original"),/Auth route/);
});
test("rejects global and remote CSS",()=>{
  const c=candidate();c.files[scopedCssPath]+="body {display:none;}";
  assert.throws(()=>validate(c,"original"),/Global CSS/);
  c.files[scopedCssPath]=css+"@import 'https://evil.test/a.css'";
  assert.throws(()=>validate(c,"original"),/Remote CSS/);
});
test("rejects unchanged output",()=>{
  assert.throws(()=>validate(candidate(),jsx),/Not a redesign/);
});

import { normalizeKnownImports } from "../src/normalize.mjs";
test("normalizes source-supported component aliases",()=>{
  assert.equal(normalizeKnownImports('import { Button } from "@components/ui/button";'),'import { Button } from "@/components/ui/button";');
  assert.equal(normalizeKnownImports('import { Button } from "@/components/ui/button";'),'import { Button } from "@/components/ui/button";');
});
