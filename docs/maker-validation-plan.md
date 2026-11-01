# Maker workflow publication — 30-day positioning validation

> Product stage: **experiment, not proven demand or an announced launch.** Provisional public brand: AI Workflow Fieldbook. No domain has been purchased or trademark clearance obtained. Change the brand before launch if research identifies a conflict.

## Reader and promise

**Audience:** independent developers, creator-founders and lean teams with a product, channel or recurring operational job to run.

**Promise:** Practical AI workflows for Build (ship), Grow (find users) and Automate (save repetitive effort). Every article should show the job, prerequisites, input, output, source evidence, what can go wrong, and what was *actually tested* versus merely documented.

**Not:** generic AI news, bulk translated news summaries, a tool directory, fake success metrics, unaudited generated tutorials or a newsletter whose subscribers cannot be verified.

## The three public tracks

| Track | Core question | Example deliverable | Existing starter page |
| --- | --- | --- | --- |
| Build | Can I build, debug and deploy something useful with fewer mistakes? | A one-screen MVP, review checklist and preview | `/playbooks/ship-ai-assisted-site-with-review` |
| Grow | Can I reach the right users with evidence, not a guessing game? | Query/SERP brief and three evidence-backed pages | `/playbooks/find-first-seo-pages-for-new-site` |
| Automate | Can a small team repeatedly finish a job without manual copying? | Reliable n8n / research / reporting workflow with approval gate | `/playbooks/rss-to-editorial-idea-queue` |

Previously written content-repurposing and weekly GA4 guides remain available as Grow and Automate. Their source-led / not independently tested status remains visible. **Five starter playbooks are not nine validated tutorials.**

## Nine-topic experiment backlog (not all published)

For each topic: find the original docs, confirm a repeatable method, run an actual test where feasible, preserve screenshots/logs and caveats, edit a publishable article, and record both distribution and usage.

### Build
1. **Build and deploy a useful one-page AI-assisted app** — track: Build; format: tutorial + preview and error-state screenshot.
2. **Use an AI coding assistant to review a GitHub PR safely** — track: Build; format: review checklist, example diff, observed false positives and human-approval evidence.
3. **Build a small research Agent with a real tool call** — track: Build; format: code sample, allowed permissions, failure modes and minimal test suite.

### Grow
4. **Find the first SEO pages for a new product** — track: Grow; format: dated SERP observations and a prioritized brief, *no invented search volume*.
5. **Monitor competitor page changes and turn them into research notes** — track: Grow; format: original page snapshots where permitted, diff summary, source logs.
6. **Repurpose a founder video into channel-specific drafts** — track: Grow; format: timestamped facts, two to three drafts and licensing/approval checklist.

### Automate
7. **Turn owned YouTube transcripts into a source-linked notes library** — track: Automate; format: consent/rights rules, transcript provenance and searchable output.
8. **Produce an approval-gated GSC/GA4 weekly report** — track: Automate; format: mapping, observed numbers, retry and idempotency checks.
9. **Build an RSS-to-private-ideas queue in n8n** — track: Automate; format: importable *original* JSON only once tested, dedupe and manual publish gate.

## Thirty-day decision process

**Days 1–7:** establish baseline Search Console (if accessible), analytics, event definitions, newsletter consent and source licensing. Select the three topics with strongest firsthand evidence. Verify each on a fresh test environment. Do not create fabricated testimonials or metrics.

**Days 8–14:** publish or revise 3 well-checked guides covering all three tracks. Make at least one actual test/demo instead of relying solely on the existing documented starters. Use original screenshots or logs, with keys and private data redacted. Distribution: relevant maker communities only where self-promotion is permitted.

**Days 15–21:** compare real visits, qualified comments and workflow usage. Produce 3 more guides or deepen pages readers actually used; avoid padding the editorial output to hit a quota.

**Days 22–30:** publish remaining evidence-backed work if it passes quality review. Decide whether to keep all 3 tracks, merge two, or narrow again. Make the call from behavior and observed inbound tasks, not just clicks.

## Measurement and decision criteria

- **Acquisition:** Search Console impressions/clicks by page, actual referrers, newsletter *verified* opt-ins (if provider is connected). Attribute uncertain data honestly.
- **Activation:** consent-safe clicks on original sources, verified template downloads or demo completions, useful support questions, and repeated usage.
- **Editorial cost:** hours and third-party API expense per *tested* guide. Avoid a pipeline that creates 100 thin articles.
- **Signal of fit:** multiple independent readers who attempt a workflow, return, request a sequel, or subscribe for more practical work.
- **Signal to pivot:** generic posts outperform practical guides in clicks but produce no useful engagement; one track consistently dominates; audience reports content is too broad.

**No invented targets.** Set numeric thresholds after the baseline week. A tiny sample cannot establish product-market fit; the goal is to decide where to invest in the next quarter.

## Technical boundaries

- Keep existing AIHOT source IDs, schema, routes and manual release/withdraw security semantics.
- Existing 24 RSS/Atom candidates and 10 disabled paid X queries remain *candidates*, not evidence of live monitoring. Two new Build GitHub Atom sources are disabled pending feed preview.
- Internal Source Radar and Opportunity Radar group discovery into the three tracks, while retaining fine-grained SEO/social/ads/analytics lanes.
- Newsletter remains disabled until a real provider, opt-in/opt-out and privacy copy have been verified.
- Public Playbooks must link to original sources; never claim a workflow was tested unless a test report is actually available.
- The old AIHOT auto-news / report endpoints are **not** the new curated release mechanism. Keep isolated until audited or retired.
