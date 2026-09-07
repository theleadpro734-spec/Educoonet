/*
# Enforce private institution access by Supabase Auth role

1. Security model
- Institution dashboard access requires an authenticated Supabase user.
- The user must carry the operator-controlled `institution` role in `raw_app_meta_data`.
- The user must own the institution row through `institutions.owner_id`.

2. Existing data
- Current institution owners are assigned the `institution` app role without changing their credentials or institution records.

3. Database security
- The institution lookup RPC only returns institutions for authenticated users with the institution role.
- Institution-owned reads and writes require both the institution role and ownership.
- Public institution browsing remains available to anonymous visitors.

4. Important notes
- No application, favorite, message, or institution data is deleted.
- The role is stored in app metadata, which users cannot edit from the browser.
*/

UPDATE auth.users AS users
SET raw_app_meta_data = COALESCE(users.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'institution')
WHERE EXISTS (
  SELECT 1
  FROM public.institutions
  WHERE institutions.owner_id = users.id
);

CREATE OR REPLACE FUNCTION public.get_institution_for_user()
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
  SELECT institutions.id, institutions.name, institutions.email, institutions.owner_id
  FROM public.institutions
  WHERE institutions.owner_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution';
$$;

REVOKE EXECUTE ON FUNCTION public.get_institution_for_user() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_institution_for_user() TO authenticated;

DROP POLICY IF EXISTS "institutions_insert_owner" ON public.institutions;
CREATE POLICY "institutions_insert_owner" ON public.institutions
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
  );

DROP POLICY IF EXISTS "institutions_update_owner" ON public.institutions;
CREATE POLICY "institutions_update_owner" ON public.institutions
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
  );

DROP POLICY IF EXISTS "institutions_delete_owner" ON public.institutions;
CREATE POLICY "institutions_delete_owner" ON public.institutions
  FOR DELETE TO authenticated
  USING (
    owner_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
  );

DROP POLICY IF EXISTS "applications_select_own" ON public.applications;
CREATE POLICY "applications_select_own" ON public.applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
      AND EXISTS (
        SELECT 1 FROM public.institutions
        WHERE institutions.id = applications.institution_id
          AND institutions.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "applications_update_inst_owner" ON public.applications;
CREATE POLICY "applications_update_inst_owner" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (
      SELECT 1 FROM public.institutions
      WHERE institutions.id = applications.institution_id
        AND institutions.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (
      SELECT 1 FROM public.institutions
      WHERE institutions.id = applications.institution_id
        AND institutions.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_select_parties" ON public.application_messages;
CREATE POLICY "messages_select_parties" ON public.application_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
            AND EXISTS (
              SELECT 1 FROM public.institutions
              WHERE institutions.id = applications.institution_id
                AND institutions.owner_id = auth.uid()
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "messages_insert_parties" ON public.application_messages;
CREATE POLICY "messages_insert_parties" ON public.application_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
            AND EXISTS (
              SELECT 1 FROM public.institutions
              WHERE institutions.id = applications.institution_id
                AND institutions.owner_id = auth.uid()
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "messages_update_parties" ON public.application_messages;
CREATE POLICY "messages_update_parties" ON public.application_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
            AND EXISTS (
              SELECT 1 FROM public.institutions
              WHERE institutions.id = applications.institution_id
                AND institutions.owner_id = auth.uid()
            )
          )
        )
    )
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "messages_delete_parties" ON public.application_messages;
CREATE POLICY "messages_delete_parties" ON public.application_messages
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_messages.application_id
        AND (
          applications.user_id = auth.uid()
          OR (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
            AND EXISTS (
              SELECT 1 FROM public.institutions
              WHERE institutions.id = applications.institution_id
                AND institutions.owner_id = auth.uid()
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "programs_insert_owner" ON public.programs;
CREATE POLICY "programs_insert_owner" ON public.programs
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = programs.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "programs_update_owner" ON public.programs;
CREATE POLICY "programs_update_owner" ON public.programs
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = programs.institution_id AND institutions.owner_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = programs.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "programs_delete_owner" ON public.programs;
CREATE POLICY "programs_delete_owner" ON public.programs
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = programs.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "gallery_insert_owner" ON public.gallery_items;
CREATE POLICY "gallery_insert_owner" ON public.gallery_items
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = gallery_items.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "gallery_update_owner" ON public.gallery_items;
CREATE POLICY "gallery_update_owner" ON public.gallery_items
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = gallery_items.institution_id AND institutions.owner_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = gallery_items.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "gallery_delete_owner" ON public.gallery_items;
CREATE POLICY "gallery_delete_owner" ON public.gallery_items
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'institution'
    AND EXISTS (SELECT 1 FROM public.institutions WHERE institutions.id = gallery_items.institution_id AND institutions.owner_id = auth.uid())
  );