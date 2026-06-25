-- =============================================
-- 007: Extended application fields + messaging
-- =============================================

-- Add new fields to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS birth_center TEXT,
  ADD COLUMN IF NOT EXISTS blood_type TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS cedula_url TEXT,
  ADD COLUMN IF NOT EXISTS birth_certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS residence_letter_url TEXT,
  ADD COLUMN IF NOT EXISTS cedula_rep_url TEXT,
  ADD COLUMN IF NOT EXISTS representative_name TEXT,
  ADD COLUMN IF NOT EXISTS representative_cedula TEXT;

-- Messaging table linked directly to applications (no auth required for test mode)
CREATE TABLE IF NOT EXISTS application_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('institution', 'student')),
  sender_name TEXT NOT NULL DEFAULT 'Usuario',
  content TEXT NOT NULL,
  read_by_student BOOLEAN DEFAULT FALSE,
  read_by_institution BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE application_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_messages_select_all" ON application_messages FOR SELECT
  TO authenticated, anon USING (true);

CREATE POLICY "app_messages_insert_all" ON application_messages FOR INSERT
  TO authenticated, anon WITH CHECK (true);

CREATE POLICY "app_messages_update_all" ON application_messages FOR UPDATE
  TO authenticated, anon USING (true) WITH CHECK (true);

-- Storage bucket for documents (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read/upload to documents bucket (test mode)
CREATE POLICY "documents_public_select" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'documents');

CREATE POLICY "documents_public_insert" ON storage.objects FOR INSERT
  TO public WITH CHECK (bucket_id = 'documents');
