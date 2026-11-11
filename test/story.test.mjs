import test from "node:test";
import {strict as assert} from "node:assert";
import {inspectStory,composeStory,validateStoryPlan,STORY_LAYOUTS,inferStoryArtDirection} from "../src/engine/story.mjs";

const staticSource=[
 'import React from "react";',
 'import Feature from "./Feature";',
 'export default function Page(){',
 'return <main><section><div>',
 '<div><h2>Features</h2><p>Choose simple tools and reliable automations for your daily work.</p></div>',
 '<div className="grid">',
 '<Feature name="Drafting" description="Write better content"><button onClick={()=>console.log("save")}>Save</button></Feature>',
 '<Feature name="Planning" description="Keep work organised"><a href="/plan">Plan</a></Feature>',
 '<Feature name="Review" description="Inspect changes"><span>Review</span></Feature>',
 '<Feature name="Sharing" description="Send finished work"><span>Share</span></Feature>',
 '</div></div></section><footer><a href="/privacy">Privacy</a></footer></main>}',
].join("\n");
const mapSource=[
 'import React from "react";',
 'const features=[{title:"Draft",desc:"Write better"},{title:"Plan",desc:"Organise work"},{title:"Review",desc:"See decisions"}];',
 'export function App(){return <main><section id="features">',
 '<div><h2>Explore capabilities</h2><p>Everything you need in one place.</p></div>',
 '<div className="grid">',
 '{features.map((f) => (<Card key={f.title} onClick={()=>console.log(f.title)}><h3>{f.title}</h3><p>{f.desc}</p><a href="/product">Read more</a></Card>))}',
 '</div></section></main>}',
].join("\n");
test("recognises genuinely distinct static components and mapped array cards",()=>{
 const a=inspectStory(staticSource),b=inspectStory(mapSource);
 assert.equal(a.sourceType,"static-components");assert.equal(a.count,4);
 assert.equal(b.sourceType,"array-map");assert.equal(b.count,3);
 assert.match(b.heading,/capabilities/i);
});
test("bounded JSX rewrite preserves each subtree and original controls",()=>{
 for(const source of [staticSource,mapSource]){
  const {intro,collection,controls}=inspectStory(source);
  for(const layout of STORY_LAYOUTS){
   const transformed=composeStory(source,{layout});
   assert.equal(transformed.source.split(intro).length,2);
   assert.equal(transformed.source.split(collection).length,2);
   assert.deepEqual(transformed.preserved,controls);
   assert(transformed.source.includes('className="slp-story-content"'));
   assert(transformed.source.includes('sloppertizer.story.css'));
   assert(transformed.source.includes("onClick={()=>console.log"));
   assert(transformed.source.includes("href="));
   if(source===mapSource)assert(transformed.source.includes("features.map((f)"));
  }
 }
});
test("rejects dangerous or speculative model plans",()=>{
 assert.throws(()=>validateStoryPlan({layout:"delete-all"}),/Invalid/);
 assert.throws(()=>validateStoryPlan({layout:"editorial-rail",headline:"Invented miracle"}),/Unknown/);
 assert.throws(()=>composeStory(staticSource,{layout:"feature-mosaic",extra:"fake proof"}),/Unknown/);
});
test("rejects ambiguous areas, unsafe JSX siblings, and double composition",()=>{
 const section=staticSource.match(/<section>[\s\S]*?<\/section>/)[0];
 const twice=staticSource.replace("</section><footer>","</section>"+section+"<footer>");
 assert.throws(()=>inspectStory(twice),/exactly one/);
 const dynamic=mapSource.replace('<div className="grid">','{Math.random() > 0.5 && <aside>Promo</aside>}<div className="grid">');
 assert.throws(()=>inspectStory(dynamic),/exactly one/);
 const done=composeStory(mapSource,{layout:"editorial-rail"});
 assert.throws(()=>composeStory(done.source,{layout:"product-casebook"}),/already composed/);
});

test("art direction follows actual source design tokens and heading role",()=>{
 const light='return <main className="bg-gray-50"><div className="bg-white"><div className="bg-amber-500"></div></div></main>';
 const dark='return <div className="bg-background"><section className="bg-gradient-hero"></section><div className="bg-card/60"></div></div>';
 const unknown='return <main><h2>Hello</h2></main>';
 assert.deepEqual(inferStoryArtDirection(light,"Features"),{tone:"day",headingRole:"eyebrow"});
 assert.deepEqual(inferStoryArtDirection(dark,"Six AI superpowers. One unified workspace."),{tone:"night",headingRole:"headline"});
 assert.equal(inferStoryArtDirection(unknown,"Features").tone,"inherit");
});
test("generated JSX carries the inferred theme but retains source product content",()=>{
 const daySource=staticSource.replace("return <main>","return <main className='bg-gray-50'>");
 const nightSource=mapSource.replace("return <main>","return <main className='bg-background bg-gradient-hero'>");
 const day=composeStory(daySource,{layout:"editorial-rail"});
 const night=composeStory(nightSource,{layout:"editorial-rail"});
 assert.equal(day.tone,"day");assert.equal(day.headingRole,"eyebrow");
 assert.equal(night.tone,"night");assert.equal(night.headingRole,"headline");
 assert.match(day.source,/slp-story--day slp-story--eyebrow/);
 assert.match(night.source,/slp-story--night slp-story--headline/);
 for(const x of [day,night])assert(x.source.includes("onClick={()=>console.log"));
});
