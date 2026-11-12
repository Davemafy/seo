#!/usr/bin/env node
/**
 * Product-contract browser check for unconstrained React redesigns.
 * Operates on rendered behavior and semantics rather than layout-specific IDs.
 */
import {writeFileSync,mkdirSync,readFileSync} from "node:fs";
import {resolve,join} from "node:path";

const SIZES={desktop:{width:1440,height:900},mobile:{width:390,height:844}};
export async function verifyCreative(url,out){
 if(!url||!out)throw Error("Need a running site and output path");
 const {chromium}=await import("playwright");
 const browser=await chromium.launch();
 const cases={};
 mkdirSync(resolve(out),{recursive:true});
 try{
  for(const [name,viewport] of Object.entries(SIZES)){
   const page=await browser.newPage({viewport,colorScheme:"light"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   const failures=[];let tabs=0,uniquePanels=0,faq=false;
   try{
    const res=await page.goto(url,{waitUntil:"networkidle",timeout:55000});
    if(res?.status()!==200)failures.push("Page status not 200");
    const heading=page.locator("h1");
    if(await heading.count()!==1||!(await heading.first().isVisible()))failures.push("Exactly one visible H1 required");
    const destinations=await page.locator("a[href]").evaluateAll(xs=>xs.map(x=>x.getAttribute("href")));
    for(const path of ["/auth","/responsible-ai"])if(!destinations.includes(path))failures.push("Missing real destination "+path);
    if(await page.locator("#features").count()!==1)failures.push("Feature anchor absent");
    const text=String(await page.locator("body").innerText()).toLowerCase();
    for(const word of ["email","meeting","task","research","chat","prompt"]){
     if(!text.includes(word))failures.push("Missing visible product category "+word);
    }
    const widget=page.locator('[role="tablist"]');
    if(await widget.count()!==1)failures.push("Need one interactive tablist");
    else{
     const choices=widget.locator('[role="tab"]');tabs=await choices.count();
     if(tabs<3)failures.push("Fewer than three demo tabs");
     else{
      const panels=[];
      for(let i=0;i<Math.min(tabs,4);i++){
       const tab=choices.nth(i);
       await tab.click({timeout:5000});
       if((await tab.getAttribute("aria-selected"))!=="true")failures.push("Tab not selected on click "+i);
       const panel=page.locator('[role="tabpanel"]:visible');
       if(await panel.count()!==1)failures.push("No visible linked tab panel "+i);
       else panels.push((await panel.innerText()).trim().slice(0,1000));
      }
      uniquePanels=new Set(panels).size;
      if(uniquePanels<3)failures.push("Tabs do not change product evidence");
      await choices.first().focus();
      await page.keyboard.press("ArrowRight");
      if((await choices.nth(1).getAttribute("aria-selected"))!=="true")failures.push("Keyboard arrow navigation missing");
     }
    }
    const accordion=page.locator('button[aria-expanded="false"]');
    if(await accordion.count()<1)failures.push("Accessible FAQ toggle missing");
    else{
     const before=await accordion.count();
     await accordion.first().click({timeout:5000});
     faq=await page.locator('button[aria-expanded="true"]').count()>0;
     if(!faq)failures.push("FAQ button fails to expand");
    }
    await page.screenshot({path:join(out,name+"-after-interactions.png"),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
    if(overflow)failures.push("Horizontal overflow");
    if(errors.length)failures.push("JavaScript page errors: "+errors.length);
    cases[name]={status:failures.length?"reject":"pass",failures,errors,tabs,uniquePanels,faq,viewport};
   }catch(e){cases[name]={status:"reject",failures:[String(e.message).slice(0,700)],errors,viewport};}
   finally{await page.close();}
  }
 }finally{await browser.close();}
 const verdict={status:Object.values(cases).every(x=>x.status==="pass")?"pass":"reject",views:cases,
  note:"This verifies behavior and layout integrity only, not creative excellence or factual marketing claims."};
 writeFileSync(join(out,"creative-verification.json"),JSON.stringify(verdict,null,2)+"\n");
 return verdict;
}
if(process.argv[1]?.endsWith("creative-verify.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 verifyCreative(args.url,args.output).then(r=>{console.log(JSON.stringify(r,null,2));if(r.status!=="pass")process.exitCode=1}).catch(e=>{console.error(e);process.exitCode=1});
}
