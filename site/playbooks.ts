/**
 * Original editorial playbooks. These are guided implementations based on linked first-party docs,
 * NOT claims of a hands-on test. No third-party article body or workflow JSON is reproduced.
 * A playbook becomes public only when deliberately added to this repository via code review.
 */
export interface Playbook {
  slug: string; track: "Build" | "Grow" | "Automate"; category: "Content Repurposing" | "Marketing Reporting" | "Content Planning" | "Product Development" | "SEO Research";
  title: string; description: string; outcome: string; readingMinutes: number;
  lastReviewed: string; verification: "Documented approach — not independently tested";
  audience: string; prerequisites: string[];
  steps: { title: string; detail: string }[];
  checkpoints: string[]; pitfalls: { issue: string; response: string }[];
  sourceDocs: { title: string; url: string }[];
}

export const PLAYBOOK_TRACKS = [
  { key: "Build", title: "Build", description: "Ship AI-powered products, sites and small agents with reliable review." },
  { key: "Grow", title: "Grow", description: "Find search demand, earn distribution and repurpose owned content." },
  { key: "Automate", title: "Automate", description: "Connect tools, data and repeatable operations with human checkpoints." },
] as const;

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "repurpose-webinar-into-social-content", track: "Grow", category: "Content Repurposing",
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
    slug: "weekly-ga4-report-with-human-review", track: "Automate", category: "Marketing Reporting",
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
    slug: "rss-to-editorial-idea-queue", track: "Automate", category: "Content Planning",
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

// A source-led Build guide; no claim of hands-on execution or guaranteed deployment.
PLAYBOOKS.unshift({
  slug: "ship-ai-assisted-site-with-review", track: "Build", category: "Product Development",
  title: "Ship a small AI-assisted website with a human review gate",
  description: "Use an AI coding assistant to scaffold an MVP, then verify every changed file, run checks and ship a reversible preview before production.",
  outcome: "A minimal working website with an explicit acceptance checklist, evidence from local checks, and a preview deployment to review.",
  readingMinutes: 9, lastReviewed: "2026-11-01", verification: "Documented approach — not independently tested",
  audience: "Indie makers and solo founders building a small product without a full engineering team.",
  prerequisites: [
    "A development machine with Node.js, Git and an IDE; a separate test repository or branch.",
    "A clearly written one-screen product goal and a list of features to leave out of the MVP.",
    "An AI coding tool of your choice, plus a way to review diffs and execute tests locally.",
  ],
  steps: [
    { title: "Specify the outcome", detail: "Write a short brief naming one target user, their job, the input/output of the product, the main error states, and an acceptance criterion you can test without a language model." },
    { title: "Create an isolated working branch", detail: "Initialize a new repository or create a branch in an existing project. Keep credentials in environment variables and a local .env ignored by Git. Do not give the coding assistant production credentials." },
    { title: "Scaffold one user journey", detail: "Follow the official framework quickstart to create the app, then ask the assistant for one page and one end-to-end flow. Avoid building payments, login, or analytics unless essential to this single test." },
    { title: "Inspect the resulting changes", detail: "Review changed files, dependency additions and external network calls. Reject hard-coded secrets, placeholder API outputs presented as production data, and blanket error suppression." },
    { title: "Verify locally", detail: "Run the framework lint/typecheck/build commands and manually test a valid input, invalid input and a network failure. Record exact commands and results rather than asserting the assistant ran them." },
    { title: "Deploy a preview and review it", detail: "Use the host's preview deployment or a staging environment; verify real responsive layout, navigation, canonical URL behavior and safe handling of missing environment variables." },
    { title: "Approve production only after a checklist", detail: "Confirm content rights, privacy/cookie behavior, source URLs, rollback capability and deployment controls. Keep the release a separate explicit action." },
  ],
  checkpoints: [
    "The MVP solves one named task; all main buttons work in the preview.",
    "A local build and at least one error-path test actually completed and were recorded.",
    "No API key or secret is exposed in the repository, browser bundle or screenshots.",
    "Preview and production environments have separate access rules and a known rollback path.",
  ],
  pitfalls: [
    { issue: "AI generates plausible but broken integrations", response: "Compare calls with primary API docs, use a mock for development and verify the live interface only with authorized credentials." },
    { issue: "The first request expands into a large product", response: "Limit scope to one core workflow, then record later ideas separately from MVP acceptance criteria." },
    { issue: "A successful build is mistaken for a successful release", response: "Test navigation, data and failure states in a deployed preview before authorizing production." },
  ],
  sourceDocs: [
    { title: "Next.js App Router: Getting Started", url: "https://nextjs.org/docs/app/getting-started" },
    { title: "GitHub Actions: Workflow syntax", url: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax" },
  ],
});

PLAYBOOKS.push({
  slug: "find-first-seo-pages-for-new-site", track: "Grow", category: "SEO Research",
  title: "Choose the first three SEO pages for a new product site",
  description: "A research and prioritization workflow that connects real user questions, SERP intent, original product evidence and manageable production scope.",
  outcome: "Three evidence-backed page briefs with a target query, user job, source checklist and measurable post-publication checks.",
  readingMinutes: 8, lastReviewed: "2026-11-01", verification: "Documented approach — not independently tested",
  audience: "Small teams and independent developers publishing English product or tutorial sites.",
  prerequisites: [
    "A working product or defined audience job, and access to real examples or product screenshots.",
    "A browser for checking current search results, plus a simple spreadsheet to record intent and evidence.",
    "A plan for collecting first-party performance after publishing, such as Google Search Console.",
  ],
  steps: [
    { title: "List user jobs, not just keyword strings", detail: "Record the problems users have before, during and after using the product. Generate candidate query phrases from the language users actually use in support, reviews or community questions." },
    { title: "Inspect the live SERP", detail: "Search each candidate phrase in the intended market and note what Google currently surfaces: tools, forums, official docs, examples or tutorials. Save the date of the check; do not fabricate rankings or search volume." },
    { title: "Find the evidence gap", detail: "For each query, ask which essential answer the existing pages fail to provide. Prefer opportunities where your own product, screenshots or a properly sourced workflow can add something original." },
    { title: "Choose a page type", detail: "Pick a solution landing page, hands-on tutorial or troubleshooting guide depending on intent. A keyword alone does not dictate whether to build a standalone tool." },
    { title: "Write a one-page brief", detail: "Capture title, reader problem, acceptance question, required original sources, example output, limitations, internal links and a verification checklist." },
    { title: "Publish and measure", detail: "Inspect mobile usability and indexing rules, then track impressions, queries and clicks over time. Use observed data to iterate; avoid promising a ranking or a specific traffic result." },
  ],
  checkpoints: [
    "Each chosen query corresponds to one clear user task.",
    "Current SERP intent and inspected date are recorded, not inferred from an AI summary.",
    "At least one original example, screenshot or first-party insight will make each page useful.",
    "Post-publication measurements and a revisit date are assigned.",
  ],
  pitfalls: [
    { issue: "Keyword volume claims are unverified", response: "Label estimates as estimates or omit them. Treat Search Console as property-specific observed data after publication." },
    { issue: "The page repeats ten existing summaries", response: "Add original workflow steps, a tested example, first-party data or a demonstrably clearer answer." },
    { issue: "A trend is mistaken for sustained demand", response: "Document the time window, compare related queries and keep a maintenance plan before investing in a standalone domain." },
  ],
  sourceDocs: [
    { title: "Google Search Central: SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
    { title: "Google Search Console: Performance report", url: "https://support.google.com/webmasters/answer/7576553" },
  ],
});

export function playbookBySlug(slug: string): Playbook | undefined {
  return PLAYBOOKS.find(p => p.slug === slug);
}
