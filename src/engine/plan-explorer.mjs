#!/usr/bin/env node
/**
 * Portable plan evidence compositor.
 * Reads literal tier facts from an existing React JSX pricing section and
 * substitutes only the explanatory introduction paragraph with a real,
 * accessible plan selector. No generated facts, checkout actions or API calls.
 */
import {createRequire} from "node:module";
import {cpSync,existsSync,lstatSync,readFileSync,writeFileSync} from "node:fs";
import {dirname,join,relative,resolve,sep} from "node:path";
import {discover} from "./site.mjs";
import {sha256} from "../lib.mjs";
const require=createRequire(import.meta.url),ts=require("typescript");
const CSS="sloppertizer.plan-explorer.css";
const isJsx=n=>ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n);
const name=(n,sf)=>ts.isJsxElement(n)?n.openingElement.tagName.getText(sf):n.tagName.getText(sf);
function nodes(root,test) {
  const result=[];
  function walk(n){if(isJsx(n)&&test(n))result.push(n);ts.forEachChild(n,walk);}
  walk(root);
  return result;
}
function classNames(n,sf){
  const open=ts.isJsxElement(n)?n.openingElement:n;
  const prop=open.attributes?.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(sf)==="className");
  return prop?.initializer&&ts.isStringLiteral(prop.initializer)?prop.initializer.text:"";
}
const hasClass=(n,sf,cls)=>classNames(n,sf).split(/\s+/).includes(cls);
function text(n,sf) {
  if(!n)return "";
  const all=[];
  function walk(x){
    if(ts.isJsxText(x))all.push(x.getText(sf));
    else if(ts.isJsxExpression(x))throw Error("Dynamic price or plan fact unsupported");
    else ts.forEachChild(x,walk);
  }
  walk(n);
  return all.join(" ").replace(/\s+/g," ").trim();
}
function safe(x){if(typeof x!=="string"||/[<>{}\u0000-\u001f]/.test(x))throw Error("Unsafe JSX fact");return x.trim();}
function exact(nodes_,sf,what){if(nodes_.length!==1)throw Error("Ambiguous "+what);return nodes_[0];}
function parsePlan(node,sf,index){
  const nameNode=exact(nodes(node,n=>name(n,sf)==="h3"),sf,"plan title");
  const title=safe(text(nameNode,sf));
  if(title.length<2||title.length>55)throw Error("Invalid plan name");
  const raw=node.getText(sf);
  const valueMatches=[...raw.matchAll(/(?:\$|€|£)\s*\d{1,7}(?:[.,]\d{1,2})?/g)];
  const distinct=[...new Set(valueMatches.map(x=>x[0].replace(/\s+/g,"")))];
  if(distinct.length!==1)throw Error("Ambiguous source price for "+title);
  const price=safe(distinct[0]);
  const periods=nodes(node,n=>name(n,sf)==="span").map(n=>text(n,sf)).filter(x=>/^\/(?:month|year|mo|yr)$/i.test(x));
  const period=periods.length===1?safe(periods[0]):"";
  const factNodes=nodes(node,n=>name(n,sf)==="li");
  if(factNodes.length<2)throw Error("Insufficient source plan facts");
  const facts=factNodes.map(n=>safe(text(n,sf))).filter(x=>x.length>3&&x.length<=120);
  if(new Set(facts).size!==facts.length)throw Error("Duplicated plan facts");
  return {name:title,price,period,facts,id:"slp-source-plan-"+(index+1)};
}
export function inspectPlans(source){
  if(source.includes(CSS)||source.includes("SloppertizerPlanExplorer"))throw Error("Plan explorer already installed");
  const sf=ts.createSourceFile("landing.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  if(sf.parseDiagnostics.length)throw Error("Invalid source JSX");
  const sections=nodes(sf,n=>hasClass(n,sf,"slp-exp-pricing"));
  const section=exact(sections,sf,"pricing section");
  const intro=exact(nodes(section,n=>hasClass(n,sf,"slp-exp-pricing-intro")),sf,"pricing introduction");
  if(!ts.isJsxElement(intro))throw Error("Pricing intro must be JSX element");
  const introductoryP=intro.children.filter(n=>ts.isJsxElement(n)&&name(n,sf)==="p");
  const textParagraph=exact(introductoryP,sf,"introductory paragraph");
  if(textParagraph.children.some(n=>ts.isJsxExpression(n)||ts.isJsxElement(n)))
    throw Error("Refuse replacing interactive introduction");
  const plans=nodes(section,n=>classNames(n,sf).split(/\s+/).some(c=>/^slp-exp-plan-\d+$/.test(c)));
  if(plans.length<2||plans.length>5)throw Error("Plan count outside safe range 2–5");
  const details=plans.map((n,i)=>parsePlan(n,sf,i));
  if(new Set(details.map(x=>x.name.toLowerCase())).size!==details.length)throw Error("Repeated plan names");
  // A fact is genuinely distinguishing only if no competing plan claims the same value.
  const enriched=details.map((p,i)=>({...p,distinguishing:p.facts.filter(f=>!details.some((q,k)=>k!==i&&q.facts.includes(f))).slice(0,3)}));
  if(enriched.some(p=>p.distinguishing.length<2))throw Error("Too little real differentiation to show a plan comparison");
  const anchors=plans.map((n,i)=>{
    const open=ts.isJsxElement(n)?n.openingElement:n;
    if(open.attributes?.properties.some(p=>ts.isJsxAttribute(p)&&p.name.getText(sf)==="id"))throw Error("Plan already has an anchor");
    return {pos:open.end-1,id:details[i].id};
  });
  return {introStart:textParagraph.getStart(sf),introEnd:textParagraph.getEnd(),plans:enriched,anchors,
    originalIntro:text(textParagraph,sf),sourceHash:sha256(source)};
}
function makeComponent(data){
 const json=JSON.stringify(data).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");
 return [
  "",
  "// Source-backed plan comparison; no checkout or backend behavior is implied.",
  "function SloppertizerPlanExplorer() {",
  "  const [active,setActive]=slpPlanState(0);",
  "  const plans="+json+";",
  "  const selected=plans[active];",
  "  return (",
  '    <aside className="slp-plan-explorer" aria-label="Compare published plans">',
  '      <div className="slp-plan-explorer-heading"><span>PLAN GUIDE / COMPARE DETAILS</span><span>SELECT TO EXPLORE</span></div>',
  '      <div className="slp-plan-explorer-tabs" role="group" aria-label="Select a plan">',
  '        {plans.map((plan,i)=><button type="button" key={plan.id} className={active===i?"slp-plan-explorer-tab is-selected":"slp-plan-explorer-tab"} aria-pressed={active===i} onClick={()=>setActive(i)}>{plan.name}</button>)}',
  '      </div>',
  '      <div className="slp-plan-explorer-content" aria-live="polite" aria-atomic="true">',
  '        <div className="slp-plan-explorer-price"><strong>{selected.price}</strong><span>{selected.period}</span></div>',
  '        <ul>{selected.distinguishing.map((fact,i)=><li key={i}>{fact}</li>)}</ul>',
  '        <a href={"#"+selected.id} className="slp-plan-explorer-link">See full {selected.name} details <span aria-hidden="true">↗</span></a>',
  '      </div>',
  '    </aside>',
  '  );',
  "}",
  ""
 ].join("\n");
}
export function composePlanExplorer(source){
 const data=inspectPlans(source);
 const edits=[{pos:data.introStart,end:data.introEnd,text:"<SloppertizerPlanExplorer />"},
   ...data.anchors.map(a=>({pos:a.pos,end:a.pos,text:' id="'+a.id+'"'}))];
 let updated=source;
 for(const e of edits.sort((a,b)=>b.pos-a.pos))updated=updated.slice(0,e.pos)+e.text+updated.slice(e.end);
 const imports=[...updated.matchAll(/^import[^\n]*;[ \t]*$/gm)];
 if(!imports.length)throw Error("Missing import anchor");
 const x=imports.at(-1),insert=x.index+x[0].length;
 updated=updated.slice(0,insert)+'\nimport { useState as slpPlanState } from "react";\nimport "./'+CSS+'";'+updated.slice(insert);
 updated+=makeComponent(data.plans);
 const output=ts.createSourceFile("result.tsx",updated,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(output.parseDiagnostics.length)throw Error("Composed TSX is invalid");
 for(const p of data.plans)if(!updated.includes('"name":"'+p.name+'"'))throw Error("Lost source plan");
 return {source:updated,plans:data.plans,sourceHash:data.sourceHash,resultHash:sha256(updated)};
}
function copySafe(from,to){
 cpSync(from,to,{recursive:true,errorOnExist:true,force:false,filter:p=>{
  const rel=relative(from,p);if(!rel)return true;
  const seg=rel.split(sep);
  return !seg.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)||x===".env"||x.startsWith(".env."))&&!lstatSync(p).isSymbolicLink();
 }});
}
export function buildPlanExplorer({project,output}){
 if(!project||!output)throw Error("Need --project and --output");
 const site=discover(project),target=resolve(output);
 if(existsSync(target)||target===site.root||target.startsWith(site.root+sep)||site.root.startsWith(target+sep))
  throw Error("Output must be a fresh separate directory");
 const result=composePlanExplorer(site.sources.page);
 copySafe(site.root,target);
 writeFileSync(resolve(target,site.entry),result.source);
 const css=readFileSync(new URL("./plan-explorer.css",import.meta.url),"utf8");
 writeFileSync(resolve(target,dirname(site.entry),CSS),css);
 const summary={product:site.product,plans:result.plans.map(({name,price,period,distinguishing})=>({name,price,period,distinguishing})),
  sourceHash:result.sourceHash,resultHash:result.resultHash,changed:[site.entry,join(dirname(site.entry),CSS)],
  status:"UNVERIFIED: build, click all plans, audit accessibility, visually critique"};
 writeFileSync(join(target,"sloppertizer-plan-explorer.json"),JSON.stringify(summary,null,2)+"\n");
 return summary;
}
if(process.argv[1]?.endsWith("plan-explorer.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(buildPlanExplorer(args),null,2));}catch(e){console.error("Plan explorer: "+e.message);process.exitCode=1;}
}
