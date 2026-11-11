import test from "node:test";
import { strict as assert } from "node:assert";
import { selection } from "../src/engine/selection.mjs";
const base=()=>{
 const v={status:200,pageHeight:2600,headlineLines:3,headlineFontSize:50,
  horizontalOverflow:false,brokenImages:[],errors:[],textCollisions:[],
  links:[{href:"/pricing"}],buttons:[{text:"Start"}],
  accessibility:{verified:true,contrastFailures:0,violations:[]}};
 return {desktop:structuredClone(v),mobile:structuredClone(v)};
};
test("preserves a better previous candidate when an automatic revision grows too tall",()=>{
 const a=base(),b=base();b.mobile.pageHeight=2950;
 assert.match(selection(a,b).problems.join(" "),/>5%/);
});
test("rejects invisible text, not just broken routes",()=>{
 const a=base(),b=base();b.desktop.accessibility={verified:true,contrastFailures:2,violations:[{id:"color-contrast",count:2}]};
 assert.match(selection(a,b).problems.join(" "),/contrast/);
});
test("technically eligible still needs human approval",()=>{
 const x=base();assert.equal(selection(x,x).status,"eligible-for-visual-review");
});

test("rejects a visually overlapping heading and paragraph despite clean builds",()=>{
 const before=base(),after=base();
 after.mobile.textCollisions=[{heading:"Choose your plan",paragraph:"Starter includes...",ratio:0.29,overlapPx:1800}];
 assert.match(selection(before,after).problems.join(" "),/heading\/paragraph overlaps/);
});
