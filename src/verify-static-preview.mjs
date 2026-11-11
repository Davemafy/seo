#!/usr/bin/env node
// Verify static client-only preview; should not access the source app's account APIs.
import { chromium } from "playwright";
import { strict as assert } from "node:assert";
const url=process.argv[2]||"http://127.0.0.1:4173/seo/";
const browser=await chromium.launch({headless:true});
try{
  for(const [view,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
    const page=await browser.newPage({viewport});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    const r=await page.goto(url,{waitUntil:"networkidle",timeout:45000});
    assert.equal(r?.status(),200,view+": preview HTTP status");
    assert.match(await page.locator("h1").innerText(),/Meetings end/,view+": redesigned headline");
    assert.ok(await page.getByText(/Unofficial redesign/).count()>0,view+": honest attribution banner");
    const first=page.getByRole("button",{name:"Mark rollback checklist reviewed"});
    assert.equal(await first.count(),1,view+": interactive sample task");
    await first.click();
    const marked=page.getByRole("button",{name:"Unmark rollback checklist reviewed"});
    assert.equal(await marked.getAttribute("aria-pressed"),"true",view+": review button toggles");
    assert.ok(await page.getByText("1 TO REVIEW").count()>0,view+": review counter updates");
    await page.getByRole("button",{name:"Mark capacity check reviewed"}).click();
    assert.ok(await page.getByText("ALL REVIEWED").count()>0,view+": both tasks reviewed");
    const tabs=page.getByRole("tab");
    assert.equal(await tabs.count(),6,view+": capabilities must remain interactive");
    await tabs.nth(2).click();
    assert.equal(await tabs.nth(2).getAttribute("aria-selected"),"true",view+": click selects tab");
    const faq=page.getByRole("button",{name:"Is my data private?"});
    await faq.click();
    assert.equal(await faq.getAttribute("aria-expanded"),"true",view+": FAQ expansion");
    const auth=page.locator('a[href="https://workflowai-pro.lovable.app/auth"]');
    const policy=page.locator('a[href="https://workflowai-pro.lovable.app/responsible-ai"]');
    assert.ok(await auth.count()>0 && await policy.count()>0,view+": external auth/policy destinations");
    const dom=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
      demo:!!document.querySelector(".slp-demo"),
    }));
    assert(!dom.overflow&&!dom.broken&&dom.demo,view+": layout/assets/demo");
    assert.deepEqual(errors,[],view+": no runtime errors");
    console.log(view+" static preview passed",dom);
    await page.close();
  }
}finally{await browser.close();}
