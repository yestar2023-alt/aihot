// Short, human-authored curated RSS. No fetched article body or thread reproduction.
import { SITE } from "@aihot/site";
import { escapeXml } from "../lib/text.ts";
import { siteUrl } from "./links.ts";
import { publicCuration } from "../admin/curation-release.ts";

export async function signalRss(): Promise<string> {
  const { items } = await publicCuration(30);
  const xml = items.map(item => {
    const source = `Original source: ${item.sourceName} — ${item.originalUrl}`;
    return `<item>
<title>${escapeXml(item.title)}</title>
<link>${escapeXml(item.originalUrl)}</link>
<guid isPermaLink="false">${escapeXml("signal:" + item.id + ":" + item.releasedAt)}</guid>
<description>${escapeXml(item.summary + "\n" + source)}</description>
<pubDate>${new Date(item.releasedAt).toUTCString()}</pubDate>
</item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(SITE.name + " — Signals")}</title>
<link>${escapeXml(siteUrl("/signals"))}</link>
<description>${escapeXml("Human-curated AI marketing workflows and resources with original source links.")}</description>
<language>en</language>
${xml}
</channel>
</rss>`;
}
