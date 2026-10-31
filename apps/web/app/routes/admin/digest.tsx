import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/digest";
import type { SignalFeed } from "@aihot/contracts/signals";
import { PLAYBOOKS } from "../../content/playbooks";
import { apiGet } from "../../lib/api.server";
import { AdminPage, Card, Button, Textarea } from "../../features/admin/ui";

export const meta: Route.MetaFunction = () => [
  { title: "Digest draft · AI Marketer Signal Admin" },
  { name: "robots", content: "noindex, nofollow" },
];
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
export async function loader({ request }: Route.LoaderArgs) {
  const feed = await apiGet<SignalFeed>("/api/site/signals", { signal: request.signal });
  return { feed };
}
function initialDigest(feed: SignalFeed): string {
  const lines = [
    "# The Signal Digest — EDITORIAL DRAFT",
    "",
    "This is a working draft, not a sent email. Check dates, facts, source links, and permissions before sending.",
    "",
    "## What is worth your time",
    "",
    ...(feed.items.length ? feed.items.slice(0, 5).flatMap((s, i) => [
      `${i+1}. **${s.title}**`,
      `   ${s.summary}`,
      `   Original: ${s.originalUrl}`,
      "",
    ]) : ["No Signals have been explicitly released yet. Do not invent any updates.", ""]),
    "## One workflow to try",
    "",
    ...PLAYBOOKS.slice(0, 2).flatMap(p => [
      `- **${p.title}** — ${p.description}`,
      `  Playbook: /playbooks/${p.slug}`,
      `  Verification: ${p.verification}.`,
      "",
    ]),
    "## Editorial sign-off",
    "",
    "- [ ] Reopened the original sources and checked facts and dates",
    "- [ ] Verified all public URLs and permissions",
    "- [ ] Removed anything that is sponsored without clear disclosure",
    "- [ ] Confirmed the email subject, sender and consented subscriber list",
    "- [ ] Checked unsubscribe and provider confirmation flows",
  ];
  return lines.join("\n");
}
export default function DigestDraft({ loaderData }: Route.ComponentProps) {
  const suggested = useMemo(() => initialDigest(loaderData.feed), [loaderData.feed]);
  const [draft, setDraft] = useState(suggested);
  const [showTemplate, setShowTemplate] = useState(false);
  return (
    <AdminPage title="The Signal Digest — draft desk" subtitle="Prepare an editor-reviewed newsletter from already released Signals and Playbooks. No messages are sent from this page.">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card title="Draft Markdown (editable)">
          <p className="mb-4 text-[13px] leading-[1.8] text-ink-3">Only explicitly released signals appear here. The Playbooks are links to source-led guides. Verify and edit every statement before using your email provider. This tool does not store drafts remotely or create subscribers.</p>
          <Textarea rows={20} value={draft} onChange={e => setDraft(e.target.value)} className="font-mono text-[12px] leading-[1.6]" aria-label="Newsletter draft markdown"/>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { setDraft(suggested); setShowTemplate(false); }} tone="secondary">Reset from live releases</Button>
            <Button onClick={() => setShowTemplate(!showTemplate)} tone="ghost">{showTemplate ? "Hide" : "Show"} editorial checklist</Button>
          </div>
          {showTemplate && <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">Copy the approved draft into a connected newsletter provider only after checking attribution, sources, consent, frequency and the provider's unsubscribe flow. The public <Link to="/newsletter" className="text-accent underline">newsletter page</Link> must have a real provider username before accepting email subscriptions.</p>}
        </Card>
        <Card title="Readiness">
          <p className="text-[13px] leading-[1.8] text-ink-2">Released Signals available: <strong>{loaderData.feed.items.length}</strong>. The editor must decide the final selection and send manually through a verified provider; no auto-send or fake delivery metrics are enabled.</p>
          <p className="mt-3 text-[13px] text-ink-3">Sources are linked in <Link className="text-accent underline" to="/admin/curation">Editorial Inbox</Link>, and public releases can be reviewed on <Link className="text-accent underline" to="/signals">Signals</Link>.</p>
        </Card>
      </div>
    </AdminPage>
  );
}
