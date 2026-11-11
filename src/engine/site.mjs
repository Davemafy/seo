import { existsSync, lstatSync, readFileSync, realpathSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { audit, sha256 } from "../lib.mjs";

export const SUPPORTED = Object.freeze([
  {framework:"react-vite",entry:"src/App.tsx"},
  {framework:"react-vite",entry:"src/App.jsx"},
  {framework:"tanstack-router",entry:"src/routes/index.tsx"},
  {framework:"next-pages",entry:"src/pages/index.tsx"},
  {framework:"next-app",entry:"app/page.tsx"}
]);

export function readLocal(root, path) {
  if(!root || !path || path.startsWith("/") || path.includes("\0") || path.split(/[\\/]/).includes(".."))
    throw Error("Unsafe project path");
  const full=resolve(root,path);
  if(!full.startsWith(root+sep) || !existsSync(full) || lstatSync(full).isSymbolicLink() || !lstatSync(full).isFile()
      || !realpathSync(full).startsWith(root+sep))throw Error("Missing or unsafe source "+path);
  const size=lstatSync(full).size;
  if(size>90000)throw Error("Page exceeds 90KB safe model input");
  return readFileSync(full,"utf8");
}
function safeMeta(pkg, html, source) {
  const tag=html.match(/<title[^>]*>([^<]{2,100})<\/title>/i)?.[1]?.trim();
  const generic=(!tag || /^(?:example|landing page|sample|vite|react|demo|untitled)/i.test(tag));
  const visibleBrand=source.match(/<a\b[^>]*>\s*([A-Za-z][A-Za-z0-9 &-]{1,40})\s*<\/a>/)?.[1]?.trim();
  const name=(generic && visibleBrand) ? visibleBrand : (tag||pkg.description||pkg.name||"Untitled website");
  return name.slice(0,100).replace(/[{}<>]/g,"");
}
export function discover(root) {
  root=realpathSync(resolve(root));
  if(!existsSync(resolve(root,"package.json")))throw Error("Not a JS project");
  const pkg=JSON.parse(readLocal(root,"package.json"));
  const options=SUPPORTED.filter(x=>existsSync(resolve(root,x.entry)));
  if(!options.length)throw Error("Unsupported frontend: no recognized React landing entry; no edits attempted");
  const selected=options.find(x=>x.framework==="react-vite" && (pkg.dependencies?.vite||pkg.devDependencies?.vite))||options[0];
  const source=readLocal(root,selected.entry);
  if(!/(<main\b|<section\b|<div\b)/.test(source))throw Error("Selected entry has no JSX");
  const html=existsSync(resolve(root,"index.html"))?readLocal(root,"index.html"):"";
  const cssCandidates=["src/index.css","src/App.css","src/styles.css","app/globals.css"];
  const css=cssCandidates.filter(p=>existsSync(resolve(root,p))).map(p=>readLocal(root,p)).join("\n").slice(0,25000);
  const existingSourceHash=sha256(source);
  return {root,entry:selected.entry,framework:selected.framework,product:safeMeta(pkg,html,source),
    sources:{page:source,css},diagnosis:audit(source,css),originalHash:existingSourceHash,
    scripts:{build:typeof pkg.scripts?.build==="string"?"build":null,dev:typeof pkg.scripts?.dev==="string"?"dev":null},
    preservation:{preserveAllAnchors:true,preserveHandlers:true,preserveJSX:true}};
}
