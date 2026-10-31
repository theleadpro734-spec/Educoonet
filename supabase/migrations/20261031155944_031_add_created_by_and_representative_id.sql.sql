/*
# Add created_by and representative_id relationships

## Purpose
Establish consistent UUID-based relationships across EduConnet so every record
is attributable to the authenticated user who created it, and applications can
optionally link to a registered representative account. All IDs remain
database-generated UUIDs (gen_random_uuid) and existing data is preserved.

## 1. New Columns

### created_by (uuid, nullable, FK -> auth.users(id), DEFAULT auth.uid())
Tracks the authenticated user who created the record. Defaults to auth.uid()
so inserts that omit the column still capture the creator from the session.
- `programs.created_by`
- `opportunities.created_by`
- `gallery_items.created_by`
- `conversations.created_by`
- `application_messages.created_by`

### representative_id (uuid, nullable, FK -> auth.users(id))
Links an application to the auth.users account of the legal representative
(parent/guardian). Nullable because most representatives do not yet have
accounts; the existing representative_name / representative_cedula text
fields are preserved.
- `applications.representative_id`

## 2. Backfill
Existing programs, opportunities, and gallery_items rows get created_by set
from the owning institution's owner_id, so historical records are attributable
to the institution owner who created them.

## 3. Indexes
Added on every new FK column to keep joins and policy subqueries fast.

## 4. Security
No RLS policy changes are required. Existing ownership-based policies already
govern access via institutions.owner_id = auth.uid(). The new columns are
informational/attribution columns; they do not broaden or narrow access.
*/

-- programs.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- opportunities.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.opportunities
      ADD COLUMN created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- gallery_items.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.gallery_items
      ADD COLUMN created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- conversations.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.conversations
      ADD COLUMN created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- application_messages.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'application_messages' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.application_messages
      ADD COLUMN created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- applications.representative_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'representative_id'
  ) THEN
    ALTER TABLE public.applications
      ADD COLUMN representative_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Backfill created_by from owning institution's owner_id
UPDATE public.programs p
  SET created_by = i.owner_id
  FROM public.institutions i
  WHERE p.institution_id = i.id
    AND p.created_by IS NULL
    AND i.owner_id IS NOT NULL;

UPDATE public.opportunities o
  SET created_by = i.owner_id
  FROM public.institutions i
  WHERE o.institution_id = i.id
    AND o.created_by IS NULL
    AND i.owner_id IS NOT NULL;

UPDATE public.gallery_items g
  SET created_by = i.owner_id
  FROM public.institutions i
  WHERE g.institution_id = i.id
    AND g.created_by IS NULL
    AND i.owner_id IS NOT NULL;

-- Indexes for the new FK columns
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON public.programs (created_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON public.opportunities (created_by);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_by ON public.gallery_items (created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations (created_by);
CREATE INDEX IF NOT EXISTS idx_application_messages_created_by ON public.application_messages (created_by);
CREATE INDEX IF NOT EXISTS idx_applications_representative_id ON public.applications (representative_id);
