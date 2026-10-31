// Public read projection for explicitly released Signals, separate from AIHOT auto-news.
import type { SignalFeed } from "@aihot/contracts/signals";
import { sql } from "../db.ts";

/** The only curation public read. Legacy articles are deliberately NOT projected into it.
 * Re-check review status, version and private-source status on every query; withdrawal revokes immediately at DB level.
 */
export async function publicCuration(limit = 30): Promise<SignalFeed> {
  const rows = await sql<Array<{
    id: string; title: string; summary: string; url: string;
    original_title: string; source_name: string; released_at: Date; source_published_at: Date | null;
  }>>`
    SELECT a.id, rel.title, rel.summary, a.url, a.title AS original_title,
           s.name AS source_name, rel.released_at, a.published_at AS source_published_at
    FROM curation_releases rel
    JOIN curation_reviews review ON review.article_id = rel.article_id
    JOIN articles a ON a.id = rel.article_id
    JOIN sources s ON s.id = a.source_id
    WHERE rel.status = 'published'
      AND review.status = 'approved' AND review.version = rel.review_version
      AND review.evidence_url IS NOT NULL
      AND s.participation_mode = 'isolated' AND s.enabled
    ORDER BY rel.released_at DESC, a.id DESC
    LIMIT ${Math.min(Math.max(1, limit), 50)}`;
  return { items: rows.map(row => ({
    id: row.id, title: row.title, summary: row.summary, originalUrl: row.url,
    originalTitle: row.original_title, sourceName: row.source_name,
    releasedAt: row.released_at.toISOString(), sourcePublishedAt: row.source_published_at?.toISOString() ?? null,
  })) };
}
