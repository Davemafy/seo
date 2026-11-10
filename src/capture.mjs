#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";
const args={};
for(let i=2;i<process.argv.length;i+=2) args[process.argv[i].slice(2)]=process.argv[i+1];
if(!args.url || !args.output) throw new Error("Usage: node src/capture.mjs --url http://localhost:3000 --output ./screenshots");
const out=resolve(args.output);
mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const report={};
try {
  for(const [name,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})) {
    const page=await browser.newPage({viewport});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const response=await page.goto(args.url,{waitUntil:"domcontentloaded",timeout:45000});
    await page.waitForTimeout(1200);
    const screenshot=join(out,name+".png");
    await page.screenshot({path:screenshot,fullPage:true,animations:"disabled"});
    const measurements=await page.evaluate(()=>({
      title:document.title,
      h1:[...document.querySelectorAll("h1")].map(n=>n.textContent.trim()),
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
      links:[...document.querySelectorAll("a[href]")].map(n=>n.getAttribute("href")),
      buttons:document.querySelectorAll("button").length
    }));
    report[name]={status:response?.status(),screenshot,...measurements,errors};
    await page.close();
  }
} finally { await browser.close(); }
writeFileSync(join(out,"report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(Object.values(report).some(x=>x.status>=400||x.overflow||x.errors.length)) process.exitCode=1;
