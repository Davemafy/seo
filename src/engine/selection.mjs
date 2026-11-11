import { readFileSync,writeFileSync } from "node:fs";
import { compareBrowser } from "./capture.mjs";
export function selection(previous,next) {
  const structural=compareBrowser(previous,next);
  const problems=[...structural.problems];
  for(const view of ["desktop","mobile"]){
    const a=previous[view],b=next[view];
    if(!a||!b){problems.push(view+": missing browser evidence");continue;}
    if(b.pageHeight>a.pageHeight*1.05)problems.push(view+": exceeds previous page height by >5%");
  }
  return {status:problems.length?"reject":"eligible-for-visual-review",problems,
    caveat:"Passing technical gates is not proof of visual quality. Human review remains required."};
}
if(process.argv[1]?.endsWith("selection.mjs")){
  const a={};for(let i=2;i<process.argv.length;i+=2)a[process.argv[i].slice(2)]=process.argv[i+1];
  if(!a.before||!a.after||!a.output)throw Error("Provide --before --after --output");
  const result=selection(JSON.parse(readFileSync(a.before,"utf8")),JSON.parse(readFileSync(a.after,"utf8")));
  writeFileSync(a.output,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify(result,null,2));if(result.status!=="eligible-for-visual-review")process.exitCode=1;
}
