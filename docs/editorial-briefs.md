# Private Playbook Briefs — editor workflow

This feature is a **private editorial planning desk**, not a public Playbook creator and not a content generation service.

## One complete operator journey

1. Open **Admin → Source Radar**, preview and validate a primary/creator source without importing unsupported copy.
2. Open **Admin → Opportunity Radar**, use the 7/30-day window and Build/Grow/Automate filters. These scores are only *editing priorities*, not SEO search volumes.
3. Open the original source and inspect it. Click **Create private Playbook brief** on a relevant candidate; this creates a single draft keyed by the original article ID. Repeat clicks do not overwrite an editor's draft.
4. Open **Admin → Playbook Briefs** and edit the draft. Choose Build/Grow/Automate, describe the target reader and actual task, list prerequisites and planned steps, and preserve evidence/claims/rights constraints.
5. Leave status as **Draft** until the working title, audience, user job, steps, evidence, limitations and testing plan are usable. **Ready for editorial review** only checks field completeness; it does not certify a tested integration.
6. Run the proposed workflow on a test account/environment yourself (if legal/feasible). Note exact commands, API permissions, input/output examples, timestamps, observed errors, screenshots, and whether anything remains untested.
7. Verify public URLs and copyright rights before publishing a separately authored Playbook through a **future** explicitly reviewed publishing path. Currently only curated *Signals* have an explicit public release action. Drafts in `editorial_briefs` cannot auto-publish to Signals, Playbooks, RSS or newsletter.

## Implementation and safety

- Migration: `database/migrations/0108_editorial_briefs.sql`.
- Backend: `packages/backend/src/admin/briefs.ts`.
- Authenticated API: `GET /api/admin/briefs`, `GET /api/admin/briefs/:id`, `POST /api/admin/briefs/:id` to create, `PATCH /api/admin/briefs/:id` to update. POST and PATCH require admin session and CSRF token. Same-source repeats return the existing brief unchanged.
- Admin UI: `/admin/briefs` and `/admin/briefs/:id`.
- Every create/update writes an `audit_log` entry in the database transaction. Updates use a version check and reject concurrent stale editing with HTTP 409.
- All private brief queries require the source to remain `participation_mode='isolated'`. Data is not included in public read modules, feeds or sitemap.
- Evidence fields are **editor-supplied**. There is no automatic extraction, independent verification, plagiarism screening or execution of untrusted workflow snippets. Do not copy full third-party posts.
- The UI is capped at the 100 most recently updated briefs. No automated content generation, publication or email sending is connected.
- The schema deliberately avoids a `published` state. **Ready for editorial review ≠ approved ≠ publicly released**.

## Pre-launch regression

Run the repository's `typecheck`, database migrations, backend test suite (including `tests/editorial-briefs.test.ts`), web browser tests and Docker smoke checks. In the admin UI, test two editor sessions with stale versions, try a public/non-isolated article, inspect audit events, and verify the same draft title never appears in `/signals` or `/feed/signals.xml`. Launch requires an explicit human review and verified services/contacts.
