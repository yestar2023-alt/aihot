// A private source enters the newsroom as inbox, and every editorial transition is checked and audited.
// Approval intentionally does NOT create a public publication.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { tag } from "./setup.ts";
import { closeDb, sql } from "@aihot/backend/db";
import { listCuration, updateCuration } from "@aihot/backend/admin/curation";
import { Conflict } from "@aihot/backend/audit";

const id = `curation-${tag()}`;
const sourceId = `cur-source-${tag()}`;
const pubSourceId = `public-source-${tag()}`;
const publicId = `public-item-${tag()}`;
const date = new Date("2026-10-26T08:00:00Z");
after(closeDb);
before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode)
    VALUES (${sourceId}, 'Private candidates', 'external', 'T2', 'isolated'),
           (${pubSourceId}, 'Visible feed', 'rss', 'T2', 'editorial')`;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
    VALUES (${id}, ${sourceId}, ${id}, ${"https://x.com/test/status/1234567890123"}, 'Unverified X post', ${date}, ${date}),
           (${publicId}, ${pubSourceId}, ${publicId}, ${"https://example.com/public"}, 'Published source', ${date}, ${date})`;
});

test("isolated materials appear in the private inbox, public sources do not", async () => {
  const { rows, counts } = await listCuration("inbox");
  assert.equal(rows.find(row => row.article_id === id)?.version, 0);
  assert.equal(rows.some(row => row.article_id === publicId), false);
  assert.ok((counts.inbox ?? 0) >= 1);
});

test("enforces staged reviews, evidence and optimistic concurrency, without publishing", async () => {
  await assert.rejects(
    updateCuration(id, { status: "approved", version: 0, note: "skip", evidenceUrl: "https://example.com" }, "editor"),
    /Invalid review transition/,
  );
  const a = await updateCuration(id, { status: "shortlisted", version: 0, note: "Worth investigating", evidenceUrl: "" }, "editor");
  assert.deepEqual(a, { articleId: id, status: "shortlisted", version: 1, public: false });
  await assert.rejects(
    updateCuration(id, { status: "fact_checked", version: 1, note: "Unverified", evidenceUrl: "" }, "editor"),
    /Fact checks need/,
  );
  await assert.rejects(
    updateCuration(id, { status: "fact_checked", version: 0, note: "This is long enough to verify", evidenceUrl: "https://example.com/proof" }, "editor"),
    Conflict,
  );
  const b = await updateCuration(id, {
    status: "fact_checked", version: 1,
    note: "Verified the author's workflow and source constraints.", evidenceUrl: "https://example.com/evidence",
  }, "reviewer");
  assert.equal(b?.status, "fact_checked");
  assert.equal(b?.version, 2);
  const c = await updateCuration(id, {
    status: "approved", version: 2,
    note: "Verified the author's workflow and source constraints.", evidenceUrl: "https://example.com/evidence",
  }, "reviewer");
  assert.deepEqual(c, { articleId: id, status: "approved", version: 3, public: false });
  const [audit] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM audit_log WHERE subject = ${`content:${id}`} AND action = 'curation.transition'`;
  assert.equal(audit?.n, 3);
  const [{ exists }] = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (SELECT 1 FROM publications WHERE article_id = ${id}) AS exists`;
  assert.equal(exists, false);
  await assert.rejects(
    updateCuration(id, { status: "rejected", version: 2, note: "", evidenceUrl: "" }, "editor"),
    Conflict,
  );
  const d = await updateCuration(id, { status: "rejected", version: 3, note: "Retraction requested", evidenceUrl: "" }, "editor");
  assert.equal(d?.public, false);
  const reopened = await updateCuration(id, { status: "inbox", version: 4, note: "Reassess with new evidence", evidenceUrl: "" }, "editor");
  assert.equal(reopened?.status, "inbox");
});

test("reviewing a non-isolated public source is refused", async () => {
  await assert.rejects(updateCuration(publicId, { status: "shortlisted", version: 0, note: "No", evidenceUrl: "" }, "editor"), Conflict);
});

test("invalid evidence URLs and malformed versions are refused", async () => {
  await assert.rejects(updateCuration(id, { status: "shortlisted", version: -1, note: "", evidenceUrl: "" }, "editor"));
  await assert.rejects(updateCuration(id, { status: "shortlisted", version: 5, note: "", evidenceUrl: "http://localhost/proof" }, "editor"));
});
