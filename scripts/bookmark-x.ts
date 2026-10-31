/**
 * Save a public X/Twitter post URL to the existing AIHOT external-ingest inbox.
 * Does NOT scrape X, invent post text or grant publication approval.
 * Usage: node --env-file-if-exists=.env scripts/bookmark-x.ts https://x.com/creator/status/1234567890123456789
 */
import { pathToFileURL } from "node:url";
import { parseXPostUrl } from "../packages/backend/src/ingest/x-bookmark.ts";
export { parseXPostUrl } from "../packages/backend/src/ingest/x-bookmark.ts";

export async function saveXBookmark(input: string, options: {
  ingestToken: string; baseUrl?: string; fetchImpl?: typeof fetch;
}): Promise<{ created: number }> {
  const { url, handle, postId } = parseXPostUrl(input);
  if (options.ingestToken.length < 16) throw new Error("INGEST_TOKEN must be set (at least 16 characters).");
  const base = new URL(options.baseUrl ?? "http://localhost:3000");
  if (base.username || base.password || base.search || base.hash) throw new Error("Invalid ingest base URL.");
  const loopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(base.hostname);
  if (base.protocol !== "https:" && !(base.protocol === "http:" && loopback)) {
    throw new Error("Use HTTPS for remote ingest endpoints; HTTP only for localhost.");
  }
  const endpoint = new URL("/api/ingest/items", base);
  const response = await (options.fetchImpl ?? fetch)(endpoint, {
    method: "POST",
    headers: { "Authorization": `Bearer ${options.ingestToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceId: "manual-x-bookmarks",
      sourceName: "Manual X bookmarks",
      items: [{ title: `X post by @${handle} (${postId}; content not retrieved)`, url }],
    }),
  });
  if (!response.ok) throw new Error(`Ingest failed with HTTP ${response.status}`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("created" in data) || typeof data.created !== "number") {
    throw new Error("Unexpected ingest response.");
  }
  return { created: data.created };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node --env-file-if-exists=.env scripts/bookmark-x.ts <x-post-url>");
    process.exitCode = 2;
  } else {
    saveXBookmark(url, { ingestToken: process.env.INGEST_TOKEN ?? "", baseUrl: process.env.INGEST_BASE_URL })
      .then(({ created }) => console.log(created ? "Bookmark stored privately." : "Already stored or not created."))
      .catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
  }
}
