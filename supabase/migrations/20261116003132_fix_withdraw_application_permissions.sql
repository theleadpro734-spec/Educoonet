/*
# Fix "Retirar" (withdraw) application for guests and signed-in students

1. Problem
- The student panel's "Retirar" button deletes the application row, but the
  DELETE policies only allowed it when `user_id IS NULL` (or for institution
  owners). Since migration 024, every insert stamps `user_id` with
  `DEFAULT auth.uid()`, so those legacy rows no longer match and deletes
  silently affected zero rows — the button did nothing.

2. Security changes
- Replace `anon_delete_applications` with a policy that allows deleting the
  user's own application: `auth.uid() = user_id`, or `user_id IS NULL` for
  legacy guest rows.
- Add a DELETE grant for `anon` (guest sessions authenticate via anon role
  RLS policies in this custom-auth setup); `authenticated` already holds it.
- Ownership scoping is unchanged for SELECT/INSERT/UPDATE.
*/

DROP POLICY IF EXISTS "anon_delete_applications" ON applications;

CREATE POLICY "applications_delete_own_anon"
ON applications FOR DELETE
TO anon, authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

GRANT DELETE ON applications TO anon;
