// Admin-only source coverage and health dashboard for the private marketing candidate feeds.
// No HTTP requests, no scraping, no background calls: figures reflect stored DB evidence only.
import { MARKETING_LANES, MARKETING_SOURCE_LANES, PRIVATE_MARKETING_SEED_IDS, type MarketingLane } from "@aihot/industry/source-coverage";
import type { AdminSourceCoverage, SourceCoverageEntry, SourceCoverageState } from "@aihot/contracts/admin";
import { sql } from "../db.ts";

interface Stored {
  id: string;
  name: string;
  kind: string;
  participation_mode: string;
  enabled: boolean;
  health: string;
  fail_count: number;
  interval_minutes: number;
  last_ok_at: Date | null;
  last_fetch_at: Date | null;
  next_fetch_at: Date | null;
  last_error: string | null;
  items_7d: number;
  run_status: string | null;
  run_started_at: Date | null;
  run_found: number | null;
  run_new: number | null;
}

/** A successful collection is not proof that a site is a trustworthy publisher. */
export function candidateState(row: Pick<Stored,
  "enabled" | "health" | "fail_count" | "interval_minutes" | "last_ok_at" | "last_fetch_at" | "next_fetch_at"
>, now: Date): SourceCoverageState {
  if (!row.enabled) return "paused";
  if (row.health === "failing" || row.fail_count >= 3) return "failing";
  if (!row.last_ok_at) return row.last_fetch_at ? "never_successful" : "not_tested";
  if (row.health === "degraded" || row.fail_count > 0) return "degraded";
  // Avoid mislabelling quiet but working feeds as failed; this only signals follow-up.
  if (now.getTime() - row.last_ok_at.getTime() > Math.max(24 * 60, row.interval_minutes * 6) * 60_000) return "stale";
  if (row.next_fetch_at && now.getTime() - row.next_fetch_at.getTime() > 60 * 60_000) return "overdue";
  return "observed_ok";
}

export async function sourceCoverage(): Promise<AdminSourceCoverage> {
  const now = new Date();
  const rows = await sql<Stored[]>`
    SELECT s.id, s.name, s.kind, s.participation_mode, s.enabled, s.health, s.fail_count,
           s.interval_minutes, s.last_ok_at, s.last_fetch_at, s.next_fetch_at,
           left(s.last_error, 320) AS last_error,
           (SELECT count(*)::int FROM articles a
             WHERE a.source_id = s.id AND a.discovered_at > now() - interval '7 days') AS items_7d,
           last_run.status AS run_status, last_run.started_at AS run_started_at,
           last_run.found_count AS run_found, last_run.new_count AS run_new
    FROM sources s
    LEFT JOIN LATERAL (
      SELECT fr.status, fr.started_at, fr.found_count, fr.new_count
      FROM fetch_runs fr WHERE fr.source_id = s.id ORDER BY fr.started_at DESC, fr.id DESC LIMIT 1
    ) last_run ON true
    WHERE s.id = ANY(${PRIVATE_MARKETING_SEED_IDS}::text[])
  `;
  const byId = new Map(rows.map(row => [row.id, row]));
  const entries: SourceCoverageEntry[] = PRIVATE_MARKETING_SEED_IDS.map(id => {
    const row = byId.get(id);
    const lanes = [...MARKETING_SOURCE_LANES[id as keyof typeof MARKETING_SOURCE_LANES]] as MarketingLane[];
    if (!row) {
      return {
        id, name: id, kind: id.startsWith("x-") ? "x_search" : "rss", lanes, state: "not_imported", health: null, enabled: false, isolated: null,
        items7d: 0, lastOkAt: null, lastFetchAt: null, lastRunAt: null,
        lastRunStatus: null, lastFound: null, lastNew: null, lastError: null,
      };
    }
    return {
      id, name: row.name, kind: row.kind, lanes, state: candidateState(row, now), health: row.health,
      enabled: row.enabled, isolated: row.participation_mode === "isolated",
      items7d: row.items_7d, lastOkAt: row.last_ok_at?.toISOString() ?? null,
      lastFetchAt: row.last_fetch_at?.toISOString() ?? null, lastRunAt: row.run_started_at?.toISOString() ?? null,
      lastRunStatus: row.run_status, lastFound: row.run_found, lastNew: row.run_new,
      lastError: row.last_error,
    };
  });
  const lanes = MARKETING_LANES.map(lane => {
    const subset = entries.filter(x => x.lanes.includes(lane.id));
    return {
      id: lane.id, title: lane.title, description: lane.description,
      expected: subset.length, imported: subset.filter(x => x.state !== "not_imported").length,
      observedOk: subset.filter(x => x.state === "observed_ok").length,
      needingAttention: subset.filter(x => ["failing", "never_successful", "stale", "overdue", "degraded"].includes(x.state)).length,
      items7d: subset.reduce((count, x) => count + x.items7d, 0),
    };
  });
  return {
    checkedAt: now.toISOString(), expected: entries.length,
    imported: entries.filter(x => x.state !== "not_imported").length,
    observedOk: entries.filter(x => x.state === "observed_ok").length,
    untested: entries.filter(x => ["not_imported", "not_tested", "never_successful"].includes(x.state)).length,
    unsafeModes: entries.filter(x => x.isolated === false).length,
    lanes, entries,
  };
}
