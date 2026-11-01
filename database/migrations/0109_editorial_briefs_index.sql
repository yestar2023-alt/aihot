-- Online-safe separate index for editorial queue sorting.
CREATE INDEX IF NOT EXISTS editorial_briefs_updated_at_idx ON editorial_briefs (updated_at DESC);
