// Private, deterministic editorial leads derived from collected source metadata.
// Does NOT call an LLM, fetch external URLs, infer audience demand or verify source claims.
import { PRIVATE_MARKETING_SEED_IDS, MARKETING_SOURCE_LANES, type MarketingLane } from "@aihot/industry/source-coverage";
import { sql } from "../db.ts";

export type OpportunityReviewState = "inbox" | "shortlisted" | "fact_checked" | "approved" | "rejected";
export interface OpportunityInput {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  tier: string;
  discoveredAt: Date;
  publishedAt: Date | null;
  reviewStatus: OpportunityReviewState;
  reviewVersion: number;
}
export interface OpportunitySource {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string | null;
  discoveredAt: string;
  reviewStatus: OpportunityReviewState;
  reviewVersion: number;
}
export interface EditorialOpportunity {
  key: string;
  title: string;
  lanes: MarketingLane[];
  reviewPriority: number;
  priorityReasons: string[];
  relatedCount: number;
  distinctDomains: number;
  sources: OpportunitySource[];
  reviewStatus: OpportunityReviewState;
  latestDiscoveredAt: string;
  confidence: "unverified_source_metadata";
}
export interface OpportunityBoard {
  generatedAt: string;
  lookbackDays: number;
  totalCandidates: number;
  displayed: number;
  leads: EditorialOpportunity[];
  methodology: string;
}
const STOPWORDS = new Set([
  "and","are","about","after","before","best","for","from","how","into","more","new","now","the","this",
  "that","their","these","those","top","with","without","your","you","using","use","what","why","can",
  "ai","guide","tools","tool","2026","marketing",
]);
const ACTIONABLE = /\b(workflow|automate|automation|tutorial|steps|template|playbook|report|experiment|case study|integrat|attribution|conversion|audit|tracking|benchmark)\b/i;
export function titleTokens(title: string): Set<string> {
  return new Set(
    title.toLowerCase().replace(/[^a-z0-9\s-]/g," ").split(/[\s-]+/)
      .filter(word => word.length >= 4 && !STOPWORDS.has(word)).slice(0, 28)
  );
}
export function possibleSameTopic(a: string, b: string): boolean {
  const aa = titleTokens(a), bb = titleTokens(b);
  if (aa.size < 4 || bb.size < 4) return false;
  const matches = [...aa].filter(word => bb.has(word)).length;
  // High lexical overlap is a discovery hint; it is NOT independent verification.
  return matches >= 4 && matches / Math.max(aa.size,bb.size) >= 0.75;
}
function host(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.hostname.toLowerCase().replace(/^www\./,"");
  } catch { return null; }
}
function canonical(url: string): string {
  try {
    const u = new URL(url);
    if (!["https:","http:"].includes(u.protocol)) return url;
    u.hash = "";
    for(const key of [...u.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ["fbclid","gclid","ref","s"].includes(key.toLowerCase())) u.searchParams.delete(key);
    }
    return (u.hostname.toLowerCase().replace(/^www\./,"") + u.pathname.replace(/\/$/,"") + (u.search || "")).toLowerCase();
  } catch { return url; }
}
export function buildOpportunityBoard(input: readonly OpportunityInput[], now = new Date(), days = 7): OpportunityBoard {
  const leads: Array<{ cluster: OpportunityInput[]; representative: OpportunityInput }> = [];
  const sorted = input
    .filter(row => row.reviewStatus !== "rejected" && row.title.trim().length >= 10 && host(row.url))
    .filter(row => now.getTime() - row.discoveredAt.getTime() <= days * 86400_000 && row.discoveredAt <= now)
    .sort((a,b)=> b.discoveredAt.getTime() - a.discoveredAt.getTime() || a.id.localeCompare(b.id));
  for (const item of sorted) {
    // Only group lexical matches in the same topic lane to minimize false merges.
    const lanes = MARKETING_SOURCE_LANES[item.sourceId as keyof typeof MARKETING_SOURCE_LANES] as readonly MarketingLane[] | undefined;
    if (!lanes?.length) continue;
    const match = leads.find(lead => {
      const leadLanes = MARKETING_SOURCE_LANES[lead.representative.sourceId as keyof typeof MARKETING_SOURCE_LANES] as readonly MarketingLane[];
      return (canonical(item.url) === canonical(lead.representative.url) ||
        (lanes.some(lane => leadLanes.includes(lane)) && possibleSameTopic(item.title,lead.representative.title)));
    });
    if (match) { if (match.cluster.length < 10) match.cluster.push(item); }
    else leads.push({ representative: item, cluster: [item] });
  }
  const opportunities = leads.map(({ cluster,representative }) => {
    const lanes = [...new Set(cluster.flatMap(item =>
      [...(MARKETING_SOURCE_LANES[item.sourceId as keyof typeof MARKETING_SOURCE_LANES] as readonly MarketingLane[] || [])]
    ))];
    const distinctDomains = new Set(cluster.map(item=>host(item.url)).filter(Boolean)).size;
    const firstParty = cluster.some(x=>x.tier==="T1");
    const actionable = ACTIONABLE.test(representative.title);
    const multiSource = new Set(cluster.map(x=>x.sourceId)).size > 1;
    const fresh = now.getTime() - representative.discoveredAt.getTime() < 48*3600_000;
    const priorityReasons = [
      ...(actionable ? ["Title describes a concrete workflow or marketing task"] : []),
      ...(firstParty ? ["At least one first-party source in the candidate group"] : []),
      ...(multiSource ? ["Potentially related coverage from several configured feeds — verify independence"] : []),
      ...(fresh ? ["Newly discovered in the last 48 hours"] : []),
    ];
    return {
      key: representative.id, title: representative.title, lanes,
      reviewPriority: Math.min(10, 2 + (actionable ? 3 : 0) + (firstParty ? 2 : 0) +
        (multiSource ? 2 : 0) + (fresh ? 1 : 0)),
      priorityReasons, relatedCount: cluster.length, distinctDomains,
      reviewStatus: representative.reviewStatus,
      latestDiscoveredAt: representative.discoveredAt.toISOString(),
      confidence: "unverified_source_metadata" as const,
      sources: cluster.map(item=>({
        id: item.id, title: item.title, url: item.url,
        sourceId: item.sourceId, sourceName: item.sourceName,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        discoveredAt: item.discoveredAt.toISOString(), reviewStatus: item.reviewStatus, reviewVersion: item.reviewVersion,
      })),
    };
  });
  opportunities.sort((a,b)=> b.reviewPriority-a.reviewPriority || b.latestDiscoveredAt.localeCompare(a.latestDiscoveredAt));
  return {
    generatedAt: now.toISOString(), lookbackDays: days, totalCandidates: sorted.length,
    displayed: opportunities.length, leads: opportunities.slice(0,100),
    methodology: "Ranking uses only title keywords, recent discovery, configured source tier and possible related coverage. It does not measure search volume, social views, independent corroboration or actual workflow success.",
  };
}

/** Read only; never uploads third-party content or makes provider calls. */
export async function editorialOpportunities(days: number): Promise<OpportunityBoard> {
  const windowDays = days === 30 ? 30 : 7;
  const rows = await sql<Array<{
    id: string; title: string; url: string; source_id: string; source_name: string; tier: string;
    discovered_at: Date; published_at: Date|null; status: OpportunityReviewState; version: number;
  }>>`
    SELECT a.id,a.title,a.url,a.source_id,s.name AS source_name,s.tier,a.discovered_at,a.published_at,
      COALESCE(r.status,'inbox') AS status, COALESCE(r.version,0) AS version
    FROM articles a JOIN sources s ON s.id=a.source_id
    LEFT JOIN curation_reviews r ON r.article_id=a.id
    WHERE s.id=ANY(${PRIVATE_MARKETING_SEED_IDS}::text[])
      AND s.participation_mode='isolated' AND a.discovered_at >= now() - make_interval(days=>${windowDays})
      AND s.enabled AND COALESCE(r.status,'inbox') <> 'rejected'
    ORDER BY a.discovered_at DESC,a.id DESC LIMIT 500
  `;
  return buildOpportunityBoard(rows.map(row=>({
    id: row.id,title:row.title,url:row.url,sourceId:row.source_id,sourceName:row.source_name,tier:row.tier,
    discoveredAt: row.discovered_at,publishedAt:row.published_at,
    reviewStatus:row.status,reviewVersion:row.version,
  })),new Date(),windowDays);
}
