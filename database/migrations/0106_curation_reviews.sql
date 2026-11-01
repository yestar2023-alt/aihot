-- Private curation workflow. Approval records editorial readiness, NOT public publication.
-- Every candidate remains private until a separate audited publication gate is implemented.
CREATE TABLE IF NOT EXISTS curation_reviews (
  article_id text PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'shortlisted', 'fact_checked', 'approved', 'rejected')),
  note text NOT NULL DEFAULT '',
  evidence_url text,
  version integer NOT NULL DEFAULT 1,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
