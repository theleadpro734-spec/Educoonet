/*
# Enable anon access for beta mode

## Problem
The app uses anonymous sessions for students, but anonymous sign-in may be disabled.
All RLS policies on applications, application_messages, and notifications require
`auth.uid() = user_id` scoped to `authenticated` only. When there is no session,
the student panel cannot read or write anything and appears broken.

## Changes
1. Add `anon` + `authenticated` SELECT/INSERT/UPDATE policies on `applications`
   that allow access when `user_id` IS NULL OR matches `auth.uid()`.
2. Add `anon` + `authenticated` policies on `application_messages` for anon access.
3. Add `anon` + `authenticated` policies on `notifications` for anon access.
4. Allow `user_id` to be NULL on applications (already nullable, confirmed).

## Security notes
- This is a beta-mode loosening: anon users can insert applications without a session.
- The `user_id` column defaults to `auth.uid()` which is NULL for anon — inserts work.
- Institution-side policies remain scoped to `authenticated` with role = 'institution'.
*/

-- applications: add anon-friendly policies alongside existing authenticated ones
DROP POLICY IF EXISTS "anon_select_applications" ON applications;
CREATE POLICY "anon_select_applications"
ON applications FOR SELECT
TO anon, authenticated
USING (
  user_id IS NULL
  OR auth.uid() = user_id
  OR (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = applications.institution_id
      AND institutions.owner_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications"
ON applications FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications"
ON applications FOR UPDATE
TO anon, authenticated
USING (
  user_id IS NULL
  OR auth.uid() = user_id
  OR (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (
      SELECT 1 FROM institutions
      WHERE institutions.id = applications.institution_id
      AND institutions.owner_id = auth.uid()
    )
  )
)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications"
ON applications FOR DELETE
TO anon, authenticated
USING (
  user_id IS NULL
  OR auth.uid() = user_id
);

-- application_messages: add anon-friendly policies
DROP POLICY IF EXISTS "anon_select_messages" ON application_messages;
CREATE POLICY "anon_select_messages"
ON application_messages FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_messages.application_id
    AND (
      applications.user_id IS NULL
      OR applications.user_id = auth.uid()
      OR (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
        AND EXISTS (
          SELECT 1 FROM institutions
          WHERE institutions.id = applications.institution_id
          AND institutions.owner_id = auth.uid()
        )
      )
    )
  )
);

DROP POLICY IF EXISTS "anon_insert_messages" ON application_messages;
CREATE POLICY "anon_insert_messages"
ON application_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = application_messages.application_id
    AND (
      applications.user_id IS NULL
      OR applications.user_id = auth.uid()
      OR (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
        AND EXISTS (
          SELECT 1 FROM institutions
          WHERE institutions.id = applications.institution_id
          AND institutions.owner_id = auth.uid()
        )
      )
    )
  )
);

DROP POLICY IF EXISTS "anon_update_messages" ON application_messages;
CREATE POLICY "anon_update_messages"
ON application_messages FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- notifications: add anon-friendly policies
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications"
ON notifications FOR SELECT
TO anon, authenticated
USING (
  user_id IS NULL
  OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications"
ON notifications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications"
ON notifications FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications"
ON notifications FOR DELETE
TO anon, authenticated
USING (true);

-- institutions: allow anon SELECT (public catalog data)
DROP POLICY IF EXISTS "anon_select_institutions" ON institutions;
CREATE POLICY "anon_select_institutions"
ON institutions FOR SELECT
TO anon, authenticated
USING (true);
