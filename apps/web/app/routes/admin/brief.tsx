import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/brief";
import type { AdminEditorialBrief, EditorialBriefTrack, EditorialBriefStatus } from "@aihot/contracts/admin";
import { SITE } from "@aihot/site";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Badge, Button, Card, Field, Input, Textarea } from "../../features/admin/ui";

export async function loader({request,params}:Route.LoaderArgs) {
  return adminGet<AdminEditorialBrief>(request,`/api/admin/briefs/${encodeURIComponent(params.id!)}`);
}
export const meta: Route.MetaFunction=()=>[
  {title:`Edit Playbook Brief · ${SITE.name}`},{name:"robots",content:"noindex, nofollow"},
];
export const headers: Route.HeadersFunction=()=>({
  "Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow",
});
export default function BriefEditor({loaderData}:Route.ComponentProps) {
  const source=loaderData;
  const [track,setTrack]=useState<EditorialBriefTrack>(source.track);
  const [title,setTitle]=useState(source.title);
  const [userJob,setUserJob]=useState(source.userJob);
  const [intendedReader,setIntendedReader]=useState(source.intendedReader);
  const [prerequisites,setPrerequisites]=useState(source.prerequisites);
  const [stepsOutline,setStepsOutline]=useState(source.stepsOutline);
  const [evidenceNotes,setEvidenceNotes]=useState(source.evidenceNotes);
  const [limitations,setLimitations]=useState(source.limitations);
  const [validationPlan,setValidationPlan]=useState(source.validationPlan);
  const [status,setStatus]=useState<EditorialBriefStatus>(source.status);
  const {run,pending}=useAdminAction();
  const save=async()=>{
    const response=await run("PATCH",`/api/admin/briefs/${encodeURIComponent(source.articleId)}`,{
      version:source.version,track,title,userJob,intendedReader,prerequisites,
      stepsOutline,evidenceNotes,limitations,validationPlan,status,
    },{label:"save-brief",success:"Private brief saved; nothing was published."});
    return !!response;
  };
  return <AdminPage title="Write a Playbook brief" subtitle="Plan the reader task and evidence before writing a public article. No AI-generated factual claims, automatic publication or newsletter delivery."
    actions={<Link to="/admin/briefs" className="text-[13px] font-semibold text-accent underline">← All briefs</Link>}>
    <div className="mx-auto max-w-4xl space-y-5">
      <Card title="Original source and verification">
        <p className="text-[12px] leading-relaxed text-ink-3">Original metadata is not evidence that its claims are correct. Open the source, check date and licensing, record independent verification and document your own test separately.</p>
        <p className="mt-3 text-[13px] text-ink-2"><strong>Source:</strong> {source.sourceName}</p>
        <a className="mt-2 block break-all text-[13px] text-accent underline" href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.sourceUrl}</a>
        <p className="mt-2 text-[12px] text-ink-4">Source title: {source.sourceTitle}. Publication date: {source.sourcePublishedAt ? new Date(source.sourcePublishedAt).toLocaleDateString("en-US") : "Unverified"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="info">Source review: {source.reviewStatus}</Badge>
          <Badge tone={status==="ready_for_review"?"ok":"muted"}>Brief: {status.replaceAll("_"," ")}</Badge>
          <Badge>Revision {source.version}</Badge>
        </div>
      </Card>
      <Card title="Audience and user job">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Track"><select aria-label="Track" className="w-full rounded-control border border-line bg-surface p-3 text-[14px] text-ink"
            value={track} onChange={e=>setTrack(e.target.value as EditorialBriefTrack)}>
            {(["Build","Grow","Automate"] as const).map(t=><option key={t} value={t}>{t}</option>)}
          </select></Field>
          <Field label="Private draft stage"><select aria-label="Private draft stage" className="w-full rounded-control border border-line bg-surface p-3 text-[14px] text-ink"
            value={status} onChange={e=>setStatus(e.target.value as EditorialBriefStatus)}>
            <option value="draft">Draft</option>
            <option value="ready_for_review">Ready for editorial review</option>
          </select></Field>
        </div>
        <Field label="Working headline" hint="Editorial title; not automatically published"><Input value={title} maxLength={180} onChange={e=>setTitle(e.target.value)}/></Field>
        <Field label="Who is this for?" hint="Name a specific audience/job, not everyone"><Textarea value={intendedReader} onChange={e=>setIntendedReader(e.target.value)} maxLength={600} rows={2}/></Field>
        <Field label="What task will they complete?" hint="Concrete user outcome, with a checkable definition of done"><Textarea value={userJob} onChange={e=>setUserJob(e.target.value)} maxLength={1500} rows={3}/></Field>
      </Card>
      <Card title="Workflow outline">
        <Field label="Prerequisites" hint="Accounts, rights, permissions, costs and materials"><Textarea value={prerequisites} onChange={e=>setPrerequisites(e.target.value)} maxLength={4000} rows={4}/></Field>
        <Field label="Steps or experiment outline" hint="Your planned steps; do not present untested results as verified"><Textarea value={stepsOutline} onChange={e=>setStepsOutline(e.target.value)} maxLength={8000} rows={9}/></Field>
        <Field label="Source evidence and verification notes" hint="Cite original URLs, timestamps, relevant documentation, and exactly what you verified"><Textarea value={evidenceNotes} onChange={e=>setEvidenceNotes(e.target.value)} maxLength={6000} rows={5}/></Field>
        <Field label="Limitations and rights" hint="Rate limits, API access, failure paths, licensing, unresolved claims"><Textarea value={limitations} onChange={e=>setLimitations(e.target.value)} maxLength={3000} rows={4}/></Field>
        <Field label="Real test / acceptance plan" hint="Commands, screenshots, success/failure cases and explicit NOT YET TESTED status"><Textarea value={validationPlan} onChange={e=>setValidationPlan(e.target.value)} maxLength={4000} rows={5}/></Field>
      </Card>
      <div className="rounded-panel border border-line bg-bg-sunk p-5">
        <p className="mb-3 text-[12px] leading-[1.8] text-ink-3">Ready for editorial review means all required sections are populated; it does not mark a guide as tested or publish anything. Changes are audit logged with optimistic version checks, so a stale editor cannot overwrite newer work.</p>
        <Button tone="primary" disabled={!!pending} busy={pending==="save-brief"} onClick={save}>Save private brief</Button>
      </div>
    </div>
  </AdminPage>;
}
