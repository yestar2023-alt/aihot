-- Private, manually editable Playbook briefs. NEVER read from public site/feed/SEO projections.
CREATE TABLE IF NOT EXISTS editorial_briefs (
  article_id text PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  track text NOT NULL CHECK (track IN ('Build','Grow','Automate')),
  title text NOT NULL CHECK (char_length(title) <= 180),
  user_job text NOT NULL DEFAULT '',
  intended_reader text NOT NULL DEFAULT '',
  prerequisites text NOT NULL DEFAULT '',
  steps_outline text NOT NULL DEFAULT '',
  evidence_notes text NOT NULL DEFAULT '',
  limitations text NOT NULL DEFAULT '',
  validation_plan text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready_for_review')),
  version integer NOT NULL DEFAULT 1,
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
