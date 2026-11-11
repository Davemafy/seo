import test from "node:test";
import {strict as assert} from "node:assert";
import {promptFor,allowedImageModel,TEST_MODELS} from "../src/engine/asset-benchmark.mjs";

test("asset benchmark prompt is grounded in actual website identity without false marketing claims",()=>{
  const x=promptFor({product:"Cactus | Product",sources:{page:"<main><h1>Cactus</h1></main>"}});
  assert.match(x,/Cactus/);
  assert.match(x,/No writing/);
  assert.match(x,/not a mock product/i);
  assert.doesNotMatch(x,/trusted by 1,000|guaranteed/i);
});

test("Qwen Image evaluation license forces a nonproduction gate",()=>{
  const q=allowedImageModel({id:"qwen-image-2.1",architecture:{
    input_modalities:["text","image"],output_modalities:["image"]
  },description:"Evaluation only (Qwen Research License)"});
  assert.equal(q.evaluationOnly,true);
  const z=allowedImageModel({id:"z-image-turbo",architecture:{
    input_modalities:["text"],output_modalities:["image"]
  },description:"Images"});
  assert.equal(z.evaluationOnly,false);
  assert.deepEqual(TEST_MODELS,["qwen-image-2.1","z-image-turbo"]);
});
test("rejects models without image output or outside the controlled comparison",()=>{
  assert.throws(()=>allowedImageModel({id:"glm-5.2",architecture:{input_modalities:["text"],output_modalities:["text"]}}),/not in tightly scoped/);
  assert.throws(()=>allowedImageModel({id:"z-image-turbo",architecture:{input_modalities:["text"],output_modalities:["text"]}}),/does not generate/);
});
