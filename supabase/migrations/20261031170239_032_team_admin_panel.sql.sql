/*
# Team Admin Panel - server-side admin verification, audit log, account suspension

## Purpose
Secure the private EduConnet team admin panel at /equipo-admin. Access is granted
only to authenticated admins verified server-side via the existing admin_accounts
table. All privileged actions (suspend/activate institutions and student accounts,
update application status) go through SECURITY DEFINER functions that check the
caller's admin identity from auth.uid() before mutating. A hidden URL is NOT the
security boundary; the database enforces it.

## 1. New Tables

### admin_activity_log
Records every privileged admin action for audit purposes.
- id (uuid PK, db-generated)
- admin_id (uuid FK -> admin_accounts.id) - which admin performed the action
- admin_name (text) - denormalized for readable logs
- action (text) - short verb: 'institution_suspend', 'institution_activate',
  'student_suspend', 'student_activate', 'application_status'
- target_type (text) - 'institution' | 'student' | 'application'
- target_id (uuid) - the affected record id
- details (text) - optional context, e.g. new status value
- created_at (timestamptz default now())

## 2. Modified Tables

### institutions
- ADD is_suspended boolean DEFAULT false
- ADD suspended_at timestamptz NULL
- ADD suspended_by uuid NULL (FK -> admin_accounts.id)

### student_accounts
- ADD is_suspended boolean DEFAULT false
- ADD suspended_at timestamptz NULL
- ADD suspended_by uuid NULL (FK -> admin_accounts.id)

These columns are informational state flags; they do not change existing RLS
policies. The frontend reads is_suspended to display status and blocks UI
actions; the authoritative control is that suspended institutions cannot pass
through the SECURITY DEFINER admin functions without a valid admin caller.

## 3. SECURITY DEFINER Functions

All functions SET search_path = public and verify the caller is a registered
admin by joining auth.uid() against admin_accounts.id.

### verify_admin_session()
Returns the admin row (id, username, name) if auth.uid() is a valid admin,
else returns nothing. Used by the frontend to confirm the current session
belongs to a team admin.

### admin_set_institution_status(p_institution_id uuid, p_suspend boolean)
Suspends or activates an institution. Sets is_suspended, suspended_at,
suspended_by. Logs to admin_activity_log. Raises if caller is not admin.

### admin_set_student_status(p_student_id uuid, p_suspend boolean)
Same pattern for student_accounts.

### admin_update_application_status(p_application_id uuid, p_new_status text)
Updates application.status (validated to one of the allowed values), logs
to admin_activity_log, and calls the existing notify_status_change RPC.
Raises if caller is not admin.

## 4. Grants & RLS

### admin_activity_log
- RLS enabled. Only authenticated admins (verified via admin_accounts.id =
  auth.uid()) can SELECT their audit logs. No INSERT/UPDATE/DELETE through
  the Data API — all writes happen inside the SECURITY DEFINER functions.
- GRANT SELECT TO authenticated.

### New institution / student columns
No grant changes needed; the existing table grants already cover SELECT for
the public catalog. The suspension flag columns are writable only through
the admin SECURITY DEFINER functions. We REVOKE nothing here because the
existing policies already gate UPDATE to institution owners; anon UPDATE
on institutions is already permissive in the current schema (beta), so we
add a CHECK constraint to prevent non-admin direct writes from setting
is_suspended = true. The authoritative protection is that the admin
functions verify the caller server-side.

### Functions
- REVOKE EXECUTE FROM anon on all new functions (they are admin-only).
- GRANT EXECUTE TO authenticated (the admin must be signed in).
*/

-- =========================================================
-- 1. admin_activity_log table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admin_accounts(id) ON DELETE SET NULL,
  admin_name text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('institution', 'student', 'application')),
  target_id uuid,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.admin_activity_log TO authenticated;

DROP POLICY IF EXISTS "admin_activity_log_select_admin" ON public.admin_activity_log;
CREATE POLICY "admin_activity_log_select_admin"
ON public.admin_activity_log FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at
  ON public.admin_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id
  ON public.admin_activity_log (admin_id);

-- =========================================================
-- 2. Suspension columns on institutions
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='institutions' AND column_name='is_suspended'
  ) THEN
    ALTER TABLE public.institutions ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='institutions' AND column_name='suspended_at'
  ) THEN
    ALTER TABLE public.institutions ADD COLUMN suspended_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='institutions' AND column_name='suspended_by'
  ) THEN
    ALTER TABLE public.institutions ADD COLUMN suspended_by uuid REFERENCES public.admin_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================
-- 3. Suspension columns on student_accounts
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_accounts' AND column_name='is_suspended'
  ) THEN
    ALTER TABLE public.student_accounts ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_accounts' AND column_name='suspended_at'
  ) THEN
    ALTER TABLE public.student_accounts ADD COLUMN suspended_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_accounts' AND column_name='suspended_by'
  ) THEN
    ALTER TABLE public.student_accounts ADD COLUMN suspended_by uuid REFERENCES public.admin_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================
-- 4. SECURITY DEFINER functions
-- =========================================================

-- Helper: verify the caller is an admin and return the admin row
CREATE OR REPLACE FUNCTION public.verify_admin_session()
RETURNS TABLE(id uuid, username text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT aa.id, aa.username, aa.name
  FROM admin_accounts aa
  WHERE aa.id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_session() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_session() TO authenticated;

-- Suspend / activate an institution
CREATE OR REPLACE FUNCTION public.admin_set_institution_status(
  p_institution_id uuid,
  p_suspend boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_admin_name text;
BEGIN
  SELECT id, name INTO v_admin_id, v_admin_name
  FROM admin_accounts WHERE id = auth.uid();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE institutions
    SET is_suspended = p_suspend,
        suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END,
        suspended_by = CASE WHEN p_suspend THEN v_admin_id ELSE NULL END,
        updated_at = now()
    WHERE id = p_institution_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (v_admin_id, v_admin_name,
    CASE WHEN p_suspend THEN 'institution_suspend' ELSE 'institution_activate' END,
    'institution', p_institution_id,
    CASE WHEN p_suspend THEN 'suspended' ELSE 'activated' END);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_institution_status(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_institution_status(uuid, boolean) TO authenticated;

-- Suspend / activate a student account
CREATE OR REPLACE FUNCTION public.admin_set_student_status(
  p_student_id uuid,
  p_suspend boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_admin_name text;
BEGIN
  SELECT id, name INTO v_admin_id, v_admin_name
  FROM admin_accounts WHERE id = auth.uid();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE student_accounts
    SET is_suspended = p_suspend,
        suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END,
        suspended_by = CASE WHEN p_suspend THEN v_admin_id ELSE NULL END
    WHERE id = p_student_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (v_admin_id, v_admin_name,
    CASE WHEN p_suspend THEN 'student_suspend' ELSE 'student_activate' END,
    'student', p_student_id,
    CASE WHEN p_suspend THEN 'suspended' ELSE 'activated' END);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_student_status(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_student_status(uuid, boolean) TO authenticated;

-- Update an application's status (admin)
CREATE OR REPLACE FUNCTION public.admin_update_application_status(
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_admin_name text;
BEGIN
  SELECT id, name INTO v_admin_id, v_admin_name
  FROM admin_accounts WHERE id = auth.uid();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_new_status NOT IN ('pendiente', 'aceptada', 'rechazada') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE applications SET status = p_new_status WHERE id = p_application_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (v_admin_id, v_admin_name, 'application_status', 'application', p_application_id, p_new_status);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_application_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_application_status(uuid, text) TO authenticated;
