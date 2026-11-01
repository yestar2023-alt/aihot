# AI Workflow Fieldbook — implementation and launch handbook

> **Status: substantial working MVP code on a development PR, NOT a live production service.** Provisional brand/domain. Existing AIHOT engine under MIT license; preserve its LICENSE and NOTICE. Never assume connected platform APIs or mailing-list services exist until credentials, permissions and live tests confirm them.

## Product boundary

AI Workflow Fieldbook is an **English-first, task-led editorial fieldbook for independent makers, creators and lean teams**, not an AI-tool directory or a mass AI-news rewrite site. Three reader tracks: **Build / Grow / Automate**. Delivery formats remain curated Signals, source-led Playbooks and an optional biweekly Digest. Source discovery is primarily internal; publication always requires human action.

## Implemented code

| Layer | Implementation |
|---|---|
| English front door | New `/` marketing home, `/signals`, `/playbooks`, `/playbooks/:slug`, `/newsletter`, `/about`, and English draft legal pages `/terms` and `/privacy`. Main navigation and wordmark are English. Previous engine home is preserved under **noindex `/archive`** for regression analysis. |
| Editorial Playbooks | Five original, English task-led guides across Build, Grow and Automate: site shipping, SEO page research, content repurposing, weekly GA4 reporting, and RSS editorial intake. Each states prerequisites, steps, checklists, pitfalls, official-source URLs and **not independently tested** status. No invented workflow tests or downloads. Data is shared in `site/playbooks.ts` for site and sitemap. |
| Intake | Authenticated `/admin/save-source` and `POST /api/admin/bookmark` normalize X/Twitter statuses, GitHub repositories/releases/issues, and YouTube videos. Only metadata and canonical URL enter the system. Existing `/admin/save-x` and CLI remain supported. No platform scraping/API calls. |
| Candidate discovery feeds | 24 RSS/Atom candidates (including 2 newly disabled Build-focused GitHub Releases sources) plus 10 disabled X query presets. Legacy marketing sources stay useful under Grow and Automate. All seeded as **isolated**, no full-text republication or automatic release. **Must test actual parser compatibility, live HTTP access and backfill boundaries.** |
| Curation | `/admin/curation` with `inbox → shortlisted → fact_checked → approved`, rejection/reopening/revocation, source evidence, detailed notes, optimistic versions and transactional audits. A fact-check requires an HTTPS evidence URL and explanatory note. |
| Publishing | A **separate explicit admin release** is required after approval. `curation_releases` records a human-written title/summary, review version and release/withdraw events. Public query rechecks current approval, review version, source isolation, source enabled flag and release state. |
| Public releases | `/signals`, `GET /api/site/signals`, `/feed/signals.xml`; short caching and withdraw. Playbooks and, when released, Signals are included in sitemap. **The legacy AIHOT automatic news/report channels are not this editorial release system.** |
| Digest | `/admin/digest` builds an editable Markdown draft from *publicly released* Signals plus linked Playbooks. Sending is deliberately manual until a verified provider is connected; editing does not auto-email. |
| Email opt-in | `/newsletter` supports Buttondown's standard HTML `POST /api/emails/embed-subscribe/{username}` flow (not JavaScript fetch). It remains disabled without `BUTTONDOWN_USERNAME`; no fake signup or claims of sends. |
| Operational safety | Collection/model calls default off in `.env.example`. Seed feeds and manual bookmark source IDs are protected from being switched to automatic publication by ordinary source edits. |

## Revised audience and positioning (2026-11-01)

The public website is no longer limited to marketing operators. It now addresses independent developers, creators and small teams wanting repeatable AI workflows for **Build / Grow / Automate**. Marketing remains a subset of Grow; existing SEO and lifecycle seed IDs and archived data remain intact.

- **Provisional name only:** AI Workflow Fieldbook (no domain reservation or trademark verification).
- **Source map:** fine-grained research subdomains have parent reader tracks; Build now includes AI Coding & Product Building. New Build feed candidates start disabled.
- **Playbooks:** five guides are currently authored as documented starting points; none claims an independently executed production workflow.
- **Validation plan:** see [Maker positioning validation](maker-validation-plan.md) for a 30-day, nine-topic *experiment backlog*, not nine falsely published tests.
- **Compatibility:** old database IDs, original report machinery, MCP prefix and automated editorial publication safeguards are preserved. No automatic production deployment.

## Three dedicated entry pages

- `/workflows/build` — product shipping, AI coding, agents and deployment.
- `/workflows/grow` — SEO, content and user acquisition.
- `/workflows/automate` — operations, data, repeatable processes and research.
- These entries reuse the single canonical `site/playbooks.ts` records; content is never copied into separate routes.
- Each page links to individual Playbooks and labels the documented / not independently tested status. The new track pages intentionally use `noindex` while fewer than 3 guides exist in a track, to avoid premature thin-category indexing. Revisit after at least three substantive, source-checked guides per track and sufficient evidence of audience use.
- Previous `/playbooks?track=Build|Grow|Automate` bookmarks remain usable. Existing AIHOT archive paths and curated Signals publish/withdraw semantics are unchanged.
- Regression checks should cover `/workflows/{build,grow,automate}`, invalid track = 404, correct canonical URLs, and the legacy archived category-cache tests.

## Local run / smoke test

1. Follow `AGENTS.md`, `docs/deploy.md` and `docs/sources.md`. Use Node.js **24.22.1+**, PostgreSQL **17** and the repo's Docker Compose configuration.
2. `npm ci`, generate `.env` with `node scripts/init-env.ts` and use **unique, private secrets**. Keep `COLLECT_ENABLED=false` and `MODEL_CALLS_ENABLED=false` initially.
3. Apply migrations with `npm run db:migrate`. Back up the database before an existing-instance migration.
4. Run services per the repository's normal development or Docker deployment guide. Test `/api/health`, `/`, `/playbooks`, each Playbook detail, `/signals`, `/feed/signals.xml`, and the authenticated `/admin`.
5. In admin: save a real public X/GitHub/YouTube URL at `/admin/save-source`, verify private source and no public appearance, then exercise each editorial review stage. A review marked **approved** must still be invisible publicly.
6. Write a short *original*, sourced public title/summary and click **Publish Signal**. Check page/API/RSS and that a subsequent **Withdraw** removes it from fresh responses. Expect up to **30 seconds** of shared cache (and up to five minutes for a prebuilt sitemap). Verify all public/private checks again after modifying a review.
7. Run `npm run typecheck`, `npm test`, and `npm run test:standalone`, plus `npm run build -w @aihot/web` and the CI's browser tests. Only claim checks that **actually passed on the exact latest commit**.

## Feed operations: no purchased APIs required for first look

- Seed sources come from `industry/sources.json`. Initial backfill is capped at five items per source (two for new Build sources). Inspect the **source preview** in admin and verify item URLs, original author, date precision and whether YouTube Atom and GitHub releases Atom parse on your host.
- Because the source seed is **import-only**, removing entries from that file does **not** remove previous sources from an existing PostgreSQL instance. Disable old generic AIHOT feeds manually in admin and verify none remain publicly selected.
- Once the fetch behavior, copyright position and cost/quotas are confirmed, enable collection with a scoped provider/budget. AI model ranking alone must **not** publish.
- X account/search monitoring via AIHOT's existing third-party integration is **not configured**. For now X URL intake works without an X API key; reading X post text automatically requires licensed and cost-controlled access.
- YouTube video and GitHub URLs saved manually are placeholders until an editor checks the originals. Do not treat a bookmark as a scrape, transcript or published finding.

## Newsletter integration

1. Create a real Buttondown publication under your own account and verify the hosted signup URL, confirmation/CAPTCHA behavior, unsubscribe flow and privacy disclosure.
2. Set `BUTTONDOWN_USERNAME=your-actual-handle` in the runtime environment, deploy/restart, and submit a real test address. Follow the provider's own end-to-end confirmation to verify that the address enters the **correct** list.
3. Prepare the actual issue using `/admin/digest`. Its draft is editable but **not stored and not sent** from this app. Copy only after editorial sign-off into Buttondown or another approved sending provider.
4. Only later consider automated draft creation and a manually approved scheduled send with authenticated provider API, unsubscribe handling, logs and delivery-idempotency tests. Do not enable automatic email sending on day one.

Official integration guide: https://docs.buttondown.com/building-your-subscriber-base

## New: private Opportunity Radar (editorial triage)

- `/admin/opportunities` plus `GET /api/admin/opportunities?days=7|30` reads recent stored **isolated** marketing source metadata (up to 500 rows and 100 displayed groups); no external calls, LLM, web searches, or third-party content copying.
- The deterministic ranking combines title evidence of a specific task, first-party provenance, discovery recency and **potential** related coverage. A similar headline is never independent corroboration.
- Reviewers can inspect original source links, filter by marketing domain and shortlist a candidate using the existing authenticated versioned review API. The action does not fact-check, approve, release, or email.
- An empty queue is an honest empty state; no views, reach, keyword volume, trend score or traffic projections are invented.
- Tests cover grouping, date windows, rejected items, attribution and empty queues. The ranking means **editorial review priority**, not an SEO opportunity score.
- Source Radar has 22 candidate RSS/Atom feeds and 10 disabled paid-X search presets. Operators must verify latest CI and preview real feeds before enabling scheduled collection.

## Open release blockers — cannot be truthfully claimed completed without operator inputs

| Blocker | What remains |
|---|---|
| CI and live smoke | Confirm latest PR CI is fully green; check working deployment against real PostgreSQL and one real source from each feed family. |
| Domain & hosting | Choose/register a non-conflicting brand/domain, provide SITE_URL and deploy with secret-backed Postgres, HTTPS, backup, monitoring and access restrictions. Do not deploy in this PR by default. |
| Newsletter | Actual Buttondown publication username, verified consent flow and sender account; no email addresses can be collected until then. |
| Legal | Provide genuine business contact and privacy/controller identity; review hosting/analytics/cookies, original media rights, affiliate disclosure and legal drafts. Legal drafts are **noindex**. |
| Branding | Replace any remaining raster PNG/ICO/Apple touch icons inherited from the template; only the original vector and JSX wordmark were replaced. |
| Discovery | Confirm seeded RSS/Atom compatibility on the runtime. Automated X monitoring requires a license, credentials and spend cap. |
| Content | Publish verified Signals via the editor and add more firsthand-tested Playbooks; the starting three are research-backed designs, not personally tested downloads. |
| Legacy routes | Original `/all`, `/items`, reports, feeds and MCP still exist in the engine for compatibility. They must be explicitly retired or isolated (including sitemap and SEO policy) before production launch, rather than accidentally exposing old generic AI news. |
| Business | Real Affiliate agreements, pricing, licensing for templates, payment provider and fulfillment are intentionally **not** invented or activated. |

## Editorial safety rules

- Attribute source author, first-party link and original date where known. Do not invent timestamps, costs, performance data or platform API permission.
- Do not copy/rehost full copyrighted articles, X threads or videos. A source link is not reproduction permission.
- All AI summaries and candidate rankings stay private until human evidence review plus separate publication command.
- A guide derived from official documentation must carry a **documented, not independently tested** label; change this only after recording reproducible test evidence.
- Do not auto-send newsletters, buy domains, activate paid endpoints, or deploy production without verified credentials and operator approval.

## Pull request checkpoints

1. Review all changed files, verify inherited license and source-mode guards.
2. Require GitHub Actions checks **on the latest commit**, not earlier cancelled/failing runs.
3. Run full local/browser smoke across desktop/mobile; verify home/playbook SSR, metadata, robots and sitemap.
4. Provision external accounts/contacts separately, then make a dedicated launch PR.
