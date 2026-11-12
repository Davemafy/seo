#!/usr/bin/env node
import {chromium} from "playwright";
import {strict as assert} from "node:assert";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
const url=process.argv[2]||"http://127.0.0.1:3202/";
const folder=resolve(process.argv[3]||"pilot-proof");mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.SLOPPERTIZER_BROWSER_PATH||undefined});
const summary={};
try {
  for(const [name,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
    const page=await browser.newPage({viewport,reducedMotion:"reduce",colorScheme:"light"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    const res=await page.goto(url,{waitUntil:"networkidle",timeout:55000});
    assert.equal(res.status(),200);
    assert.equal(await page.locator("h1").count(),1);
    assert.equal(await page.locator(".wf-feature-row").count(),6);
    assert.equal(await page.getByRole("tab").count(),3);
    assert((await page.locator('a[href="/auth"]').count())>=2);
    assert((await page.locator('a[href="/responsible-ai"]').count())>=1);
    assert.equal(await page.getByText("This page is a design exploration.",{exact:false}).count(),1);
    assert.equal((await page.locator("body").innerText()).includes("120K+"),false);
    await page.getByRole("tab",{name:"Meeting notes"}).click();
    assert.match(await page.getByRole("tabpanel").innerText(),/Make the notes useful/);
    await page.getByRole("tab",{name:"Plan the day"}).click();
    assert.match(await page.getByRole("tabpanel").innerText(),/See what comes next/);
    await page.getByRole("tab",{name:"Write an email"}).focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.getByRole("tab",{name:"Meeting notes"}).getAttribute("aria-selected"),"true");
    await page.getByRole("tab",{name:"Write an email"}).click();
    const faq=page.locator(".wf-faq-item").first();
    await faq.locator("button").click();
    assert.equal(await faq.locator("button").getAttribute("aria-expanded"),"true");
    assert.match(await faq.locator("p").innerText(),/email drafting/);
    await faq.locator("button").click();
    if(name==="mobile"){
      await page.getByRole("button",{name:"Open menu"}).click();
      const menu=page.getByRole("navigation",{name:"Mobile navigation"});
      assert(await menu.isVisible());
      await menu.getByText("Capabilities").click();
      assert.equal(await menu.count(),0);
    }
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:join(folder,name+".png"),fullPage:true,animations:"disabled"});
    const metrics=await page.evaluate(()=>({
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      pageHeight:document.documentElement.scrollHeight,
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      brokenImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src)
    }));
    summary[name]={...metrics,errors};
    assert.equal(metrics.overflow,false);
    assert.equal(metrics.brokenImages.length,0);
    assert.deepEqual(errors,[]);
    await page.close();
  }
}finally{await browser.close();}
writeFileSync(join(folder,"interaction-report.json"),JSON.stringify({status:"pass",views:summary},null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
