#!/usr/bin/env node
/** Source compatibility is distinct from premium visual acceptance:
 * inherited source defects remain documented, but NEW regressions reject.
 */
import {readFileSync,writeFileSync} from "node:fs";
const views=["desktop","mobile"];
function diff(a=[],b=[]){
 const counts=new Map(),out=[];
 for(const x of a)counts.set(x,(counts.get(x)||0)+1);
 for(const x of b){const n=counts.get(x)||0;if(n>0)counts.set(x,n-1);else out.push(x);}
 return out;
}
function asset(x){try{const u=new URL(x);return u.pathname+u.search;}catch{return x;}}
export function storyCompatibility(original,candidate){
 const failures=[],inherited=[];
 for(const view of views){
  const a=original[view],b=candidate[view];
  if(!a||!b||b.status!==200){failures.push(view+": page missing");continue;}
  if(diff(a.errors||[],b.errors||[]).length)failures.push(view+": new runtime errors");
  if(!a.horizontalOverflow&&b.horizontalOverflow)failures.push(view+": new horizontal overflow");
  const broken=diff((a.brokenImages||[]).map(asset),(b.brokenImages||[]).map(asset));
  if(broken.length)failures.push(view+": new broken images: "+broken.join(", ").slice(0,200));
  const lost=diff((b.links||[]).map(x=>x.href).filter(Boolean),(a.links||[]).map(x=>x.href).filter(Boolean));
  if(lost.length)failures.push(view+": original href destinations missing: "+lost.join(", ").slice(0,190));
  if((b.buttons||[]).length<(a.buttons||[]).length)failures.push(view+": original controls removed");
  if(diff((b.headings||[]).filter(Boolean),(a.headings||[]).filter(Boolean)).length)
    failures.push(view+": source headings missing");
  if((b.textCollisions||[]).length>(a.textCollisions||[]).length)failures.push(view+": new heading/paragraph overlaps");
  if(b.accessibility?.verified!==true)failures.push(view+": accessibility audit missing");
  else if(b.accessibility.contrastFailures>(a.accessibility?.contrastFailures||0))
    failures.push(view+": text contrast worsened");
  if((a.brokenImages||[]).length)inherited.push(view+": "+a.brokenImages.length+" pre-existing missing images");
  if((a.accessibility?.contrastFailures||0)>0)inherited.push(view+": "+a.accessibility.contrastFailures+" pre-existing contrast failures");
 }
 return {status:failures.length?"reject":inherited.length?"compatible-with-inherited-defects":"compatible",
  failures,inherited,
  caveat:"Source compatibility does not imply premium visual quality; inherited defects still block production readiness."};
}
const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
if(process.argv[1]?.endsWith("story-compatibility.mjs")){
 if(!args.before||!args.after||!args.output)throw Error("Need --before --after --output");
 const r=storyCompatibility(JSON.parse(readFileSync(args.before,"utf8")),JSON.parse(readFileSync(args.after,"utf8")));
 writeFileSync(args.output,JSON.stringify(r,null,2)+"\n");
 console.log(JSON.stringify(r,null,2));if(r.status==="reject")process.exitCode=1;
}
