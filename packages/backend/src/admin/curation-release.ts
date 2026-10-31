// Explicit human release of a PRIVATE, evidence-reviewed signal.
// Released signals are read only through publicCuration() and never through legacy AIHOT publication projections.
import { audit, Conflict } from "../audit.ts";
import { sql } from "../db.ts";
import { CurationBadRequest } from "./curation.ts";

export interface PublicSignal {
  id: string;
  title: string;
  summary: string;
  originalUrl: string;
  originalTitle: string;
  sourceName: string;
  releasedAt: string;
  sourcePublishedAt: string | null;
}
export interface SignalFeed { items: PublicSignal[] }

interface ReleaseInput { reviewVersion?: unknown; title?: unknown; summary?: unknown }

function releaseCopy(input: ReleaseInput): { reviewVersion: number; title: string; summary: string } {
  if (!Number.isInteger(input.reviewVersion) || Number(input.reviewVersion) < 1) {
    throw new CurationBadRequest("Provide the current approved review version.");
  }
  if (typeof input.title !== "string" || input.title.trim().length < 15 || input.title.trim().length > 140) {
    throw new CurationBadRequest("Write an original English headline of 15–140 characters.");
  }
  if (typeof input.summary !== "string" || input.summary.trim().length < 80 || input.summary.trim().length > 700) {
    throw new CurationBadRequest("Write a sourced original commentary of 80–700 characters.");
  }
  return { reviewVersion: input.reviewVersion as number, title: input.title.trim(), summary: input.summary.trim() };
}

/** This is a publication operation, not the private `approved` review transition. */
export async function releaseCuration(id: string, data: ReleaseInput, actor: string) {
  const input = releaseCopy(data);
  return sql.begin(async tx => {
    const [row] = await tx<{ id: string; url: string; participation_mode: string; status: string | null; version: number | null; evidence_url: string | null }[]>`
      SELECT a.id, a.url, s.participation_mode, cr.status, cr.version, cr.evidence_url
      FROM articles a JOIN sources s ON s.id = a.source_id
      LEFT JOIN curation_reviews cr ON cr.article_id = a.id
      WHERE a.id = ${id} FOR UPDATE OF a`;
    if (!row) return null;
    if (row.participation_mode !== "isolated" || row.status !== "approved" || !row.evidence_url) {
      throw new Conflict("The source must remain isolated and its editorial review approved with evidence.");
    }
    if (row.version !== input.reviewVersion) throw new Conflict("Approval has changed; refresh before release.");
    const [previous] = await tx<{ status: string; review_version: number }[]>`
      SELECT status, review_version FROM curation_releases WHERE article_id = ${id} FOR UPDATE`;
    if (previous?.status === "published" && previous.review_version === input.reviewVersion) {
      throw new Conflict("Signal is already released. Withdraw and re-approve before updating.");
    }
    // A revised editorial approval must always be consciously re-released by the editor.
    const [after] = await tx<{ released_at: Date }[]>`
      INSERT INTO curation_releases (article_id, title, summary, review_version, status, updated_by)
      VALUES (${id}, ${input.title}, ${input.summary}, ${input.reviewVersion}, 'published', ${actor})
      ON CONFLICT (article_id) DO UPDATE SET
        title = excluded.title, summary = excluded.summary, review_version = excluded.review_version,
        status = 'published', released_at = now(), updated_at = now(), updated_by = excluded.updated_by
      RETURNING released_at`;
    await audit(actor, "curation.release", `content:${id}`, "Explicit signal release",
      previous ?? null, { status: "published", reviewVersion: input.reviewVersion, title: input.title, summary: input.summary },
      { db: tx });
    return { articleId: id, releasedAt: after!.released_at.toISOString(), public: true as const };
  });
}

/** Withdrawal remains possible after a review has been revoked; requires admin session and audit. */
export async function withdrawCuration(id: string, actor: string) {
  return sql.begin(async tx => {
    const [before] = await tx<{ status: string; title: string }[]>`
      SELECT status, title FROM curation_releases WHERE article_id = ${id} FOR UPDATE`;
    if (!before) return null;
    if (before.status === "withdrawn") throw new Conflict("This signal has already been withdrawn.");
    await tx`UPDATE curation_releases SET status = 'withdrawn', updated_at = now(), updated_by = ${actor}
      WHERE article_id = ${id}`;
    await audit(actor, "curation.withdraw", `content:${id}`, "Manual withdrawal",
      before, { status: "withdrawn" }, { db: tx });
    return { articleId: id, public: false as const };
  });
}

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
