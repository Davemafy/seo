#!/usr/bin/env node
import {chromium} from "playwright";
import {strict as assert} from "node:assert";
const url=process.argv[2]||"http://127.0.0.1:3000/";
const browser=await chromium.launch();
try {
  for(const [view,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
    const page=await browser.newPage({viewport});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    const response=await page.goto(url,{waitUntil:"networkidle",timeout:45000});
    assert.equal(response.status(),200,view+": response");
    const ui=page.locator(".slp-plan-explorer");
    assert.equal(await ui.count(),1,view+": plan explorer");
    const selector=page.getByRole("group",{name:"Select a plan"});
    const buttons=selector.getByRole("button");
    assert.equal(await buttons.count(),3,view+": real source has three plans");
    const expected=[
      {label:"Starter",price:"$29",fact:"1 developer",anchor:"slp-source-plan-1"},
      {label:"Company",price:"$99",fact:"10 developers",anchor:"slp-source-plan-2"},
      {label:"Enterprise",price:"$499",fact:"100+ developers",anchor:"slp-source-plan-3"}
    ];
    for(const item of expected){
      const button=selector.getByRole("button",{name:item.label,exact:true});
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"),"true",view+": select "+item.label);
      assert.equal(await ui.locator(".slp-plan-explorer-price strong").innerText(),item.price);
      assert.match(await ui.locator(".slp-plan-explorer-content").innerText(),new RegExp(item.fact.replace("+","\\+")),view+": source facts "+item.label);
      const link=ui.getByRole("link",{name:new RegExp("See full "+item.label+" details")});
      assert.equal(await link.getAttribute("href"),"#"+item.anchor);
      assert.equal(await page.locator("#"+item.anchor).count(),1);
      const card=page.locator("#"+item.anchor);
      await page.waitForFunction((id)=>document.getElementById(id)?.getAttribute("data-slp-selected")==="true",item.anchor);
      const border=await card.evaluate(el=>getComputedStyle(el).borderTopColor);
      if(border!=="rgb(171, 107, 73)") {
        const debug=await page.evaluate(()=>{
          const button=document.querySelector('.slp-plan-explorer-tab[aria-pressed="true"]');
          const card=document.querySelector('.slp-exp-plan-1');
          return {
            activeButton:button?.outerHTML.slice(0,300),
            buttonParent:button?.parentElement?.outerHTML.slice(0,300),
            firstChild:button?.matches(':nth-child(1)'),
            section:button?.closest('.slp-exp-pricing')?.className,
            selectorMatch:document.querySelectorAll('.slp-exp-pricing:has(.slp-plan-explorer-tab:nth-child(1)[aria-pressed="true"]) .slp-exp-plan-1').length,
            genericMatch:document.querySelectorAll('.slp-exp-pricing:has(.slp-plan-explorer-tab[aria-pressed="true"]) .slp-exp-plan-1').length,
            cardClass:card?.className
          };
        });
        const ruleDetails=await card.evaluate(el=>({
          selectedAttr:el.getAttribute("data-slp-selected"),
          scopeMatch:el.matches('.slp-engine:not(#slp-plan-selection-priority):not(#slp-editorial-priority) .slp-exp-plan[data-slp-selected="true"]'),
          neutralMatch:el.matches('.slp-engine:not(#slp-plan-selection-priority):not(#slp-editorial-priority) .slp-exp-plan[data-slp-selected="false"]'),
          border:getComputedStyle(el).border,
          matches:[...document.styleSheets].flatMap(sheet=>{
            try{return [...sheet.cssRules].flatMap(rule=>rule.cssRules?[...rule.cssRules]:[rule]).filter(rule=>rule.selectorText?.includes("data-slp-selected")&&el.matches(rule.selectorText)).map(rule=>({selector:rule.selectorText,border:rule.style?.border,important:rule.style?.getPropertyPriority("border")}));}
            catch{return [];}
          })
        }));
        console.log(view+": selected-card CSS diagnosis",JSON.stringify({...debug,selectedId:item.anchor,ruleDetails}));
      }
      assert.equal(border,"rgb(171, 107, 73)",view+": selected source card matches active plan");
    }
    const last=selector.getByRole("button",{name:"Enterprise"});
    await last.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    assert.equal(await last.evaluate(el=>el===document.activeElement),true,view+": keyboard reachable");
    const data=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth+2,
      broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length
    }));
    assert.equal(data.overflow,false,view+": no overflow");
    if(view==="mobile")assert.equal(await page.locator(".slp-cmp-feature-strip").isVisible(),false,view+": duplicate feature strip hidden");
    assert.equal(data.broken,0,view+": images work");
    assert.deepEqual(errors,[],view+": no runtime errors");
    console.log(view,"passed",data);
    await page.close();
  }
}finally{await browser.close();}
