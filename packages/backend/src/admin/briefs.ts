// Drafts are private editorial records. Never appear in site, RSS or newsletter reads.
// Source metadata is unverified until the editor adds evidence and an actual test record.
import { WORK_TRACKS, type WorkTrack } from "@aihot/industry/source-coverage";
import { audit, Conflict } from "../audit.ts";
import { sql } from "../db.ts";
import { CurationBadRequest } from "./curation.ts";

export type BriefStatus = "draft" | "ready_for_review";
export interface EditorialBrief {
  articleId: string; sourceTitle: string; sourceUrl: string; sourceName: string;
  sourcePublishedAt: string | null; reviewStatus: string;
  track: WorkTrack; title: string; userJob: string; intendedReader: string;
  prerequisites: string; stepsOutline: string; evidenceNotes: string; limitations: string;
  validationPlan: string; status: BriefStatus; version: number;
  updatedAt: string; updatedBy: string;
}
interface Stored {
  article_id: string; source_title: string; source_url: string; source_name: string;
  source_published_at: Date | null; review_status: string;
  track: WorkTrack; title: string; user_job: string; intended_reader: string;
  prerequisites: string; steps_outline: string; evidence_notes: string; limitations: string;
  validation_plan: string; status: BriefStatus; version: number;
  updated_at: Date; updated_by: string;
}
const SELECT = `
 SELECT b.article_id, a.title AS source_title, a.url AS source_url,
 s.name AS source_name, a.published_at AS source_published_at,
 coalesce(cr.status,'inbox') AS review_status, b.track, b.title, b.user_job,
 b.intended_reader, b.prerequisites, b.steps_outline, b.evidence_notes,
 b.limitations, b.validation_plan, b.status, b.version, b.updated_at, b.updated_by
 FROM editorial_briefs b
 JOIN articles a ON a.id=b.article_id
 JOIN sources s ON s.id=a.source_id
 LEFT JOIN curation_reviews cr ON cr.article_id=a.id
 WHERE s.participation_mode='isolated'`;
function present(row: Stored): EditorialBrief {
  return {
    articleId:row.article_id,sourceTitle:row.source_title,sourceUrl:row.source_url,
    sourceName:row.source_name,sourcePublishedAt:row.source_published_at?.toISOString() ?? null,
    reviewStatus:row.review_status,track:row.track,title:row.title,
    userJob:row.user_job,intendedReader:row.intended_reader,prerequisites:row.prerequisites,
    stepsOutline:row.steps_outline,evidenceNotes:row.evidence_notes,limitations:row.limitations,
    validationPlan:row.validation_plan,status:row.status,version:row.version,
    updatedAt:row.updated_at.toISOString(),updatedBy:row.updated_by,
  };
}
function validTrack(value: unknown): WorkTrack {
  if (typeof value !== "string" || !(WORK_TRACKS as readonly string[]).includes(value))
    throw new CurationBadRequest("Choose Build, Grow or Automate.");
  return value as WorkTrack;
}
const LIMITS = {
  title:180,userJob:1500,intendedReader:600,prerequisites:4000,stepsOutline:8000,
  evidenceNotes:6000,limitations:3000,validationPlan:4000,
} as const;
type EditKey = keyof typeof LIMITS;
export interface BriefEdit {
  version?: unknown; track?: unknown; status?: unknown;
  title?: unknown; userJob?: unknown; intendedReader?: unknown;
  prerequisites?: unknown; stepsOutline?: unknown; evidenceNotes?: unknown;
  limitations?: unknown; validationPlan?: unknown;
}
function clean(input: BriefEdit) {
  const copy = {} as Record<EditKey,string>;
  for(const key of Object.keys(LIMITS) as EditKey[]) {
    const val = input[key];
    if(typeof val !== "string" || val.trim().length > LIMITS[key])
      throw new CurationBadRequest(`${key} must be text with at most ${LIMITS[key]} characters.`);
    copy[key] = val.trim();
  }
  if(!Number.isSafeInteger(input.version) || Number(input.version)<1)
    throw new CurationBadRequest("Expected a current brief version.");
  if(input.status !== "draft" && input.status !== "ready_for_review")
    throw new CurationBadRequest("Invalid brief status.");
  if(input.status === "ready_for_review" &&
    (copy.title.length<15 || copy.userJob.length<30 || copy.intendedReader.length<10 ||
     copy.stepsOutline.length<80 || copy.evidenceNotes.length<30 ||
     copy.limitations.length<20 || copy.validationPlan.length<30))
    throw new CurationBadRequest("Complete the user job, audience, steps, evidence, limitations and validation plan before requesting review.");
  return { ...copy, version:input.version as number, track:validTrack(input.track), status:input.status };
}
export async function listBriefs(): Promise<{ rows: EditorialBrief[] }> {
  const rows = await sql<Stored[]>`
    SELECT b.article_id,a.title AS source_title,a.url AS source_url,s.name AS source_name,
    a.published_at AS source_published_at,coalesce(cr.status,'inbox') AS review_status,
    b.track,b.title,b.user_job,b.intended_reader,b.prerequisites,b.steps_outline,
    b.evidence_notes,b.limitations,b.validation_plan,b.status,b.version,b.updated_at,b.updated_by
    FROM editorial_briefs b JOIN articles a ON a.id=b.article_id
    JOIN sources s ON s.id=a.source_id LEFT JOIN curation_reviews cr ON cr.article_id=a.id
    WHERE s.participation_mode='isolated' ORDER BY b.updated_at DESC,b.article_id LIMIT 100`;
  return {rows:rows.map(present)};
}
export async function getBrief(id:string):Promise<EditorialBrief|null> {
  const rows=await sql<Stored[]>`
    SELECT b.article_id,a.title AS source_title,a.url AS source_url,s.name AS source_name,
    a.published_at AS source_published_at,coalesce(cr.status,'inbox') AS review_status,
    b.track,b.title,b.user_job,b.intended_reader,b.prerequisites,b.steps_outline,
    b.evidence_notes,b.limitations,b.validation_plan,b.status,b.version,b.updated_at,b.updated_by
    FROM editorial_briefs b JOIN articles a ON a.id=b.article_id
    JOIN sources s ON s.id=a.source_id LEFT JOIN curation_reviews cr ON cr.article_id=a.id
    WHERE b.article_id=${id} AND s.participation_mode='isolated'`;
  return rows[0]?present(rows[0]):null;
}
export async function createBrief(id:string,trackValue:unknown,actor:string) {
  const track=validTrack(trackValue);
  return sql.begin(async tx=>{
    const [source]=await tx<{title:string;mode:string}[]>`
      SELECT a.title,s.participation_mode AS mode FROM articles a
      JOIN sources s ON s.id=a.source_id WHERE a.id=${id} FOR UPDATE OF a`;
    if(!source)return null;
    if(source.mode!=="isolated")throw new Conflict("Only private sources may become briefs.");
    const [previous]=await tx<{article_id:string}[]>`SELECT article_id FROM editorial_briefs WHERE article_id=${id}`;
    if(previous)return {articleId:id,created:false,private:true as const};
    await tx`INSERT INTO editorial_briefs(article_id,track,title,updated_by)
      VALUES (${id},${track},${source.title.slice(0,180)},${actor})`;
    await audit(actor,"brief.create",`content:${id}`,"Private editorial outline created",
      null,{track,title:source.title.slice(0,180),status:"draft"},{db:tx});
    return {articleId:id,created:true,private:true as const};
  });
}
export async function saveBrief(id:string,edit:BriefEdit,actor:string) {
  const input=clean(edit);
  return sql.begin(async tx=>{
    const [row]=await tx<Stored[]>`
      SELECT b.article_id,a.title AS source_title,a.url AS source_url,s.name AS source_name,
      a.published_at AS source_published_at,coalesce(cr.status,'inbox') AS review_status,
      b.track,b.title,b.user_job,b.intended_reader,b.prerequisites,b.steps_outline,
      b.evidence_notes,b.limitations,b.validation_plan,b.status,b.version,b.updated_at,b.updated_by
      FROM editorial_briefs b JOIN articles a ON a.id=b.article_id
      JOIN sources s ON s.id=a.source_id LEFT JOIN curation_reviews cr ON cr.article_id=a.id
      WHERE b.article_id=${id} FOR UPDATE OF b`;
    if(!row)return null;
    const [source]=await tx<{participation_mode:string}[]>`
      SELECT participation_mode FROM sources s JOIN articles a ON a.source_id=s.id WHERE a.id=${id}`;
    if(source?.participation_mode!=="isolated")throw new Conflict("The source is no longer private.");
    if(row.version!==input.version)throw new Conflict("This brief has changed; reload before editing.");
    const [after]=await tx<{version:number}[]>`
      UPDATE editorial_briefs SET track=${input.track},title=${input.title},user_job=${input.userJob},
      intended_reader=${input.intendedReader},prerequisites=${input.prerequisites},
      steps_outline=${input.stepsOutline},evidence_notes=${input.evidenceNotes},
      limitations=${input.limitations},validation_plan=${input.validationPlan},
      status=${input.status},version=version+1,updated_at=now(),updated_by=${actor}
      WHERE article_id=${id} RETURNING version`;
    await audit(actor,"brief.update",`content:${id}`,"Private playbook brief edit",
      {version:row.version,track:row.track,status:row.status},
      {version:after!.version,track:input.track,status:input.status},{db:tx});
    return {articleId:id,version:after!.version,public:false as const};
  });
}
