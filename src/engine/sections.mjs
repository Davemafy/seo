#!/usr/bin/env node
import { createRequire } from "node:module";
import { cpSync, existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { discover } from "./site.mjs";
import { sha256 } from "../lib.mjs";
const require=createRequire(import.meta.url);
const ts=require("typescript");
const CSS_FILE="sloppertizer.sections.css";
const j=n=>ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n);
const tag=(n,sf)=>(ts.isJsxElement(n)?n.openingElement.tagName:n.tagName).getText(sf);
function collect(root,fn){const result=[];function walk(n){if(j(n)&&fn(n))result.push(n);ts.forEachChild(n,walk)}walk(root);return result;}
function kids(n){return ts.isJsxElement(n)?n.children.filter(j):[]}
function contains(root,name,sf){return collect(root,n=>n!==root&&tag(n,sf)===name).length>0}
function sourceHasPrice(n,sf,source){return /(?:\$|€|£)\s*\d{1,7}/.test(source.slice(n.pos,n.end));}
export function annotateSections(source){
 if(source.includes(CSS_FILE))throw Error("Editorial sections already present");
 const sf=ts.createSourceFile("site.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(sf.parseDiagnostics.length)throw Error("JSX parsing failure");
 const mains=collect(sf,n=>tag(n,sf)==="main");
 if(mains.length!==1||!ts.isJsxElement(mains[0]))throw Error("Expected one main");
 const main=mains[0],top=kids(main);
 const features=top.filter(n=>collect(n,x=>x!==n&&tag(x,sf)==="Feature").length>=3);
 const pricing=top.filter(n=>tag(n,sf)==="section"&&sourceHasPrice(n,sf,source)&&collect(n,x=>tag(x,sf)==="h3").length>=2);
 const quote=top.filter(n=>contains(n,"blockquote",sf)),footers=top.filter(n=>tag(n,sf)==="footer");
 if([features,pricing,quote,footers].some(a=>a.length!==1))throw Error("Feature, pricing, quote and footer must be unambiguous");
 const f=features[0],p=pricing[0];
 const featureGrid=collect(f,n=>ts.isJsxElement(n)&&kids(n).filter(c=>tag(c,sf)==="Feature").length>=3);
 const featureHeading=collect(f,n=>tag(n,sf)==="div"&&contains(n,"h2",sf)&&!contains(n,"Feature",sf))
   .sort((a,b)=>(a.end-a.pos)-(b.end-b.pos));
 const planNodes=collect(p,n=>tag(n,sf)==="div"&&kids(n).some(c=>tag(c,sf)==="h3")&&contains(n,"ul",sf)&&sourceHasPrice(n,sf,source));
 const planGrids=collect(p,n=>ts.isJsxElement(n)&&kids(n).filter(c=>planNodes.includes(c)).length>=2);
 const pricingHeading=collect(p,n=>tag(n,sf)==="div"&&contains(n,"h2",sf)&&!contains(n,"h3",sf))
   .sort((a,b)=>(a.end-a.pos)-(b.end-b.pos));
 if(featureGrid.length!==1||!featureHeading.length||!pricingHeading.length||planGrids.length!==1||planNodes.length<2||planNodes.length>5)
  throw Error("Unsupported structural composition; original untouched");
 const tags=[
  [f,"slp-exp-features"],[featureHeading[0],"slp-exp-features-intro"],
  [featureGrid[0],"slp-exp-feature-grid"],[p,"slp-exp-pricing"],
  [pricingHeading[0],"slp-exp-pricing-intro"],[planGrids[0],"slp-exp-plan-grid"],
  [quote[0],"slp-exp-quote"],[footers[0],"slp-exp-footer"],
  ...planNodes.map((n,i)=>[n,"slp-exp-plan slp-exp-plan-"+(i+1)])
 ];
 const edits=[];
 for(const [n,cls] of tags){
  const opening=ts.isJsxElement(n)?n.openingElement:n;
  const attribute=opening.attributes?.properties.find(x=>ts.isJsxAttribute(x)&&x.name.getText(sf)==="className");
  if(attribute){
   if(!attribute.initializer||!ts.isStringLiteral(attribute.initializer))
    throw Error("Dynamic className unsupported");
   edits.push({at:attribute.initializer.end-1,text:" "+cls});
  }else edits.push({at:opening.end-1,text:' className="'+cls+'"'});
 }
 const imports=[...source.matchAll(/^import\s+[^\n]*;?[ \t]*$/gm)];
 if(!imports.length)throw Error("Missing import anchor");
 edits.push({at:imports.at(-1).index+imports.at(-1)[0].length,text:'\nimport "./'+CSS_FILE+'";'});
 let result=source;
 for(const e of edits.sort((a,b)=>b.at-a.at))result=result.slice(0,e.at)+e.text+result.slice(e.at);
 if(ts.createSourceFile("site.tsx",result,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length)
  throw Error("Result JSX invalid");
 return {source:result,featureCount:kids(featureGrid[0]).length,planCount:planNodes.length,
  sourceHash:sha256(source),resultHash:sha256(result)};
}
function safeCopy(from,to){
 cpSync(from,to,{recursive:true,force:false,errorOnExist:true,filter:path=>{
  const rel=relative(from,path);if(!rel)return true;
  const parts=rel.split(sep);
  return !parts.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)||x===".env"||x.startsWith(".env."))&&!lstatSync(path).isSymbolicLink();
 }});
}
export function composeSections({project,output}){
 const site=discover(project),dest=resolve(output);
 if(existsSync(dest)||dest===site.root||dest.startsWith(site.root+sep)||site.root.startsWith(dest+sep))
  throw Error("Output must be a fresh separate directory");
 const parsed=annotateSections(site.sources.page);
 safeCopy(site.root,dest);
 writeFileSync(resolve(dest,site.entry),parsed.source);
 const css=readFileSync(fileURLToPath(new URL("./sections.css",import.meta.url)),"utf8");
 writeFileSync(resolve(dest,dirname(site.entry),CSS_FILE),css);
 const report={product:site.product,featureCount:parsed.featureCount,planCount:parsed.planCount,
  sourceHash:parsed.sourceHash,resultHash:parsed.resultHash,
  changed:[site.entry,join(dirname(site.entry),CSS_FILE)],
  status:"UNVERIFIED: build, browser and visual review required"};
 writeFileSync(join(dest,"sloppertizer-editorial-report.json"),JSON.stringify(report,null,2)+"\n");
 return report;
}
if(process.argv[1]?.endsWith("sections.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(composeSections(args),null,2));}
 catch(e){console.error("Sections: "+e.message);process.exitCode=1}
}
