CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY NOT NULL,
  review_key TEXT NOT NULL,
  family_key TEXT NOT NULL,
  input_json TEXT NOT NULL,
  draft_json TEXT,
  source_log TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  responses_json TEXT NOT NULL DEFAULT '[]',
  translations_json TEXT NOT NULL DEFAULT '{}',
  slot_id TEXT,
  created_at TEXT NOT NULL,
  approved_at TEXT
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS slots (
  slot_id TEXT PRIMARY KEY NOT NULL,
  case_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
