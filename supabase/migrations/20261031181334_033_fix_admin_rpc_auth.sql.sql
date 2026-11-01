/*
# Fix admin RPCs to not depend on auth.uid()

## Problem
The admin login flow uses verify_admin_login (username/password check against
admin_accounts) but does NOT create a Supabase auth.users session. Therefore
auth.uid() is NULL for admin calls, and the existing admin_* SECURITY DEFINER
functions (which check auth.uid() = admin_accounts.id) always reject.

## Fix
Change verify_admin_session and all admin action RPCs to accept p_admin_id
(uuid) as a parameter and verify it EXISTS in admin_accounts server-side.
The p_admin_id value originates from verify_admin_login (a server-verified
RPC), not from user input. The functions still raise 'Not authorized' if the
ID is not a valid admin, so a forged ID from the client is rejected.

## Functions modified
- verify_admin_session(p_admin_id uuid) — returns admin row if the ID is valid
- admin_set_institution_status(p_admin_id uuid, p_institution_id uuid, p_suspend boolean)
- admin_set_student_status(p_admin_id uuid, p_student_id uuid, p_suspend boolean)
- admin_update_application_status(p_admin_id uuid, p_application_id uuid, p_new_status text)

All are SECURITY DEFINER, SET search_path = public, REVOKE EXECUTE FROM anon.
*/

-- verify_admin_session: verify a stored admin_id is valid
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_admin_id uuid)
RETURNS TABLE(id uuid, username text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_admin_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT aa.id, aa.username, aa.name
  FROM admin_accounts aa
  WHERE aa.id = p_admin_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_session(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_session(uuid) TO authenticated;

-- admin_set_institution_status
CREATE OR REPLACE FUNCTION public.admin_set_institution_status(
  p_admin_id uuid,
  p_institution_id uuid,
  p_suspend boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;
  IF v_admin_name IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE institutions
    SET is_suspended = p_suspend,
        suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END,
        suspended_by = CASE WHEN p_suspend THEN p_admin_id ELSE NULL END,
        updated_at = now()
    WHERE id = p_institution_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name,
    CASE WHEN p_suspend THEN 'institution_suspend' ELSE 'institution_activate' END,
    'institution', p_institution_id,
    CASE WHEN p_suspend THEN 'suspended' ELSE 'activated' END);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_institution_status(uuid, uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_institution_status(uuid, uuid, boolean) TO authenticated;

-- admin_set_student_status
CREATE OR REPLACE FUNCTION public.admin_set_student_status(
  p_admin_id uuid,
  p_student_id uuid,
  p_suspend boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;
  IF v_admin_name IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE student_accounts
    SET is_suspended = p_suspend,
        suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END,
        suspended_by = CASE WHEN p_suspend THEN p_admin_id ELSE NULL END
    WHERE id = p_student_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name,
    CASE WHEN p_suspend THEN 'student_suspend' ELSE 'student_activate' END,
    'student', p_student_id,
    CASE WHEN p_suspend THEN 'suspended' ELSE 'activated' END);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_student_status(uuid, uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_student_status(uuid, uuid, boolean) TO authenticated;

-- admin_update_application_status
CREATE OR REPLACE FUNCTION public.admin_update_application_status(
  p_admin_id uuid,
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;
  IF v_admin_name IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_new_status NOT IN ('pendiente', 'aceptada', 'rechazada') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE applications SET status = p_new_status WHERE id = p_application_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name, 'application_status', 'application', p_application_id, p_new_status);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_application_status(uuid, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_application_status(uuid, uuid, text) TO authenticated;
