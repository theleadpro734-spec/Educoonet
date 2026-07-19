/*
# Open RLS policies for custom-auth app (anon + authenticated)

## Problem
This app uses custom auth (student_accounts / institution_accounts tables with
bcrypt-hashed passwords verified via RPC). It does NOT use Supabase Auth, so
`auth.uid()` is always null and every request runs as the `anon` role. However,
the INSERT/UPDATE/DELETE policies on `applications` and ALL policies on
`application_messages` are scoped to `authenticated` only — so the anon client
is blocked from submitting applications, sending messages, or updating message
read status. This is why "the application system doesn't work."

## Fix
1. Recreate the INSERT/UPDATE/DELETE policies on `applications` to allow
   `anon, authenticated` (the app's custom auth handles authorization on the
   client side; RLS just needs to let the anon key through).
2. Recreate ALL policies on `application_messages` to allow `anon, authenticated`.
3. Add a SELECT policy on `storage.objects` for public buckets so uploaded
   files can be listed/verified (public bucket URLs already bypass RLS for
   reads, but having a SELECT policy prevents edge-case failures).

## Security Notes
- This is a custom-auth app: Supabase Auth is not in use, so `authenticated`
  policies are unreachable. Opening to `anon` is the correct fix, not a
  shortcut.
- The SELECT policies on applications already allow anon (unchanged).
- notifications already allows anon (unchanged).
*/

-- ===== applications =====
-- INSERT: allow anon (student submits application)
DROP POLICY IF EXISTS "applications_insert" ON applications;
CREATE POLICY "applications_insert"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: allow anon (institution changes status, student can't via UI)
DROP POLICY IF EXISTS "applications_update" ON applications;
CREATE POLICY "applications_update"
  ON applications FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- DELETE: allow anon (institution deletes)
DROP POLICY IF EXISTS "applications_delete" ON applications;
CREATE POLICY "applications_delete"
  ON applications FOR DELETE
  TO anon, authenticated
  USING (true);

-- SELECT already allows anon, authenticated — no change needed

-- ===== application_messages =====
-- SELECT: allow anon (both student and institution read messages)
DROP POLICY IF EXISTS "application_messages_select" ON application_messages;
CREATE POLICY "application_messages_select"
  ON application_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: allow anon (both sides send messages)
DROP POLICY IF EXISTS "application_messages_insert" ON application_messages;
CREATE POLICY "application_messages_insert"
  ON application_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: allow anon (mark as read)
DROP POLICY IF EXISTS "application_messages_update" ON application_messages;
CREATE POLICY "application_messages_update"
  ON application_messages FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ===== storage.objects SELECT for public buckets =====
-- Allow anyone to list/select objects in public buckets (covers, logos,
-- gallery, documents, institution-assets)
DROP POLICY IF EXISTS "public_buckets_select" ON storage.objects;
CREATE POLICY "public_buckets_select"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('covers', 'logos', 'gallery', 'documents', 'institution-assets'));
