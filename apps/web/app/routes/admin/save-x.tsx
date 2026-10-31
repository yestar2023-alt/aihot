import { useState } from "react";
import { Link } from "react-router";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/save-x";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Button, Card, Field, Input } from "../../features/admin/ui";

export const meta: Route.MetaFunction = () => [
  { title: `Save X Post · ${SITE.name} Admin` },
  { name: "robots", content: "noindex, nofollow" },
];
export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
});

export default function SaveXPost() {
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<{ url: string; created: number } | null>(null);
  const { run, pending } = useAdminAction();

  return (
    <AdminPage title="Save a useful X post" subtitle="Bookmark public X/Twitter posts for private review. Saving a link does not republish or scrape the original post.">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card title="Manual X bookmark">
          <form onSubmit={async (event) => {
            event.preventDefault();
            setSaved(null);
            const result = await run<{ url: string; created: number }>(
              "POST", "/api/admin/bookmark-x", { url: url.trim() },
              { label: "bookmark-x", success: "X link saved to private intake.", revalidate: false },
            );
            if (result) setSaved(result);
          }} className="space-y-4">
            <Field label="Public X post URL" hint="Supports https://x.com/handle/status/123... and Twitter's legacy links. Tracking parameters are removed.">
              <Input type="url" required value={url} onChange={event => setUrl(event.target.value)} placeholder="https://x.com/creator/status/1234567890123456789" />
            </Field>
            <Button type="submit" tone="primary" busy={pending === "bookmark-x"} disabled={!url.trim()}>
              Save link privately
            </Button>
          </form>
          {saved && (
            <div className="mt-4 rounded-card bg-bg-sunk p-3 text-[13px] text-ink-2" role="status">
              {saved.created > 0 ? "Saved to the private source." : "This link may already be stored."}
              <div className="mt-1 break-all"><a className="text-accent underline" href={saved.url} target="_blank" rel="noreferrer">{saved.url}</a></div>
              <div className="mt-2">The source post's text, date and claims have <strong>not</strong> been retrieved or independently checked. Nothing is published automatically.</div>
            </div>
          )}
        </Card>
        <Card title="Editorial flow">
          <p className="text-[13px] leading-relaxed text-ink-2">
            After saving, the item is recorded under the isolated source <code>manual-x-bookmarks</code>.
            Use <Link to="/admin/content" className="text-accent underline">Content diagnostics</Link> to find it by URL.
            A separate editorial approval gate will be required before shortlisted items appear publicly.
          </p>
        </Card>
      </div>
    </AdminPage>
  );
}
