#!/usr/bin/env node
/**
 * Safely recomposes an existing JSX feature section with React DOM layout
 * wrappers. Every original source subtree remains byte-for-byte intact.
 * Both authored static cards and React .map() renderers are supported.
 */
import { createRequire } from "node:module";
import { cpSync, existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { sha256 } from "../lib.mjs";
import { discover } from "./site.mjs";

const require=createRequire(import.meta.url),ts=require("typescript");
const CSS_FILE="sloppertizer.story.css";
export const STORY_LAYOUTS=Object.freeze(["editorial-rail","product-casebook","feature-mosaic"]);
const DEFAULT_MAX_ITEMS=12;
const jsx=n=>ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n);
const tag=(n,sf)=>(ts.isJsxElement(n)?n.openingElement.tagName:n.tagName).getText(sf);
const direct=n=>ts.isJsxElement(n)?n.children.filter(jsx):[];
const raw=(node,sf)=>node.getText(sf);
const attr=(node,sf,key)=>{
 const open=ts.isJsxElement(node)?node.openingElement:node;
 const p=open.attributes?.properties?.find(x=>ts.isJsxAttribute(x)&&x.name.getText(sf)===key);
 return p?.initializer&&ts.isStringLiteral(p.initializer)?p.initializer.text:null;
};
function visit(root,pred){
 const hits=[];function walk(n){if(pred(n))hits.push(n);ts.forEachChild(n,walk);}walk(root);return hits;
}
function plainText(root,sf){
 return visit(root,n=>ts.isJsxText(n)).map(n=>n.getText(sf)).join(" ").replace(/\s+/g," ").trim();
}
function jsxIn(root,sf,names){
 return visit(root,n=>jsx(n)&&names.includes(tag(n,sf)));
}
function isHeadingIntro(root,sf){
 const headings=jsxIn(root,sf,["h2"]);
 if(headings.length!==1||!jsxIn(root,sf,["p"]).length)return false;
 const txt=plainText(root,sf);
 return /\b(features?|superpowers?|capabilities|benefits|what you get|all.in.one)\b/i.test(txt);
}
function isStaticCard(n,sf){
 if(!jsx(n))return false;
 const tn=tag(n,sf);
 if(/^[A-Z]/.test(tn))return Boolean(attr(n,sf,"name")||attr(n,sf,"title")||attr(n,sf,"description"));
 return jsxIn(n,sf,["h3"]).length===1&&jsxIn(n,sf,["p"]).length>=1;
}
function staticCards(root,sf){
 return visit(root,n=>ts.isJsxElement(n)&&direct(n).length>=3&&direct(n).every(x=>isStaticCard(x,sf)))
   .filter(n=>direct(n).length<=DEFAULT_MAX_ITEMS);
}
function arrayEntries(sf){
 const data=new Map();
 for(const n of visit(sf,x=>ts.isVariableDeclaration(x)&&ts.isIdentifier(x.name)&&x.initializer&&ts.isArrayLiteralExpression(x.initializer))){
  const items=n.initializer.elements;
  if(items.length<3||items.length>DEFAULT_MAX_ITEMS)continue;
  const valid=items.every(x=>ts.isObjectLiteralExpression(x)&&x.properties.some(p=>ts.isPropertyAssignment(p)&&["title","name"].includes(p.name.getText(sf))&&ts.isStringLiteralLike(p.initializer)));
  if(valid)data.set(n.name.text,items.length);
 }
 return data;
}
function mappedCards(root,sf,arrays){
 const maps=visit(root,n=>ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==="map"&&ts.isIdentifier(n.expression.expression));
 return maps.filter(m=>arrays.has(m.expression.expression.text)&&m.arguments.length===1&&
   (ts.isArrowFunction(m.arguments[0])||ts.isFunctionExpression(m.arguments[0])) &&
   jsxIn(m.arguments[0],sf,["h3"]).length>=1)
   .map(m=>({name:m.expression.expression.text,count:arrays.get(m.expression.expression.text)}));
}
function sourceControls(s){
 // These are allowed but must be preserved verbatim within one of the original subtrees.
 return {handlers:[...s.matchAll(/\bon(?:Click|Change|Submit|KeyDown|Focus|Blur)=/g)].length,
  hrefs:[...s.matchAll(/\bhref\s*=/g)].length,
  keys:[...s.matchAll(/\bkey\s*=/g)].length,
  maps:[...s.matchAll(/\.map\s*\(/g)].length};
}
function validateChildren(parent,sf){
 const nodes=parent.children;
 const visual=nodes.filter(jsx);
 if(visual.length!==2)return null;
 if(nodes.some(n=>!jsx(n)&&!ts.isJsxText(n)&&!ts.isJsxExpression(n)))return null;
 if(nodes.some(n=>ts.isJsxExpression(n)&&n.expression))return null;
 if(nodes.some(n=>ts.isJsxText(n)&&n.getText(sf).trim()))return null;
 // JSX comment expressions must also be retained. The composition is limited to
 // safe adjacent child subtrees without interleaved JSX comments.
 if(nodes.some(n=>ts.isJsxExpression(n)))return null;
 return visual;
}
export function inspectStory(source){
 if(typeof source!=="string"||source.length>90000||source.includes(CSS_FILE))throw Error("Unsupported or already composed source");
 const sf=ts.createSourceFile("site.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(sf.parseDiagnostics.length)throw Error("Original TSX parse failed");
 const arrays=arrayEntries(sf),candidates=[];
 for(const parent of visit(sf,n=>ts.isJsxElement(n))){
  const pair=validateChildren(parent,sf);
  if(!pair)continue;
  const [intro,collection]=pair;
  if(!isHeadingIntro(intro,sf))continue;
  if(/(?:\$|€|£)\s*\d+/.test(raw(collection,sf)))continue; // pricing isn't a feature story.
  const directGroups=staticCards(collection,sf),maps=mappedCards(collection,sf,arrays);
  if(directGroups.length+maps.length!==1)continue;
  const count=directGroups.length?direct(directGroups[0]).length:maps[0].count;
  const introText=raw(intro,sf),cardsText=raw(collection,sf);
  if(introText.length<30||cardsText.length<130||count<3)continue;
  candidates.push({
   parentTag:tag(parent,sf),start:intro.getStart(sf),end:collection.getEnd(),
   intro:introText,collection:cardsText,
   count,sourceType:directGroups.length?"static-components":"array-map",
   heading:plainText(jsxIn(intro,sf,["h2"])[0],sf),
   parentOpen:raw(parent.openingElement,sf)
  });
 }
 if(candidates.length!==1)throw Error("Need exactly one safe feature narrative and 3–12-card collection; found "+candidates.length);
 const result=candidates[0];
 return {...result,
   originalHash:sha256(source),
   protectedIntroHash:sha256(result.intro),
   protectedCardsHash:sha256(result.collection),
   controls:sourceControls(source)};
}
export function validateStoryPlan(plan){
 if(!plan||typeof plan!=="object"||Array.isArray(plan)||!STORY_LAYOUTS.includes(plan.layout))
  throw Error("Invalid composition: choose an approved layout");
 if(Object.keys(plan).some(x=>x!=="layout"&&x!=="reason"))throw Error("Unknown composition plan field");
 if(plan.reason!==undefined&&(typeof plan.reason!=="string"||plan.reason.length>200))
  throw Error("Unbounded art direction");
 return {layout:plan.layout,reason:plan.reason||""};
}
export function composeStory(source,plan={layout:"editorial-rail"}){
 const design=validateStoryPlan(plan),inventory=inspectStory(source);
 // This is a genuine JSX component tree rewrite, not a CSS selector pass.
 // Both React subtrees are embedded byte-for-byte, including keys, Link,
 // map callbacks, event handlers and original product copy.
 const replacement=[
  '<div className="slp-story slp-story--'+design.layout+'" data-slp-story="source-preserved">',
  '  <div className="slp-story-intro">'+inventory.intro+'</div>',
  '  <div className="slp-story-content">'+inventory.collection+'</div>',
  '</div>'
 ].join("\n");
 let output=source.slice(0,inventory.start)+replacement+source.slice(inventory.end);
 const found=[...output.matchAll(/^import[^\n]*;?[ \t]*$/gm)];
 if(!found.length)throw Error("Cannot locate safe CSS import position");
 const last=found.at(-1),at=last.index+last[0].length;
 output=output.slice(0,at)+'\nimport "./'+CSS_FILE+'";'+output.slice(at);
 const out=ts.createSourceFile("result.tsx",output,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(out.parseDiagnostics.length)throw Error("Resulting TSX rejected");
 if(output.split(inventory.intro).length!==2||output.split(inventory.collection).length!==2)
  throw Error("Protected source subtree was duplicated or changed");
 const before=inventory.controls,after=sourceControls(output);
 for(const k of Object.keys(before))if(before[k]!==after[k])throw Error("Original "+k+" changed");
 return {
  source:output,layout:design.layout,sourceType:inventory.sourceType,
  count:inventory.count,heading:inventory.heading,
  protectedHashes:[inventory.protectedIntroHash,inventory.protectedCardsHash],
  originalHash:inventory.originalHash,outputHash:sha256(output),
  preserved:before
 };
}
function safeCopy(from,to){
 cpSync(from,to,{recursive:true,force:false,errorOnExist:true,filter:path=>{
  const rel=relative(from,path);if(!rel)return true;
  const parts=rel.split(sep);
  return !parts.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)||x===".env"||x.startsWith(".env."))&&!lstatSync(path).isSymbolicLink();
 }});
}
export function composeStoryProject({project,output,layout="editorial-rail"}){
 if(!project||!output)throw Error("Need --project --output");
 const site=discover(project),target=resolve(output);
 if(existsSync(target)||site.root===target||target.startsWith(site.root+sep)||site.root.startsWith(target+sep))
  throw Error("Output must be new and disjoint");
 const result=composeStory(site.sources.page,{layout});
 safeCopy(site.root,target);
 writeFileSync(resolve(target,site.entry),result.source);
 const sheet=readFileSync(new URL("./story.css",import.meta.url),"utf8");
 writeFileSync(resolve(target,dirname(site.entry),CSS_FILE),sheet);
 const receipt={product:site.product,sourceType:result.sourceType,layout:result.layout,featureCount:result.count,
  entry:site.entry,protectedHashes:result.protectedHashes,originalHash:result.originalHash,outputHash:result.outputHash,
  originalControls:result.preserved,changed:[site.entry,join(dirname(site.entry),CSS_FILE)],
  status:"UNVERIFIED: compile, browser interactions, screenshots and independent visual review required"};
 writeFileSync(join(target,"sloppertizer-story-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
 return receipt;
}
if(process.argv[1]?.endsWith("story.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(composeStoryProject(args),null,2));}
 catch(e){console.error("Story composition: "+e.message);process.exitCode=1;}
}
