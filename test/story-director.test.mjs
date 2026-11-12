import test from "node:test";
import {strict as assert} from "node:assert";
import {parseModelStoryPlan} from "../src/engine/story-director.mjs";
test("accepts only existing bounded React compositions",()=>{
 const x=parseModelStoryPlan('{"layout":"editorial-rail","reason":"Source has a compact feature heading."}');
 assert.equal(x.layout,"editorial-rail");
 assert.match(x.reason,/Source/);
});
test("refuses arbitrary JSX and attempts to inject facts through model plan",()=>{
 assert.throws(()=>parseModelStoryPlan('{"layout":"code-injection","reason":"pretty"}'),/Invalid composition/);
 assert.throws(()=>parseModelStoryPlan('{"layout":"product-casebook","testimonials":["Fake"]}'),/Unknown composition/);
 assert.throws(()=>parseModelStoryPlan('{"layout":"feature-mosaic","reason":"x".repeat(201)}'),/JSON/);
});
test("fails closed on missing or incomplete output",()=>{
 assert.throws(()=>parseModelStoryPlan("Try editorial-rail"),/JSON/);
 assert.throws(()=>parseModelStoryPlan('{"layout":"product-casebook",'),/JSON/);
});

test("trims only verbose reasoning while retaining strict layout validation",()=>{
 const x=parseModelStoryPlan(JSON.stringify({layout:"feature-mosaic",reason:"Source-directed analysis. ".repeat(20)}));
 assert.equal(x.layout,"feature-mosaic");
 assert.equal(x.reason.length,200);
 assert.throws(()=>parseModelStoryPlan(JSON.stringify({layout:"arbitrary",reason:"a".repeat(280)})),/Invalid composition/);
});
