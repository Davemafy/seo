import test from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { discover } from "../src/engine/site.mjs";
import { addScope,unchangedOutsideScope,validateCss } from "../src/engine/scope.mjs";
import { parseDesign,generate } from "../src/engine/generate.mjs";
import { compareBrowser } from "../src/engine/capture.mjs";

const original='import React from "react";\nimport "./App.css";\nexport default function App(){return <main className="mx-auto p-6"><h2>Cactus care</h2><button>Try It Out</button><a href="/pricing">Pricing</a></main>}\n';
const goodCss=(".slp-engine { background: #eee; color: #15211f; }\n.slp-engine h2 { font-size: 5rem; line-height: 1.04; }\n").repeat(5);
function fixture(fn) {
  const dir=mkdtempSync(join(tmpdir(),"slop-engine-"));
  try{
    mkdirSync(join(dir,"src"));
    writeFileSync(join(dir,"package.json"),JSON.stringify({name:"cactus",scripts:{build:"tsc && vite build",dev:"vite"}}));
    writeFileSync(join(dir,"index.html"),"<title>Cactus | Grow with less effort</title>");
    writeFileSync(join(dir,"src/App.tsx"),original);
    writeFileSync(join(dir,"src/App.css"),".foo{display:grid}");
    return fn(dir);
  }finally{rmSync(dir,{force:true,recursive:true});}
}
test("discovers a DIFFERENT React/Vite product without product-specific requirements",()=>fixture(root=>{
  const d=discover(root);
  assert.equal(d.entry,"src/App.tsx");assert.equal(d.product,"Cactus | Grow with less effort");
  assert.equal(d.framework,"react-vite");
  assert.doesNotMatch(JSON.stringify(d),/WorkFlow AI Pro/);
}));
test("adds scoped CSS without removing any original markup/handlers/anchors",()=>{
  const p=addScope(original,"src/App.tsx");
  assert(p.source.includes('className="mx-auto p-6 slp-engine"'));
  assert(unchangedOutsideScope(original,p.source));
  assert(p.source.includes('href="/pricing"'));
  assert(p.source.includes("<button>Try It Out</button>"));
});
test("rejects ambiguous/dynamic root for integrity",()=>{
  assert.throws(()=>addScope(original.replace("<main","<main>\\n<main"),"src/App.tsx"),/exactly one/);
  assert.throws(()=>addScope(original.replace('className="mx-auto p-6"','className={styles.root}'),"src/App.tsx"),/Dynamic/);
});
test("rejects CSS breaking its scope, remote dependencies, bad provenance",()=>{
  assert.equal(validateCss(goodCss),goodCss);
  assert.throws(()=>validateCss(goodCss+'body { color:red }'),/escaped/);
  assert.throws(()=>validateCss(goodCss+'@import url(https://x.test/)'),/Unsafe/);
  assert.throws(()=>validateCss(goodCss+'.slp-engine, html {opacity:0}'),/escaped/);
});
test("parse visual design contract and reject missing delimiters",()=>{
  const answer='===DESIGN_DIRECTION===\\nCactus is a patient-growth app with a confident editorial display. Give the content a generous width.\\n===DESIGN_CSS===\\n'+goodCss+'\\n===DESIGN_END===';
  assert.equal(parseDesign(answer).css,goodCss.trim());
  assert.throws(()=>parseDesign(goodCss),/markers/);
});
test("automated candidate generation uses mock inference and preserves source",async()=> {
  await fixture(async()=>{}); // isolated fixture test below uses explicit async cleanup
  const root=mkdtempSync(join(tmpdir(),"slop-cactus-")),target=root+"-candidate";
  try{
    mkdirSync(join(root,"src"));writeFileSync(join(root,"package.json"),JSON.stringify({name:"cactus",devDependencies:{vite:"3.2.3"},scripts:{build:"vite build",dev:"vite"}}));
    writeFileSync(join(root,"index.html"),"<title>Cactus Studio</title>");
    writeFileSync(join(root,"src/App.tsx"),original);writeFileSync(join(root,"src/App.css"),".foo{}");
    const provider=async messages=>({content:"===DESIGN_DIRECTION===\\nCactus Studio uses careful layout and richer typography. Distinct art direction protects the original functionality.\\n===DESIGN_CSS===\\n"+goodCss+"\\n===DESIGN_END===",model:"mock",usage:{total_tokens:0}});
    const result=await generate({project:root,output:target,provider});
    assert.equal(result.product,"Cactus Studio");
    const rendered=readFileSync(join(target,"src/App.tsx"),"utf8");
    assert(unchangedOutsideScope(original,rendered));
    assert.equal(readFileSync(join(root,"src/App.tsx"),"utf8"),original);
  }finally{rmSync(root,{force:true,recursive:true});rmSync(target,{force:true,recursive:true});}
});
test("compares browser quality and preserves original links/buttons",()=>{
 const b={desktop:{status:200,pageHeight:2100,headlineLines:2,headlineFontSize:40,links:[{href:"/pricing"}],buttons:[{text:"Try"}]},mobile:{status:200,pageHeight:3000,headlineLines:2,headlineFontSize:36,links:[{href:"/pricing"}],buttons:[{text:"Try"}]}};
 const c=structuredClone(b);c.mobile.links=[];
 assert.match(compareBrowser(b,c).problems.join(" "),/link missing/);
 assert.equal(compareBrowser(b,b).status,"structural-pass");
});
