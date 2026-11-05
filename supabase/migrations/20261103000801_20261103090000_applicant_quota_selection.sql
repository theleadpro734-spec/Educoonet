/*
# Applicant quota selection and self-service application management

1. Purpose
- Let applicants see published institutions' active grades, academic periods, and available quotas while applying.
- Store the selected quota on the application so the institution can identify the requested grade and period.
- Let the authenticated applicant edit or delete only their own application.

2. Modified tables
- `applications.quota_id` (uuid, nullable, references `quotas`) stores the applicant's selected quota.
- An index supports institution and quota lookups.

3. Security
- Public applicants may read only quotas, grades, and academic periods belonging to published, non-suspended institutions; only active academic periods and grades are shown through the application query.
- Applicant updates are limited to applicant-owned fields. `institution_id`, `user_id`, and `status` remain server-controlled.
- Applicant deletes remain limited to the authenticated owner of the application.
- Institution owners retain access to their applications and continue changing status through the existing administrative flow.

4. Integrity
- A trigger rejects a selected quota from another institution.
- A quota remains a request/preference during application; the synchronized `assigned` counter changes only when the institution creates an assignment through the existing atomic RPC.
- Existing rows are preserved and keep `quota_id` null.
*/

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS quota_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applications_quota_id_fkey'
      AND conrelid = 'public.applications'::regclass
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_quota_id_fkey
      FOREIGN KEY (quota_id) REFERENCES public.quotas(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS applications_quota_id_idx
  ON public.applications (quota_id);

CREATE OR REPLACE FUNCTION public.validate_application_quota_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.quota_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.quotas q
    WHERE q.id = NEW.quota_id
      AND q.institution_id = NEW.institution_id
  ) THEN
    RAISE EXCEPTION 'El cupo seleccionado no pertenece a esta institucion';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_validate_quota ON public.applications;
CREATE TRIGGER applications_validate_quota
  BEFORE INSERT OR UPDATE OF institution_id, quota_id ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_application_quota_reference();

GRANT SELECT ON public.quotas, public.grades, public.academic_periods TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_published_quotas" ON public.quotas;
CREATE POLICY "public_select_published_quotas"
ON public.quotas FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = quotas.institution_id
      AND i.is_published = true
      AND i.is_suspended = false
  )
);

DROP POLICY IF EXISTS "public_select_published_grades" ON public.grades;
CREATE POLICY "public_select_published_grades"
ON public.grades FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = grades.institution_id
      AND i.is_published = true
      AND i.is_suspended = false
  )
);

DROP POLICY IF EXISTS "public_select_active_periods" ON public.academic_periods;
CREATE POLICY "public_select_active_periods"
ON public.academic_periods FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = academic_periods.institution_id
      AND i.is_published = true
      AND i.is_suspended = false
  )
);

REVOKE UPDATE ON public.applications FROM anon, authenticated;
GRANT UPDATE (
  opportunity_id,
  quota_id,
  name,
  last_name,
  email,
  phone,
  educational_level,
  address,
  identity_document,
  cv_url,
  certificates_url,
  birth_date,
  birth_place,
  birth_center,
  blood_type,
  province,
  city,
  sector,
  cedula_url,
  birth_certificate_url,
  residence_letter_url,
  cedula_rep_url,
  representative_name,
  representative_cedula,
  contact_email,
  representative_id
) ON public.applications TO authenticated;

DROP POLICY IF EXISTS "anon_update_applications" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;
DROP POLICY IF EXISTS "applications_update_inst_owner" ON public.applications;

CREATE POLICY "applications_update_own"
ON public.applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_inst_owner"
ON public.applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = applications.institution_id
      AND i.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutions i
    WHERE i.id = applications.institution_id
      AND i.owner_id = auth.uid()
  )
);

REVOKE DELETE ON public.applications FROM anon;
GRANT DELETE ON public.applications TO authenticated;

DROP POLICY IF EXISTS "anon_delete_applications" ON public.applications;
DROP POLICY IF EXISTS "applications_delete_own" ON public.applications;
CREATE POLICY "applications_delete_own"
ON public.applications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
