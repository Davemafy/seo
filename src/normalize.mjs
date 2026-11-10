#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { landingPath } from "./lib.mjs";

export function normalizeKnownImports(input) {
  // The source project uses @/components, never @components.
  // Correct this deterministic, verified alias drift without another model call.
  return input.replace(/(from\s+["'])@components\//g, "$1@/components/");
}
export function fixProject(root) {
  const path = join(resolve(root), landingPath);
  const before = readFileSync(path, "utf8");
  const after = normalizeKnownImports(before);
  if (after !== before) writeFileSync(path, after);
  return { path, changed: before !== after, replacements: (before.match(/from\s+["']@components\//g) || []).length };
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const i = process.argv.indexOf("--project");
  if (i < 0 || !process.argv[i + 1]) throw new Error("Usage: node src/normalize.mjs --project candidate");
  console.log(JSON.stringify(fixProject(process.argv[i + 1])));
}
