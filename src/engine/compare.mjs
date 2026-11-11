#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { compareBrowser } from "./capture.mjs";
const opts={};
for(let i=2;i<process.argv.length;i+=2){opts[process.argv[i].slice(2)]=process.argv[i+1];}
if(!opts.before||!opts.after||!opts.output)throw Error("Usage --before path --after path --output file");
const result=compareBrowser(
  JSON.parse(readFileSync(opts.before,"utf8")),
  JSON.parse(readFileSync(opts.after,"utf8"))
);
writeFileSync(opts.output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(result.status!=="structural-pass")process.exitCode=1;
