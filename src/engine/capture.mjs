import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { auditAccessibility,accessibilityDefects } from "./accessibility.mjs";
const sizes={desktop:{width:1440,height:900},mobile:{width:390,height:844}};

export async function capture(url,output) {
  const { chromium } = await import("playwright");
  const browser=await chromium.launch({executablePath:process.env.SLOPPERTIZER_BROWSER_PATH||undefined});
  const result={};mkdirSync(output,{recursive:true});
  try{
    for(const [view,viewport] of Object.entries(sizes)) {
      const page=await browser.newPage({viewport,colorScheme:"light"});
      const errors=[];
      page.on("pageerror",x=>errors.push(x.message));
      const res=await page.goto(url,{waitUntil:"networkidle",timeout:55000});
      await page.waitForTimeout(4500);
      await page.screenshot({path:join(output,view+".png"),fullPage:true,animations:"disabled"});
      const dims=await page.evaluate(()=>{
        const el=document.querySelector("h1,h2");
        const s=el?getComputedStyle(el):null;
        const lineHeight=s?(s.lineHeight==="normal"?parseFloat(s.fontSize)*1.2:parseFloat(s.lineHeight)):0;
        return {
          pageHeight:document.documentElement.scrollHeight,
          width:document.documentElement.scrollWidth,
          horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,
          headlineLines:el?Math.round(el.getBoundingClientRect().height/Math.max(lineHeight,1)):null,
          headlineFontSize:s?parseFloat(s.fontSize):null,
          title:document.title,
          links:[...document.querySelectorAll("a[href]")].map(x=>({href:x.getAttribute("href"),text:x.textContent.trim().slice(0,100)})),
          buttons:[...document.querySelectorAll("button")].map(x=>({type:x.type,text:x.textContent.trim().slice(0,80)})),
          headings:[...document.querySelectorAll("h1,h2,h3")].map(x=>x.textContent.trim().slice(0,130)),
          brokenImages:[...document.images].filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.currentSrc||x.src).slice(0,25),
          textCollisions:(()=>{
            const hits=[];
            for(const h of document.querySelectorAll("h1,h2,h3")){
              const siblings=[...(h.parentElement?.children||[])].filter(el=>el!==h&&el.tagName==="P");
              for(const p of siblings){
                if(!h.textContent.trim()||!p.textContent.trim())continue;
                if(getComputedStyle(h).display==="none"||getComputedStyle(p).display==="none")continue;
                const a=h.getBoundingClientRect(),b=p.getBoundingClientRect();
                if(a.width===0||a.height===0||b.width===0||b.height===0)continue;
                const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
                const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
                const ratio=(x*y)/Math.min(a.width*a.height,b.width*b.height);
                if(x>=10&&y>=7&&ratio>0.035)hits.push({
                  heading:h.textContent.trim().slice(0,100),
                  paragraph:p.textContent.trim().slice(0,100),
                  overlapPx:Math.round(x*y),ratio:Number(ratio.toFixed(3))
                });
              }
            }
            return hits.slice(0,20);
          })()
        };
      });
      let accessibility;
      try {accessibility=await auditAccessibility(page);}catch(e){accessibility={verified:false,error:String(e.message).slice(0,250)};}
      result[view]={status:res?.status()||0,...dims,errors,accessibility};
      await page.close();
    }
  }finally{await browser.close();}
  writeFileSync(join(output,"report.json"),JSON.stringify(result,null,2)+"\n");
  return result;
}
export function compareBrowser(original,proposed) {
  const problems=[];
  for(const name of Object.keys(sizes)){
    const b=original[name],c=proposed[name];
    if(!b||!c||c.status!==200){problems.push(name+": unavailable page");continue;}
    if(c.errors?.length||c.brokenImages?.length||c.horizontalOverflow)problems.push(name+": runtime, image or overflow regression");
    if(!Array.isArray(c.textCollisions))problems.push(name+": text-collision audit missing");
    else if(c.textCollisions.length)problems.push(name+": "+c.textCollisions.length+" heading/paragraph overlaps");
    for(const defect of accessibilityDefects(c.accessibility))problems.push(name+": "+defect);
    if(c.pageHeight>b.pageHeight*1.15)problems.push(name+": page height >15% baseline");
    if((c.headlineLines||0)>5)problems.push(name+": excessive headline wraps");
    if((c.headlineFontSize||0)<25)problems.push(name+": headline too small");
    // Don't silently remove links or button interactions; anchors may move, but destinations must survive.
    for(const href of new Set(b.links.map(x=>x.href).filter(Boolean))) {
      if(!c.links.some(x=>x.href===href))problems.push(name+": link missing "+href);
    }
    if(c.buttons.length<b.buttons.length)problems.push(name+": buttons removed");
  }
  return {status:problems.length?"reject":"structural-pass",problems};
}
const args={};
for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
if(process.argv[1]?.endsWith("capture.mjs")){
  if(!args.url||!args.output)throw Error("Usage --url --output");
  capture(args.url,resolve(args.output)).then(x=>{console.log(JSON.stringify(x,null,2));if(Object.values(x).some(y=>y.status!==200||y.horizontalOverflow||y.errors.length||y.brokenImages.length))process.exitCode=1}).catch(e=>{console.error(e);process.exitCode=1});
}
