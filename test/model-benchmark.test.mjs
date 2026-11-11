import test from "node:test";
import {strict as assert} from "node:assert";
import {selectCalibratedJudge} from "../src/engine/model-benchmark.mjs";
test("selects only image-grounded visual judges",()=>{
 assert.equal(selectCalibratedJudge({rows:[{model:"glm-5.2",earned:8,eligibleForJudging:true},{model:"muse-glimmer-30b",earned:7,eligibleForJudging:false}]}),"glm-5.2");
 assert.throws(()=>selectCalibratedJudge({rows:[{model:"muse-glimmer-30b",earned:7,eligibleForJudging:false}]}),/No image-grounded/);
});
test("independent fully calibrated judge is preferred over coding model",()=>{
 assert.equal(selectCalibratedJudge({rows:[{model:"glm-5.2",earned:8,eligibleForJudging:true},{model:"muse-glimmer-30b",earned:8,eligibleForJudging:true}]}),"muse-glimmer-30b");
});
