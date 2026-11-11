import { dirname, relative, resolve, sep } from "node:path";
import { sha256 } from "../lib.mjs";

export const CSS_NAME="sloppertizer.engine.css";
export function addScope(page, entry) {
  if(typeof page!=="string" || !/\.(tsx|jsx)$/.test(entry))throw Error("Expected React JSX entry");
  const cssImport='import "./'+CSS_NAME+'";';
  if(page.includes("sloppertizer.engine.css")) {
    if(!page.includes('slp-engine'))throw Error("Previous CSS import has no scope");
    return {source:page,relativeCss:resolve(dirname(entry),CSS_NAME),alreadyScoped:true};
  }
  // Match root <main> without touching handlers, attributes, or children. Never guess for other root structures.
  const tag=/<main\b([^>]*)>/g;
  const match=tag.exec(page);
  if(!match || tag.exec(page))throw Error("Need exactly one <main> root; refusing ambiguous edits");
  const attributes=match[1];
  if(/\{\s*\.\.\.|className\s*=\s*\{/.test(attributes))throw Error("Dynamic root props unsupported; preserving original");
  let updated;
  if(/\bclassName\s*=\s*(["'])(.*?)\1/s.test(attributes)) {
    updated=match[0].replace(/\bclassName\s*=\s*(["'])(.*?)\1/s,(_,q,classes)=>"className="+q+classes+" slp-engine"+q);
  } else if(/\bclassName\b/.test(attributes)) throw Error("Unrecognized className; no edit");
  else updated=match[0].replace(/>$/,' className="slp-engine">');
  // CSS import is inserted after existing imports but before declarations to preserve syntax.
  const imports=[...page.matchAll(/^import\s+.*?;\s*$/gm)];
  if(!imports.length)throw Error("No safe import anchor");
  const last=imports.at(-1),insert=last.index+last[0].length;
  let scoped=page.slice(0,match.index)+updated+page.slice(match.index+match[0].length);
  const shift=updated.length-match[0].length;
  const offset=insert+(match.index<insert?shift:0);
  scoped=scoped.slice(0,offset)+"\n"+cssImport+scoped.slice(offset);
  return {source:scoped,relativeCss:resolve(dirname(entry),CSS_NAME),alreadyScoped:false};
}

export function validateCss(css) {
  if(typeof css!=="string" || css.length<320 || css.length>24000)throw Error("Invalid scoped CSS length");
  if(/@import|@font-face|url\s*\(|expression\s*\(|behavior\s*:|position\s*:\s*fixed|javascript\s*:/i.test(css))
    throw Error("Unsafe CSS or external asset dependency");
  // Verify each selector, including grouped selectors; at-rules may wrap selectors but cannot escape scope.
  const stripped=css.replace(/\/\*[\s\S]*?\*\//g,"");
  const openers=[...stripped.matchAll(/([^{}]+)\{/g)];
  if(!openers.length)throw Error("No CSS rules");
  for(const [,raw] of openers){
    const v=raw.trim().replace(/^}/g,"").trim();
    if(!v)continue;
    if(v.startsWith("@")){
      if(!/^@(?:media|supports)\s/.test(v))throw Error("Unsupported CSS at-rule");
      continue;
    }
    if(v.split(",").some(s=>!s.trim().startsWith(".slp-engine")))
      throw Error("CSS escaped .slp-engine: "+v.slice(0,100));
  }
  return css;
}
export function unchangedOutsideScope(original, scoped) {
  const removeImport=s=>s.replace(/\n?import "\.\/sloppertizer\.engine\.css";/,"");
  const undoClass=s=>s.replace(/\bclassName=(["'])([^"']*?) slp-engine\1/,"className=$1$2$1")
    .replace(/\sclassName="slp-engine"(?=>)/,"");
  return sha256(removeImport(undoClass(scoped)))===sha256(original);
}
