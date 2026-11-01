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

test("maker homepage links to Build Grow Automate guides and digest", async () => {
  const page = await browser.newPage();
  try {
    await visit(page, web.origin + "/");
    await expect(page.getByRole("heading", { name: /Build. Grow./ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Guides for real work/ })).toBeVisible();
    await expect(page.getByText("The first Signals are in editorial review.")).toBeVisible();
    await page.getByRole("link", { name: "Explore Playbooks" }).click();
    await expect(page.getByRole("heading", { name: /Build. Grow. Automate./ })).toBeVisible();
    await page.getByRole("link", { name: /Build \(1\)/ }).click();
    await expect(page.getByRole("heading", { name: /Ship a small AI-assisted website/ })).toBeVisible();
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
    assert.match(title, /AI Workflow Fieldbook/);
    await visit(page, web.origin + "/playbooks/not-a-real-guide");
    assert.equal((await page.locator("body").innerText()).includes("weekly GA4 report"), false);
  } finally { await page.close(); }
});

test("Build, Grow and Automate have dedicated landing pages and preserve evidence caveats", async () => {
  const page = await browser.newPage();
  try {
    for (const track of ["build", "grow", "automate"]) {
      await visit(page, web.origin + "/workflows/" + track);
      await expect(page.getByRole("navigation", { name: "Workflow categories" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Start with a practical guide" })).toBeVisible();
      await expect(page.getByText(/Documentation-based starters, not claimed hands-on test results/)).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", web.origin + "/workflows/" + track);
      await expect(page.getByRole("link", { name: "Read guide" }).first()).toBeVisible();
    }
    await visit(page, web.origin + "/workflows/unexpected");
    await expect(page.getByText(/Workflow category not found|404|not found/i).first()).toBeVisible();
  } finally { await page.close(); }
});

test("newsletter cannot collect emails before a provider is configured", async () => {
  const page = await browser.newPage();
  try {
    await visit(page, web.origin + "/newsletter");
    await expect(page.getByRole("heading", { name: /Useful AI workflows/ })).toBeVisible();
    await expect(page.getByText(/subscription provider has not been connected/i)).toBeVisible();
    assert.equal(await page.getByRole("textbox", { name: /Email address/ }).count(), 0);
  } finally { await page.close(); }
});
