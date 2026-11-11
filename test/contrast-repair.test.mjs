import test from "node:test";
import { strict as assert } from "node:assert";
import { validateColorPatch } from "../src/engine/contrast-repair.mjs";
const safe=".slp-engine .pricing-card p { color: #f6f2eb !important; background-color: #173d2d; }\n".repeat(3);
test("accepts scoped color-only contrast patches",()=>assert.equal(validateColorPatch(safe),safe));
test("rejects model's attempt to rewrite layout",()=>{
 assert.throws(()=>validateColorPatch(safe+'.slp-engine h2{margin-top:2rem}'),/color/);
 assert.throws(()=>validateColorPatch(safe+'.slp-engine h2::after{content:"Most Popular"}'),/non-color/);
 assert.throws(()=>validateColorPatch(safe+'body{color:#000}'),/Unscoped/);
});
