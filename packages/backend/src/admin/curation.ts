// A private editorial review layer over collected materials. Approval is NOT a public release.
// Every transition is optimistic-versioned and audit-logged in the same transaction.
import { audit, Conflict } from "../audit.ts";
import { sql } from "../db.ts";

export const CURATION_STATES = ["inbox", "shortlisted", "fact_checked", "approved", "rejected"] as const;
export type CurationState = (typeof CURATION_STATES)[number];

export interface CurationRow {
  article_id: string;
  title: string;
  url: string;
  source_name: string;
  discovered_at: Date;
  published_at: Date | null;
  status: CurationState;
  note: string;
  evidence_url: string | null;
  version: number;
  updated_by: string | null;
  updated_at: Date | null;
}

const NEXT: Record<CurationState, readonly CurationState[]> = {
  inbox: ["shortlisted", "rejected"],
  shortlisted: ["inbox", "fact_checked", "rejected"],
  fact_checked: ["shortlisted", "approved", "rejected"],
  approved: ["shortlisted", "rejected"],
  rejected: ["inbox"],
};

export class CurationBadRequest extends Error {
  statusCode = 400;
}

function reviewState(value: unknown): CurationState {
  if (typeof value !== "string" || !CURATION_STATES.includes(value as CurationState)) {
    throw new CurationBadRequest("Unknown editorial review state.");
  }
  return value as CurationState;
}

function evidence(value: unknown): string | null {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) throw new CurationBadRequest("Evidence URL is too long or invalid.");
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port || !u.hostname.includes(".")) throw new Error();
    return u.toString();
  } catch { throw new CurationBadRequest("Evidence must be an HTTPS URL without credentials."); }
}

/** Narrow to isolated source material; even approved items have no public access via this API. */
export async function listCuration(status?: string): Promise<{ rows: CurationRow[]; counts: Record<string, number> }> {
  const selected = status === undefined || status === "all" ? null : reviewState(status);
  const [rows, counts] = await Promise.all([
    sql<CurationRow[]>`
      SELECT a.id AS article_id, a.title, a.url, s.name AS source_name, a.discovered_at, a.published_at,
             coalesce(r.status, 'inbox') AS status, coalesce(r.note, '') AS note, r.evidence_url,
             coalesce(r.version, 0) AS version, r.updated_by, r.updated_at
      FROM articles a JOIN sources s ON s.id = a.source_id
      LEFT JOIN curation_reviews r ON r.article_id = a.id
      WHERE s.participation_mode = 'isolated'
        AND (${selected}::text IS NULL OR coalesce(r.status, 'inbox') = ${selected})
      ORDER BY a.discovered_at DESC, a.id DESC LIMIT 50`,
    sql<{ status: string; count: number }[]>`
      SELECT coalesce(r.status, 'inbox') AS status, count(*)::int AS count
      FROM articles a JOIN sources s ON s.id = a.source_id
      LEFT JOIN curation_reviews r ON r.article_id = a.id
      WHERE s.participation_mode = 'isolated'
      GROUP BY 1`,
  ]);
  return { rows, counts: Object.fromEntries(counts.map(r => [r.status, r.count])) };
}

export async function updateCuration(id: string, input: {
  status: string; note?: unknown; evidenceUrl?: unknown; version?: unknown;
}, actor: string): Promise<{ articleId: string; status: CurationState; version: number; public: false } | null> {
  const target = reviewState(input.status);
  if (!Number.isInteger(input.version) || Number(input.version) < 0) {
    throw new CurationBadRequest("Expected the current review version.");
  }
  if (typeof input.note !== "string" || input.note.length > 2000) {
    throw new CurationBadRequest("Review notes must be text no longer than 2000 characters.");
  }
  const note = input.note.trim();
  const evidenceUrl = evidence(input.evidenceUrl);
  return sql.begin(async tx => {
    // Lock the article row; serializes two reviewers even before a review row has been inserted.
    const [article] = await tx<{ id: string; participation_mode: string }[]>`
      SELECT a.id, s.participation_mode FROM articles a JOIN sources s ON s.id = a.source_id
      WHERE a.id = ${id} FOR UPDATE OF a`;
    if (!article) return null;
    if (article.participation_mode !== "isolated") {
      throw new Conflict("This material is not in the private editorial inbox.");
    }
    const [before] = await tx<{ status: CurationState; version: number; note: string; evidence_url: string | null }[]>`
      SELECT status, version, note, evidence_url FROM curation_reviews WHERE article_id = ${id}`;
    const current = before?.status ?? "inbox";
    const version = before?.version ?? 0;
    if (version !== input.version) throw new Conflict("This review has changed; reload before editing.");
    if (!NEXT[current].includes(target)) {
      throw new CurationBadRequest(`Invalid review transition ${current} → ${target}.`);
    }
    const effectiveEvidence = evidenceUrl ?? before?.evidence_url ?? null;
    const effectiveNote = note || before?.note || "";
    if (target === "fact_checked" && (!effectiveEvidence || effectiveNote.length < 20)) {
      throw new CurationBadRequest("Fact checks need an evidence URL and at least 20 characters of review notes.");
    }
    if (target === "approved" && (!effectiveEvidence || effectiveNote.length < 20)) {
      throw new CurationBadRequest("Approval requires verified evidence and review notes.");
    }
    const [after] = await tx<{ version: number }[]>`
      INSERT INTO curation_reviews (article_id, status, note, evidence_url, updated_by, version)
      VALUES (${id}, ${target}, ${effectiveNote}, ${effectiveEvidence}, ${actor}, 1)
      ON CONFLICT (article_id) DO UPDATE SET
        status = EXCLUDED.status, note = EXCLUDED.note, evidence_url = EXCLUDED.evidence_url,
        updated_by = EXCLUDED.updated_by, updated_at = now(), version = curation_reviews.version + 1
      RETURNING version`;
    await audit(actor, "curation.transition", `content:${id}`, effectiveNote,
      { status: current, version, note: before?.note ?? "", evidenceUrl: before?.evidence_url ?? null },
      { status: target, version: after!.version, note: effectiveNote, evidenceUrl: effectiveEvidence, public: false },
      { db: tx });
    return { articleId: id, status: target, version: after!.version, public: false as const };
  });
}
