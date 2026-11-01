import { Link } from "react-router";
import type { Route } from "./+types/briefs";
import type { AdminEditorialBriefs } from "@aihot/contracts/admin";
import { SITE } from "@aihot/site";
import { adminGet } from "../../lib/admin.server";
import { AdminPage, Badge, Card, Empty, Stat } from "../../features/admin/ui";

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<AdminEditorialBriefs>(request, "/api/admin/briefs");
}
export const meta: Route.MetaFunction=()=>[
  {title:`Playbook Briefs · ${SITE.name}`},
  {name:"robots",content:"noindex, nofollow"},
];
export const headers: Route.HeadersFunction=()=>({
  "Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow",
});
export default function EditorialBriefs({loaderData}:Route.ComponentProps) {
  const {rows}=loaderData;
  return <AdminPage title="Playbook Briefs" subtitle="Private writing briefs from reviewed source metadata. A brief is not a published article and cannot enter the public website or newsletter."
    actions={<Link className="text-[13px] font-medium text-accent underline" to="/admin/opportunities">Discover candidates →</Link>}>
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat label="Saved briefs" value={rows.length}/>
      <Stat label="Ready for editorial review" value={rows.filter(x=>x.status==="ready_for_review").length}/>
      <Stat label="Incomplete drafts" value={rows.filter(x=>x.status==="draft").length}/>
    </div>
    <Card title="Private brief queue">
      {rows.length===0 ? <Empty>No Playbook briefs yet. Find a source in <Link className="text-accent underline" to="/admin/opportunities">Opportunity Radar</Link> and create a brief to start.</Empty> :
        <div className="space-y-3">
          {rows.map(row=><article key={row.articleId} className="rounded-card border border-line p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{row.track}</Badge>
              <Badge tone={row.status==="ready_for_review"?"ok":"muted"}>{row.status.replaceAll("_"," ")}</Badge>
              <Badge>{row.reviewStatus} source review</Badge>
            </div>
            <h2 className="mt-2 text-[16px] font-semibold text-ink">
              <Link to={`/admin/briefs/${encodeURIComponent(row.articleId)}`} className="hover:text-accent">{row.title}</Link>
            </h2>
            <p className="mt-1 break-words text-[12px] text-ink-4">Original: {row.sourceName} · Updated {new Date(row.updatedAt).toLocaleDateString("en-US")}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
              <Link to={`/admin/briefs/${encodeURIComponent(row.articleId)}`} className="font-semibold text-accent underline">Continue writing →</Link>
              <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">Original source ↗</a>
            </div>
          </article>)}
        </div>}
    </Card>
    <p className="mt-5 text-[12px] leading-relaxed text-ink-4">Showing the 100 most recently edited private briefs. A “ready for review” label means the required editorial fields are filled, not that facts were independently verified.</p>
  </AdminPage>;
}
