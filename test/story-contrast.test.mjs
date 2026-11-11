import test from "node:test";
import {strict as assert} from "node:assert";
import {contrast} from "../src/engine/repair-from-axe.mjs";
import {repairTextColor,makeStoryContrastPatch} from "../src/engine/story-contrast.mjs";
test("fixes inherited amber-on-light hero color without inventing a new brand",()=>{
 const corrected=repairTextColor("#f59e0b",["#f9fafb"]);
 assert(contrast(corrected,"#f9fafb")>=4.5);
 assert.notEqual(corrected,"#000000");
 assert.notEqual(corrected,"#20382c");
});
test("generates a strict color-only patch using actual axe screenshot evidence",()=>{
 const entry={id:"color-contrast",count:1,nodes:[{
  selector:".text-amber-500",
  failure:"Element has insufficient color contrast (foreground color: #f59e0b, background color: #f9fafb, font size 42px)"
 }]};
 const report={desktop:{accessibility:{verified:true,violations:[entry]}},mobile:{accessibility:{verified:true,violations:[entry]}}};
 const patch=makeStoryContrastPatch(report);
 assert.equal(patch.changedSelectors,1);
 assert.match(patch.css,/body:not\(#slp-story-color-fix-sentinel\) \.text-amber-500 \{ color: #[0-9a-f]{6} !important; \}/);
 assert.doesNotMatch(patch.css,/padding:|content:|font-size:|position:|display:/);
});
test("no measurements means no decorative repairs",()=>{
 const no={desktop:{accessibility:{verified:true,violations:[]}},mobile:{accessibility:{verified:true,violations:[]}}};
 assert.equal(makeStoryContrastPatch(no).changedSelectors,0);
 assert.equal(makeStoryContrastPatch(no).css,"");
});
test("unverified, truncated, conflicting or suspicious CSS evidence rejects",()=>{
 const node={selector:".x",failure:"foreground color: #f59e0b, background color: #f9fafb"};
 const x={desktop:{accessibility:{verified:true,violations:[{id:"color-contrast",count:2,nodes:[node]}]}},mobile:{accessibility:{verified:true,violations:[]}}};
 assert.throws(()=>makeStoryContrastPatch(x),/Truncated/);
 x.desktop.accessibility.violations[0].count=1;x.desktop.accessibility.violations[0].nodes[0].selector="div { display:none }";
 assert.throws(()=>makeStoryContrastPatch(x),/selector/);
 assert.throws(()=>repairTextColor("#ffffff",[]),/Unsupported/);
});
