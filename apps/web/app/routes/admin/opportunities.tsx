import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/opportunities";
import type { AdminOpportunityBoard, AdminEditorialOpportunity } from "@aihot/contracts/admin";
import { SITE } from "@aihot/site";
import { MARKETING_LANES } from "@aihot/industry/source-coverage";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Badge, Card, Stat, Button } from "../../features/admin/ui";

export async function loader({ request }: Route.LoaderArgs) {
  const u=new URL(request.url);
  const days=u.searchParams.get("days")==="30" ? "30" : "7";
  return adminGet<AdminOpportunityBoard>(request,`/api/admin/opportunities?days=${days}`);
}
export const meta: Route.MetaFunction=()=>[
  { title:`Opportunity Radar · ${SITE.name}` },{name:"robots",content:"noindex, nofollow"},
];
export const headers: Route.HeadersFunction=()=>({"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"});

function Opportunity({ lead }: { lead: AdminEditorialOpportunity }) {
  const [open,setOpen]=useState(false);
  const {run,pending}=useAdminAction();
  const representative=lead.sources[0];
  return <article className="rounded-panel border border-line bg-surface p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {lead.lanes.map(l=><Badge key={l} tone="info">{MARKETING_LANES.find(x=>x.id===l)?.title ?? l}</Badge>)}
        {lead.relatedCount>1 && <Badge tone="warn">{lead.relatedCount} potentially related items — not verified</Badge>}
      </div>
      <span className="text-[12px] font-medium text-ink-3">Editorial review priority {lead.reviewPriority}/10</span>
    </div>
    <h2 className="mt-4 text-[19px] font-semibold leading-snug text-ink">{lead.title}</h2>
    <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-ink-4">
      <span>{lead.distinctDomains} distinct linking domain(s)</span>
      <span>Found {new Date(lead.latestDiscoveredAt).toLocaleDateString("en-US")}</span>
      <span>State: {lead.reviewStatus}</span>
    </div>
    <div className="mt-3 rounded-control bg-bg-sunk p-3">
      <p className="text-[12px] font-semibold text-ink-2">Why it surfaced (heuristic signals, not evidence of results)</p>
      {lead.priorityReasons.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-[1.7] text-ink-3">
        {lead.priorityReasons.map(reason=><li key={reason}>{reason}</li>)}
      </ul> : <p className="mt-1 text-[12px] text-ink-3">Relevant recent source metadata. No particular performance evidence detected.</p>}
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
      <a href={representative.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-accent underline">View original source</a>
      <button className="text-[13px] font-medium text-accent underline" onClick={()=>setOpen(!open)} type="button">
        {open?"Hide sources":"Show all source links"}
      </button>
      {representative.reviewStatus==="inbox" && <Button size="sm" disabled={!!pending} busy={pending==="shortlist:"+lead.key} onClick={()=>run(
        "POST", `/api/admin/curation/${encodeURIComponent(representative.id)}/review`,
        {status:"shortlisted",version:representative.reviewVersion,note:"Editorial triage from Opportunity Radar. Original source, claim details, rights and any related coverage still require manual fact-checking.",evidenceUrl:""},
        {label:"shortlist:"+lead.key,success:"Candidate shortlisted privately; no publication performed."},
      )}>Shortlist for review</Button>}
      <Link to={`/admin/content?q=${encodeURIComponent(representative.url)}`} className="text-[13px] text-accent underline">Inspect item</Link>
    </div>
    {open && <div className="mt-4 border-t border-line pt-3">
      <p className="text-[12px] font-semibold text-ink-2">Possible related coverage — verify creator, dates and independence yourself</p>
      <ul className="mt-2 space-y-3">
        {lead.sources.map(item=><li key={item.id} className="text-[13px] leading-relaxed text-ink-3">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="break-words text-accent underline">{item.title}</a>
          <span className="ml-2">· {item.sourceName} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US") : "Original publication date unknown"}</span>
        </li>)}
      </ul>
    </div>}
  </article>;
}
export default function OpportunityRadar({ loaderData }: Route.ComponentProps) {
  const [params]=useSearchParams();
  const navigate=useNavigate();
  const [lane,setLane]=useState("all");
  const [onlyActionable,setOnlyActionable]=useState(false);
  const view=useMemo(()=>loaderData.leads.filter(x=>
    (lane==="all" || x.lanes.includes(lane)) && (!onlyActionable || x.reviewPriority>=6)
  ),[loaderData.leads,lane,onlyActionable]);
  return <AdminPage title="Opportunity Radar" subtitle="Private, explainable editorial leads from captured source metadata. Not a measure of search volume or proven trends."
    actions={<div className="flex gap-2">
      <Link to="/admin/source-coverage" className="rounded-control px-3 py-2 text-[13px] text-accent ring-1 ring-line">Source health →</Link>
      <Link to="/admin/curation" className="rounded-control px-3 py-2 text-[13px] text-accent ring-1 ring-line">Editorial Inbox →</Link>
    </div>}
  >
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Items in window" value={loaderData.totalCandidates} />
      <Stat label="Potential topic groups" value={loaderData.displayed} />
      <Stat label="Review priority ≥6" value={loaderData.leads.filter(x=>x.reviewPriority>=6).length} />
      <Stat label="Multi-source groupings" value={loaderData.leads.filter(x=>x.relatedCount>1).length} />
    </div>
    <div className="my-6 flex flex-wrap items-center gap-3">
      <label className="text-[13px] font-medium text-ink-2">Discovery window</label>
      <select aria-label="Discovery window" value={String(loaderData.lookbackDays)} onChange={e=>navigate(`?days=${e.target.value}`)}
        className="rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-ink">
        <option value="7">Last 7 days</option><option value="30">Last 30 days</option>
      </select>
      <label className="text-[13px] font-medium text-ink-2">Marketing domain</label>
      <select aria-label="Marketing domain" value={lane} onChange={e=>setLane(e.target.value)}
        className="rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-ink">
        <option value="all">All domains</option>{MARKETING_LANES.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}
      </select>
      <label className="flex items-center gap-2 text-[13px] text-ink-2">
        <input type="checkbox" checked={onlyActionable} onChange={e=>setOnlyActionable(e.target.checked)} />
        Priority ≥6 only
      </label>
    </div>
    <div className="mb-5 rounded-control bg-bg-sunk p-4 text-[12px] leading-[1.8] text-ink-3">
      {loaderData.methodology} Similar headlines can be syndicated, promotional or coincidental. Any source may be inaccurate.
      Shortlisting records an internal editorial task only; it does not approve, publish or send emails.
    </div>
    {view.length===0 ? <Card title="No matching candidates">
      <p className="text-[14px] text-ink-3">No relevant private items have been collected in this period. Check imported feed health or try 30 days. Disabled X presets do not produce live records.</p>
      <Link to="/admin/source-coverage" className="mt-3 inline-block text-[13px] text-accent underline">Inspect source health →</Link>
    </Card> : <div className="grid gap-4 lg:grid-cols-2">
      {view.map(lead=><Opportunity key={lead.key} lead={lead}/>)}
    </div>}
    <p className="mt-8 text-[12px] text-ink-4">Generated {new Date(loaderData.generatedAt).toLocaleString("en-US")}. This board displays up to 100 groups from 500 recent private rows; it is not an exhaustive external web search.</p>
  </AdminPage>;
}
