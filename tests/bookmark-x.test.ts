import assert from "node:assert/strict";
import { test } from "node:test";
import { parseXPostUrl, saveXBookmark } from "../scripts/bookmark-x.ts";

test("canonicalizes X and legacy Twitter links while dropping tracking", () => {
  assert.deepEqual(parseXPostUrl("https://twitter.com/a_creator/status/1234567890123456789?s=20"), {
    url: "https://x.com/a_creator/status/1234567890123456789",
    handle: "a_creator", postId: "1234567890123456789",
  });
});

test("rejects non-post URLs, insecure URLs and foreign domains", () => {
  for (const bad of [
    "https://evil.example/user/status/12345678",
    "http://x.com/user/status/12345678",
    "https://x.com/user",
    "https://x.com/user/status/not-a-number",
    "https://x.com.evil.example/user/status/12345678",
  ]) {
    assert.throws(() => parseXPostUrl(bad));
  }
});

test("saves only the link with a clearly unverified placeholder title", async () => {
  let destination = "";
  let sent: unknown;
  let bearer = "";
  const request = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    destination = String(input);
    bearer = String(new Headers(init?.headers).get("Authorization"));
    sent = JSON.parse(String(init?.body));
    return Response.json({ ok: true, created: 1 });
  };
  const result = await saveXBookmark("https://x.com/demo/status/1234567890", {
    ingestToken: "1234567890abcdef",
    fetchImpl: request as typeof fetch,
  });
  assert.equal(destination, "http://localhost:3000/api/ingest/items");
  assert.equal(bearer, "Bearer 1234567890abcdef");
  assert.equal(result.created, 1);
  const payload = sent as { sourceId: string; items: Array<{ title: string; url: string }> };
  assert.equal(payload.sourceId, "manual-x-bookmarks");
  assert.equal(payload.items[0]?.url, "https://x.com/demo/status/1234567890");
  assert.match(payload.items[0]?.title ?? "", /content not retrieved/);
  assert.ok(!JSON.stringify(sent).includes("publishedAt"));
});

test("requires a token and protects remote HTTP transport", async () => {
  await assert.rejects(saveXBookmark("https://x.com/demo/status/1234567890", { ingestToken: "short" }));
  await assert.rejects(saveXBookmark("https://x.com/demo/status/1234567890", {
    ingestToken: "1234567890abcdef", baseUrl: "http://remote.example",
  }));
});
