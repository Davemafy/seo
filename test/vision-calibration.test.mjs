import test from "node:test";
import {strict as assert} from "node:assert";
import {scoreVision} from "../src/engine/vision-calibration.mjs";
const f={brand:"CEDAR STUDIO",badge:"Q7K-42",selected:"STARTER",headerColor:"green"};
test("vision score requires actual screenshot details, not generic descriptions",()=>{
 assert.equal(scoreVision(f,{brand:"CEDAR STUDIO",badge:"Q7K-42",selected:"STARTER",headerColor:"green"}).earned,4);
 assert.equal(scoreVision(f,{brand:"CEDAR STUDIO",badge:"Q7K-42",selected:"TEAM",headerColor:"green"}).earned,3);
 assert.equal(scoreVision(f,{}).earned,0);
});
