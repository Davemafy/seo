import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const axe=require("axe-core");

export async function auditAccessibility(page) {
  await page.addScriptTag({ content: axe.source });
  const violations=await page.evaluate(async()=>{
    const result=await window.axe.run(document,{runOnly:{type:"rule",values:["color-contrast","link-name","button-name"]}});
    return result.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,
      nodes:v.nodes.slice(0,24).map(n=>({
        selector:n.target.join(" "),html:n.html.slice(0,300),
        failure:n.failureSummary?.slice(0,450)||""
      }))}));
  });
  return {verified:true,contrastFailures:violations.find(v=>v.id==="color-contrast")?.count||0,violations};
}
export function accessibilityDefects(assessment) {
  if(assessment?.verified!==true)return ["Accessibility audit unavailable"];
  const failures=[];
  for(const item of assessment.violations||[]){
    if(item.id==="color-contrast")failures.push(item.count+" text contrast violations (WCAG AA)");
    else if(["link-name","button-name"].includes(item.id))failures.push(item.count+" unnamed "+item.id+" controls");
  }
  return failures;
}
