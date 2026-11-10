#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

export const SITES = Object.freeze([
  { id: "superhuman", name: "Superhuman", url: "https://superhuman.com/" },
  { id: "sunsama", name: "Sunsama", url: "https://www.sunsama.com/" },
  { id: "granola", name: "Granola", url: "https://www.granola.ai/" }
]);
export const VIEWPORT = Object.freeze({ width: 1440, height: 900 });

async function main() {
  const args = process.argv.slice(2);
  if (args[0] !== "--output" || !args[1]) throw new Error("Usage: node src/reference-capture.mjs --output refs");
  const dir = resolve(args[1]);
  mkdirSync(dir, { recursive: true });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const manifest = [];
  try {
    for (const site of SITES) {
      const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, colorScheme: "light" });
      const page = await ctx.newPage();
      try {
        const response = await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 45000 });
        if (!response?.ok()) throw new Error(site.id + ": HTTP " + response?.status());
        await page.waitForTimeout(2200);
        if (site.id === "sunsama" || site.id === "granola") {
          const name = site.id === "sunsama" ? /^decline$/i : /^reject all$/i;
          const reject = page.getByRole("button", { name });
          if (await reject.count()) await reject.first().click({ timeout: 1500 }).catch(() => {});
        }
        // Capture the real rendered opening viewport; do not fetch or copy branding assets.
        const destination = join(dir, site.id + "-hero.jpg");
        await page.screenshot({ path: destination, type: "jpeg", quality: 77, fullPage: false, animations: "disabled" });
        const info = await page.evaluate(() => ({
          title: document.title,
          h1: [...document.querySelectorAll("h1")].map(e => e.textContent.trim()).slice(0, 2),
          pageWidth: document.documentElement.scrollWidth
        }));
        manifest.push({
          id: site.id, url: page.url(), originalUrl: site.url,
          viewport: VIEWPORT, ...info, file: site.id + "-hero.jpg",
          sha256: createHash("sha256").update(readFileSync(destination)).digest("hex")
        });
        console.log("Reference captured: " + site.id + " (" + info.title + ")");
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
  if (manifest.length !== SITES.length) throw new Error("Some references failed");
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

if (process.argv[1]?.endsWith("reference-capture.mjs")) {
  main().catch(e => { console.error("Reference capture: " + e.message); process.exitCode = 1; });
}
