import test from "node:test";
import {strict as assert} from "node:assert";
import {contrast,selectedTextColor,generatePatch} from "../src/engine/repair-from-axe.mjs";
test("selects WCAG AAA contrast without changing page geometry",()=>{
 for(const bg of ["#193b2e","#fbf8f1","#ccaa8f","#b46b42"]){
  assert(contrast(selectedTextColor(bg),bg)>=4.5);
 }
});
test("generates grounded CSS only for failing selectors",()=>{
 const violation={id:"color-contrast",count:1,nodes:[{
  selector:".pricing-card p",failure:"Element has insufficient contrast (foreground color: #496457, background color: #193b2e, font size: 13px)."
 }]};
 const r={desktop:{accessibility:{verified:true,violations:[violation]}},mobile:{accessibility:{verified:true,violations:[violation]}}};
 const p=generatePatch(r);
 assert.equal(p.affected,1);
 assert.match(p.css,/\.slp-engine \.pricing-card p \{ color: #[0-9a-f]{6} !important; \}/);
 assert.doesNotMatch(p.css,/padding|height|position|content:/);
});
test("rejects partial axe reports and unverified output",()=>{
 const bad={desktop:{accessibility:{verified:true,violations:[{id:"color-contrast",count:2,nodes:[{selector:".x",failure:"background color: #ffffff"}]}]}},mobile:{accessibility:{verified:true,violations:[]}}};
 assert.throws(()=>generatePatch(bad),/truncated/);
});
