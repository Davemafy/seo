import test from "node:test";
import { strict as assert } from "node:assert";
import { checkGuidance } from "../src/visual-director.mjs";
import { evaluateQuality } from "../src/visual-quality-gate.mjs";

test("rejects generic and reference-free analysis", () => {
  assert.throws(()=>checkGuidance("Looks polished"),/missing|generic/);
  assert.throws(()=>checkGuidance("All sites look similar. ".repeat(70)),/superhuman/);
});
test("retains concrete image-derived plan",()=>{
  const value="Observed references: Superhuman has a large product surface. Sunsama shows a calendar. Granola has a strong typographic proposition. Pass 2 diagnosis: hero too sparse. Redesign specification: a better hero with a mobile breakpoint. "+"Typography, product detail and vertical rhythm are critical. ".repeat(10);
  assert.match(checkGuidance(value),/Pass 2/);
});
test("rejects longer and broken page while allowing measured improvements",()=>{
  const report=(desktop,mobile)=>({desktop:{status:200,pageHeight:desktop,h1:["A"],authLinks:1,responsibleAiLinks:1,errors:[],brokenImages:[],overflow:false},mobile:{status:200,pageHeight:mobile,h1:["A"],authLinks:1,responsibleAiLinks:1,errors:[],brokenImages:[],overflow:false}});
  assert.equal(evaluateQuality(report(2748,4046),report(2800,4060),{desktop:{h1Lines:3},mobile:{h1Lines:4,h1FontSize:44}}).result,"browser-checks-passed");
  assert.equal(evaluateQuality(report(2748,4046),report(3763,4590),{desktop:{h1Lines:7},mobile:{h1Lines:4,h1FontSize:44}}).result,"reject");
});
