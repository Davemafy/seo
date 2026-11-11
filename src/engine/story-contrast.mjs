#!/usr/bin/env node
/**
 * Deterministic, color-only accessibility repair for the source-preserving
 * React story compositor. No inference, copy edits, DOM changes, or secrets.
 * Repairs ONLY concrete foreground/background failures from axe-core.
 */
import {readFileSync,writeFileSync,existsSync,cpSync,lstatSync} from "node:fs";
import {resolve,dirname,join,relative,sep} from "node:path";
import {discover} from "./site.mjs";
import {contrast} from "./repair-from-axe.mjs";
import {sha256} from "../lib.mjs";
const CSS="sloppertizer.story-contrast.css";
const IMPORT='import "./sloppertizer.story.css";';
const toRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const fromRgb=rgb=>"#"+rgb.map(n=>Math.round(Math.min(255,Math.max(0,n))).toString(16).padStart(2,"0")).join("");
const colorInfo=s=>{
 const foreground=s.match(/foreground color:\s*(#[0-9a-f]{6})\b/i)?.[1]?.toLowerCase();
 const background=s.match(/background color:\s*(#[0-9a-f]{6})\b/i)?.[1]?.toLowerCase();
 if(!foreground||!background)throw Error("No unambiguous six-digit foreground/background evidence");
 return {foreground,background};
};
const mix=(hex,target,t)=>{
 const a=toRgb(hex),b=toRgb(target);
 return fromRgb(a.map((v,i)=>v+(b[i]-v)*t));
};
export function repairTextColor(original,backgrounds){
 if(!/^#[0-9a-f]{6}$/i.test(original)||!backgrounds?.length||backgrounds.some(x=>!/^#[0-9a-f]{6}$/i.test(x)))
  throw Error("Unsupported screenshot color evidence");
 const minRatio=c=>Math.min(...backgrounds.map(bg=>contrast(c,bg)));
 if(minRatio(original)>=4.5)return original.toLowerCase();
 const candidates=[];
 for(const end of ["#000000","#ffffff"]){
  for(let i=1;i<=100;i++){
   const c=mix(original,end,i/100);
   if(minRatio(c)>=4.5){candidates.push({c,change:i});break;}
  }
 }
 if(!candidates.length)throw Error("No single foreground color meets WCAG AA on all captured backgrounds");
 return candidates.sort((a,b)=>a.change-b.change)[0].c;
}
export function makeStoryContrastPatch(report){
 const grouped=new Map(),issues=[];
 for(const view of ["desktop","mobile"]){
  const measured=report?.[view]?.accessibility;
  if(measured?.verified!==true)throw Error("Missing browser-verified accessibility report for "+view);
  for(const violation of measured.violations||[]){
   if(violation.id!=="color-contrast")continue;
   if(!Array.isArray(violation.nodes)||violation.nodes.length!==violation.count)
    throw Error("Truncated axe nodes; refusing incomplete color repair");
   for(const node of violation.nodes){
    const selector=node.selector;
    if(typeof selector!=="string"||selector.length>240||
       !/^[#.\w\s\[\]\(\)="':>+~-]+$/.test(selector)||
       /(?:^|\s)(?:body|html|:root)\b/.test(selector))
      throw Error("Unexpected selector in color repair evidence");
    const {foreground,background}=colorInfo(node.failure||"");
    const entry=grouped.get(selector)||{foreground,backgrounds:new Set()};
    if(entry.foreground!==foreground)throw Error("Same selector has inconsistent original foreground");
    entry.backgrounds.add(background);
    grouped.set(selector,entry);
    issues.push({view,selector,foreground,background});
   }
  }
 }
 const css=[...grouped].map(([selector,details])=>{
   const fixed=repairTextColor(details.foreground,[...details.backgrounds]);
   return "body:not(#slp-story-color-fix-sentinel) "+selector+" { color: "+fixed+" !important; }";
 }).join("\n");
 if(css.length>15000)throw Error("Too many color fixes; requires human review");
 return {css:css?css+"\n":"",issues,changedSelectors:grouped.size};
}
function copySafe(from,to){
 cpSync(from,to,{recursive:true,errorOnExist:true,force:false,filter:p=>{
  const r=relative(from,p);if(!r)return true;
  return !r.split(sep).some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)||x===".env"||x.startsWith(".env."))
   &&!lstatSync(p).isSymbolicLink();
 }});
}
export function repairStoryProject({project,report,output}){
 if(!project||!report||!output)throw Error("Need --project --report --output");
 const site=discover(project),dest=resolve(output);
 if(existsSync(dest)||dest===site.root||dest.startsWith(site.root+sep)||site.root.startsWith(dest+sep))
  throw Error("Refuse in-place or nested repair");
 if(!site.sources.page.includes(IMPORT)||site.sources.page.includes(CSS)||site.sources.page.includes("slp-story-color-fix-sentinel"))
  throw Error("Expected one unrepaired source-preserving story");
 const evidence=JSON.parse(readFileSync(resolve(report),"utf8"));
 const patch=makeStoryContrastPatch(evidence);
 copySafe(site.root,dest);
 const target=resolve(dest,site.entry);
 const input=site.sources.page;
 if(patch.css){
  writeFileSync(target,input.replace(IMPORT,IMPORT+'\nimport "./'+CSS+'";'));
  writeFileSync(resolve(dest,dirname(site.entry),CSS),patch.css);
 }
 const result={sourceHash:site.originalHash,changedSelectors:patch.changedSelectors,
  issues:patch.issues,cssHash:sha256(patch.css),
  changed:patch.css?[site.entry,join(dirname(site.entry),CSS)]:[],
  resultStatus:patch.css?"UNVERIFIED repair; must rebuild and rerun axe-core":"No measured contrast defects; no source change"};
 writeFileSync(join(dest,"sloppertizer-story-contrast-receipt.json"),JSON.stringify(result,null,2)+"\n");
 return result;
}
if(process.argv[1]?.endsWith("story-contrast.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(repairStoryProject(args),null,2));}
 catch(e){console.error("Story color repair: "+e.message);process.exitCode=1;}
}
