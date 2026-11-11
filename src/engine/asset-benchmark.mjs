#!/usr/bin/env node
/**
 * Asset quality experiment only. The images are evidence artifacts:
 * they are not inserted into a product or presented as factual product proof.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {sha256} from "../lib.mjs";
import {discover} from "./site.mjs";

export const IMAGE_API="https://api.vultrinference.com/v1/images/generations";
export const IMAGE_CATALOG="https://api.vultrinference.com/v1/images/models";
export const TEST_MODELS=["qwen-image-2.1","z-image-turbo"];
const MIME={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};

export function promptFor(site){
  if(!site?.product || !site.sources?.page)throw Error("Missing real product source");
  const name=site.product.split(/[|—–]/)[0].replace(/[^A-Za-z0-9 &.-]/g,"").trim().slice(0,48);
  if(!name)throw Error("Unknown product identity");
  return "Art-direction asset study for the existing website branded "+name+". "+
   "A solitary sculptural living cactus botanical specimen with carefully observed physical texture, "+
   "premium editorial still life photographed on a warm bone-white studio set with a subtle terracotta plinth, "+
   "beautiful organic silhouette, quiet restraint, tactile shadows, controlled natural daylight, "+
   "precise photographic realism, memorable visual composition. "+
   "An artwork concept for a website hero, not a mock product, user interface, app screenshot, "+
   "logo, certification, customer testimonial, performance claim or functional demonstration. "+
   "No writing, no typography, no watermarks, no fake labels. "+
   "Square, center subject, safe crop, spare neutral background.";
}
export function allowedImageModel(item){
  if(!item?.id || !TEST_MODELS.includes(item.id))throw Error("Model not in tightly scoped comparison");
  const mode=item.architecture||{};
  if(!mode.input_modalities?.includes("text")||!mode.output_modalities?.includes("image"))
    throw Error("Selected model does not generate images");
  return {id:item.id,
    name:item.name||item.id,
    description:item.description||"",
    evaluationOnly:item.id==="qwen-image-2.1"||/evaluation only|research license/i.test(item.description||"")};
}
function outputFile(data,filename){
  if(typeof data!=="string"||data.length<700 || data.length>28e6)throw Error("Unexpected image bytes");
  const buf=Buffer.from(data,"base64");
  const png=buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg=buf[0]===255&&buf[1]===216;
  const webp=buf.toString("ascii",0,4)==="RIFF"&&buf.toString("ascii",8,12)==="WEBP";
  if(!png&&!jpg&&!webp)throw Error("Response not a PNG/JPG/WEBP");
  const ext=png?"png":jpg?"jpg":"webp";
  const file=filename+"."+ext;
  writeFileSync(file,buf,{flag:"wx"});
  return {file,bytes:buf.length,sha256:sha256(buf)};
}
export async function benchmarkImages({project,output,fetcher=fetch,key=process.env.VULTR_INFERENCE_API_KEY}){
  if(!key)throw Error("Vultr inference secret missing");
  const site=discover(project);
  const dir=resolve(output);
  mkdirSync(dir,{recursive:true});
  const response=await fetcher(IMAGE_CATALOG,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error("Image model catalog HTTP "+response.status);
  const body=await response.json();
  const list=body.data||[];
  const prompt=promptFor(site);
  const rows=[];
  for(const id of TEST_MODELS){
    const entry=list.find(x=>x.id===id);
    if(!entry){rows.push({model:id,status:"unavailable"});continue;}
    const model=allowedImageModel(entry);
    const args={model:id,prompt,n:1,size:"1024x1024",seed:20261111,response_format:"b64_json",output_format:"png"};
    // Different denoising-step defaults are model-specific; compare the same art direction, resolution and seed.
    const begin=performance.now();
    try{
      const r=await fetcher(IMAGE_API,{method:"POST",headers:{
        authorization:"Bearer "+key,"content-type":"application/json"
      },body:JSON.stringify(args),signal:AbortSignal.timeout(240000)});
      if(!r.ok){
        const msg=(await r.text()).slice(0,300);
        throw Error("Image API HTTP "+r.status+" "+msg);
      }
      const result=await r.json();
      if(result.data?.length!==1||!result.data[0]?.b64_json)
        throw Error("Missing single generated image");
      const item=outputFile(result.data[0].b64_json,join(dir,id));
      rows.push({model:id,status:"generated",...item,imageSize:result.size||args.size,
        elapsedMs:Math.round(performance.now()-begin),usage:result.data[0].usage||result.usage||{},
        evaluationOnly:model.evaluationOnly,
        licenseWarning:model.evaluationOnly?
          "Evaluation-only/Qwen Research License. Do not deploy commercially.":
          "Not licensed for production by this test; verify the separate image model terms before use."});
    }catch(e){
      rows.push({model:id,status:"error",error:String(e.message).slice(0,400),
        elapsedMs:Math.round(performance.now()-begin),evaluationOnly:model.evaluationOnly});
    }
  }
  const report={product:site.product,sourceHash:site.originalHash,
    identicalPrompt:prompt,seed:20261111,size:"1024x1024",rows,
    noProductionDeployment:true,
    note:"Sample study only; aesthetic quality and legal reuse require separate validation."};
  writeFileSync(join(dir,"asset-benchmark.json"),JSON.stringify(report,null,2)+"\n");
  return report;
}
if(process.argv[1]?.endsWith("asset-benchmark.mjs")){
  const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
  benchmarkImages(opts).then(x=>console.log(JSON.stringify({
    models:x.rows.map(r=>({model:r.model,status:r.status,file:r.file,evaluationOnly:r.evaluationOnly,cost:r.usage?.cost,error:r.error}))
  },null,2))).catch(e=>{console.error("Asset benchmark: "+e.message);process.exitCode=1});
}
