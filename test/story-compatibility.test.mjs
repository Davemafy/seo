import test from "node:test";
import {strict as assert} from "node:assert";
import {storyCompatibility} from "../src/engine/story-compatibility.mjs";
const fixture=()=>{
 const x={status:200,errors:[],horizontalOverflow:false,
  brokenImages:["http://127.0.0.1:3201/source-logo.png"],
  links:[{href:"#features"},{href:"/auth"}],buttons:[{text:"Start"}],
  headings:["Features","Feature A"],textCollisions:[],
  accessibility:{verified:true,contrastFailures:2,violations:[]}};
 return {desktop:structuredClone(x),mobile:structuredClone(x)};
};
test("does not blame inherited defects on a safe DOM composition",()=>{
 const before=fixture(),after=structuredClone(before);
 for(const view of ["desktop","mobile"])after[view].brokenImages=["http://127.0.0.1:3202/source-logo.png"];
 const r=storyCompatibility(before,after);
 assert.equal(r.status,"compatible-with-inherited-defects");
 assert(r.inherited.length===4);
});
test("new assets, lost links and vanished headings reject",()=>{
 const a=fixture(),b=structuredClone(a);
 b.desktop.brokenImages.push("http://127.0.0.1:3202/new-missing.png");
 b.mobile.links.pop();b.mobile.headings.pop();
 const r=storyCompatibility(a,b);
 assert.equal(r.status,"reject");assert.match(r.failures.join(" "),/broken images/);
 assert.match(r.failures.join(" "),/destinations/);
 assert.match(r.failures.join(" "),/headings/);
});
test("new runtime errors and contrast regressions reject",()=>{
 const a=fixture(),b=structuredClone(a);
 b.desktop.errors.push("Crash");b.mobile.accessibility.contrastFailures=3;
 assert.equal(storyCompatibility(a,b).status,"reject");
});
