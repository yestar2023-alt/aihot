import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { chromium, expect, type Browser } from "@playwright/test";
import { fakeApi, startWebServer, visit, type WebServer } from "./web-server.ts";

const api = fakeApi((url) => {
  if (url.pathname === "/api/site/signals") return { items: [] };
});
let web: WebServer; let browser: Browser;
before(async () => {
  web = await startWebServer(api);
  browser = await chromium.launch({ channel: "chromium" });
});
after(async () => { await browser?.close(); await web?.stop(); });

test("marketing homepage links to original-source content, guides and digest", async () => {
  const page = await browser.newPage();
  try {
    await visit(page, web.origin + "/");
    await expect(page.getByRole("heading", { name: /Less AI noise/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Playbooks for real marketing tasks/ })).toBeVisible();
    await expect(page.getByText("The first Signals are in editorial review.")).toBeVisible();
    await page.getByRole("link", { name: "Explore Playbooks" }).click();
    await expect(page.getByRole("heading", { name: /AI marketing work you can actually plan/ })).toBeVisible();
  } finally { await page.close(); }
});

test("playbook articles expose original references and explicitly disclaim testing", async () => {
  const page = await browser.newPage();
  try {
    await visit(page, web.origin + "/playbooks/weekly-ga4-report-with-human-review");
    await expect(page.getByRole("heading", { name: /Plan an automated weekly GA4 report/ })).toBeVisible();
    await expect(page.getByText(/not independently tested/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Google Analytics Data API: runReport/ })).toHaveAttribute("href", /^https:\/\/developers\.google\.com/);
    const title = await page.title();
    assert.match(title, /AI Marketer Signal/);
    await visit(page, web.origin + "/playbooks/not-a-real-guide");
    assert.equal((await page.locator("body").innerText()).includes("weekly GA4 report"), false);
  } finally { await page.close(); }
});

test("newsletter cannot collect emails before a provider is configured", async () => {
  const page = await browser.newPage();
  try {
    await visit(page, web.origin + "/newsletter");
    await expect(page.getByRole("heading", { name: /One useful AI marketing email/ })).toBeVisible();
    await expect(page.getByText(/subscription provider has not been connected/i)).toBeVisible();
    assert.equal(await page.getByRole("textbox", { name: /Email address/ }).count(), 0);
  } finally { await page.close(); }
});
