import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { tag } from "./setup.ts";
import { closeDb, sql } from "@aihot/backend/db";
import { createBrief, getBrief, listBriefs, saveBrief } from "@aihot/backend/admin/briefs";
import { Conflict } from "@aihot/backend/audit";
import { publicCuration } from "@aihot/backend/publication/curation";
import { signalRss } from "@aihot/backend/publication/curation-feed";

const suffix = tag();
const sourceId = `brief-private-${suffix}`;
const publicSourceId = `brief-public-${suffix}`;
const id = `brief-${suffix}`;
const publicId = `brief-public-item-${suffix}`;
const sourceUrl = "https://github.com/example/original-workflow";
const complete = {
  version: 1, track: "Build", status: "ready_for_review",
  title: "Ship a small AI-assisted website with safe checks",
  intendedReader: "Independent developers who want a reliable MVP",
  userJob: "Prepare, verify and deploy a basic working web application without inventing results.",
  prerequisites: "A Git repository and a test branch, a staging environment and permission to deploy.",
  stepsOutline: "1. Define a single user journey. 2. Create a feature branch. 3. Build one page. 4. Run typechecks and tests. 5. Review the deployment preview and record observed failures.",
  evidenceNotes: "Original repository: https://github.com/example/original-workflow. The source has not yet been independently tested.",
  limitations: "API availability, pricing and production permission still require verification.",
  validationPlan: "Run a local build, test the success and failure paths, collect screenshots and note the exact commit.",
} as const;
before(async()=>{
  await sql`INSERT INTO sources (id,name,kind,tier,participation_mode)
    VALUES (${sourceId},'Private brief test','external','T2','isolated'),
           (${publicSourceId},'Public source test','external','T1','editorial')`;
  await sql`INSERT INTO articles (id,source_id,identity_key,url,title,discovered_at,timeline_at)
    VALUES (${id},${sourceId},${id},${sourceUrl},'Raw source title',now(),now()),
    (${publicId},${publicSourceId},${publicId},'https://example.com/public','Public source title',now(),now())`;
});
after(closeDb);

test("a private source creates one unverified brief; duplicate create never overwrites",async()=>{
  await assert.rejects(createBrief(publicId,"Grow","editor"),Conflict);
  await assert.rejects(createBrief(id,"Unknown","editor"),/Choose Build/);
  const first = await createBrief(id,"Build","editor");
  assert.deepEqual(first,{articleId:id,created:true,private:true});
  const second = await createBrief(id,"Grow","second-editor");
  assert.deepEqual(second,{articleId:id,created:false,private:true});
  const brief = await getBrief(id);
  assert.equal(brief?.track,"Build");
  assert.equal(brief?.status,"draft");
  assert.equal(brief?.stepsOutline,"");
  assert.equal(brief?.sourceUrl,sourceUrl);
  assert.equal((await listBriefs()).rows.filter(x=>x.articleId===id).length,1);
  const [log]=await sql<{n:number}[]>`SELECT count(*)::int AS n FROM audit_log WHERE subject=${`content:${id}`} AND action='brief.create'`;
  assert.equal(log?.n,1);
});

test("ready for review requires human-written evidence; versioned edits are audited",async()=>{
  await assert.rejects(saveBrief(id,{...complete,stepsOutline:""}, "editor"),/Complete the user job/);
  await assert.rejects(saveBrief(id,{...complete,version:0},"editor"),/current brief version/);
  const saved=await saveBrief(id,complete,"reviewer");
  assert.equal(saved?.public,false);
  assert.equal(saved?.version,2);
  const result=await getBrief(id);
  assert.equal(result?.status,"ready_for_review");
  assert.equal(result?.stepsOutline,complete.stepsOutline);
  await assert.rejects(saveBrief(id,complete,"stale-editor"),Conflict);
  const [log]=await sql<{n:number}[]>`SELECT count(*)::int AS n FROM audit_log WHERE subject=${`content:${id}`} AND action='brief.update'`;
  assert.equal(log?.n,1);
});

test("private editorial briefs never leak into Signals or RSS",async()=>{
  assert.equal((await publicCuration()).items.some(x=>x.id===id),false);
  assert.ok(!(await signalRss()).includes("Ship a small AI-assisted website with safe checks"));
  const [published]=await sql<{n:number}[]>`SELECT count(*)::int AS n FROM curation_releases WHERE article_id=${id}`;
  assert.equal(published?.n,0);
});

test("changing source participation to public blocks further edits and private reads",async()=>{
  await sql`UPDATE sources SET participation_mode='editorial' WHERE id=${sourceId}`;
  assert.equal(await getBrief(id),null);
  assert.equal((await listBriefs()).rows.some(x=>x.articleId===id),false);
  await assert.rejects(saveBrief(id,{...complete,version:2},"editor"),Conflict);
});
