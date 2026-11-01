# AI Workflow Fieldbook — source coverage and ingestion policy
Last researched: 2026-11-01 · Provisional brand · English-first editorial project

## Read this before enabling a worker

The shipped seed list is [industry/sources.json](../industry/sources.json). At the current revision there are **24 candidate RSS/Atom feed configurations plus 10 disabled X keyword searches**, all `participation_mode: isolated`, with full-text redistribution explicitly off. **Configured does not mean a production fetch has succeeded**. Each feed needs an isolated preview on the deployment host and content/date validation before enabling collection.

The private admin link-saving form supports a canonical link from X, GitHub or YouTube, but it **does not** read the linked post or video text and does not represent continuous monitoring. Original X/API credentials, licensed video transcription, Reddit access and paid third-party data are not connected. Existing sources stored in a real database are not deleted merely because a seed is removed from JSON.

## Editorial coverage matrix

| Lane / reader task | Feeds configured (private candidate) | Complementary sources to curate (not connected to live monitoring) | Editorial question |
| --- | --- | --- | --- |
| 1. AI Agents & workflow automation | n8n Blog, Make Blog, n8n GitHub Releases, n8n YouTube | n8n workflow gallery, GitHub issues/examples, Zapier templates, X practitioner demos | Can a marketer reproduce the workflow, and what approvals, credentials and costs are required? |
| 2. SEO, AEO & organic discovery | Google Search Central, Ahrefs Blog, Search Engine Land | Google Search Status Dashboard, GSC documentation, original SEO experiments, Reddit r/SEO | Does the claim change a real organic-search workflow, and is it backed by original measurement? |
| 3. Social publishing & community | Buffer Resources, Social Media Examiner, Later Blog, Meta Developer News | X/Twitter practitioner threads, LinkedIn examples, Reddit marketing communities, creator video demos | Which platform/account permissions actually permit the action? |
| 4. Paid acquisition / ads / performance | Google Ads & Commerce, Microsoft Advertising, Meta Developer News, Search Engine Land | Google Ads API documentation and changelog, official Ads accounts, controlled tests by practitioners | What changes in campaign setup, attribution, permissions, creative approval or cost? |
| 5. Content marketing & repurposing | Buffer Resources, HubSpot Marketing, Lenny's Newsletter | YouTube tutorials, creator-owned demonstrations and open GitHub projects | Can a human-reviewed reuse workflow be followed without inventing claims or infringing source rights? |
| 6. Email marketing & CRM lifecycle | Omnisend, Campaign Monitor, HubSpot Marketing, HubSpot Sales | Customer.io, Klaviyo and Kit official docs, ESP changelogs, deliverability practitioner discussions | Is the automation permission-based, measurable and compliant with actual platform limits? |
| 7. Marketing analytics, attribution & reporting | Amplitude, PostHog, Google Ads & Commerce | GA4 Data API documentation, Looker Studio release notes, analytics practitioners | What metric definition/date range/identity setting supports the conclusion? |
| 8. Ecommerce & retail growth | Shopify Changelog, Practical Ecommerce, Omnisend | Shopify merchant case studies, Shopify app developer changelogs, merchant original posts | Is this relevant to ecommerce merchants rather than a generic software promotion? |
| 9. Growth, GTM, CRO & experimentation | Lenny's Newsletter, HubSpot Sales, Amplitude, PostHog | Growth Unhinged (website/manual; no verified native feed here), CXL, Marketing Examples, original AB tests | Is there a baseline, test method, control/comparison and credible result? |
| 10. AI platform constraints & product updates | n8n Releases, Meta Developer News and relevant official product blogs | OpenAI developer docs, model API changelogs, GitHub release notes | Does a changed feature or API genuinely impact an existing marketer workflow? |

### Preconfigured X keyword searches (all disabled)

The existing AIHOT SocialData `x_search` adapter can use the following **future** inputs after the operator authorizes credentials and spend. They are configured with `enabled:false`, so merely importing these rows makes no paid requests.

| Marketing lane | Disabled source ID | Query |
| --- | --- | --- |
| Automation | `x-auto-marketing` | `n8n marketing automation lang:en -filter:replies` |
| SEO | `x-seo-automation` | `AI SEO workflow lang:en -filter:replies` |
| Social | `x-social-automation` | `AI social media automation lang:en -filter:replies` |
| Paid ads | `x-paid-media` | `AI ads automation lang:en -filter:replies` |
| Content | `x-content-repurposing` | `AI content repurposing lang:en -filter:replies` |
| Email | `x-email-lifecycle` | `AI email marketing workflow lang:en -filter:replies` |
| Analytics | `x-analytics-reporting` | `AI marketing reporting lang:en -filter:replies` |
| Ecommerce | `x-ecommerce-growth` | `Shopify AI automation lang:en -filter:replies` |
| CRO | `x-growth-experiments` | `AI growth experiments lang:en -filter:replies` |
| Agents | `x-agent-marketing` | `AI agent marketing workflow lang:en -filter:replies` |

These queries are **untested candidates**, not guaranteed to produce quality results or to support all X operators in SocialData. Preview a small number after explicitly setting `SOCIALDATA_API_KEY` and the paid request budget. Review sample quality, actual timestamps, API restrictions and duplicate rate before enabling a scheduled query. No automatically discovered X content can bypass isolated editorial review.

### Source types and evidence hierarchy

- **Primary:** official documentation, changelogs, GitHub releases, product/API announcements, firsthand controlled experiments. Tier T1 describes provenance, not impartiality.
- **Practitioner:** firsthand X Threads, video walkthroughs, public workflow exports, implementation blog posts; validate author, access conditions, version, source and date.
- **Independent:** specialized SEO/social/marketing analysis and newsletters (T2); attribute their interpretation separately from original findings.
- **Community demand:** recurring questions from Reddit, forums and comments; this is evidence of *pain*, not proof that a proposed solution works.

For an important item, triangulate at least two independent evidence types (e.g. official release + firsthand demonstration, or developer docs + user test), then record limitations. If only one credible primary source exists, state that fact clearly; do not invent a second source.

### Monitoring modes and truthful statuses

| Mode | Current state | Allowed output |
| --- | --- | --- |
| Seeded RSS / Atom | 22 candidate configurations, **not fetch-verified for this deployment** | Internal candidate rows only; initial backfill <=3 for new seeds |
| Manual X status URL | Implemented admin bookmarking | Canonical URL + explicit unverified placeholder |
| Manual GitHub URL | Implemented admin bookmarking | Canonical repository/issue/release URL + explicit unverified placeholder |
| Manual YouTube URL | Implemented admin bookmarking | Canonical video URL + explicit unverified placeholder |
| X keyword and watch-account automation | 10 **disabled** keyword query presets, **not running**; no watch-account monitoring | Do not claim fresh posts; requires SocialData API credentials, explicit payment approval, 429 controls and an observed working preview |
| YouTube channels / search | One experimental n8n channel feed seed; generic search not integrated | A channel feed must be previewed and its channel ID checked |
| GitHub discovery | n8n Releases Atom only plus manual bookmarks | No global GitHub topic/commit monitoring yet |
| Reddit / independent communities | Watchlist only | Link and discuss source context manually; do not scrape behind restrictions |
| Paid marketing intelligence | Not integrated | Do not claim ad spending, reach or ROI; no silent subscriptions |

### Source Radar admin implementation

- Admin navigation: **Source Radar** (`/admin/source-coverage`); authenticated endpoint `GET /api/admin/source-coverage`.
- Uses the one-to-many canonical lane mapping `industry/source-coverage.ts`, covering exactly the 34 IDs in `industry/sources.json` (24 RSS + 10 disabled X keyword presets). New seeds must be added to both files or registry tests fail.
- Source statuses: `not_imported` (seed not in DB), `not_tested` (no recorded fetch), `never_successful`, `failing`, `degraded`, `stale`, `overdue`, `paused`, and `observed_ok` (recent successful collection). A successful fetch is **not** source credibility or copyright clearance.
- Each card shows recent fetch time/status, found/new counts, errors, items collected over seven days and linked marketing lanes. X keyword presets display separately and are not eligible for one-click preview here to prevent accidental paid API requests. The dashboard does not make external calls during initial load.
- A human can click **Preview live feed** on one imported RSS source. It uses the project's existing authenticated preview endpoint and does **not** store candidates, trigger an LLM, or grant publication permission. A preview success is transient, not recorded as a durable fetch unless the normal collector subsequently runs.
- `packages/backend/src/admin/sources.ts` derives its protected source IDs from this same registry, so all 34 seeds cannot be flipped to public editorial participation or full-text redistribution through routine admin edits. The manual X, GitHub and YouTube buckets are likewise protected.
- The default admin **Source** creation form still needs operators to provide the actual feed URL and credentials. A seed missing from an already-running database does not magically appear by changing this JSON; explicitly import approved candidates through the project's supported source creation workflow.

## Operational plan

1. **Preview every feed** as an isolated source via admin's feed preview. Require HTTP success, parseable RSS/Atom, canonical links, a sensible date, the expected author, and no mass duplicates. Record `checked_at`, HTTP code, parsed item count, last item time and error in operator notes or an admin health table. An aggregator reporting a feed as active does **not** prove this deployment can fetch it.
2. **Enable selectively:** Begin with 2 source families from each of the highest-impact lanes, then expand gradually. Cost and rate-limit ceilings should apply to *discovery*, not only LLM prompts.
3. **Preserve original-source credit:** `site_fulltext=false` and `syndicate_fulltext=false` unless an explicit, applicable license/permission is recorded. Keep original URL, attribution, author, source type, observed time and publication date separately.
4. **Cross-lane balance:** A single tool company, SEO blog or platform should not dominate the weekly shortlist. During human review aim to include at least 4 distinct marketing tasks and both primary and practitioner evidence. Do not force low-value filler for quotas.
5. **Review policy:** Source collection and AI scores are private. Editors verify, add original insight and separately click `Publish Signal`. Only an explicitly released item enters `/signals` or its RSS.
6. **Newsletter:** Generate a proposed Digest from separately released material once provider setup is complete; send only on deliberate editorial approval and through an email provider with verified unsubscribe.
7. **Improve coverage monthly:** Track source uptime, duplicate rate, high-value findings per 100 fetched items, source-origin diversity, editorial acceptance rate, broken URLs and reader engagement. Replace weak feeds, do not maximize raw URL volume.

### Candidate-specific notes

- Feeds in `industry/sources.json` were chosen after public-source research. Some third-party feed directories report endpoint status; treat that as a lead, not our own connectivity test.
- Google Search Central: `https://developers.google.com/search/blog/feed.xml`; Ahrefs: `https://ahrefs.com/blog/feed/`; Search Engine Land: `https://searchengineland.com/feed`.
- Social Media Examiner: `https://www.socialmediaexaminer.com/feed/`; Later: `https://later.com/rss.xml`.
- Google Ads & Commerce: `https://blog.google/products/ads-commerce/rss/`; Microsoft Ads: `https://about.ads.microsoft.com/en-us/blog/rss`; Meta Developer News: `https://developers.facebook.com/blog/devblog/rss/`.
- Omnisend: `https://www.omnisend.com/blog/feed/`; Campaign Monitor: `https://www.campaignmonitor.com/blog/feed/`; HubSpot Sales: `https://blog.hubspot.com/sales/rss.xml`.
- Amplitude: `https://amplitude.com/feed`; PostHog: `https://posthog.com/rss.xml`.
- Shopify Changelog: `https://changelog.shopify.com/feed.xml`; Practical Ecommerce: `https://www.practicalecommerce.com/feed`.
- Lenny's Newsletter: `https://www.lennysnewsletter.com/feed`. Some content may be member-only; collect metadata only and never reproduce member content.
- Growth Unhinged uses a new publishing platform as of Jan 2026. Its old Substack is not current; use `https://www.growthunhinged.com/` as a website watchlist only until a current accessible feed or permitted integration is confirmed.
