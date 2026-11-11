#!/usr/bin/env node
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {catalog,selectModel,assertActualModel} from "./model-catalog.mjs";
import {vultr,parseJsonReply} from "../lib.mjs";
import {readImage} from "./generate.mjs";
const CASES=[
  {id:"alpha",brand:"CEDAR STUDIO",badge:"Q7K-42",selected:"STARTER",headerColor:"green",header:"#194735",selectedIndex:0},
  {id:"beta",brand:"NOVA LABS",badge:"M3P-81",selected:"TEAM",headerColor:"navy",header:"#182B52",selectedIndex:1}
];
const PROMPT=[
  "You are calibrating visual perception. Inspect the ATTACHED image, not marketing claims.",
  'Return exactly one JSON object: {"brand":"...","badge":"...","selected":"...","headerColor":"green|navy|other"}.',
  "Brand is the large white title in the top bar. Badge is the small yellow alphanumeric code.",
  "Selected is the pricing card with a thick coral outline. HeaderColor is the top header's predominant background.",
  "Copy letters/numbers exactly from the image. Do not guess. No explanation."
].join("\n");
const STYLE=[
  "*{box-sizing:border-box}",
  "body{margin:0;font-family:Arial,sans-serif;background:#F5F1E9;color:#182C2A}",
  "header{height:140px;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 56px}",
  "header strong{font-size:49px;letter-spacing:-1.5px;font-weight:800}",
  ".code{background:#F2D678;color:#1B312A;padding:14px 18px;font:bold 25px Arial;letter-spacing:1px}",
  "main{padding:36px 54px 24px}",
  ".eyebrow{font:bold 13px Arial;letter-spacing:1.8px;color:#576F64}",
  "h1{font:bold 40px Arial;letter-spacing:-1.6px;margin:15px 0 26px}",
  ".plans{display:grid;grid-template-columns:1fr 1fr;gap:24px}",
  ".plan{height:306px;padding:23px 27px;background:#FFFDFC;border:6px solid #D1D7CD;display:flex;flex-direction:column}",
  ".plan.chosen{border:8px solid #DA6258;padding:21px 25px}",
  ".plan-number{font:bold 12px Arial;color:#677A6D;letter-spacing:1.3px}",
  "h2{font:bold 34px Arial;margin:11px 0 6px}",
  "p{font:15px Arial;line-height:1.5;color:#56665A;margin:0}",
  ".price{font:bold 32px Arial;margin-top:auto}",
  ".price span{font:13px Arial;color:#536357}",
  ".action{font:bold 13px Arial;display:flex;justify-content:space-between;margin-top:10px}"
].join("");
function fixtureHTML(f){
 const cols=["STARTER","TEAM"].map((name,index)=>{
  return ['<div class="plan ',index===f.selectedIndex?'chosen':'','"><div class="plan-number">0',
    String(index+1),' / PLAN</div><h2>',name,'</h2><p>',
    index===0?'For individuals and small teams.':'For expanding groups and projects.',
    '</p><div class="price">$',
    index===0?'29':'99',
    '<span> / month</span></div><div class="action">View plan <span>→</span></div></div>'].join("");
 }).join("");
 return ['<!doctype html><html lang="en"><meta charset="utf-8"><style>',STYLE,
  'header{background:',f.header,'}</style><body><header><strong>',f.brand,
  '</strong><div class="code">',f.badge,'</div></header><main><div class="eyebrow">',
  'WORKSPACE / PRICING COMPARISON</div><h1>Choose how you work.</h1><div class="plans">',
  cols,'</div></main></body></html>'].join("");
}
export async function createVisionFixtures(dir,{browserFactory}={}){
 mkdirSync(dir,{recursive:true});
 const {chromium}=browserFactory||await import("playwright");
 const browser=await chromium.launch({headless:true});
 try{
  for(const f of CASES){
   const page=await browser.newPage({viewport:{width:960,height:625},deviceScaleFactor:1});
   await page.setContent(fixtureHTML(f),{waitUntil:"load"});
   await page.screenshot({path:join(dir,f.id+".png")});
   await page.close();
  }
 }finally{await browser.close();}
 return CASES.length;
}
const norm=v=>typeof v==="string"?v.toUpperCase().replace(/\s+/g," ").trim():"";
export function scoreVision(f,guess){
 const parts=Object.fromEntries(["brand","badge","selected","headerColor"].map(k=>[k,{
  expected:f[k],observed:guess?.[k]??null,correct:norm(f[k])===norm(guess?.[k])
 }]));
 return {earned:Object.values(parts).filter(x=>x.correct).length,total:4,parts};
}
export async function runVisionBenchmark({imagesDir,models,output,provider=vultr,modelList=null}){
 const available=modelList||await catalog();
 const ids=models.split(",").map(x=>x.trim()).filter(Boolean);
 if(!ids.length||ids.length>5||new Set(ids).size!==ids.length)throw Error("Choose 1–5 distinct models");
 const rows=[];
 for(const model of ids){
  const info=selectModel(available,model,{vision:true}),trials=[];
  for(const f of CASES){
   const begin=performance.now();
   try{
    const messages=[{role:"system",content:PROMPT},{role:"user",content:[
      {type:"text",text:"Analyze this screenshot. Report only what it visibly shows."},
      readImage(join(imagesDir,f.id+".png"))
    ]}];
    const r=await provider(messages,model,1400);
    assertActualModel(model,r.model);
    let parsed=null;try{parsed=parseJsonReply(r.content);}catch{}
    trials.push({case:f.id,model:r.model,elapsedMs:Math.round(performance.now()-begin),usage:r.usage,
      ...scoreVision(f,parsed),validJson:parsed!==null,modelOutput:parsed,
      rawExcerpt:parsed?null:r.content?.slice(0,350)});
   }catch(e){
    trials.push({case:f.id,model,elapsedMs:Math.round(performance.now()-begin),
      earned:0,total:4,validJson:false,error:String(e.message).slice(0,250)});
   }
  }
  const earned=trials.reduce((a,b)=>a+b.earned,0);
  const cost=trials.reduce((sum,t)=>sum+
    (t.usage?.prompt_tokens||0)*(info.inputUsdPerMillion||0)/1e6+
    (t.usage?.completion_tokens||0)*(info.outputUsdPerMillion||0)/1e6,0);
  rows.push({model,earned,total:8,eligibleForJudging:earned===8&&trials.every(t=>t.validJson),
    estimatedUsd:Number(cost.toFixed(6)),trials});
 }
 const out={benchmark:"paired-image-grounding-v1",source:"Live Vultr catalog",rows,
  caveat:"Passing tests visual reading only, not design judgment or code quality."};
 writeFileSync(resolve(output),JSON.stringify(out,null,2)+"\n");
 return out;
}
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
if(process.argv[1]?.endsWith("vision-calibration.mjs")){
 if(opts.action==="fixtures")createVisionFixtures(resolve(opts.output||"calibration")).then(n=>console.log("Fixtures:",n)).catch(e=>{console.error(e);process.exitCode=1;});
 else if(opts.action==="benchmark")runVisionBenchmark({imagesDir:resolve(opts.images),models:opts.models,output:opts.output}).then(x=>console.log(JSON.stringify(x.rows.map(r=>({model:r.model,earned:r.earned,eligible:r.eligibleForJudging})),null,2))).catch(e=>{console.error(e);process.exitCode=1;});
 else throw Error("Use --action fixtures|benchmark");
}
