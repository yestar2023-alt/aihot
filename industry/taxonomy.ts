// Industry profile for AI Marketer Signal: a curated AI marketing workflows publication.
// Internal identifiers are intentionally stable; do not rename once URLs/API clients exist.
export const CATEGORIES = [
  { key: "workflow", tagColor: "green", label: "Workflows", section: "Reusable workflows", guide: "Repeatable AI-assisted marketing automations with explicit inputs, triggers, steps, outputs and constraints. Prefer reusable exports and troubleshooting over hype.", commentary: true },
  { key: "content", tagColor: "turquoise", label: "Content", section: "Content & social marketing", guide: "AI-assisted content planning, research, repurposing, distribution, social media operations and editorial approval. An announcement alone belongs in product updates, not a workflow." },
  { key: "analytics", tagColor: "violet", label: "Analytics", section: "Measurement & reporting", guide: "Marketing analytics, reporting workflows, attribution, experiment analysis and dashboards with reproducible methods." },
  { key: "growth", tagColor: "indigo", label: "Growth", section: "Growth & lifecycle", guide: "Lead operations, CRM, onboarding, lifecycle messaging, retention, testing, funnel automation and concrete growth experiments." },
  { key: "tools", tagColor: "orange", label: "Tool updates", section: "Tools & integrations", guide: "Material AI tool or integration updates affecting marketing workflows, access, pricing or limitations. Reject generic tool directories and minor feature churn." },
  { key: "industry", tagColor: "purple", label: "Insights", section: "Marketing practice", guide: "Credible cross-tool comparisons, marketing practice research and case studies when no other actionable category fits. Avoid funding, personality and general AI headlines without a marketing application.", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

// No "new models" counter: this publication is about marketing jobs-to-be-done.
export const RELEASE: { category: string; tag: string; unit: string } | null = null;
export const PLAIN_TERMS: readonly string[] = ["ai", "api", "crm", "seo", "utm", "ga4", "n8n", "mcp", "rss", "linkedin", "youtube", "x", "email", "roi", "cpc", "ctr"];

// Preserve framework item-type identifiers; scoring and item-understanding prompts share these keys.
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

export const CATEGORY_TAGS = [
  "Workflow", "Content Ops", "Analytics", "Growth", "Tool Update", "Case Study",
  "Tool Comparison", "Tutorial", "Original Research", "Industry Insight", "Other",
] as const;
export const TOPIC_TAGS = [
  "Automation", "Content Repurposing", "Social Media", "Content Planning",
  "Email Marketing", "Lead Follow-up", "CRM", "Reporting", "Attribution",
  "AI Agents", "SEO", "Video", "Community", "Newsletter",
] as const;
export const ENTITY_TAGS = [
  "n8n", "Zapier", "Make", "Buffer", "HubSpot", "Google", "LinkedIn", "YouTube",
  "X", "Meta", "GitHub", "Notion",
] as const;
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  automation: "Automation", workflows: "Workflow", workflow: "Workflow",
  "ai workflow": "Workflow", "content automation": "Content Ops",
  "social marketing": "Social Media", "social media marketing": "Social Media",
  "content reuse": "Content Repurposing", repurposing: "Content Repurposing",
  reporting: "Reporting", analytics: "Analytics", "lead generation": "Growth",
  crm: "CRM", comparison: "Tool Comparison", tutorials: "Tutorial",
  guides: "Tutorial", "case study": "Case Study",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  n8n: { name: "n8n", displayTag: "n8n", aliases: ["n8n"], orgNames: ["n8n"] },
  zapier: { name: "Zapier", displayTag: "Zapier", aliases: ["Zapier"], orgNames: ["Zapier"] },
  make: { name: "Make", displayTag: "Make", aliases: ["Make.com", "Make automation", "Integromat"], orgNames: ["Make", "Make.com"] },
  buffer: { name: "Buffer", displayTag: "Buffer", aliases: ["Buffer", "Buffer social"], orgNames: ["Buffer"] },
  hubspot: { name: "HubSpot", displayTag: "HubSpot", aliases: ["HubSpot", "HubSpot Marketing Hub"], orgNames: ["HubSpot"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google Sheets", "Google Analytics", "GA4", "Looker Studio", "Google"], orgNames: ["Google"] },
  linkedin: { name: "LinkedIn", displayTag: "LinkedIn", aliases: ["LinkedIn"], orgNames: ["LinkedIn"] },
  youtube: { name: "YouTube", displayTag: "YouTube", aliases: ["YouTube"], orgNames: ["YouTube"] },
  x: { name: "X", displayTag: "X", aliases: ["X", "Twitter", "X/Twitter"], orgNames: ["X", "Twitter"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Instagram", "Facebook"], orgNames: ["Meta"] },
  github: { name: "GitHub", displayTag: "GitHub", aliases: ["GitHub"], orgNames: ["GitHub"] },
  notion: { name: "Notion", displayTag: "Notion", aliases: ["Notion"], orgNames: ["Notion"] },
};
// Identity guard deliberately uses narrow patterns; avoid matching common English words like "make", "buffer" or "x".
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "n8n", name: "n8n", patterns: [/\bn8n\b/i] },
  { id: "zapier", name: "Zapier", patterns: [/\bzapier\b/i] },
  { id: "hubspot", name: "HubSpot", patterns: [/\bhubspot\b/i] },
  { id: "linkedin", name: "LinkedIn", patterns: [/\blinkedin\b/i] },
  { id: "youtube", name: "YouTube", patterns: [/\byoutube\b/i] },
  { id: "github", name: "GitHub", patterns: [/\bgithub\b/i] },
  { id: "notion", name: "Notion", patterns: [/\bnotion\b/i] },
];
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "n8n", domains: ["n8n.io", "blog.n8n.io"] },
  { entityId: "zapier", domains: ["zapier.com"] },
  { entityId: "make", domains: ["make.com"] },
  { entityId: "buffer", domains: ["buffer.com"] },
  { entityId: "hubspot", domains: ["hubspot.com", "blog.hubspot.com"] },
  { entityId: "google", domains: ["google.com", "developers.google.com"] },
  { entityId: "linkedin", domains: ["linkedin.com"] },
  { entityId: "youtube", domains: ["youtube.com"] },
  { entityId: "github", domains: ["github.com"] },
  { entityId: "notion", domains: ["notion.so"] },
];
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
