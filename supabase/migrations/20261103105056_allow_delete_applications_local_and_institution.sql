/*
# Allow deleting applications for local users and institutions

1. Problem
- Local (anonymous) postulantes could not delete their own applications because the only DELETE policy checks auth.uid() = user_id, and local sessions have auth.uid() = NULL with user_id = NULL.
- Institutions had no DELETE policy at all on applications.

2. Changes
- `anon_delete_applications`: allows anon to delete applications where user_id IS NULL (local-user applications). This matches the existing anon SELECT/INSERT pattern.
- `applications_delete_inst_owner`: allows an institution owner to delete applications belonging to their institution.

3. Security
- anon can only delete rows with user_id IS NULL (already readable by anon under existing policy).
- institution delete is scoped to the owner of the institution the application belongs to.
*/

DROP POLICY IF EXISTS "anon_delete_applications" ON public.applications;
CREATE POLICY "anon_delete_applications"
ON public.applications FOR DELETE
TO anon, authenticated
USING (user_id IS NULL);

DROP POLICY IF EXISTS "applications_delete_inst_owner" ON public.applications;
CREATE POLICY "applications_delete_inst_owner"
ON public.applications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = applications.institution_id
    AND i.owner_id = auth.uid()
  )
);
