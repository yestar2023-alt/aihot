# AI Marketer Signal — AIHOT adaptation status (first implementation slice)

> **Development branch, NOT ready to deploy.** Working name and brand are provisional. This is an adaptation of the existing AIHOT engine (MIT license); keep LICENSE and NOTICE. Do not reuse AIHOT's trademark or raster logos.

## Product contract

- Audience: English-speaking content, social, growth and lifecycle marketing operators.
- Promise: **Less AI noise. More useful marketing workflows.**
- Primary output: curated, attributed signals and occasional reproducible marketing playbooks, not an AI tools directory.
- Research sources: RSS, X links, GitHub repositories, YouTube tutorials, official documentation and validated marketing case studies.
- Monetization later: disclosed tool Affiliate links, tested template downloads and services.
- Newsletter: optional digest distribution **after** the editorial review and email-consent workflow exists. Existing AIHOT daily/weekly report generation is **not** a mailing-list sender.
- Chinese market: no translated duplicates or WeChat/Xiaohongshu tutorials in v1. Different platforms need independent verification.

## Implemented on this branch

- Renamed site identity and SEO description to provisional **AI Marketer Signal**.
- Marketing-operations taxonomy and job-centric topics replace generic model/news categories.
- Candidate sources: n8n Blog, Buffer Resources, HubSpot Marketing Blog and Make Blog. Each imports with `participation_mode: isolated`, `site_fulltext: false`, `syndicate_fulltext: false`. Source retrieval compatibility still needs live preview.
- Editorial prompts prioritize real workflows, evidence, limitations and the reader's task rather than model launches and funding news.
- Manual X bookmarking: authenticated **`/admin/save-x`** browser form + `POST /api/admin/bookmark-x` (admin session + CSRF + private-source guard), alongside `scripts/bookmark-x.ts` for CLI. Both normalize X URLs, deduplicate through the existing external-ingest API and **do not retrieve tweet text** or fabricate timestamps.
- `.env.example` defaults collection and model calls to disabled until an operator explicitly enables them.
- Original vector logo replaced; **PNG/ICO/Apple icons and nameplate assets still need replacement before public launch**.

## Exercise private X link bookmarking (local development)

1. Read `AGENTS.md`, `docs/deploy.md` and `docs/sources.md`. Use Node.js 24+, PostgreSQL 17 and Docker Compose if you want the full application.
2. Generate `.env` using `node scripts/init-env.ts`. Do not commit it. Set `INGEST_TOKEN` to a unique random secret of at least 16 characters and keep `COLLECT_ENABLED=false` / `MODEL_CALLS_ENABLED=false`.
3. Start the app locally and sign into `/admin`. Use the **Save X post** menu (`/admin/save-x`), paste a genuine public post URL and submit; it invokes `/api/admin/bookmark-x` through the existing authenticated and CSRF-protected admin API. Alternatively, use the CLI with a real **public** URL:
   ```bash
   node --env-file-if-exists=.env scripts/bookmark-x.ts 'https://x.com/creator/status/1234567890123456789'
   ```
   Replace the example with a real URL. The script sends only the canonical URL and a placeholder title to `POST /api/ingest/items`.
4. The importer creates an `external` source with ID `manual-x-bookmarks`; the framework defaults newly created external sources to **isolated**, not public. Verify it in `/admin`. Repeated URLs should return zero newly created entries. No X API key is required to bookmark a URL; reading the post content requires a separate licensed source.
5. Run `node --test tests/bookmark-x.test.ts` to validate local bookmark parsing without hitting X.

Do not switch any candidate source to `editorial` or enable collection/model workers on a public deployment until the human approval gate and content rights review exist. Already imported generic demo sources are **not deleted** by changing `industry/sources.json`; pause them in admin on existing databases.

## Explicitly NOT finished

| Gap | Acceptance requirement |
| --- | --- |
| English frontend | Translate actual React Router interface copy and issue templates; only some config and prompts are English today. Do not set `locale=en-US` until the UI itself matches. |
| Full source intake UI | `/admin/save-x` exists for X links. Extend it to GitHub and YouTube, add an inbox/review status and private ingestion audit; X text remains unverified until licensed retrieval. |
| Private editorial pipeline | Database-backed states `inbox → triaged → shortlisted → fact_checked → approved/rejected`, audit logs and owner-only permissions. Current AIHOT auto-selection is **not** equivalent to approval. |
| Publication gate | Public signals, SEO pages, RSS and daily/weekly reports must see only explicitly approved items (including an audit record). End-to-end negative tests required. |
| Content schema | Separate sourced curated link, editorial insight, published issue and human-verified playbook; distinguish source claim vs editor test. No bulk spun SEO pages. |
| X radar | Official/licensed API access check, source accounts/keywords, spend limits, 429 handling, deletion handling and admin controls; **not connected**. |
| GitHub / YouTube discovery | Source permissions, rate limits, clean incrementals, evidence and retrieval-status reporting. |
| Newsletter | Double opt-in when appropriate, unsubscribe, provider webhooks and human-send approval; **no email has been configured or sent**. |
| Asset/legal rollout | Replace all raster branded assets, write real Terms/Privacy and consent, add Affiliate disclosure, verify licensing and source opt-outs. |
| Quality checks | `npm run typecheck`, `npm test`, web build, browser test and live feed preview on Node 24/Postgres 17. These have **not** been executed locally from this chat. |
| Production | Domain, hosting, credentials, backups, monitoring, billing approval and manual go-live review. Not authorized or performed. |

## Recommended next PR sequence

1. **M1 — Private inbox & review gate:** expand existing `/admin/save-x` URL saver into reviewable inbox with DB state machine, do not publish AI-selected items automatically; add a migration plus tests and preserve public API semantics.
2. **M2 — English editorial UI:** migrate frontend copy and content rendering to English, implement curated signals and 1–2 human-authored playbooks with source traceability.
3. **M3 — Content radar:** GitHub/RSS/YouTube metadata collection with observability, then licensed X radar only if credentials and budget are approved.
4. **M4 — Newsletter & business:** verified email opt-in, Digest approval, provider send, templates and transparent Affiliate disclosure.
5. **M5 — Production QA:** clean database migration and build, privacy, SEO, accessibility, original brand assets, feed tests and deployment approval.

## Editorial and licensing guardrails

- Keep source title, author, publisher, URL and date when known; distinguish unknown dates. Use short original commentary with a clear link back.
- No full-thread scraping, blanket rehosting, misleading attribution or automatic paraphrase-only SEO pages.
- No fabricated workflow tests, costs, performance, rankings or API capabilities.
- Use provider APIs only when access and cost are known. The old AIHOT SocialData X integration is **not** connected by this branch.
- Labels and ranking are *recommendations* until human-reviewed; they do not grant copyright permission.
