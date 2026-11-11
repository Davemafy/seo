import test from "node:test";
import { strict as assert } from "node:assert";
import { DEMO, STYLE, partitionRoute, replaceDemo } from "../src/demo-fidelity.mjs";
const source=[
'import "../sloppertizer-landing.css";',
'import "../sloppertizer-composition.css";',
'function HeroWorkspace() { return <div>old mock</div>; }',
'function Capabilities() { return <div>Six tabs</div>; }',
'function Landing() { return <><section className="slp-hero slp-cmp slp-cmp--stage-led" data-composition="stage-led"><h1>Title</h1><HeroWorkspace/></section><section id="features">Features</section><Link to="/auth"/><Link to="/responsible-ai"/></> }'
].join("\n");
test("demo only replaces one bounded source span",()=>{
  const revised=replaceDemo(source),before=partitionRoute(source),after=partitionRoute(revised);
  assert.equal(after.after,before.after);
  assert.equal(after.before.replace('import "../sloppertizer-demo.css";\n',''),before.before);
  assert.match(revised,/From meeting to momentum/);
  assert.match(revised,/Nothing is sent without your review/);
  assert.equal((revised.match(/<h1\b/g)||[]).length,1);
});
test("rejects duplicate and unknown source markers",()=>{
  assert.throws(()=>partitionRoute("random"),/exactly one/);
  assert.throws(()=>partitionRoute(source+"function HeroWorkspace() {}"),/exactly one/);
});
test("sample widgets are not disguised clickable actions",()=>{
  assert.doesNotMatch(DEMO,/<button|onClick|type="submit"/);
  assert.match(DEMO,/ILLUSTRATIVE|MEETING NOTES|PREPARED ACTIONS|TIME-BLOCKED DAY/);
  assert.match(STYLE,/\.slp-root \.slp-cmp--stage-led \.slp-demo/);
  assert.doesNotMatch(STYLE,/^\s*(?:html|body|:root|\*)\s*\{/m);
});
