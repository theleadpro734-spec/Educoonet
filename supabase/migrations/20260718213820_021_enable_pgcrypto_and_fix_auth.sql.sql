/*
# Enable pgcrypto and simplify auth RPCs

## Problem
The `crypt()` function used by the auth RPCs requires the `pgcrypto` extension,
which was not enabled. This caused all student/institution login attempts to
fail with "function crypt(text, text) does not exist".

## Changes
1. Enable the `pgcrypto` extension (needed for `crypt()` password hashing).
2. Recreate the auth RPCs so they gracefully handle both hashed and plaintext
   passwords: if the stored value looks like a bcrypt hash (starts with `$2`),
   use `crypt()` for comparison; otherwise do a direct text comparison. This
   makes login work for every existing account regardless of storage format.

## Security
- Functions remain SECURITY DEFINER with `SET search_path = public`.
- No RLS or table changes.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- verify_student_password
DROP FUNCTION IF EXISTS public.verify_student_password(p_email text, p_password text);

CREATE FUNCTION public.verify_student_password(p_email text, p_password text)
RETURNS TABLE (
  id uuid,
  name text,
  last_name text,
  email text,
  cedula text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.name, sa.last_name, sa.email, sa.cedula
  FROM student_accounts sa
  WHERE sa.email = lower(trim(p_email))
    AND (
      (sa.password LIKE '$2%' AND sa.password = crypt(p_password, sa.password))
      OR (sa.password NOT LIKE '$2%' AND sa.password = p_password)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_student_password(text, text) TO anon, authenticated;

-- verify_institution_password
DROP FUNCTION IF EXISTS public.verify_institution_password(p_dea_code text, p_password text);

CREATE FUNCTION public.verify_institution_password(p_dea_code text, p_password text)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  institution_id uuid,
  dea_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ia.id, ia.name, ia.email, ia.institution_id, ia.dea_code
  FROM institution_accounts ia
  WHERE ia.dea_code = trim(p_dea_code)
    AND (
      (ia.password LIKE '$2%' AND ia.password = crypt(p_password, ia.password))
      OR (ia.password NOT LIKE '$2%' AND ia.password = p_password)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_institution_password(text, text) TO anon, authenticated;

-- verify_admin_login
DROP FUNCTION IF EXISTS public.verify_admin_login(p_username text, p_password text);

CREATE FUNCTION public.verify_admin_login(p_username text, p_password text)
RETURNS TABLE (
  id uuid,
  username text,
  name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT aa.id, aa.username, aa.name
  FROM admin_accounts aa
  WHERE aa.username = trim(p_username)
    AND (
      (aa.password LIKE '$2%' AND aa.password = crypt(p_password, aa.password))
      OR (aa.password NOT LIKE '$2%' AND aa.password = p_password)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO anon, authenticated;
