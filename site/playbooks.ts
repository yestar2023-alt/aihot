/**
 * Original editorial playbooks. These are guided implementations based on linked first-party docs,
 * NOT claims of a hands-on test. No third-party article body or workflow JSON is reproduced.
 * A playbook becomes public only when deliberately added to this repository via code review.
 */
export interface Playbook {
  slug: string; category: "Content Repurposing" | "Marketing Reporting" | "Content Planning";
  title: string; description: string; outcome: string; readingMinutes: number;
  lastReviewed: string; verification: "Documented approach — not independently tested";
  audience: string; prerequisites: string[];
  steps: { title: string; detail: string }[];
  checkpoints: string[]; pitfalls: { issue: string; response: string }[];
  sourceDocs: { title: string; url: string }[];
}

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "repurpose-webinar-into-social-content", category: "Content Repurposing",
    title: "Turn one webinar into a week of reviewed social drafts",
    description: "A practical, human-approved pipeline for turning your own webinar transcript into channel-specific posts without auto-publishing unverified claims.",
    outcome: "One source-of-truth transcript, a shortlist of usable claims, and several editable social drafts awaiting human approval.",
    readingMinutes: 8, lastReviewed: "2026-11-01", verification: "Documented approach — not independently tested",
    audience: "Content marketers and small B2B teams with permission to reuse their own webinar.",
    prerequisites: [
      "A webinar recording and transcript you own or are licensed to reuse.",
      "A spreadsheet or document with a source URL, speaker, timestamps, claims and approval status.",
      "An AI text tool with a privacy policy suitable for your transcript; editorial approval before any social scheduling.",
    ],
    steps: [
      { title: "Prepare the source", detail: "Export the transcript, preserve speaker attribution and timestamps, and redact private customer information. Save the original URL and usage rights next to the working file." },
      { title: "Extract supported ideas", detail: "Ask the model for 10 distinct, timestamped ideas; require a verbatim evidence snippet for each claim. Reject ideas that the transcript does not explicitly support." },
      { title: "Rank for audience relevance", detail: "Mark each idea by audience, source timestamp, novelty and whether it can stand alone. Shortlist 3–5 ideas with enough context to avoid quote distortion." },
      { title: "Create channel-specific drafts", detail: "Draft separate versions for a professional network post, an X post and a newsletter paragraph. Specify length, factual boundaries, call to action and no invented statistics. Keep them as drafts." },
      { title: "Run an editorial review", detail: "Check every quoted fact against the source transcript, verify names and links, and confirm that the copy complies with channel-specific usage rules. Record who approved the draft and when." },
      { title: "Schedule and measure", detail: "Use an authorized publishing tool or publish manually. Add a tracked destination link only where permitted; later compare meaningful engagement and site visits, not vanity metrics alone." },
    ],
    checkpoints: [
      "All claims can be traced to source timestamps and do not exaggerate results.",
      "Each post is adapted for a real channel instead of identical text copied everywhere.",
      "No customer PII, undisclosed sponsored claims, or unlicensed material is published.",
      "A human approves every draft and records the final destination link.",
    ],
    pitfalls: [
      { issue: "AI invents a quote or a statistic", response: "Require a timestamped source span, delete unsupported statements and review the transcript manually." },
      { issue: "One draft reads awkwardly on every network", response: "Rewrite to each platform's actual audience and test formatting in preview before publishing." },
      { issue: "A scheduling integration cannot access an account", response: "Confirm account permissions and supported channel behavior; keep a manual draft-and-review fallback." },
    ],
    sourceDocs: [
      { title: "Buffer: scheduling posts and selecting channels", url: "https://support.buffer.com/en-us/articles/scheduling-posts-4Qdld7giAZ" },
      { title: "Buffer API: post scheduling lifecycle", url: "https://developers.buffer.com/guides/posts-and-scheduling.html" },
    ],
  },
  {
    slug: "weekly-ga4-report-with-human-review", category: "Marketing Reporting",
    title: "Plan an automated weekly GA4 report with an approval step",
    description: "A source-led workflow design for collecting GA4 metrics, appending them to a reporting sheet, and drafting a narrative that a marketer verifies before distribution.",
    outcome: "A consistent weekly metrics table and a reviewable summary with data provenance, not an unsupervised report blasted to clients.",
    readingMinutes: 10, lastReviewed: "2026-11-01", verification: "Documented approach — not independently tested",
    audience: "Marketing analysts, operators and agency teams with authorized access to GA4.",
    prerequisites: [
      "Access to the correct Google Analytics 4 property and valid API credentials or OAuth consent.",
      "A reporting sheet with explicit column names for week, property, metric, value, comparison and data freshness.",
      "An automation runner such as n8n, a test property and a clearly designated human reviewer.",
    ],
    steps: [
      { title: "Define the report before automating", detail: "Pick the business questions, date range, dimensions and metrics. Document which GA4 property they refer to, the reporting timezone, comparison period and any interpretation caveats." },
      { title: "Fetch a minimal GA4 report", detail: "Use the official Analytics Data API runReport method with the appropriate property, dimension and metric definitions. Test a single request first and handle missing rows and quotas without assuming the data is exhaustive." },
      { title: "Normalize the output", detail: "Map API dimensionHeaders, metricHeaders and rows to explicit spreadsheet column names. Keep property ID, query range and retrieval time for every record." },
      { title: "Write to the sheet", detail: "Use a Google Sheets integration to append or update rows by a stable week/property key. Retry transient errors carefully, and make reruns idempotent to avoid duplicate weeks." },
      { title: "Draft explanations with guardrails", detail: "Give the AI only the verified metrics and a comparison table. Ask for observations, not causal explanations; any reason for a performance change must be labelled as a hypothesis." },
      { title: "Review and release", detail: "A human checks anomalies, date ranges, and sampling or threshold notes where relevant. Publish the approved report through the organization's authorized channel." },
    ],
    checkpoints: [
      "Property, metric, dimension and date range are recorded with each query.",
      "Manual GA4 UI spot-check agrees with at least a sample of the retrieved data.",
      "Repeated workflow execution does not duplicate spreadsheet rows.",
      "The AI never states causes, savings or conversions that the underlying data cannot establish.",
    ],
    pitfalls: [
      { issue: "Authentication or access denied", response: "Confirm property permission and OAuth scope, then test the official API using a low-volume request." },
      { issue: "GA4 UI numbers differ from API output", response: "Compare reporting identity, dimensions, date filters, attribution settings and data freshness before drawing conclusions." },
      { issue: "A scheduled run times out or duplicates rows", response: "Add a retry policy, durable checkpoint and a unique week/property key, and avoid emailing partial reports." },
    ],
    sourceDocs: [
      { title: "Google Analytics Data API: runReport", url: "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport" },
      { title: "Google Analytics: create a report", url: "https://developers.google.com/analytics/devguides/reporting/data/v1/basics" },
      { title: "n8n: Google Sheets node documentation", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets" },
    ],
  },
  {
    slug: "rss-to-editorial-idea-queue", category: "Content Planning",
    title: "Build an RSS-to-editorial-ideas queue without autopublishing",
    description: "Collect credible marketing sources into a private backlog, deduplicate links and add an editorial decision before drafting anything public.",
    outcome: "A reusable content research queue with original sources, why-it-matters notes, and accountable go/no-go decisions.",
    readingMinutes: 7, lastReviewed: "2026-11-01", verification: "Documented approach — not independently tested",
    audience: "Solo content publishers and marketing teams overwhelmed by X, blogs and tutorial feeds.",
    prerequisites: [
      "A small list of first-party feeds, official docs and creators you are permitted to monitor.",
      "A private table with URL, author, source, published date (or unknown), category, status and editorial notes.",
      "A responsible editor and a published correction/takedown contact.",
    ],
    steps: [
      { title: "Choose source families", detail: "Start with official release notes, practitioner tutorials and community examples. Keep source type and reliability separate from popularity." },
      { title: "Collect metadata only", detail: "Save canonical URLs, title, author, source and a short excerpt where allowed. Preserve unknown dates instead of inventing them; obey rate limits and platform terms." },
      { title: "Deduplicate", detail: "Normalize tracking parameters and group duplicate URLs or discussions of the same release. Keep the original creator as the primary reference instead of promoting reposts." },
      { title: "Evaluate usefulness", detail: "Score whether the material addresses a specific marketing job, includes steps and evidence, has current API restrictions and adds information not already covered." },
      { title: "Human review", detail: "Mark items as shortlist, fact checked, approved or rejected. Only separately released editorial writing can appear on the site." },
      { title: "Turn the strongest finds into assets", detail: "Publish a short curated signal with a source link. For high-value ideas, create an original playbook with prerequisites, verification checkpoints, limitations and relevant documentation." },
    ],
    checkpoints: [
      "A source URL and content rights note are preserved for each candidate.",
      "No full article, thread or transcript is republished by default.",
      "Sources without enough detail stay in the private queue.",
      "Publication requires a separate explicit approval and release action.",
    ],
    pitfalls: [
      { issue: "A popular repost crowds out the original creator", response: "Resolve the original source and keep reposts as corroborating context only." },
      { issue: "AI summaries become low-value SEO pages", response: "Only publish independently useful editorial synthesis with specific evidence and a reader task." },
      { issue: "The source changes or disappears", response: "Check the live source before publication; keep an editorial withdrawal and correction process." },
    ],
    sourceDocs: [
      { title: "n8n: Google Sheets integration reference", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets" },
      { title: "Buffer: content feeds and idea saving", url: "https://support.buffer.com/articles/using-content-feeds-on-the-buffer-mobile-app-Rdf4qiL52u" },
    ],
  },
];

export function playbookBySlug(slug: string): Playbook | undefined {
  return PLAYBOOKS.find(p => p.slug === slug);
}
