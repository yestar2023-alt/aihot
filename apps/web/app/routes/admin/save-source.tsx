import { useState } from "react";
import { Link } from "react-router";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/save-source";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Button, Card, Field, Input } from "../../features/admin/ui";

export const meta: Route.MetaFunction = () => [
  { title: `Save source · ${SITE.name} Admin` },
  { name: "robots", content: "noindex, nofollow" },
];
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
export default function SaveSource() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ kind: string; created: number; url: string } | null>(null);
  const { run, pending } = useAdminAction();
  return (
    <AdminPage title="Save a source" subtitle="Collect source URLs from X, GitHub and YouTube in a private research queue. No scraping, republishing, or automatic public release.">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card title="Add to the private inbox">
          <form className="space-y-4" onSubmit={async event => {
            event.preventDefault();
            setResult(null);
            const value = await run<{ kind: string; created: number; url: string }>(
              "POST", "/api/admin/bookmark", { url: url.trim() },
              { label: "save-source", success: "Link processed in the private research inbox.", revalidate: false }
            );
            if (value) setResult(value);
          }}>
            <Field label="Public source URL" hint="X status posts, GitHub repositories / issues / releases and YouTube watch / Shorts links. URL metadata only.">
              <Input type="url" autoComplete="off" required value={url} onChange={e=>setUrl(e.target.value)}
                placeholder="https://github.com/org/repo or https://www.youtube.com/watch?v=..." />
            </Field>
            <Button tone="primary" disabled={!url.trim()} busy={pending === "save-source"} type="submit">Save privately</Button>
          </form>
          {result && <div className="mt-4 rounded-card bg-bg-sunk p-3 text-[13px] text-ink-2" role="status">
            <strong>{result.created ? "Added to the private queue." : "Already saved or no new record created."}</strong>
            <p className="mt-1 break-all"><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-accent underline">{result.url}</a></p>
            <p className="mt-2">Source: {result.kind}. The author's text, upload time and claims have not been independently retrieved. An editor must verify the original before approving publication.</p>
          </div>}
        </Card>
        <Card title="What happens next">
          <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-[1.8] text-ink-2">
            <li>The canonical source link is saved under an isolated source ID.</li>
            <li>Open <Link to="/admin/curation" className="text-accent underline">Editorial Inbox</Link> to review it and add an evidence URL and your notes.</li>
            <li>Fact-check, approve, and then explicitly release an original summary on Signals. Nothing is published just because it was collected.</li>
          </ol>
        </Card>
      </div>
    </AdminPage>
  );
}
