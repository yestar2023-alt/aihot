import { useState } from "react";
import { Link } from "react-router";
import { SITE } from "@aihot/site";
import type { AdminCurationInbox, AdminCurationRow, CurationStatus } from "@aihot/contracts/admin";
import type { Route } from "./+types/curation";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Badge, Button, Card, Empty, Field, Input, Textarea } from "../../features/admin/ui";

const TABS: Array<{ key: CurationStatus | "all"; title: string }> = [
  { key: "inbox", title: "Inbox" },
  { key: "shortlisted", title: "Shortlisted" },
  { key: "fact_checked", title: "Fact-checked" },
  { key: "approved", title: "Ready (private)" },
  { key: "rejected", title: "Rejected" },
  { key: "all", title: "All" },
];
const NEXT: Record<CurationStatus, Array<{ status: CurationStatus; label: string }>> = {
  inbox: [{ status: "shortlisted", label: "Shortlist" }, { status: "rejected", label: "Reject" }],
  shortlisted: [{ status: "fact_checked", label: "Mark fact-checked" }, { status: "inbox", label: "Return to inbox" }, { status: "rejected", label: "Reject" }],
  fact_checked: [{ status: "approved", label: "Approve for draft queue" }, { status: "shortlisted", label: "Request more evidence" }, { status: "rejected", label: "Reject" }],
  approved: [{ status: "shortlisted", label: "Revoke approval" }, { status: "rejected", label: "Reject" }],
  rejected: [{ status: "inbox", label: "Reopen" }],
};

export async function loader({ request }: Route.LoaderArgs) {
  const status = new URL(request.url).searchParams.get("status") ?? "inbox";
  const inbox = await adminGet<AdminCurationInbox>(request, `/api/admin/curation?status=${encodeURIComponent(status)}`);
  return { ...inbox, status };
}
export const meta: Route.MetaFunction = () => [
  { title: `Editorial Inbox · ${SITE.name}` },
  { name: "robots", content: "noindex, nofollow" },
];
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });

function ReviewPanel({ row, onDone }: { row: AdminCurationRow; onDone: () => void }) {
  const [note, setNote] = useState(row.note);
  const [evidenceUrl, setEvidenceUrl] = useState(row.evidence_url ?? "");
  const { run, pending } = useAdminAction();
  return (
    <Card title={`Review: ${row.title}`}>
      <div className="space-y-4">
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          Current: <strong>{row.status}</strong> · v{row.version}. Review the original content and verify its claims before marking it fact-checked.
        </p>
        <Field label="Source evidence URL" hint="Required for fact-checking. Use an accessible original or primary evidence page, not just an AI summary.">
          <Input type="url" value={evidenceUrl} placeholder="https://..." onChange={e => setEvidenceUrl(e.target.value)} />
        </Field>
        <Field label="Editorial notes" hint="At least 20 characters for fact-checking and approval. Record which claims you checked, caveats and source rights.">
          <Textarea value={note} onChange={e => setNote(e.target.value)} rows={5} maxLength={2000} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {NEXT[row.status].map(next => (
            <Button key={next.status} busy={pending === next.status} disabled={!!pending} tone={next.status === "approved" || next.status === "fact_checked" ? "primary" : "secondary"} onClick={async () => {
              const result = await run("POST", `/api/admin/curation/${encodeURIComponent(row.article_id)}/review`,
                { status: next.status, note, evidenceUrl: evidenceUrl.trim(), version: row.version },
                { label: next.status, success: "Review saved privately." });
              if (result) onDone();
            }}>{next.label}</Button>
          ))}
          <Button tone="ghost" onClick={onDone}>Close</Button>
        </div>
        <p className="text-[12px] text-ink-3">Even “approved” items remain private. Public websites, RSS, API and newsletters do not use this approval yet.</p>
      </div>
    </Card>
  );
}

export default function EditorialInbox({ loaderData }: Route.ComponentProps) {
  const { rows, counts, status } = loaderData;
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = rows.find(r => r.article_id === chosen);
  return (
    <AdminPage title="Editorial Inbox" subtitle="Review imported X links and candidate marketing resources. This is a private newsroom; nothing here is auto-published.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <Link key={tab.key} to={tab.key === "inbox" ? "/admin/curation" : `/admin/curation?status=${tab.key}`}
              className={`rounded-control px-3 py-2 text-[13px] ring-1 ring-line ${status === tab.key ? "bg-ink text-bg" : "bg-surface text-ink-2"}`}>
              {tab.title} {tab.key === "all" ? "" : (`(${counts[tab.key] ?? 0})`)}
            </Link>
          ))}
        </div>
        {selected && <ReviewPanel key={selected.article_id + ":" + selected.version} row={selected} onDone={() => setChosen(null)} />}
        <Card title={`Candidate resources (${rows.length} shown)`}>
          {rows.length === 0 ? <Empty>No resources in this stage. <Link className="text-accent underline" to="/admin/save-x">Save a public X post</Link> to start an inbox.</Empty> : (
            <div className="space-y-3">
              {rows.map(row => (
                <article key={row.article_id} className="rounded-card border border-line p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{row.status}</Badge>
                    <span className="text-[12px] text-ink-3">{row.source_name}</span>
                    <span className="text-[12px] text-ink-4">{new Date(row.discovered_at).toLocaleDateString("en-US")}</span>
                  </div>
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="break-words text-[14px] font-semibold text-ink hover:text-accent">{row.title}</a>
                  {row.note && <p className="mt-1 text-[12.5px] text-ink-3 line-clamp-2">{row.note}</p>}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setChosen(row.article_id)}>Review</Button>
                    <Link to={`/admin/content?q=${encodeURIComponent(row.url)}`} className="px-2 py-1 text-[12.5px] text-accent underline">Inspect content</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
