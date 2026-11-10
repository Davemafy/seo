#!/usr/bin/env node
import { chromium } from "playwright";
import { strict as assert } from "node:assert";
const address = process.argv[2];
if (!address || !/^https?:\/\//.test(address)) throw new Error("Usage: node src/interactions.mjs http://127.0.0.1:3000");
const browser = await chromium.launch();
try {
  for (const [device, viewport] of Object.entries({
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
  })) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(address, { waitUntil: "domcontentloaded" });
    assert.equal(response?.status(), 200, device+" page response");
    const tabs = page.getByRole("tab");
    assert.equal(await tabs.count(), 6, device+" must have six accessible capability tabs");
    const panel = page.getByRole("tabpanel");
    assert.match(await panel.innerText(),/Smart Email Generator/,device+" initial panel");
    const taskTab = tabs.filter({hasText:"AI Task Planner"});
    await taskTab.click();
    assert.equal(await taskTab.getAttribute("aria-selected"),"true",device+" active state");
    assert.match(await panel.innerText(),/AI Task Planner/,device+" active panel changes");
    assert.doesNotMatch(await panel.innerText(),/Draft executive-quality emails/,device+" old panel removed");
    await tabs.filter({hasText:"Research Assistant"}).click();
    assert.match(await panel.innerText(),/Research Assistant/,device+" research panel");
    const faq = page.getByRole("button",{name:"Is my data private?"});
    await faq.click();
    assert.equal(await faq.getAttribute("aria-expanded"),"true",device+" FAQ should expand");
    assert.ok(await page.locator('a[href="/auth"]').count()>0,device+" auth links");
    assert.ok(await page.locator('a[href="/responsible-ai"]').count()>0,device+" responsible AI links");
    assert.equal(errors.length,0,device+" JavaScript errors");
    console.log(device+": tabs, FAQ, links, JS checks passed");
    await page.close();
  }
} finally {
  await browser.close();
}
