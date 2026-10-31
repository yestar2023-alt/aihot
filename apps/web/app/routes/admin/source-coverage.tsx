import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/source-coverage";
import type { AdminSourceCoverage, AdminSourcePreview, SourceCoverageEntry, SourceCoverageState } from "@aihot/contracts/admin";
import { useAdminAction } from "../../features/admin/action";
import { SITE } from "@aihot/site";
import { adminGet } from "../../lib/admin.server";
import { AdminPage, Badge, Card, Stat } from "../../features/admin/ui";

const STATE: Record<SourceCoverageState, { label: string; tone: "muted" | "warn" | "bad" | "ok" | "info" }> = {
  not_imported: { label: "Not imported", tone: "muted" },
  not_tested: { label: "Never fetched", tone: "muted" },
  never_successful: { label: "No successful run", tone: "bad" },
  paused: { label: "Paused", tone: "muted" },
  failing: { label: "Failing", tone: "bad" },
  degraded: { label: "Degraded", tone: "warn" },
  stale: { label: "Stale", tone: "warn" },
  overdue: { label: "Overdue", tone: "warn" },
  observed_ok: { label: "Recent success", tone: "ok" },
};
const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "No recorded success";

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<AdminSourceCoverage>(request, "/api/admin/source-coverage");
}
export const meta: Route.MetaFunction = () => [{ title: `Source coverage · ${SITE.name}` }, { name: "robots", content: "noindex, nofollow" }];
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });

function SourceCard({ entry }: { entry: SourceCoverageEntry }) {
  const state = STATE[entry.state];
  const [preview, setPreview] = useState<AdminSourcePreview | null>(null);
  const { run, pending } = useAdminAction();
  return <article className="rounded-card border border-line bg-surface p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-[14px] font-semibold text-ink">{entry.name}</h3>
        <p className="mt-1 text-[11px] text-ink-4">{entry.kind === "x_search" ? "X keyword search · disabled by default; provider access and costs required" : "RSS/Atom source"}</p>
        <p className="mt-0.5 break-all font-mono text-[11px] text-ink-4">{entry.id}</p>
      </div>
      <Badge tone={state.tone}>{state.label}</Badge>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {entry.lanes.map(l => <Badge key={l} tone="info">{l}</Badge>)}
      {entry.isolated === false && <Badge tone="bad">Public-mode configuration — investigate</Badge>}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-ink-3">
      <div><span className="text-ink-4">Last successful fetch</span><p className="mt-1 text-ink-2">{fmt(entry.lastOkAt)}</p></div>
      <div><span className="text-ink-4">Items discovered / 7d</span><p className="mt-1 text-ink-2">{entry.items7d}</p></div>
      <div><span className="text-ink-4">Latest run status</span><p className="mt-1 text-ink-2">{entry.lastRunStatus ?? "No run yet"}</p></div>
      <div><span className="text-ink-4">Latest run: found / new</span><p className="mt-1 text-ink-2">{entry.lastFound ?? "—"} / {entry.lastNew ?? "—"}</p></div>
    </div>
    {entry.lastError && <p className="mt-3 break-words rounded-control bg-hot-soft p-2 text-[12px] text-hot">{entry.lastError}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      {entry.state !== "not_imported" ? <>
        <Link to={`/admin/sources/${encodeURIComponent(entry.id)}`} className="text-[13px] font-medium text-accent hover:underline">Details →</Link>
        {entry.kind === "rss" && <button type="button" disabled={!!pending} onClick={async () => {
          setPreview(null);
          const result = await run<AdminSourcePreview>("POST",
            `/api/admin/sources/${encodeURIComponent(entry.id)}/preview`, undefined,
            { label: "preview:" + entry.id, revalidate: false });
          if (result) setPreview(result);
        }} className="text-[13px] font-medium text-accent underline disabled:opacity-50">
          {pending ? "Checking live feed…" : "Preview live feed (no import)"}
        </button>}
      </> : <Link to="/admin/sources/new" className="text-[13px] font-medium text-accent hover:underline">Open private source setup →</Link>}
    </div>
    {preview && <div className="mt-3 rounded-control bg-bg-sunk p-3 text-[12px] text-ink-2" role="status">
      <p className="font-semibold">Preview: {preview.count} parsed items in {preview.ms} ms. No rows saved.</p>
      {preview.count === 0 && <p className="mt-1">Empty preview: check the original feed and filters manually.</p>}
      <ul className="mt-2 space-y-2">
        {preview.items.slice(0,3).map(item => <li key={item.url} className="break-words">
          <a target="_blank" rel="noopener noreferrer" className="text-accent underline" href={item.url}>{item.title}</a>
          <span className="ml-2 text-ink-4">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US") : "Date unverified"}</span>
        </li>)}
      </ul>
    </div>}
  </article>;
}
export default function SourceCoveragePage({ loaderData }: Route.ComponentProps) {
  const { lanes, entries, checkedAt, expected, imported, observedOk, untested, unsafeModes } = loaderData;
  const [lane, setLane] = useState("all");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const visible = useMemo(() => entries.filter(e =>
    (lane === "all" || e.lanes.includes(lane)) && (!onlyIssues || e.state !== "observed_ok")
  ), [entries, lane, onlyIssues]);
  return <AdminPage title="Source Radar · Domain Coverage"
    subtitle="A live database view of candidate feeds across 10 marketing disciplines. Configured does not mean the source has fetched successfully, and a successful fetch is not editorial verification."
    actions={<Link to="/admin/sources" className="rounded-control px-3 py-2 text-[13px] font-semibold text-accent ring-1 ring-line">All source settings →</Link>}
  >
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Stat label="Seeded source candidates" value={expected} />
      <Stat label="Imported to DB" value={imported} />
      <Stat label="Recently healthy" value={observedOk} tone={observedOk ? "ok" : undefined} />
      <Stat label="Missing / unverified" value={untested} tone={untested ? "warn" : undefined} />
      <Stat label="Unsafe source modes" value={unsafeModes} tone={unsafeModes ? "bad" : "ok"} />
    </div>
    <p className="mt-3 text-[12px] text-ink-4">Calculated at {new Date(checkedAt).toLocaleString("en-US")}. All counts come from stored runs, not assumed connectivity. Source collection and LLM budgets remain controlled separately.</p>
    <h2 className="mb-4 mt-9 text-[20px] font-semibold text-ink">Coverage by marketing job</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lanes.map(l => <button key={l.id} type="button" onClick={() => { setLane(lane === l.id ? "all" : l.id); }}
        aria-pressed={lane === l.id} className={`rounded-panel p-4 text-left ring-1 transition-colors ${lane === l.id ? "bg-accent-soft ring-accent/35" : "bg-surface ring-line hover:bg-bg-sunk"}`}>
        <div className="text-[14px] font-semibold text-ink">{l.title}</div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{l.description}</p>
        <p className="mt-3 text-[13px] text-ink-2">{l.imported}/{l.expected} imported · {l.observedOk} recent success</p>
        <p className="mt-1 text-[12px] text-ink-4">{l.needingAttention} issues · {l.items7d} collected / 7d</p>
      </button>)}
    </div>
    <div className="mb-4 mt-9 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[20px] font-semibold text-ink">Sources ({visible.length})</h2>
      <div className="flex flex-wrap items-center gap-3">
        {lane !== "all" && <button onClick={() => setLane("all")} className="text-[13px] text-accent underline">Clear lane</button>}
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={onlyIssues} onChange={e => setOnlyIssues(e.target.checked)} />
          Show only sources needing review
        </label>
      </div>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      {visible.map(e => <SourceCard key={e.id} entry={e} />)}
    </div>
    <Card title="What this dashboard does not claim" className="mt-8">
      <p className="text-[13px] leading-[1.9] text-ink-3">
        These are 22 private RSS/Atom candidate feeds. Real-time X keyword search, video transcription, GitHub discovery and Reddit monitoring are separate integrations and are not represented as running here. Preview feeds one at a time, review URL/title/date quality, and keep full-text publication disabled without a verified license.
      </p>
    </Card>
  </AdminPage>;
}
