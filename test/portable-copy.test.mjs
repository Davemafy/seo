import test from "node:test";
import { strict as assert } from "node:assert";
import { findCopySlots,verifyCopy,patchTextOnly } from "../src/engine/copy.mjs";
const source='<div className="capabilities"><p className="text-gray-600">\\n Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum. \\n </p><button onClick={save}>Try it out</button><p>Real human copy.</p></div>';
test("finds only inert placeholder JSX text and keeps handlers untouched",()=>{
  const slots=findCopySlots(source);
  assert.equal(slots.length,1);
  assert.match(slots[0].original,/Lorem ipsum/);
  const revised=patchTextOnly(source,slots,[{id:slots[0].id,replacement:"Cactus makes low-maintenance growth easy to begin, with simple setup and steady progress over time."}]);
  assert.match(revised,/Cactus makes low-maintenance/);
  assert(revised.includes('<button onClick={save}>Try it out</button>'));
  assert(revised.includes('<p>Real human copy.</p>'));
});
test("rejects fabricated stats, markup and untouched placeholders",()=>{
  const slots=findCopySlots(source),id=slots[0].id;
  assert.throws(()=>verifyCopy({replacements:[{id,replacement:"Trusted by 300 million users around the world with no setup at all."}]},slots),/Unsafe/);
  assert.throws(()=>verifyCopy({replacements:[{id,replacement:"Lorem ipsum, now with even better features for you."}]},slots),/Placeholder/);
  assert.throws(()=>verifyCopy({replacements:[{id,replacement:"<strong>Guaranteed productivity benefits for every household</strong>"}]},slots),/Unsafe/);
});
test("refuses nested JSX and interactive text nodes",()=>{
  const markup='<p>{user.name} Lorem ipsum</p><p><button onClick={submit}>Lorem ipsum</button></p>';
  assert.equal(findCopySlots(markup).length,0);
});
