/*
# Fix auth RPC search_path to include extensions schema

## Problem
`crypt()` lives in the `extensions` schema (pgcrypto was installed there), but
the auth RPCs were created with `SET search_path = public`, which excludes
`extensions` — so `crypt()` could not be found and all logins failed.

## Fix
Recreate the three auth RPCs with `SET search_path = public, extensions` so
both the application tables (in `public`) and the `crypt()` function (in
`extensions`) are visible to the function body.

## Security
- Functions remain SECURITY DEFINER.
- search_path is pinned (prevents injection) but now includes `extensions`.
- No RLS or table changes.
*/

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
SET search_path = public, extensions
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
SET search_path = public, extensions
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
SET search_path = public, extensions
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
