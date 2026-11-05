/*
# Reserve quota on application and release it on rejection

1. Behaviour
- Creating or moving an application to a quota reserves one slot immediately.
- A slot counts as occupied while its application is 'pendiente' or 'aceptada'.
- Rejecting an application frees its slot and archives the application so it leaves the listings.

2. Changes
- `applications.archived_at`: timestamp set when an application is rejected. Archived rows are hidden from listings but kept for history.
- `quota_reserved_count(uuid)`: counts occupied, non-archived applications for a quota. Runs with definer rights so applicants can see the real availability without reading other people's applications.
- `quotas_with_available`: `available` is now total minus assigned minus reserved; new column `reserved`.
- `validate_application_quota_reference`: when a quota is chosen (insert or change), locks the quota row and rejects the write if no slot is free.
- Trigger that stamps `archived_at` when status changes to 'rechazada'.
- Realtime publication includes `applications` and `quotas` so open screens refresh.

3. Security
- `quota_reserved_count` is executable by anon and authenticated only; it returns a number and no personal data.

4. Notes
- Assignments created by the institution still increase `assigned`; they are not counted twice because reservations are computed from applications.
*/

ALTER TABLE applications ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE OR REPLACE FUNCTION public.quota_reserved_count(p_quota_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)::integer
  FROM public.applications a
  WHERE a.quota_id = p_quota_id
    AND a.status IN ('pendiente', 'aceptada')
    AND a.archived_at IS NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.quota_reserved_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quota_reserved_count(uuid) TO anon, authenticated;

CREATE OR REPLACE VIEW public.quotas_with_available
WITH (security_invoker = true)
AS
SELECT
  q.id,
  q.institution_id,
  q.grade_or_group,
  q.academic_period,
  q.grade_id,
  q.period_id,
  g.name AS grade_name,
  g.level AS grade_level,
  p.name AS period_name,
  p.start_date AS period_start_date,
  p.end_date AS period_end_date,
  q.total,
  q.assigned,
  q.total - q.assigned - public.quota_reserved_count(q.id) AS available,
  q.notes,
  q.created_by,
  q.created_at,
  q.updated_at,
  public.quota_reserved_count(q.id) AS reserved
FROM public.quotas q
LEFT JOIN public.grades g ON g.id = q.grade_id
LEFT JOIN public.academic_periods p ON p.id = q.period_id;

GRANT SELECT ON public.quotas_with_available TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_application_quota_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_free integer;
BEGIN
  IF NEW.quota_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.quotas q
    WHERE q.id = NEW.quota_id
      AND q.institution_id = NEW.institution_id
  ) THEN
    RAISE EXCEPTION 'El cupo seleccionado no pertenece a esta institucion';
  END IF;

  IF NEW.quota_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.quota_id IS DISTINCT FROM OLD.quota_id) THEN
    PERFORM 1 FROM public.quotas q WHERE q.id = NEW.quota_id FOR UPDATE;

    SELECT q.total - q.assigned - public.quota_reserved_count(q.id)
    INTO v_free
    FROM public.quotas q
    WHERE q.id = NEW.quota_id;

    IF v_free IS NULL OR v_free <= 0 THEN
      RAISE EXCEPTION 'Este cupo ya no tiene disponibilidad';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.archive_rejected_application()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'rechazada' AND OLD.status IS DISTINCT FROM 'rechazada' THEN
    NEW.archived_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS applications_archive_rejected ON public.applications;
CREATE TRIGGER applications_archive_rejected
BEFORE UPDATE OF status ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.archive_rejected_application();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'applications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'quotas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotas;
  END IF;
END $$;
