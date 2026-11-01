import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSourceBookmark } from "@aihot/backend/ingest/bookmarks";

test("X, YouTube and GitHub URLs canonicalize without fetching any content", () => {
  assert.deepEqual(parseSourceBookmark("https://twitter.com/creator/status/1234567890123456?utm_source=test"), {
    kind: "x", canonicalUrl: "https://x.com/creator/status/1234567890123456",
    title: "X post by @creator (1234567890123456; content not retrieved)",
    sourceId: "manual-x-bookmarks", sourceName: "Manual X bookmarks",
  });
  const youtube = parseSourceBookmark("https://youtu.be/dQw4w9WgXcQ?t=41");
  assert.equal(youtube.canonicalUrl, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(youtube.sourceId, "manual-youtube-bookmarks");
  const github = parseSourceBookmark("https://github.com/n8n-io/n8n/releases/latest?utm_campaign=example");
  assert.equal(github.canonicalUrl, "https://github.com/n8n-io/n8n/releases/latest");
  assert.match(github.title, /not independently inspected/);
});

test("rejects arbitrary domains, private schemes and malformed public URLs", () => {
  const bad = [
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://github.com/owner",
    "https://github.com/owner/repo/tree/main/.env",
    "https://github.com/user:password@github.com/a/b",
    "https://www.youtube.com/watch?v=INVALID",
    "https://x.com/user/status/abc123",
    "https://youtu.be/dQw4w9WgXcQ#details",
    "ftp://github.com/a/b",
    "https://github.com/a/b/issues/notanumber",
  ];
  for (const url of bad) assert.throws(() => parseSourceBookmark(url), url);
});

test("source IDs are fixed isolated intake buckets, not user-supplied", () => {
  const bookmarks = [
    parseSourceBookmark("https://github.com/org/repo"),
    parseSourceBookmark("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    parseSourceBookmark("https://x.com/u/status/1234567890"),
  ];
  assert.deepEqual(bookmarks.map(b=>b.sourceId), [
    "manual-github-bookmarks", "manual-youtube-bookmarks", "manual-x-bookmarks",
  ]);
  assert.ok(bookmarks.every(b=>!b.canonicalUrl.includes("utm_")));
});
