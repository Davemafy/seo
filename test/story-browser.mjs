#!/usr/bin/env node
import {strict as assert} from "node:assert";
import {chromium} from "playwright";
const url=process.argv[2],number=Number(process.argv[3]),tone=process.argv[4];
if(!url||!Number.isInteger(number)||number<3)throw Error("Need URL and source-backed card count");
const browser=await chromium.launch({executablePath:process.env.SLOPPERTIZER_BROWSER_PATH||undefined});
try{
 for(const [name,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
  const page=await browser.newPage({viewport,colorScheme:"light"}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const response=await page.goto(url,{waitUntil:"networkidle",timeout:55000});
  assert.equal(response.status(),200,name+": page loads");
  const story=page.locator(".slp-story");
  if(tone) {
    assert.equal((await story.getAttribute("class")).includes("slp-story--"+tone),true,name+": inferred source art direction");
    const styles=await story.evaluate(el=>{
      const root=getComputedStyle(el),title=el.querySelector(".slp-story-intro h2"),
        card=el.querySelector(".slp-story-content .grid > *");
      return {background:root.backgroundColor,headingSize:parseFloat(getComputedStyle(title).fontSize),
        cardBackground:card?getComputedStyle(card).backgroundColor:null};
    });
    if(tone==="night"){
      assert(styles.headingSize>=30,name+": headline scale intentional");
      assert.equal(styles.cardBackground,"rgb(17, 28, 48)",name+": cards respect source night palette");
    } else if(tone==="day"){
      assert(styles.headingSize<19,name+": Features acts as eyebrow not oversized headline");
      assert.equal(styles.cardBackground,"rgb(251, 250, 247)",name+": cards respect source warm neutral palette");
    }
  }

  assert.equal(await story.count(),1,name+": exactly one feature story");
  assert.equal(await story.locator(".slp-story-intro").count(),1);
  assert.equal(await story.locator(".slp-story-content").count(),1);
  const selector=".slp-story-content > .grid > *, .slp-story-content > div > .grid > *";
  assert.equal(await page.locator(selector).count(),number,name+": preserved original source cards");
  const metrics=await story.evaluate(el=>{
    const a=el.getBoundingClientRect(),n=el.querySelector(".slp-story-intro").getBoundingClientRect(),
      c=el.querySelector(".slp-story-content").getBoundingClientRect();
    return {width:a.width,leadWidth:n.width,contentWidth:c.width,leadTop:n.top,contentTop:c.top,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2};
  });
  assert.equal(metrics.horizontalOverflow,false,name+": no page overflow");
  assert(metrics.leadWidth>90&&metrics.contentWidth>180,name+": visible source sections");
  if(name==="desktop")assert(metrics.contentWidth>metrics.leadWidth*.9,name+": intended editorial composition");
  else assert(metrics.contentTop>metrics.leadTop,name+": stacked mobile narrative");
  assert.deepEqual(errors,[],name+": browser runtime clean");
  console.log(name,JSON.stringify(metrics));
  await page.close();
 }
}finally{await browser.close();}
