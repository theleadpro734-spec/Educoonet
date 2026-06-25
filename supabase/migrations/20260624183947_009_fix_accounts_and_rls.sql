/*
# Fix accounts tables, verify functions, and RLS for test mode

1. Changes
- Create student_accounts table if missing (with name, last_name, email, cedula, password, created_at).
- Create institution_accounts table if missing (with name, email, password, institution_id, dea_code, created_at).
- Create verify_password SQL functions using pgcrypto.
- Insert demo accounts so login works.
- Open RLS policies for test mode on applications, application_messages, student_accounts, institution_accounts.

2. Security Notes
- Test mode: open RLS so the app works without Supabase Auth.
- Passwords are stored with bcrypt via pgcrypto.
*/

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create student_accounts table
CREATE TABLE IF NOT EXISTS student_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  cedula TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;

-- Create institution_accounts table
CREATE TABLE IF NOT EXISTS institution_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  dea_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE institution_accounts ENABLE ROW LEVEL SECURITY;

-- Verify functions for passwords
CREATE OR REPLACE FUNCTION verify_student_password(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  last_name TEXT,
  email TEXT,
  cedula TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.name, sa.last_name, sa.email, sa.cedula
  FROM student_accounts sa
  WHERE sa.email = p_email
    AND sa.password = crypt(p_password, sa.password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_institution_password(p_dea_code TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  institution_id UUID,
  dea_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ia.id, ia.name, ia.email, ia.institution_id, ia.dea_code
  FROM institution_accounts ia
  WHERE ia.dea_code = p_dea_code
    AND ia.password = crypt(p_password, ia.password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert demo accounts if not exist
INSERT INTO student_accounts (name, last_name, email, cedula, password)
SELECT 'Estudiante', 'Demo', 'estudiante@educonnet.com', '1234567890', crypt('test123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM student_accounts WHERE email = 'estudiante@educonnet.com');

INSERT INTO institution_accounts (name, email, password, institution_id, dea_code)
SELECT 'Institucion Demo', 'institucion@educonnet.com', crypt('test123', gen_salt('bf')), 'a4feecf4-0a56-4ca9-ab1b-ee3385e16cf3', '08H00201'
WHERE NOT EXISTS (SELECT 1 FROM institution_accounts WHERE email = 'institucion@educonnet.com');

-- Open RLS for test mode
DROP POLICY IF EXISTS "applications_select_own" ON applications;
DROP POLICY IF EXISTS "applications_insert" ON applications;
DROP POLICY IF EXISTS "applications_update" ON applications;
DROP POLICY IF EXISTS "applications_select_all" ON applications;
DROP POLICY IF EXISTS "applications_insert_all" ON applications;
DROP POLICY IF EXISTS "applications_update_all" ON applications;

CREATE POLICY "applications_select_all" ON applications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "applications_insert_all" ON applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "applications_update_all" ON applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "application_messages_select_all" ON application_messages;
DROP POLICY IF EXISTS "application_messages_insert_all" ON application_messages;
DROP POLICY IF EXISTS "application_messages_update_all" ON application_messages;

CREATE POLICY "application_messages_select_all" ON application_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "application_messages_insert_all" ON application_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "application_messages_update_all" ON application_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "student_accounts_select" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_select_own" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_insert" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_insert_own" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_select_all" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_insert_all" ON student_accounts;

CREATE POLICY "student_accounts_select_all" ON student_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "student_accounts_insert_all" ON student_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "institution_accounts_select" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_select_own" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_insert" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_insert_own" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_select_all" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_insert_all" ON institution_accounts;

CREATE POLICY "institution_accounts_select_all" ON institution_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "institution_accounts_insert_all" ON institution_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
