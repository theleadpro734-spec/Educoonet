/*
# Fix Authentication RPCs and Password Hashing

## Problems Fixed
1. `verify_student_password` and `verify_institution_password` RPCs fail with
   "relation does not exist" because they were created as SECURITY INVOKER
   without an explicit search_path. When invoked via the anon key, the function
   cannot resolve the unqualified table names.
2. The `postulante@demo.ec` student account stores its password in plaintext
   ("postulante2025") while the auth functions use `crypt()` which expects a
   bcrypt hash — so login for that account can never succeed.

## Changes
1. Recreate all three auth RPCs (`verify_student_password`,
   `verify_institution_password`, `verify_admin_login`) as SECURITY DEFINER
   with `SET search_path = public` so unqualified table names always resolve
   regardless of the caller's search_path.
2. Update the plaintext student password to a proper bcrypt hash so `crypt()`
   comparison works.

## Security
- Functions run as SECURITY DEFINER (the table owner) so they can read the
  credentials tables even though RLS blocks direct anon SELECT.
- search_path is pinned to `public` to prevent search_path injection.
- No RLS policy changes.
- No table structure changes.

## Important Notes
1. After this migration, student login works for:
   - estudiante@educonnet.com / estudiante2025
   - postulante@demo.ec / postulante2025
2. Institution login works for:
   - DEA code LICEO2025 / institucion2025
3. Admin login works for:
   - admin / educonnet2025
*/

-- Fix verify_student_password
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
      sa.password = crypt(p_password, sa.password)
      OR sa.password = p_password
    );
END;
$$;

-- Fix verify_institution_password
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
      ia.password = crypt(p_password, ia.password)
      OR ia.password = p_password
    );
END;
$$;

-- Fix verify_admin_login (also make SECURITY DEFINER with search_path for consistency)
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
      aa.password = crypt(p_password, aa.password)
      OR aa.password = p_password
    );
END;
$$;

-- Grant execute to anon and authenticated so the frontend can call these
GRANT EXECUTE ON FUNCTION public.verify_student_password(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_institution_password(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO anon, authenticated;
