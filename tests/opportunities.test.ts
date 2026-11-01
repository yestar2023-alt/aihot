import assert from "node:assert/strict";
import { test } from "node:test";
import { buildOpportunityBoard, possibleSameTopic, titleTokens, type OpportunityInput } from "@aihot/backend/admin/opportunities";

const now = new Date("2026-11-01T12:00:00Z");
function candidate(id: string, sourceId: string, title: string, url: string, opts: Partial<OpportunityInput> = {}): OpportunityInput {
  return {
    id, sourceId, title, url, sourceName: sourceId, tier: "T2",
    discoveredAt: new Date("2026-11-01T08:00:00Z"), publishedAt: null,
    reviewStatus: "inbox", reviewVersion: 0,
    ...opts,
  };
}
test("lexical grouping requires meaningful overlap and excludes generic marketing words", () => {
  assert.equal(possibleSameTopic("AI marketing tools", "Best AI marketing tools"), false);
  assert.equal(possibleSameTopic(
    "Automate GA4 report data collection using n8n workflow",
    "GA4 report data collection workflow with n8n automation"
  ), true);
  assert.equal(possibleSameTopic(
    "Microsoft Advertising keyword planner announces new API limits",
    "Shopify marketing subscription pricing new customer guide"
  ), false);
  assert.equal(titleTokens("AI marketing AI marketing").size, 0);
});
test("related coverage is labelled unverified, deduplicated and sorted with explicit reasons", () => {
  const rows = [
    candidate("n8n-a","rss-n8n-blog","Automate GA4 report data collection using n8n workflow","https://blog.n8n.io/report?utm_source=x", { tier:"T1" }),
    candidate("other-b","rss-hubspot-marketing","GA4 report data collection workflow with n8n automation","https://blog.hubspot.com/marketing/n8n-report", { tier:"T2" }),
    candidate("dup-c","rss-n8n-blog","Automate GA4 report data collection using n8n workflow","https://blog.n8n.io/report?utm_source=email", { tier:"T1" }),
    candidate("old","rss-amplitude-blog","Amplitude marketing data report workflow release","https://amplitude.com/old",{discoveredAt:new Date("2026-10-01T00:00:00Z")}),
    candidate("reject","rss-posthog-blog","Marketing report automation workflow tutorial case study","https://posthog.com/reject",{reviewStatus:"rejected"}),
  ];
  const result=buildOpportunityBoard(rows,now,7);
  assert.equal(result.totalCandidates,3);
  assert.equal(result.leads.length,1);
  assert.equal(result.leads[0]?.relatedCount,3);
  assert.equal(result.leads[0]?.distinctDomains,2);
  assert.ok(result.leads[0]?.priorityReasons.some(x=>x.includes("verify independence")));
  assert.equal(result.leads[0]?.confidence,"unverified_source_metadata");
  assert.equal(result.leads[0]?.sources[0]?.publishedAt,null);
});
test("near-miss headlines from unrelated marketing lanes do not falsely corroborate each other", () => {
  const rows=[
    candidate("s1","rss-google-search-central","Marketing API status report automated analytics tool changes","https://developers.google.com/search/blog/example"),
    candidate("s2","rss-omnisend-blog","Marketing API status report automated analytics tool changes","https://www.omnisend.com/blog/example"),
  ];
  const r=buildOpportunityBoard(rows,now,7);
  assert.equal(r.leads.length,2);
});
test("no preconfigured feed content means an honest empty board", () => {
  const r=buildOpportunityBoard([],now,7);
  assert.equal(r.totalCandidates,0);
  assert.equal(r.displayed,0);
  assert.equal(r.leads.length,0);
  assert.match(r.methodology,/does not measure search volume/);
});
