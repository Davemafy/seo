#!/usr/bin/env node
/** Deterministic, evidence-grounded WCAG AA text contrast repair.
 * Only changes text color for axe-core-failed elements, never page structure.
 */
import {existsSync,lstatSync,readFileSync,writeFileSync,cpSync} from "node:fs";
import {resolve,dirname,join,relative,sep} from "node:path";
import {discover} from "./site.mjs";
import {sha256} from "../lib.mjs";

function rgb(hex) {return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
export function luminance(hex){
 const [r,g,b]=rgb(hex).map(n=>n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4);
 return 0.2126*r+0.7152*g+0.0722*b;
}
export function contrast(a,b){
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function selectedTextColor(bg) {
 const candidates=["#20382c","#f9f7f0","#0d1b13","#ffffff","#000000"];
 const chosen=candidates
   .map(color=>({color,ratio:contrast(color,bg)}))
   .filter(x=>x.ratio>=4.5)
   .sort((a,b)=>a.color==="#20382c"?-1:b.color==="#20382c"?1:b.ratio-a.ratio)[0];
 if(!chosen)throw Error("Cannot produce accessible text color for background "+bg);
 return chosen.color;
}
function parseAxeFailure(detail) {
 const match=detail.match(/background color:\s*(#[0-9a-f]{6})\b/i);
 if(!match)throw Error("No measurable opaque background color");
 return match[1].toLowerCase();
}
export function generatePatch(reports){
 const failures=[];
 for(const view of ["desktop","mobile"]){
  const r=reports[view]?.accessibility;
  if(r?.verified!==true)throw Error("Missing verified "+view+" audit");
  for(const v of r.violations||[]){
   if(v.id!=="color-contrast")continue;
   for(const node of v.nodes||[]){
    const target=node.selector;
    if(typeof target!=="string"||!target||target.includes("{")||target.includes("}")||target.includes(","))
      throw Error("Unexpected CSS selector");
    if(node.failure?.length>1000)throw Error("Unexpected contrast detail length");
    failures.push({selector:target,background:parseAxeFailure(node.failure||""),view});
   }
   if(v.nodes?.length!==v.count)throw Error("Contrast audit truncated: refusing incomplete patch");
  }
 }
 if(!failures.length)throw Error("No measured contrast failures");
 const dedup=new Map();
 for(const item of failures){
  // Mobile/desktop backgrounds can differ. Do not invent a single rule where they conflict.
  const selector='.slp-engine:not(#slp-contrast-specificity):not(#slp-contrast-priority) '+item.selector;
  const color=selectedTextColor(item.background);
  if(dedup.has(selector) && dedup.get(selector)!==color)
    throw Error("Responsive foreground colors conflict; needs a viewport-specific repair");
  dedup.set(selector,color);
 }
 const css=[...dedup].map(([selector,color])=>selector+' { color: '+color+' !important; }').join("\n")+"\n";
 if(css.length>18000)throw Error("Patch too large; requires human review");
 return {css,affected:dedup.size,failures:failures.length};
}
function safeCopy(from,to) {
 cpSync(from,to,{recursive:true,force:false,errorOnExist:true,filter:p=>{
  const rel=relative(from,p);if(!rel)return true;
  const parts=rel.split(sep);
  if(parts.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)))return false;
  if(parts.some(x=>x===".env"||x.startsWith(".env.")))return false;
  return !lstatSync(p).isSymbolicLink();
 }});
}
export function repairFromAxe({project,report,output}){
 if(!project||!report||!output)throw Error("Need --project --report --output");
 const site=discover(project),target=resolve(output);
 if(existsSync(target)||target===site.root||target.startsWith(site.root+sep)||site.root.startsWith(target+sep))
  throw Error("Output must be a separate fresh directory");
 if((site.sources.page.includes("slp-contrast-specificity")||site.sources.page.includes("slp-contrast-priority")))throw Error("Specificity sentinel clashes with source");
 if(!site.sources.page.includes('import "./sloppertizer.engine.css";'))
  throw Error("Only scoped engine candidates can be repaired");
 const evidence=JSON.parse(readFileSync(resolve(report),"utf8"));
 const patch=generatePatch(evidence);
 safeCopy(site.root,target);
 const importLine='import "./sloppertizer.engine.css";';
 writeFileSync(resolve(target,site.entry),site.sources.page.replace(importLine,importLine+'\nimport "./sloppertizer.contrast.css";'));
 writeFileSync(resolve(target,dirname(site.entry),"sloppertizer.contrast.css"),patch.css);
 const result={product:site.product,sourceHash:site.originalHash,
  changed:[site.entry,join(dirname(site.entry),"sloppertizer.contrast.css")],
  measuredFailures:patch.failures,selectorsRepaired:patch.affected,patchHash:sha256(patch.css),
  verified:false,status:"must rebuild, recapture and rerun WCAG AA"};
 writeFileSync(join(target,"sloppertizer-contrast-report.json"),JSON.stringify(result,null,2)+"\n");
 return result;
}
if(process.argv[1]?.endsWith("repair-from-axe.mjs")){
 const a={};for(let i=2;i<process.argv.length;i+=2)a[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(repairFromAxe(a),null,2));}
 catch(e){console.error("Repair from axe: "+e.message);process.exitCode=1;}
}
