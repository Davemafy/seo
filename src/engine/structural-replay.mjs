#!/usr/bin/env node
/**
 * Replay exactly one archived structural model response. No API calls,
 * no generated application execution, no production deployment.
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync,lstatSync} from "node:fs";
import {dirname,join,resolve,relative,sep} from "node:path";
import {discover} from "./site.mjs";
import {landingPath,scopedCssPath,parseTaggedReply,sha256} from "../lib.mjs";
import {normalizeKnownImports} from "../normalize.mjs";
import {validateStructuralProposal} from "./structural-studio.mjs";

export function structuralReplay({project,response,output}){
 if(!project||!response||!output)throw Error("Need project, archived model response, and output");
 const site=discover(project),target=resolve(output);
 if(existsSync(target)||target===site.root||target.startsWith(site.root+sep)||site.root.startsWith(target+sep))
  throw Error("Output must be new and disjoint from source");
 const raw=readFileSync(resolve(response),"utf8");
 const proposal=parseTaggedReply(raw);
 proposal.files[landingPath]=normalizeKnownImports(proposal.files[landingPath]);
 const verdict=validateStructuralProposal(proposal,site.sources.page);
 cpSync(site.root,target,{recursive:true,force:false,errorOnExist:true,filter:p=>{
  const rel=relative(site.root,p);if(!rel)return true;
  if(rel.split(sep).some(x=>[".git","node_modules","dist",".next",".output","coverage"].includes(x)||x===".env"||x.startsWith(".env.")))return false;
  return !lstatSync(p).isSymbolicLink();
 }});
 for(const p of verdict.paths){
  const filename=join(target,p);
  mkdirSync(dirname(filename),{recursive:true});
  writeFileSync(filename,proposal.files[p]+"\n");
 }
 const receipt={kind:"archived structural model response",originalSourceHash:site.originalHash,
  originalResponseSha256:sha256(raw),generatedPaths:verdict.paths,
  codeHashes:Object.fromEntries(verdict.paths.map(p=>[p,sha256(proposal.files[p])])),
  status:"UNVERIFIED: browser and independent visual jury must review; no deploy"};
 writeFileSync(join(target,"structural-replay-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
 return receipt;
}
if(process.argv[1]?.endsWith("structural-replay.mjs")){
 const a={};for(let i=2;i<process.argv.length;i+=2)a[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(structuralReplay(a),null,2));}catch(e){console.error("Structural replay: "+e.message);process.exitCode=1;}
}
