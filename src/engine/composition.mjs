#!/usr/bin/env node
/**
 * Source-preserving, component-bounded hero composition.
 * This module is product-agnostic: it discovers literal text and supplied
 * visual assets through the TypeScript JSX AST and chooses a reusable layout.
 * It never invents assets or replaces a working interactive subtree.
 */
import { createRequire } from "node:module";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { discover } from "./site.mjs";
import { addScope } from "./scope.mjs";
import { sha256 } from "../lib.mjs";

const require=createRequire(import.meta.url);
const ts=require("typescript");

export const COMPOSE_CSS="sloppertizer.compose.css";
const safeLiteral=value=>value.replace(/[<>{}\u0000-\u001f]/g," ").replace(/\s+/g," ").trim().slice(0,220);
const getNodeText=(n,sf,src)=>src.slice(n.getStart(sf),n.getEnd());
const nameOf=(tag,sf)=>tag?.getText(sf)||"";
function walk(node,visitor) {visitor(node);ts.forEachChild(node,n=>walk(n,visitor));}
function jsxNodes(node,condition) {
  const matches=[];walk(node,x=>{if((ts.isJsxElement(x)||ts.isJsxSelfClosingElement(x))&&condition(x))matches.push(x);});return matches;
}
function jsxTag(node,sf) {
  return nameOf(ts.isJsxElement(node)?node.openingElement.tagName:node.tagName,sf);
}
function hasJsx(node,sf,names) {
  return jsxNodes(node,x=>names.includes(jsxTag(x,sf))).length>0;
}
function rawText(node,sf) {
  const chunks=[];
  walk(node,x=>{if(ts.isJsxText(x))chunks.push(x.getText(sf));});
  return safeLiteral(chunks.join(" "));
}
function attr(node,sf,name) {
  const opening=ts.isJsxElement(node)?node.openingElement:node;
  if(!opening.attributes)return null;
  const item=opening.attributes.properties.find(x=>ts.isJsxAttribute(x)&&x.name.getText(sf)===name);
  if(!item?.initializer||!ts.isStringLiteral(item.initializer))return null;
  return item.initializer.text;
}
function copyProject(from,to) {
  cpSync(from,to,{recursive:true,errorOnExist:true,force:false,filter:path=>{
    const rel=relative(from,path);if(!rel)return true;
    const parts=rel.split(sep);
    if(parts.some(x=>[".git","node_modules","dist",".next","coverage",".output"].includes(x)))return false;
    if(parts.some(x=>x===".env"||x.startsWith(".env.")))return false;
    return !lstatSync(path).isSymbolicLink();
  }});
}
function includesDynamicControl(hero,sf) {
  // This intentional initial adapter will reject hero regions with controls
  // rather than treating their handlers as disposable design details.
  const controls=new Set(["a","button","input","select","textarea","form","label"]);
  return hasJsx(hero,sf,[...controls]);
}
function textParagraph(nodes,sf,product) {
  const paragraphs=nodes.flatMap(n=>jsxNodes(n,x=>jsxTag(x,sf)==="p"))
    .map(x=>rawText(x,sf)).filter(x=>x.length>48&&x.length<310&&!/lorem ipsum/i.test(x));
  const exact=paragraphs.find(x=>x.toLowerCase().includes(product.toLowerCase().split(/\s/)[0]));
  return exact||paragraphs[0]||"";
}
export function inspectComposition(source, product="Untitled") {
  const sf=ts.createSourceFile("src/Landing.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  if(sf.parseDiagnostics?.length)throw Error("Source JSX cannot be parsed safely");
  const mains=jsxNodes(sf,n=>jsxTag(n,sf)==="main");
  if(mains.length!==1||!ts.isJsxElement(mains[0]))throw Error("Need exactly one JSX main landmark");
  const main=mains[0];
  const children=main.children.filter(n=>ts.isJsxElement(n));
  if(children.length<2)throw Error("Need a standalone, bounded hero child");
  const eligible=children.filter(n=>hasJsx(n,sf,["h1","h2"])&&hasJsx(n,sf,["img","picture","video","Lottie","Canvas","Image"]));
  if(eligible.length!==1)throw Error("Need exactly one hero containing a heading and a visual asset");
  const hero=eligible[0];
  if(includesDynamicControl(hero,sf))throw Error("Interactive hero subtree cannot be replaced safely");
  const headings=jsxNodes(hero,n=>["h1","h2"].includes(jsxTag(n,sf)));
  const assets=jsxNodes(hero,n=>["img","video","svg","Lottie","Canvas","Image"].includes(jsxTag(n,sf)));
  if(headings.length!==1||assets.length!==1)throw Error("Ambiguous heading or visual asset");
  const heading=headings[0],asset=assets[0];
  const headingText=rawText(heading,sf);
  if(headingText.length<10||headingText.length>160)throw Error("Unreliable source headline");
  const features=jsxNodes(main,n=>jsxTag(n,sf)==="Feature")
    .map(n=>attr(n,sf,"name")).filter(Boolean).map(safeLiteral).slice(0,4);
  const support=textParagraph(children.filter(n=>n!==hero),sf,product);
  const idx=children.indexOf(hero),next=children[idx+1];
  if(!next)throw Error("No subsequent section to anchor the hero");
  const nextOpening=getNodeText(next.openingElement,sf,source);
  if(nextOpening.includes("id="))throw Error("Next section has own anchor; preserving existing route");
  const mainSlice=getNodeText(main.openingElement,sf,source);
  if(!/<main\b/.test(mainSlice))throw Error("Invalid root");
  const navCandidate=children[0]!==hero && hasJsx(children[0],sf,["a"]) ? children[0] : null;
  let nav=null;
  if(navCandidate) {
    const opening=getNodeText(navCandidate.openingElement,sf,source);
    if(/className\s*=\s*["']/.test(opening)) {
      const decorated=opening.replace(/className\s*=\s*(["'])(.*?)\1/s,(_,q,v)=>"className="+q+v+" slp-cmp-nav"+q);
      nav={start:navCandidate.openingElement.getStart(sf),end:navCandidate.openingElement.getEnd(),decorated};
    }
  }
  return {
    nav,
    page:product,position:{start:hero.getStart(sf),end:hero.getEnd()},
    nextSection:{openingEnd:next.openingElement.getEnd()-1,tag:jsxTag(next,sf)},
    heading:{jsx:getNodeText(heading,sf,source),text:headingText},
    asset:{jsx:getNodeText(asset,sf,source),tag:jsxTag(asset,sf)},
    support,features,
    originalRegionHash:sha256(getNodeText(hero,sf,source)),
    originalSourceHash:sha256(source)
  };
}
export const LAYOUTS=Object.freeze(["editorial-stage","artwork-focus"]);
function cleanJSX(s) {return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
export function renderHero(inventory,layout="editorial-stage") {
  if(!LAYOUTS.includes(layout))throw Error("Unknown layout");
  const label=safeLiteral(inventory.page.split(/[|–—]/)[0].trim());
  const caption=inventory.features[1]||inventory.features[0]||label;
  const featureList=inventory.features.map((x,i)=>'<span className="slp-cmp-feature"><b>0'+(i+1)+'</b> '+cleanJSX(x)+'</span>').join("\n");
  const support=inventory.support||inventory.heading.text;
  return [
    '<section className="slp-cmp-hero slp-cmp-'+layout+'" aria-label="Introduction">',
    '  <div className="slp-cmp-wrapper">',
    '    <div className="slp-cmp-copy">',
    '      <div className="slp-cmp-kicker"><span className="slp-cmp-kicker-num">01 / INTRODUCING</span><span className="slp-cmp-kicker-rule" aria-hidden="true" /><span>'+cleanJSX(label.toUpperCase())+'</span></div>',
    '      <div className="slp-cmp-headline">'+inventory.heading.jsx+'</div>',
    '      <div className="slp-cmp-description">',
    '        <p>'+cleanJSX(support)+'</p>',
    '        <a className="slp-cmp-explore" href="#slp-details">Explore the details <span aria-hidden="true">↗</span></a>',
    '      </div>',
    '    </div>',
    '    <div className="slp-cmp-visual" aria-label="Original product illustration">',
    '      <div className="slp-cmp-visual-grid" aria-hidden="true"></div>',
    '      <div className="slp-cmp-art">'+inventory.asset.jsx+'</div>',
    '      <div className="slp-cmp-art-caption"><span>FEATURE / '+cleanJSX(caption.toUpperCase())+'</span><span>ORIGINAL PRODUCT ART</span></div>', 
    '    </div>',
    '  </div>',
    '  <div className="slp-cmp-feature-strip">'+featureList+'</div>',
    '</section>'
  ].join("\n");
}
export const COMPOSITION_STYLES=[
".slp-engine .slp-cmp-nav{width:100%;max-width:none;background:#F4F0E7;border-bottom:1px solid #D8DDD1;padding:21px max(3.5%,calc((100vw - 1208px)/2))!important;margin:0!important}",
".slp-engine .slp-cmp-nav a{font-size:25px!important;font-weight:800!important;letter-spacing:-.055em!important;color:#193B2E!important}",
".slp-engine .slp-cmp-nav button{border-radius:0!important;background:#193B2E!important;color:#F9F6ED!important;font-size:11px!important;font-weight:700!important;letter-spacing:.05em!important;box-shadow:none!important;text-transform:none!important;padding:12px 20px!important}",
".slp-engine .slp-cmp-hero{--slp-ink:#173A2C;--slp-accent:#BA6E44;--slp-paper:#F4F0E7;--slp-rule:#C9D1C4;background:var(--slp-paper);color:var(--slp-ink);margin:0 auto;border-bottom:1px solid #D8DDD1;padding:0;overflow:visible;position:relative}",
".slp-engine .slp-cmp-wrapper{max-width:1300px;margin:0 auto;padding:59px 46px 42px;display:grid;grid-template-columns:minmax(0,1.13fr) minmax(0,.87fr);align-items:stretch;gap:68px}",
".slp-engine .slp-cmp-copy{min-width:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:25px;padding:10px 0 13px}",
".slp-engine .slp-cmp-kicker{width:100%;display:flex;align-items:center;gap:14px;color:#556F5D;font-size:11px;font-weight:750;letter-spacing:.11em;line-height:1.3;text-transform:uppercase}",
".slp-engine .slp-cmp-kicker-num{color:var(--slp-accent)}",
".slp-engine .slp-cmp-kicker-rule{flex:1;height:1px;max-width:44px;background:#9DB1A2}",
".slp-engine .slp-cmp-headline{margin:12px 0 0;width:100%}",
".slp-engine .slp-cmp-headline h1,.slp-engine .slp-cmp-headline h2{font-family:ui-sans-serif,system-ui,sans-serif!important;font-size:clamp(54px,4.9vw,72px)!important;font-weight:790!important;line-height:1.01!important;letter-spacing:-.079em!important;color:#193B2E!important;margin:0!important;max-width:800px;text-wrap:balance}",
".slp-engine .slp-cmp-headline h1 span,.slp-engine .slp-cmp-headline h2 span{display:block!important;color:#193B2E!important;max-width:850px}",
".slp-engine .slp-cmp-description{display:flex;flex-direction:column;align-items:flex-start;gap:29px;max-width:500px}",
".slp-engine .slp-cmp-description p{font-size:16px!important;line-height:1.62!important;letter-spacing:-.01em!important;color:#496457!important;margin:0!important;max-width:455px!important}",
".slp-engine .slp-cmp-explore{display:inline-flex;align-items:center;gap:18px;border-radius:0;background:#193D2D;color:#F8F5EC;text-decoration:none;font-size:13px;font-weight:700;padding:16px 20px;line-height:1.3;box-shadow:none;transition:background .2s ease}",
".slp-engine .slp-cmp-explore:hover{background:#325641;color:#fff}",
".slp-engine .slp-cmp-explore:focus-visible{outline:2px solid #BF783F;outline-offset:3px}",
".slp-engine .slp-cmp-explore span{font-size:20px;line-height:10px}",
".slp-engine .slp-cmp-visual{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:480px;background:#CCAA8F;position:relative;isolation:isolate;border:1px solid #B98F71;box-shadow:14px 14px 0 #E6E0D3;overflow:hidden}",
".slp-engine .slp-cmp-visual:before{content:'';position:absolute;inset:22px;border:1px solid #E8CCB4;z-index:-1;pointer-events:none}",
".slp-engine .slp-cmp-visual-grid{position:absolute;inset:0;z-index:-2;background-image:linear-gradient(#F7E2CC30 1px,transparent 1px),linear-gradient(90deg,#F7E2CC30 1px,transparent 1px);background-size:47px 47px}",
".slp-engine .slp-cmp-art{width:100%;height:100%;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}",
".slp-engine .slp-cmp-art .lottie-cactus{height:450px!important;width:100%!important;max-width:510px;min-width:200px;margin:auto;filter:contrast(1.18) saturate(1.1);transform:scale(1.09)}",
".slp-engine .slp-cmp-art svg,.slp-engine .slp-cmp-art img{max-width:100%;max-height:100%;object-fit:contain}",
".slp-engine .slp-cmp-art-caption{position:absolute;inset:auto 23px 22px;display:flex;justify-content:space-between;gap:18px;color:#624231;font:750 9px/1.4 ui-monospace,monospace;letter-spacing:.11em}",
".slp-engine .slp-cmp-feature-strip{max-width:1208px;margin:0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:1px solid #D2D9CC;padding:18px 0 22px}",
".slp-engine .slp-cmp-feature{display:flex;align-items:center;gap:12px;border-left:1px solid #CDD8CA;padding:12px 24px;color:#305342;font-size:12px;font-weight:650;line-height:1.3}",
".slp-engine .slp-cmp-feature:first-child{border-left:0;padding-left:4px}",
".slp-engine .slp-cmp-feature b{font:700 10px/1.3 ui-monospace,monospace;color:#B46B42}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-wrapper{grid-template-columns:minmax(0,1fr);gap:32px;padding-top:48px}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-copy{display:grid;grid-template-columns:1.1fr .9fr;column-gap:55px;align-items:end}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-kicker{grid-column:1/-1;margin:0 0 10px}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-headline{grid-column:1;margin:0}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-description{grid-column:2;grid-row:2;align-self:end}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-visual{min-height:370px;max-height:450px}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-art{min-height:340px}",
".slp-engine .slp-cmp-artwork-focus .slp-cmp-art .lottie-cactus{height:400px!important}",
"@media(max-width:1000px){.slp-engine .slp-cmp-wrapper{padding:55px 28px;gap:30px;grid-template-columns:1fr}.slp-engine .slp-cmp-visual{min-height:400px}.slp-engine .slp-cmp-headline h1,.slp-engine .slp-cmp-headline h2{font-size:clamp(48px,6.3vw,68px)!important}.slp-engine .slp-cmp-artwork-focus .slp-cmp-copy{display:flex;align-items:flex-start}.slp-engine .slp-cmp-feature-strip{margin:0 28px}}",
"@media(max-width:600px){.slp-engine .slp-cmp-wrapper{padding:32px 18px 29px;gap:28px}.slp-engine .slp-cmp-copy{gap:21px;padding:0}.slp-engine .slp-cmp-kicker{font-size:9px;gap:9px}.slp-engine .slp-cmp-headline h1,.slp-engine .slp-cmp-headline h2{font-size:clamp(36px,10.1vw,43px)!important;line-height:1.02!important;letter-spacing:-.067em!important}.slp-engine .slp-cmp-headline{margin-top:5px}.slp-engine .slp-cmp-description{gap:19px}.slp-engine .slp-cmp-description p{font-size:14px!important;line-height:1.55!important}.slp-engine .slp-cmp-explore{font-size:12px;padding:14px 18px}.slp-engine .slp-cmp-visual{min-height:330px;box-shadow:7px 7px 0 #E4DDCE}.slp-engine .slp-cmp-art{min-height:320px}.slp-engine .slp-cmp-art .lottie-cactus{height:340px!important;transform:scale(1.02)}.slp-engine .slp-cmp-art-caption{inset:auto 13px 13px;font-size:8px}.slp-engine .slp-cmp-feature-strip{grid-template-columns:repeat(2,minmax(0,1fr));margin:0 18px;padding:11px 0 14px}.slp-engine .slp-cmp-feature{padding:10px 8px;font-size:11px;gap:7px}.slp-engine .slp-cmp-feature:nth-child(odd){border-left:0}.slp-engine .slp-cmp-artwork-focus .slp-cmp-wrapper{padding-top:32px}.slp-engine .slp-cmp-artwork-focus .slp-cmp-visual{min-height:325px}.slp-engine .slp-cmp-artwork-focus .slp-cmp-art{min-height:290px}}",
".slp-engine .slp-cmp-headline h2 span:last-child,.slp-engine .slp-cmp-headline h1 span:last-child{color:#B96A3F!important}",
"@media(prefers-reduced-motion:reduce){.slp-engine .slp-cmp-explore{transition:none}}"
].join("\n")+"\n";

export function applyComposition(source, product,layout="editorial-stage") {
  const inventory=inspectComposition(source,product);
  const fresh=renderHero(inventory,layout);
  let edited=source.slice(0,inventory.nextSection.openingEnd)+
    ' id="slp-details"'+source.slice(inventory.nextSection.openingEnd);
  edited=edited.slice(0,inventory.position.start)+fresh+edited.slice(inventory.position.end);
  if(inventory.nav) {
    edited=edited.slice(0,inventory.nav.start)+inventory.nav.decorated+edited.slice(inventory.nav.end);
  }
  // Scoped CSS for the component library is explicitly imported.
  const importText='import "./'+COMPOSE_CSS+'";';
  if(edited.includes(importText))throw Error("Composition already applied");
  const sf=ts.createSourceFile("src/Landing.tsx",edited,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  if(sf.parseDiagnostics?.length)throw Error("Result failed JSX syntax check");
  const imports=[...edited.matchAll(/^import[^\n]*;[ \t]*$/gm)];
  if(!imports.length)throw Error("Import anchor missing");
  const last=imports.at(-1),at=last.index+last[0].length;
  edited=edited.slice(0,at)+"\n"+importText+edited.slice(at);
  if(!edited.includes(inventory.asset.jsx)||!edited.includes(inventory.heading.jsx))throw Error("Original content not preserved");
  const scoped=addScope(edited,"src/Landing.tsx");
  return {source:scoped.source,inventory,style:COMPOSITION_STYLES,layout};
}
export function composeProject({project,output,layout="editorial-stage"}) {
  const site=discover(project),destination=resolve(output);
  if(existsSync(destination)||site.root===destination||destination.startsWith(site.root+sep)||site.root.startsWith(destination+sep))
    throw Error("Output must be new and disjoint");
  const composed=applyComposition(site.sources.page,site.product,layout);
  copyProject(site.root,destination);
  writeFileSync(resolve(destination,site.entry),composed.source);
  writeFileSync(resolve(destination,dirname(site.entry),COMPOSE_CSS),composed.style);
  writeFileSync(resolve(destination,dirname(site.entry),"sloppertizer.engine.css"),"/* Pending scoped model refinement; composition preview remains functional. */\n");
  const report={product:site.product,entry:site.entry,layout,
    changedFiles:[site.entry,join(dirname(site.entry),COMPOSE_CSS),join(dirname(site.entry),"sloppertizer.engine.css")],
    originalHash:site.originalHash,candidateHash:sha256(composed.source),
    preservedHeroAssetHash:sha256(composed.inventory.asset.jsx),
    preservedHeroHeadingHash:sha256(composed.inventory.heading.jsx),
    featureNames:composed.inventory.features,
    status:"UNVERIFIED: build and browser comparisons required"};
  writeFileSync(join(destination,"sloppertizer-composition.json"),JSON.stringify(report,null,2)+"\n");
  return report;
}
if(process.argv[1]?.endsWith("composition.mjs")) {
  const args={};
  for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
  try{console.log(JSON.stringify(composeProject(args),null,2));}
  catch(e){console.error("Composition: "+e.message);process.exitCode=1;}
}
