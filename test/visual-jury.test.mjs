import test from "node:test";
import { strict as assert } from "node:assert";
import { AXES,assessDesign } from "../src/engine/visual-jury.mjs";
const good=()=>({
 scores:Object.fromEntries(AXES.map(key=>[key,{score:4,reason:"Readable, coherent, visually strong detail."}])),
 issues:[],betterThanBaseline:true,verdict:"pass"
});
test("quality jury requires every visual dimension >=4/5 and actual improvement",()=>{
 assert.equal(assessDesign(good()).status,"advisory-pass");
 const poor=good();poor.scores.productEvidence.score=2;
 assert.match(assessDesign(poor).problems.join(" "),/productEvidence/);
});
test("build-success output still rejected when visuals have a major issue",()=>{
 const report=good();report.issues=[{severity:"major",description:"The illustration is almost invisible",fix:"Strengthen artwork"}];
 assert.equal(assessDesign(report).status,"iterate");
});
test("incomplete or unverified aesthetic claims fail closed",()=>{
 const report=good();delete report.scores.mobileReadability;
 assert.throws(()=>assessDesign(report),/rubric/);
 const unchanged=good();unchanged.betterThanBaseline=false;
 assert.equal(assessDesign(unchanged).status,"iterate");
});
