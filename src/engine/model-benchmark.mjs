#!/usr/bin/env node
import {existsSync,readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {catalog,selectModel} from "./model-catalog.mjs";
import {generate} from "./generate.mjs";
import {jury} from "./visual-jury.mjs";

const DEFAULT_CODE_MODELS=["glm-5.2","glm-5.3","qwen3.8-27b"];
const parseNames=x=>{
 const ids=(x||DEFAULT_CODE_MODELS.join(",")).split(",").map(v=>v.trim()).filter(Boolean);
 if(!ids.length||ids.length>4||new Set(ids).size!==ids.length||ids.some(id=>!(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id))))
  throw Error("Choose 1–4 distinct simple Vultr model IDs");
 return ids;
};
function json(path){return JSON.parse(readFileSync(path,"utf8"));}
function save(path,data){writeFileSync(resolve(path),JSON.stringify(data,null,2)+"\n");}
export async function generateComparison({project,desktop,mobile,report,output,models,runner=generate,modelList=null}){
 const ids=parseNames(models),available=modelList||await catalog();
 mkdirSync(output,{recursive:true});
 const results=[];
 for(const id of ids){
  selectModel(available,id,{vision:true});
  const target=join(output,id);
  const start=performance.now();
  try{
   const r=await runner({project,desktop,mobile,report,output:target,model:id});
   if(r.model!==id)throw Error("Observed model mismatch; invalid generated candidate");
   results.push({id,ok:true,elapsedMs:Math.round(performance.now()-start),
    sourceHash:r.sourceHash,styleHash:r.styleHash,usage:r.usage,model:r.model});
  }catch(e){
   results.push({id,ok:false,elapsedMs:Math.round(performance.now()-start),
    error:String(e.message).slice(0,350)});
  }
 }
 const data={source:"same pinned React source and identical screenshots for all code models",models:results,
   note:"No candidate is deployed, and no arbitrary model fallback is accepted."};
 save(join(output,"generation-report.json"),data);
 return data;
}
export function selectCalibratedJudge(vision){
 const candidates=vision?.rows?.filter(row=>row.eligibleForJudging&&row.earned===8)||[];
 if(!candidates.length)throw Error("No image-grounded model passed both calibration fixtures; cannot run trusted visual jury");
 const preference=["muse-glimmer-30b","deepseek-v4.1-flash-1017","glm-5.3","qwen3.8-27b","glm-5.2"];
 candidates.sort((a,b)=>preference.indexOf(a.model)-preference.indexOf(b.model));
 return candidates[0].model;
}
export async function compareCandidates({original,resultsDir,visionReport,output,models,judgeFn=jury}){
 const judgeModel=selectCalibratedJudge(json(visionReport)),ids=parseNames(models),rows=[];
 for(const id of ids){
  const folder=join(resultsDir,id),reportPath=join(folder,"report.json"),gatePath=join(folder,"gate.json");
  if(!existsSync(reportPath)||!existsSync(gatePath)){
   rows.push({id,available:false,reason:"Build or screenshot evidence absent"});continue;
  }
  const metrics=json(reportPath),technical=json(gatePath);
  let judgment=null;
  if(metrics.desktop?.status===200&&metrics.mobile?.status===200){
   const target=join(folder,"jury.json");
   try {
    const gate=await judgeFn({original,candidate:join(folder,"desktop.png"),mobile:join(folder,"mobile.png"),output:target,model:judgeModel});
    judgment={model:judgeModel,gate};
   }catch(e){judgment={model:judgeModel,error:String(e.message).slice(0,250)};}
  }
  rows.push({id,available:true,technical,desktop:{
   height:metrics.desktop?.pageHeight,errors:metrics.desktop?.errors?.length,
   contrastFailures:metrics.desktop?.accessibility?.contrastFailures,
   overflow:metrics.desktop?.horizontalOverflow},
   mobile:{height:metrics.mobile?.pageHeight,errors:metrics.mobile?.errors?.length,
    contrastFailures:metrics.mobile?.accessibility?.contrastFailures,
    overflow:metrics.mobile?.horizontalOverflow},judgment});
 }
 const accepted=rows.filter(r=>r.technical?.status==="eligible-for-visual-review"&&r.judgment?.gate?.status==="advisory-pass");
 const result={judgeModel,results:rows,advisoryShortlist:accepted.map(r=>r.id),
  limitations:["Only one independent website in this round","Visual jury is a model opinion, not expert human approval",
  "Calibration proves perception of a few image details, not superior art direction",
  "No production model switched or output published automatically"]};
 save(output,result);return result;
}
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
if(process.argv[1]?.endsWith("model-benchmark.mjs")){
 if(opts.action==="generate")generateComparison({
  project:resolve(opts.project),desktop:resolve(opts.desktop),mobile:resolve(opts.mobile),
  report:resolve(opts.report),output:resolve(opts.output),models:opts.models
 }).then(x=>console.log(JSON.stringify(x.models,null,2))).catch(e=>{console.error(e);process.exitCode=1;});
 else if(opts.action==="judge")compareCandidates({
  original:resolve(opts.original),resultsDir:resolve(opts.results),
  visionReport:resolve(opts.vision),output:resolve(opts.output),models:opts.models
 }).then(x=>console.log(JSON.stringify({judgeModel:x.judgeModel,shortlist:x.advisoryShortlist},null,2))).catch(e=>{console.error(e);process.exitCode=1;});
 else throw Error("Use --action generate|judge");
}
