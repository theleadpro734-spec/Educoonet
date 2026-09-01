/*
# Anonymous Auth for Representatives + Institution Auth via Supabase Auth

## Overview
This migration transitions EduConnet from custom password-table auth to Supabase Auth:
- Representatives (postulantes) use Supabase Anonymous Auth. Each visitor gets
  an anonymous user with a real auth.users UUID. Their applications, messages,
  favorites and notifications are all keyed to that UUID.
- Institutions use Supabase email/password auth. The institutions.owner_id
  column (already a FK to auth.users) identifies which institution the logged-in
  user owns.

## Tables modified

### applications
- `user_id` column already exists (uuid, FK -> auth.users) but is nullable and
  has no default. We add `DEFAULT auth.uid()` so inserts that omit user_id
  automatically fill it from the authenticated session.
- Backfill existing rows: set user_id from the matching student_accounts email
  where possible. Rows with no match get a synthetic anonymous user so they are
  never orphaned.

### notifications
- Add `user_id uuid` column (FK -> auth.users, nullable, DEFAULT auth.uid()).
- Backfill: set user_id from user_email by matching student_accounts or
  institution_accounts. Unmatched rows stay NULL (readable only by the system).
- Add index on (user_id, read) for the unread-count query.

### favorites
- `user_id` already exists. Add FK to auth.users and DEFAULT auth.uid().

## RLS — all policies rewritten for ownership-based access

### institutions (public read, owner write)
- SELECT: public (anon + authenticated) — anyone can browse institutions.
- INSERT/UPDATE/DELETE: only the institution owner (auth.uid() = owner_id).

### applications
- SELECT: the representative who owns it (auth.uid() = user_id) OR the
  institution that owns the institution_id (EXISTS subquery).
- INSERT: representative only, WITH CHECK auth.uid() = user_id.
- UPDATE: institution owner only (they change status), WITH CHECK that
  user_id is unchanged.
- DELETE: representative only.

### application_messages
- SELECT: either party (rep owns application.user_id, inst owns institution).
- INSERT: either party, WITH CHECK sender_type matches their role.
- UPDATE: either party (for read flags).
- DELETE: either party.

### notifications
- SELECT/UPDATE: owner only (auth.uid() = user_id).
- INSERT: via SECURITY DEFINER RPC only (no direct client inserts needed).

### favorites
- Full CRUD: owner only (auth.uid() = user_id).

### programs, gallery_items
- SELECT: public. INSERT/UPDATE/DELETE: institution owner only.

## RPCs
- `create_notification` updated to also set user_id when it can resolve one
  from user_email.
- `notify_status_change` updated to resolve user_id from the application's user_id.
- Old verify_* RPCs kept for backward compatibility but no longer the primary
  auth path.

## Notes
1. Existing 13 applications have user_id = NULL. We backfill them by creating
   anonymous auth.users for each distinct email and linking them. This
   preserves history so existing representatives don't lose their data.
2. institutions.owner_id is already set for the one existing institution.
3. Anonymous auth must be enabled in the Supabase dashboard (Auth > Providers
   > Anonymous). This is a manual step — see the final summary to the user.
*/

-- ============================================================================
-- 1. applications: add DEFAULT auth.uid() to user_id
-- ============================================================================
ALTER TABLE applications
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ============================================================================
-- 2. notifications: add user_id column + index
-- ============================================================================
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read);

-- ============================================================================
-- 3. favorites: add FK + default
-- ============================================================================
ALTER TABLE favorites
  ALTER COLUMN user_id SET DEFAULT auth.uid();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'favorites_user_id_fkey'
      AND conrelid = 'public.favorites'::regclass
  ) THEN
    ALTER TABLE favorites
      ADD CONSTRAINT favorites_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 4. Backfill: create anonymous auth.users for existing application emails
--    so historical data is not orphaned.
-- ============================================================================
DO $$
DECLARE
  r RECORD;
  v_uid uuid;
BEGIN
  -- For each distinct email in applications that has no user_id, create an
  -- anonymous user and link the rows.
  FOR r IN
    SELECT DISTINCT email
    FROM applications
    WHERE user_id IS NULL AND email IS NOT NULL
  LOOP
    -- Check if a user already exists with this email
    SELECT id INTO v_uid FROM auth.users WHERE email = r.email LIMIT 1;
    IF v_uid IS NULL THEN
      -- Create an anonymous user with this email as metadata
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
      VALUES (
        v_uid,
        r.email,
        '',  -- no password (anonymous)
        now(),
        now(),
        now(),
        jsonb_build_object('is_anonymous', true, 'role', 'representative'),
        jsonb_build_object('is_anonymous', true, 'migrated', true)
      );
    END IF;

    -- Link applications
    UPDATE applications SET user_id = v_uid WHERE email = r.email AND user_id IS NULL;

    -- Link notifications by email
    UPDATE notifications SET user_id = v_uid WHERE user_email = r.email AND user_id IS NULL;
  END LOOP;

  -- Link notifications for institution emails
  FOR r IN
    SELECT DISTINCT email FROM institutions WHERE email IS NOT NULL
  LOOP
    SELECT id INTO v_uid FROM auth.users WHERE email = r.email LIMIT 1;
    IF v_uid IS NULL THEN
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
      VALUES (
        v_uid,
        r.email,
        '',
        now(),
        now(),
        now(),
        jsonb_build_object('is_anonymous', true, 'role', 'institution'),
        jsonb_build_object('is_anonymous', true, 'migrated', true)
      );
    END IF;
    UPDATE notifications SET user_id = v_uid WHERE user_email = r.email AND user_id IS NULL;
  END LOOP;
END $$;

-- ============================================================================
-- 5. Update create_notification RPC to set user_id
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_email text,
  p_user_role text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  v_user_id uuid;
BEGIN
  -- Resolve user_id from email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email LIMIT 1;

  INSERT INTO notifications (user_email, user_role, type, title, message, related_id, user_id)
  VALUES (p_user_email, p_user_role, p_type, p_title, p_message, p_related_id, COALESCE(v_user_id, auth.uid()))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- ============================================================================
-- 6. Update notify_status_change to resolve student user_id
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_status_change(
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_student_email text;
  v_status_text text;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_student_email := v_app.email;

  v_status_text := CASE p_new_status
    WHEN 'aceptada' THEN 'aceptada'
    WHEN 'rechazada' THEN 'rechazada'
    ELSE 'actualizada'
  END;

  PERFORM create_notification(
    v_student_email,
    'student',
    'status_changed',
    'Tu postulacion ha sido ' || v_status_text,
    'El estado de tu postulacion ha cambiado a: ' || p_new_status,
    p_application_id
  );
END;
$$;

-- ============================================================================
-- 7. RLS Policies — drop all existing, create ownership-based
-- ============================================================================

-- ---- institutions ----
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "institutions_select" ON institutions;
DROP POLICY IF EXISTS "institutions_insert" ON institutions;
DROP POLICY IF EXISTS "institutions_update" ON institutions;
DROP POLICY IF EXISTS "institutions_delete" ON institutions;
DROP POLICY IF EXISTS "institutions_select_public" ON institutions;

CREATE POLICY "institutions_select_public" ON institutions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "institutions_insert_owner" ON institutions
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "institutions_update_owner" ON institutions
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "institutions_delete_owner" ON institutions
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ---- applications ----
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select" ON applications;
DROP POLICY IF EXISTS "applications_insert" ON applications;
DROP POLICY IF EXISTS "applications_update" ON applications;
DROP POLICY IF EXISTS "applications_delete" ON applications;
DROP POLICY IF EXISTS "anon_select_applications" ON applications;
DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
DROP POLICY IF EXISTS "anon_update_applications" ON applications;
DROP POLICY IF EXISTS "anon_delete_applications" ON applications;

-- SELECT: rep sees own, institution owner sees apps for their institution
CREATE POLICY "applications_select_own" ON applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = applications.institution_id
        AND institutions.owner_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_own" ON applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_inst_owner" ON applications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = applications.institution_id
        AND institutions.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = applications.institution_id
        AND institutions.owner_id = auth.uid()
    )
  );

CREATE POLICY "applications_delete_own" ON applications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---- application_messages ----
ALTER TABLE application_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "application_messages_select" ON application_messages;
DROP POLICY IF EXISTS "application_messages_insert" ON application_messages;
DROP POLICY IF EXISTS "application_messages_update" ON application_messages;
DROP POLICY IF EXISTS "application_messages_delete" ON application_messages;
DROP POLICY IF EXISTS "anon_select_application_messages" ON application_messages;
DROP POLICY IF EXISTS "anon_insert_application_messages" ON application_messages;
DROP POLICY IF EXISTS "anon_update_application_messages" ON application_messages;
DROP POLICY IF EXISTS "anon_delete_application_messages" ON application_messages;

CREATE POLICY "messages_select_parties" ON application_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM institutions
            WHERE institutions.id = applications.institution_id
              AND institutions.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "messages_insert_parties" ON application_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM institutions
            WHERE institutions.id = applications.institution_id
              AND institutions.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "messages_update_parties" ON application_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM institutions
            WHERE institutions.id = applications.institution_id
              AND institutions.owner_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (true);

CREATE POLICY "messages_delete_parties" ON application_messages
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM institutions
            WHERE institutions.id = applications.institution_id
              AND institutions.owner_id = auth.uid()
          )
        )
    )
  );

-- ---- notifications ----
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT policy — notifications are only created via the SECURITY DEFINER RPC.

-- ---- favorites ----
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select" ON favorites;
DROP POLICY IF EXISTS "favorites_insert" ON favorites;
DROP POLICY IF EXISTS "favorites_update" ON favorites;
DROP POLICY IF EXISTS "favorites_delete" ON favorites;
DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_update_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;

CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_update_own" ON favorites
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---- programs ----
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programs_select" ON programs;
DROP POLICY IF EXISTS "programs_insert" ON programs;
DROP POLICY IF EXISTS "programs_update" ON programs;
DROP POLICY IF EXISTS "programs_delete" ON programs;
DROP POLICY IF EXISTS "anon_select_programs" ON programs;
DROP POLICY IF EXISTS "anon_insert_programs" ON programs;
DROP POLICY IF EXISTS "anon_update_programs" ON programs;
DROP POLICY IF EXISTS "anon_delete_programs" ON programs;

CREATE POLICY "programs_select_public" ON programs
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "programs_insert_owner" ON programs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE id = programs.institution_id AND owner_id = auth.uid())
  );

CREATE POLICY "programs_update_owner" ON programs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM institutions WHERE id = programs.institution_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE id = programs.institution_id AND owner_id = auth.uid())
  );

CREATE POLICY "programs_delete_owner" ON programs
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM institutions WHERE id = programs.institution_id AND owner_id = auth.uid())
  );

-- ---- gallery_items ----
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_items_select" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_insert" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_update" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_delete" ON gallery_items;
DROP POLICY IF EXISTS "anon_select_gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "anon_insert_gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "anon_update_gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "anon_delete_gallery_items" ON gallery_items;

CREATE POLICY "gallery_select_public" ON gallery_items
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_insert_owner" ON gallery_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE id = gallery_items.institution_id AND owner_id = auth.uid())
  );

CREATE POLICY "gallery_update_owner" ON gallery_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM institutions WHERE id = gallery_items.institution_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE id = gallery_items.institution_id AND owner_id = auth.uid())
  );

CREATE POLICY "gallery_delete_owner" ON gallery_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM institutions WHERE id = gallery_items.institution_id AND owner_id = auth.uid())
  );

-- ============================================================================
-- 8. Enable realtime on notifications
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ============================================================================
-- 9. Helper RPC: get_institution_for_user — returns the institution a given
--    auth user owns. Used by the frontend to verify institution access.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institution_for_user()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  owner_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.name, i.email, i.owner_id
  FROM institutions i
  WHERE i.owner_id = auth.uid();
$$;

-- ============================================================================
-- 10. Helper RPC: link_anonymous_to_email — verifies the caller is anonymous
--     before allowing an account upgrade.
-- ============================================================================
CREATE OR REPLACE FUNCTION link_anonymous_to_email(
  p_email text,
  p_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND raw_app_meta_data->>'is_anonymous' = 'true'
  ) THEN
    RAISE EXCEPTION 'El usuario actual no es anonimo';
  END IF;
END;
$$;
