#!/usr/bin/env node
/** Replay a saved, independently generated Sloppertizer CSS response without
 * repeating any inference. Never overwrite source or deploy a candidate. */
import {readFileSync,writeFileSync,existsSync,cpSync,mkdirSync,lstatSync} from "node:fs";
import {dirname,join,resolve,relative,sep} from "node:path";
import {discover} from "./site.mjs";
import {addScope,unchangedOutsideScope,CSS_NAME} from "./scope.mjs";
import {parseDesign} from "./generate.mjs";
import {sha256} from "../lib.mjs";
export function replayTaste({project,response,output}){
 if(!project||!response||!output)throw Error("Need --project --response --output");
 const site=discover(project),target=resolve(output);
 if(existsSync(target)||target===site.root||target.startsWith(site.root+sep)||site.root.startsWith(target+sep))
   throw Error("Replay output must be new and separate from source");
 const draft=parseDesign(readFileSync(resolve(response),"utf8"));
 const scoped=addScope(site.sources.page,site.entry);
 if(!unchangedOutsideScope(site.sources.page,scoped.source))throw Error("Original feature source not preserved");
 cpSync(site.root,target,{recursive:true,force:false,errorOnExist:true,filter:p=>{
   const rel=relative(site.root,p);
   if(!rel)return true;
   if(rel.split(sep).some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)||x===".env"||x.startsWith(".env.")))return false;
   return !lstatSync(p).isSymbolicLink();
 }});
 mkdirSync(resolve(target,dirname(site.entry)),{recursive:true});
 writeFileSync(resolve(target,site.entry),scoped.source);
 writeFileSync(resolve(target,dirname(site.entry),CSS_NAME),draft.css+"\n");
 const receipt={sourceHash:site.originalHash,sourcePreserved:true,stylesheetSha256:sha256(draft.css),
  stylesheetBytes:Buffer.byteLength(draft.css),direction:draft.direction,
  status:"UNVERIFIED — browser verification and independent visual review required"};
 writeFileSync(join(target,"sloppertizer-taste-replay.json"),JSON.stringify(receipt,null,2)+"\n");
 return receipt;
}
if(process.argv[1]?.endsWith("taste-replay.mjs")){
 const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
 try{console.log(JSON.stringify(replayTaste(args),null,2));}
 catch(e){console.error("Taste replay: "+e.message);process.exitCode=1;}
}
