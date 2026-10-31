/**
 * Editorial source registry: one canonical mapping from private feed and disabled X keyword seeds to marketing lanes.
 * Catalog presence is never evidence that a feed URL currently works or that a site is live.
 */
export const MARKETING_LANES = [
  { id: "automation", title: "AI automation & Agents", description: "Reusable workflows, AI agents, actual integrations and operator limits." },
  { id: "seo", title: "SEO & AI Search", description: "Organic discovery, search quality, AEO, original SEO experiments." },
  { id: "social", title: "Social & community", description: "Social publishing, platform APIs, creators and communities." },
  { id: "paid", title: "Paid media", description: "Google, Meta and Microsoft ads, campaign experiments and reporting." },
  { id: "content", title: "Content marketing", description: "Planning, research, repurposing and distribution workflows." },
  { id: "email", title: "Email & CRM", description: "Consent-aware email, lifecycle, CRM and lead workflows." },
  { id: "analytics", title: "Measurement & analytics", description: "Marketing metrics, attribution and reproducible data reports." },
  { id: "commerce", title: "Ecommerce", description: "Storefront, merchant, retention and digital commerce operations." },
  { id: "growth", title: "Growth & CRO", description: "Experiments, positioning, conversion and GTM practice." },
  { id: "platform", title: "AI platform changes", description: "Developer changes that materially affect marketer workflows." },
] as const;
export type MarketingLane = (typeof MARKETING_LANES)[number]["id"];

/** Each catalog entry is metadata only; the feed URL, API query, enabled flag and participation live in sources.json.
 * All seeds are private until a separately audited human release has taken place.
 */
export const MARKETING_SOURCE_LANES = {
  "rss-n8n-blog": ["automation", "content", "platform"],
  "rss-buffer-resources": ["social", "content"],
  "rss-hubspot-marketing": ["content", "growth", "email"],
  "rss-make-blog": ["automation", "platform"],
  "rss-n8n-github-releases": ["automation", "platform"],
  "rss-n8n-youtube": ["automation", "content"],
  "rss-google-search-central": ["seo", "platform"],
  "rss-ahrefs-blog": ["seo", "content"],
  "rss-search-engine-land": ["seo", "paid"],
  "rss-social-media-examiner": ["social", "content"],
  "rss-later-blog": ["social", "content"],
  "rss-google-ads-commerce": ["paid", "commerce"],
  "rss-microsoft-advertising": ["paid", "platform"],
  "rss-meta-developers": ["social", "paid", "platform"],
  "rss-omnisend-blog": ["email", "commerce"],
  "rss-campaign-monitor": ["email", "content"],
  "rss-amplitude-blog": ["analytics", "growth"],
  "rss-posthog-blog": ["analytics", "growth"],
  "rss-shopify-changelog": ["commerce", "platform"],
  "rss-practical-ecommerce": ["commerce", "growth"],
  "rss-lennys-newsletter": ["growth", "content"],
  "rss-hubspot-sales": ["email", "growth"],
  "x-auto-marketing": ["automation"],
  "x-seo-automation": ["seo"],
  "x-social-automation": ["social"],
  "x-paid-media": ["paid"],
  "x-content-repurposing": ["content"],
  "x-email-lifecycle": ["email"],
  "x-analytics-reporting": ["analytics"],
  "x-ecommerce-growth": ["commerce"],
  "x-growth-experiments": ["growth"],
  "x-agent-marketing": ["automation", "platform"],
} as const satisfies Record<string, readonly MarketingLane[]>;

export const PRIVATE_MARKETING_SEED_IDS: readonly string[] = Object.keys(MARKETING_SOURCE_LANES);
