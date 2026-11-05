/*
# Institution accept / reject through a checked function

1. Problem
- Institutions could not change an application's status. The applicant-facing column grants never include `status`, and the institution has no table-level UPDATE, so the direct update was refused and the button appeared to do nothing.

2. New function
- `institution_set_application_status(p_application_id, p_new_status)`: lets the owner of the application's institution set the status to 'aceptada' or 'rechazada' (or back to 'pendiente').
- It refuses applications that were already rejected and archived, so a freed quota cannot be taken again without a new reservation.
- It sends the same applicant notification the old flow sent.
- Rejecting archives the application and releases its quota through the existing trigger and availability view.

3. Security
- Ownership is checked against the caller's session (`institutions.owner_id = auth.uid()`).
- Executable by authenticated only; anon and PUBLIC are revoked.
*/

CREATE OR REPLACE FUNCTION public.institution_set_application_status(
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_status text;
  v_archived_at timestamptz;
BEGIN
  IF p_new_status NOT IN ('pendiente', 'aceptada', 'rechazada') THEN
    RAISE EXCEPTION 'Estado invalido';
  END IF;

  SELECT a.status, a.archived_at INTO v_current_status, v_archived_at
  FROM applications a
  JOIN institutions i ON i.id = a.institution_id
  WHERE a.id = p_application_id
    AND i.owner_id = auth.uid();

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'No autorizado para gestionar esta postulacion';
  END IF;

  IF v_archived_at IS NOT NULL AND p_new_status <> 'rechazada' THEN
    RAISE EXCEPTION 'Esta postulacion fue rechazada y archivada';
  END IF;

  IF v_current_status = p_new_status THEN
    RETURN;
  END IF;

  UPDATE applications SET status = p_new_status WHERE id = p_application_id;
  PERFORM notify_status_change(p_application_id, p_new_status);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.institution_set_application_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.institution_set_application_status(uuid, text) TO authenticated;
