#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

export function evaluateQuality(baseline, candidate, typography, ratios={desktop:1.18,mobile:1.18}) {
  const defects=[];
  for(const name of ["desktop","mobile"]) {
    const b=baseline[name],c=candidate[name];
    if(!b || !c) { defects.push(name+": missing browser report"); continue; }
    if(c.status!==200 || c.overflow || c.errors?.length || c.brokenImages?.length || !c.authLinks || !c.responsibleAiLinks)
      defects.push(name+": runtime, assets, overflow or links broken");
    if(c.pageHeight > Math.round(b.pageHeight*ratios[name]))
      defects.push(name+": page length regression ("+c.pageHeight+"px vs baseline "+b.pageHeight+"px)");
    if(!c.h1?.length || c.h1.length!==1) defects.push(name+": expected one H1");
  }
  if(typography?.desktop?.h1Lines > 4) defects.push("desktop: hero headline exceeds 4 visual lines");
  if(typography?.mobile?.h1Lines > 5) defects.push("mobile: hero headline exceeds 5 visual lines");
  if(typography?.mobile?.h1FontSize < 30) defects.push("mobile: headline typography too small");
  return { result: defects.length?"reject":"browser-checks-passed", defects, baseline: {desktop:baseline.desktop?.pageHeight,mobile:baseline.mobile?.pageHeight}, candidate:{desktop:candidate.desktop?.pageHeight,mobile:candidate.mobile?.pageHeight}, typography };
}

async function measure(url) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const data={};
  try {
    for(const [name,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})) {
      const page=await browser.newPage({viewport});
      await page.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
      await page.waitForTimeout(1200);
      data[name]=await page.evaluate(()=>{
        const h1=document.querySelector("h1");
        if(!h1)return {h1Lines:0,h1FontSize:0};
        const cs=getComputedStyle(h1);
        const fontSize=parseFloat(cs.fontSize)||0;
        const lineHeight=cs.lineHeight==="normal"?fontSize*1.15:parseFloat(cs.lineHeight);
        const height=h1.getBoundingClientRect().height;
        return {h1Lines:Math.round(height/Math.max(1,lineHeight)),h1FontSize:fontSize,h1Width:Math.round(h1.getBoundingClientRect().width)};
      });
      await page.close();
    }
  } finally {await browser.close();}
  return data;
}
async function main() {
  const args={};
  for(let i=2;i<process.argv.length;i+=2) args[process.argv[i].slice(2)]=process.argv[i+1];
  if(!args.baseline||!args.candidate||!args.url||!args.output) throw new Error("Need --baseline, --candidate, --url, --output");
  const b=JSON.parse(readFileSync(args.baseline,"utf8")),c=JSON.parse(readFileSync(args.candidate,"utf8"));
  const typography=await measure(args.url);
  const result=evaluateQuality(b,c,typography);
  writeFileSync(args.output,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));
  if(result.defects.length) process.exitCode=1;
}
if(process.argv[1]?.endsWith("visual-quality-gate.mjs")) main().catch(e=>{console.error(e.message);process.exitCode=1;});
