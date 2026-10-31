-- Explicit, human-owned publication record for the curated Signals feed.
-- Review "approved" is NOT a release; this table is the separate permission boundary.
CREATE TABLE IF NOT EXISTS curation_releases (
  article_id text PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  review_version integer NOT NULL,
  status text NOT NULL CHECK (status IN ('published', 'withdrawn')),
  first_released_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
