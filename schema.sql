CREATE TABLE IF NOT EXISTS tefl_leads (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  consent_text_version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'TEFL Landing Page',
  country_code TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_tefl_leads_email ON tefl_leads(email);
CREATE INDEX IF NOT EXISTS idx_tefl_leads_submitted_at ON tefl_leads(submitted_at);
