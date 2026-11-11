import test from "node:test";
import { strict as assert } from "node:assert";
import { accessibilityDefects } from "../src/engine/accessibility.mjs";
test("rejects unreadable text even when source compiles",()=>{
 const report={verified:true,contrastFailures:3,violations:[{id:"color-contrast",count:3}]};
 assert.match(accessibilityDefects(report).join(" "),/3 text contrast/);
 assert.deepEqual(accessibilityDefects({verified:true,contrastFailures:0,violations:[]}),[]);
});
test("rejects missing or unverified color audit",()=>assert.deepEqual(accessibilityDefects(null),["Accessibility audit unavailable"]));
