import test from "node:test";
import { strict as assert } from "node:assert";
import { checkManifest } from "../src/vision-pilot.mjs";
import { SITES } from "../src/reference-capture.mjs";

const manifest=SITES.map(s=>({id:s.id,originalUrl:s.url,file:s.id+"-hero.jpg",sha256:"a".repeat(64)}));
test("allows only named screenshot references",()=>assert.equal(checkManifest(manifest).length,3));
test("rejects swapped or unverified screenshot sets",()=>{
  assert.throws(()=>checkManifest(manifest.slice(1)),/three/);
  assert.throws(()=>checkManifest(manifest.map((m,i)=>i===0?{...m,file:"../../.env"}:m)),/Invalid screenshot manifest/);
});
