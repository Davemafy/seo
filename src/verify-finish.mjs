#!/usr/bin/env node
import { chromium } from "playwright";
import { strict as assert } from "node:assert";

const url=process.argv[2];
if(!url)throw Error("Usage: node src/verify-finish.mjs http://127.0.0.1:3000/");
const browser=await chromium.launch({headless:true});
const report={};
try{
  for(const [name,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    const res=await page.goto(url,{waitUntil:"networkidle",timeout:50000});
    assert.equal(res?.status(),200,name+": HTTP");
    assert.match(await page.locator("#features h2").innerText(),/Write it\. Plan it\./,name+": feature message");
    assert.match(await page.locator(".slp-approach-title").innerText(),/AI prepares\./,name+": responsible AI headline");
    assert.match(await page.locator(".slp-cta-title").innerText(),/Make room for/,name+": CTA");
    const tabs=page.getByRole("tab");
    assert.equal(await tabs.count(),6,name+": six preserved capabilities");
    for(let n=0;n<6;n++){
      await tabs.nth(n).click();
      assert.equal(await tabs.nth(n).getAttribute("aria-selected"),"true",name+": tab "+n+" selectable");
      assert.equal(await page.getByRole("tabpanel").count(),1,name+": tabpanel present");
    }
    const faq=page.getByRole("button",{name:"Is my data private?"});
    await faq.click();
    assert.equal(await faq.getAttribute("aria-expanded"),"true",name+": FAQ still opens");
    const demo=page.getByRole("button",{name:"Mark rollback checklist reviewed"});
    await demo.click();
    assert.equal(await page.getByRole("button",{name:"Unmark rollback checklist reviewed"}).getAttribute("aria-pressed"),"true",name+": sample remains interactive");
    const measurements=await page.evaluate(()=>{
      const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
      const tabs=[...document.querySelectorAll('[role="tab"]')];
      const styles=getComputedStyle(document.querySelector(".slp-cap-list"));
      const cta=getComputedStyle(document.querySelector(".slp-cta-section"));
      const touches=tabs.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,y:r.y,x:r.x}});
      return {
        width:innerWidth,pageWidth:document.documentElement.scrollWidth,
        pageHeight:document.documentElement.scrollHeight,
        featureHeight:rect("#features")?.height,
        capabilityTabGrid:styles.display,
        capabilityTabColumns:styles.gridTemplateColumns,
        distinctRows:[...new Set(touches.map(r=>Math.round(r.y)))].length,
        tabMinHeight:Math.min(...touches.map(r=>r.h)),
        capabilityCard:rect(".slp-cap"),
        trustedBackground:cta.backgroundColor,
        cta:rect(".slp-cta-section"),
        brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
        outdatedTrustCopy:document.body.innerText.includes("never used to train public models"),
        unfinishedCss:!![...document.styleSheets].find(s=>s.href?.includes("finish.css"))
      };
    });
    assert(measurements.pageWidth<=measurements.width+2,name+": no horizontal overflow");
    assert.equal(measurements.brokenImages,0,name+": no broken images");
    assert.equal(measurements.outdatedTrustCopy,false,name+": unsupported model/privacy claim removed");
    assert.notEqual(measurements.trustedBackground,"rgba(0, 0, 0, 0)",name+": closing CTA has visual surface");
    if(name==="mobile"){
      assert.equal(measurements.capabilityTabGrid,"grid",name+": mobile tabs use visible compact grid");
      assert.equal(measurements.distinctRows,3,name+": six tabs in three rows");
      assert(measurements.tabMinHeight>=44,name+": accessible tap targets");
      assert(measurements.featureHeight<1300,name+": capabilities are compact");
    }
    assert.deepEqual(errors,[],name+": no JavaScript errors");
    report[name]=measurements;
    await page.close();
  }
}finally{await browser.close();}
console.log(JSON.stringify(report,null,2));
