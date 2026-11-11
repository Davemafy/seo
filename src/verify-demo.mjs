#!/usr/bin/env node
import { chromium } from "playwright";
import { strict as assert } from "node:assert";
const url = process.argv[2];
if (!url) throw Error("Usage: node src/verify-demo.mjs http://127.0.0.1:3000");
const browser = await chromium.launch();
const data = {};
try {
  for (const [view, viewport] of Object.entries({ desktop:{width:1440,height:900}, mobile:{width:390,height:844} })) {
    const page = await browser.newPage({viewport});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto(url,{waitUntil:"networkidle",timeout:45000});
    await page.locator(".slp-demo").waitFor();
    const metrics=await page.evaluate(()=>{
      const demo=document.querySelector(".slp-demo");
      const source=document.querySelector(".slp-demo-input");
      const output=document.querySelector(".slp-demo-output");
      const agenda=document.querySelector(".slp-demo-agenda");
      const left=document.querySelector(".slp-cmp-copy");
      const stage=document.querySelector(".slp-cmp-stage");
      const title=document.querySelector(".slp-demo-heading h2");
      const essential=[...document.querySelectorAll(".slp-demo-input p, .slp-demo-input strong, .slp-demo-task strong")];
      const clipped=[demo,source,output,agenda,stage].some(el=>el && el.scrollWidth>el.clientWidth+2);
      return {
        panels:[source,output,agenda].every(Boolean),
        content:[...document.querySelectorAll(".slp-demo-task strong")].map(x=>x.textContent.trim()),
        title:title?.textContent.trim(),
        bodyTextPx:Math.min(...essential.map(el=>parseFloat(getComputedStyle(el).fontSize))),
        horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
        clipped,
        stageHeight:Math.round(stage?.getBoundingClientRect().height||0),
        demoHeight:Math.round(demo?.getBoundingClientRect().height||0),
        demoWidth:Math.round(demo?.getBoundingClientRect().width||0),
        demoWithinStage:demo?.getBoundingClientRect().width<=stage?.getBoundingClientRect().width+2,
        sidebarVisible:!!document.querySelector(".slp-demo-rail") && getComputedStyle(document.querySelector(".slp-demo-rail")).display!=="none",
        detailsOutsideHero:!!document.querySelector("#features .slp-cap"),
        navExists:!!document.querySelector('a[href="/responsible-ai"]')
      };
    });
    assert(metrics.panels,view+": three stages missing");
    assert(metrics.content.length===2,view+": exactly two prepared actions expected");
    assert(metrics.title?.includes("From meeting to momentum"),view+": demonstration title missing");
    assert(metrics.bodyTextPx>=11,view+": essential copy illegibly small");
    assert(!metrics.horizontalOverflow&&!metrics.clipped&&metrics.demoWithinStage,view+": clipping/overflow");
    assert(metrics.detailsOutsideHero&&metrics.navExists,view+": untouched routes/features missing");
    assert.equal(metrics.sidebarVisible,view==="desktop",view+": sidebar responsiveness");
    assert.equal(errors.length,0,view+": JS errors");
    data[view]=metrics;
    await page.close();
  }
} finally {await browser.close();}
console.log(JSON.stringify(data,null,2));
