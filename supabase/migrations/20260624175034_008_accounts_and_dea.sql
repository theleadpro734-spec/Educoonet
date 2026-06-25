-- Add auth fields to institutions
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS dea_code TEXT,
  ADD COLUMN IF NOT EXISTS access_password TEXT;

-- Student accounts (simple credential store, no Supabase Auth needed)
CREATE TABLE IF NOT EXISTS student_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  last_name   TEXT,
  email       TEXT UNIQUE NOT NULL,
  cedula      TEXT,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads so the login modal can verify credentials
CREATE POLICY "anon_read_student_accounts"
  ON student_accounts FOR SELECT TO anon USING (true);

-- Allow institutions (anon) to also read for verification
CREATE POLICY "anon_read_institutions_password"
  ON institutions FOR SELECT TO anon USING (true);
