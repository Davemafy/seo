import test from "node:test";
import {strict as assert} from "node:assert";
import {PRESETS,splitSource,transform,hero,STYLE} from "../src/composition-lab.mjs";
const text=[
 'import "../sloppertizer-landing.css";',
 '<section className="slp-hero">Old Hero</section>',
 '<section id="features" className="slp-capabilities">Frozen components and tests</section>',
 '<section id="faq">FAQ</section>',
 '<Link to="/responsible-ai"/> <Link to="/auth"/>'
].join("\n");
test("two legal layouts only",()=>{
  assert.deepEqual(PRESETS,["stage-led","product-canvas"]);
  assert.throws(()=>hero("random"),/Invalid composition/);
});
test("hero-only change with locked rest of page byte-for-byte",()=>{
  for(const preset of PRESETS){
    const revised=transform(text,preset);
    assert.equal(splitSource(revised).after,splitSource(text).after);
    assert.equal(splitSource(revised).before.replace('import "../sloppertizer-composition.css";\n',''),splitSource(text).before);
    assert.equal((revised.match(/id="features"/g)||[]).length,1);
    assert.equal((revised.match(/<h1\b/g)||[]).length,1);
    assert.match(revised,/Review every AI output/);
  }
});
test("fail closed on unknown source boundaries",()=>{
  assert.throws(()=>splitSource("bad"),/Expected exactly one/);
  assert.throws(()=>splitSource(text+'<section className="slp-hero">X</section>'),/Expected exactly one/);
});
test("hero stylesheet scoped and responsive",()=>{
  assert.match(STYLE,/\.slp-root \.slp-hero\.slp-cmp/);
  assert.match(STYLE,/@media\(max-width:600px\)/);
  assert.doesNotMatch(STYLE,/^\s*(?:html|body|:root)\s*\{/m);
});
