import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { tag } from "./setup.ts";
import { closeDb, sql } from "@aihot/backend/db";
import { updateCuration } from "@aihot/backend/admin/curation";
import { releaseCuration, withdrawCuration } from "@aihot/backend/admin/curation-release";
import { publicCuration } from "@aihot/backend/publication/curation";
import { signalRss } from "@aihot/backend/publication/curation-feed";
import { Conflict } from "@aihot/backend/audit";
import { buildApp } from "../apps/api/src/app.ts";

const suffix = tag();
const source = `private-signal-${suffix}`;
const id = `signal-${suffix}`;
const url = `https://x.com/reporter/status/123456789987654321`;
const factNote = "Verified the original author's tutorial URL, visible steps, and API permissions. Commercial use remains unverified.";
const headline = "An n8n workflow that helps marketers assemble a weekly report";
const summary = "This workflow combines data collection and a human review step into a reusable draft. The original post describes its configuration, but no independent performance improvement has been verified.";
const app = await buildApp();
before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode)
    VALUES (${source}, 'Private X source', 'external', 'T2', 'isolated')`;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
    VALUES (${id}, ${source}, ${id}, ${url}, 'Unverified original', now(), now())`;
});
after(async () => { await app.close(); await closeDb(); });

test("review alone never creates a public signal or RSS entry", async () => {
  await updateCuration(id, { status: "shortlisted", version: 0, note: "Needs review", evidenceUrl: "" }, "editor");
  await updateCuration(id, { status: "fact_checked", version: 1, note: factNote, evidenceUrl: url }, "editor");
  await updateCuration(id, { status: "approved", version: 2, note: factNote, evidenceUrl: url }, "editor");
  assert.ok(!(await publicCuration()).items.some(x => x.id === id));
  assert.ok(!(await signalRss()).includes(headline));
  const api = await app.inject("/api/site/signals");
  assert.equal(api.statusCode, 200);
  assert.equal(api.json().items.some((x: { id: string }) => x.id === id), false);
  assert.ok(!(await app.inject("/feed/signals.xml")).body.includes(headline));
});

test("release must follow current approval and includes only human copy", async () => {
  await assert.rejects(releaseCuration(id, { reviewVersion: 2, title: headline, summary }, "editor"), Conflict);
  await assert.rejects(releaseCuration(id, { reviewVersion: 3, title: "short", summary }, "editor"), /15/);
  const published = await releaseCuration(id, { reviewVersion: 3, title: headline, summary }, "editor");
  assert.equal(published?.public, true);
  const listed = (await publicCuration()).items.find(x => x.id === id);
  assert.equal(listed?.summary, summary);
  assert.equal(listed?.originalUrl, url);
  assert.equal(listed?.title, headline);
  assert.ok(!(await signalRss()).includes("Unverified original</title>"));
  assert.ok((await signalRss()).includes("Original source:"));
  assert.ok((await app.inject("/feed/signals.xml")).body.includes("weekly report"));
  const [audit] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM audit_log WHERE subject = ${`content:${id}`} AND action='curation.release'`;
  assert.equal(audit?.n, 1);
});

test("changing review version revokes public access automatically; explicit re-release is required", async () => {
  await updateCuration(id, { status: "shortlisted", version: 3, note: "Re-check license", evidenceUrl: url }, "editor");
  assert.equal((await publicCuration()).items.some(x => x.id === id), false);
  assert.equal((await app.inject("/api/site/signals")).json().items.some((x: { id: string }) => x.id === id), false);
  await updateCuration(id, { status: "fact_checked", version: 4, note: factNote, evidenceUrl: url }, "editor");
  await updateCuration(id, { status: "approved", version: 5, note: factNote, evidenceUrl: url }, "editor");
  assert.equal((await publicCuration()).items.some(x => x.id === id), false);
  await releaseCuration(id, { reviewVersion: 6, title: headline, summary }, "editor");
  assert.equal((await publicCuration()).items.some(x => x.id === id), true);
});

test("source pause and manual withdrawal remove signal from all new public reads", async () => {
  await sql`UPDATE sources SET enabled = false WHERE id = ${source}`;
  assert.equal((await publicCuration()).items.some(x => x.id === id), false);
  await sql`UPDATE sources SET enabled = true WHERE id = ${source}`;
  assert.equal((await publicCuration()).items.some(x => x.id === id), true);
  const withdrawn = await withdrawCuration(id, "editor");
  assert.equal(withdrawn?.public, false);
  assert.equal((await publicCuration()).items.some(x => x.id === id), false);
  assert.ok(!(await signalRss()).includes(headline));
  assert.equal((await app.inject("/api/site/signals")).json().items.some((x: { id: string }) => x.id === id), false);
  await assert.rejects(withdrawCuration(id, "editor"), Conflict);
  const [audit] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM audit_log WHERE subject = ${`content:${id}`} AND action='curation.withdraw'`;
  assert.equal(audit?.n, 1);
});
