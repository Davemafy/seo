import test from "node:test";
import {strict as assert} from "node:assert";
import {describeModel,selectModel,assertActualModel,catalog} from "../src/engine/model-catalog.mjs";
const item={id:"glm-5.2",input_modalities:[{type:"text",pricing:[{type:"prompt",cost_usd:"0.00000075"}]},{type:"image"}],output_modalities:[{type:"text",pricing:[{type:"completion",cost_usd:"0.000003"}]}]};
test("catalog actually proves image input and token pricing without relying on marketing names",()=>{
 const a=describeModel(item);
 assert.equal(a.readsImages,true);assert.equal(a.writesText,true);
 assert.equal(a.inputUsdPerMillion,0.75);assert.equal(a.outputUsdPerMillion,3);
 assert.equal(selectModel([a],a.id,{vision:true}),a);
});
test("rejects misspelled IDs and silent provider model fallback",()=>{
 const a=describeModel(item);
 assert.throws(()=>selectModel([a],"glm-5.22",{vision:true}),/Unknown/);
 assert.throws(()=>assertActualModel(a.id,"deepseek-v4.1-flash-1017"),/substituted/);
});
test("does not accept assumed vision when only text is advertised",()=>{
 const a=describeModel({...item,input_modalities:[{type:"text"}]});
 assert.throws(()=>selectModel([a],a.id,{vision:true}),/modalities/);
});
test("reads live-provider shape with injected fetch",async()=>{
 const a=await catalog({fetcher:async()=>({ok:true,json:async()=>({data:[item]})})});
 assert.equal(a.length,1);
});
