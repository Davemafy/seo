import test from "node:test";
import {strict as assert} from "node:assert";
import {parseTastePlan,formatTasteBrief,tasteRedesign} from "../src/engine/taste-profile.mjs";
const directions=[
{name:"Workbench editorial",metaphor:"Workshop planning desk",productFit:"Real tasks and notes belong together",layout:"Vertical typographic introduction with dense full width content rows",typography:"Literary headings with technical labels",palette:"Off white and charcoal with rust accents",risk:"Avoid tiny text in work queue"},
{name:"Daily dispatch",metaphor:"Morning newspaper dispatch",productFit:"One overview for meeting notes and tasks",layout:"Split hero with narrow sidebar and wide document-led narrative",typography:"Editorial contrast and restrained monospace markers",palette:"Newsprint with deep blue and copper",risk:"Do not imply fabricated publication authority"},
{name:"Flight board",metaphor:"Airport departure information",productFit:"Priorities can read as upcoming actions",layout:"Horizontal modular timeline with compressed navigation",typography:"Tabular labels and strong information grid",palette:"Ink black and pale cyan with warm yellow",risk:"Avoid unreadable mobile tabular text"}];
const good={directions,selected:"Daily dispatch",selectionRationale:"A document-led day planner best accommodates the actual feature set without implying an invented dashboard, while the other options add visual density.",negativeRules:["No fake product statistics","No copy lifted from real brand","No generic gradient hero"]};
test("accepts distinct concepts and selected rationale",()=>{
 const r=parseTastePlan(JSON.stringify(good));assert.equal(r.directions.length,3);assert.match(formatTasteBrief({plan:r}),/Daily dispatch/);
});
test("rejects generic repeat, unknown choice, unknown keys",()=>{
 assert.throws(()=>parseTastePlan(JSON.stringify({...good,directions:[directions[0],directions[0],directions[2]]})),/not distinct/);
 assert.throws(()=>parseTastePlan(JSON.stringify({...good,selected:"Not in list"})),/not in candidates/);
 assert.throws(()=>parseTastePlan(JSON.stringify({...good,fluff:"ignore"})),/structure/);
 assert.throws(()=>parseTastePlan("Not JSON"),/JSON/);
});
test("unsafe output refused before model or filesystem writes",async()=>{
 await assert.rejects(tasteRedesign({project:"/tmp",desktop:"one.png",mobile:"two.png",report:"x",output:"/tmp"}),/Not a JS project/);
});
