/*
# Control de Roles y Permisos del Equipo Admin

Adds role-based access control (RBAC) to the admin team panel.

1. Roles
- super_admin — full control (manage institutions, students, and admin users)
- operator — can suspend/reactivate institutions and students; cannot manage users
- viewer — read-only; cannot suspend/reactivate or manage users

2. admin_accounts columns added
- role text NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin','operator','viewer'))
- is_active boolean NOT NULL DEFAULT true
- updated_at timestamptz NOT NULL DEFAULT now()

3. New table: admin_permissions
- id uuid PK, role text, permission text, created_at, UNIQUE(role, permission)
- Seeded with the permission matrix.

4. Functions (all SECURITY DEFINER, server-enforced)
- admin_has_permission(p_admin_id, p_permission) boolean helper
- verify_admin_login(p_username, p_password) — returns role; rejects inactive
- verify_admin_session(p_admin_id) — returns role
- admin_set_institution_status(p_admin_id, ...) — checks 'institutions.manage'
- admin_set_student_status(p_admin_id, ...) — checks 'students.manage'
- admin_create_user(p_admin_id, p_name, p_username, p_password, p_role) — 'users.manage'
- admin_update_user(p_admin_id, p_target_id, p_name, p_role, p_is_active) — 'users.manage'
- admin_reset_user_password(p_admin_id, p_target_id, p_new_password) — 'users.manage'
- admin_list_users(p_admin_id) — 'users.manage'

5. Notes
- Existing admin account defaults to super_admin and is_active=true.
- No-arg admin_set_* overloads kept as-is.
- Functions with changed return types are DROPped before CREATE.
- No test users inserted.
*/

-- =========================================================
-- Add columns to admin_accounts
-- =========================================================

ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin','operator','viewer'));
ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS admin_accounts_role_idx ON admin_accounts(role);

-- =========================================================
-- admin_permissions table
-- =========================================================

CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('super_admin','operator','viewer')),
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_permissions_role_perm_unique UNIQUE (role, permission)
);

INSERT INTO admin_permissions (role, permission) VALUES
  ('super_admin', 'institutions.manage'),
  ('super_admin', 'students.manage'),
  ('super_admin', 'users.manage'),
  ('super_admin', 'view.all'),
  ('operator', 'institutions.manage'),
  ('operator', 'students.manage'),
  ('operator', 'view.all'),
  ('viewer', 'view.all')
ON CONFLICT (role, permission) DO NOTHING;

-- =========================================================
-- updated_at trigger
-- =========================================================

CREATE OR REPLACE FUNCTION touch_admin_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_accounts_touch_updated_at ON admin_accounts;
CREATE TRIGGER admin_accounts_touch_updated_at
  BEFORE UPDATE ON admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION touch_admin_updated_at();

-- =========================================================
-- Helper: admin_has_permission
-- =========================================================

CREATE OR REPLACE FUNCTION admin_has_permission(p_admin_id uuid, p_permission text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role text;
  v_active boolean;
BEGIN
  SELECT a.role, a.is_active INTO v_role, v_active
  FROM admin_accounts a
  WHERE a.id = p_admin_id;

  IF NOT FOUND OR NOT v_active THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM admin_permissions ap
    WHERE ap.role = v_role AND ap.permission = p_permission
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_has_permission(uuid, text) TO authenticated;

-- =========================================================
-- Replace verify_admin_login (return role, reject inactive)
-- =========================================================

DROP FUNCTION IF EXISTS verify_admin_login(text, text);

CREATE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS TABLE(id uuid, username text, name text, role text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT a.id, a.username, a.name, a.role
    FROM admin_accounts a
    WHERE lower(a.username) = lower(p_username)
      AND a.is_active = true
      AND a.password = crypt(p_password, a.password)
    LIMIT 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION verify_admin_login(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION verify_admin_login(text, text) TO authenticated;

-- =========================================================
-- Replace verify_admin_session (both overloads)
-- =========================================================

DROP FUNCTION IF EXISTS verify_admin_session();
DROP FUNCTION IF EXISTS verify_admin_session(uuid);

CREATE FUNCTION verify_admin_session()
RETURNS TABLE(id uuid, username text, name text, role text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN;
END;
$$;

REVOKE EXECUTE ON FUNCTION verify_admin_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION verify_admin_session() TO authenticated;

CREATE FUNCTION verify_admin_session(p_admin_id uuid)
RETURNS TABLE(id uuid, username text, name text, role text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT a.id, a.username, a.name, a.role
    FROM admin_accounts a
    WHERE a.id = p_admin_id AND a.is_active = true
    LIMIT 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION verify_admin_session(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION verify_admin_session(uuid) TO authenticated;

-- =========================================================
-- Replace admin_set_institution_status(p_admin_id, ...) — add permission check
-- =========================================================

DROP FUNCTION IF EXISTS admin_set_institution_status(uuid, uuid, boolean);

CREATE FUNCTION admin_set_institution_status(p_admin_id uuid, p_institution_id uuid, p_suspend boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'institutions.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar instituciones';
  END IF;

  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;

  IF p_suspend THEN
    UPDATE institutions
      SET is_suspended = true, suspended_at = now(), suspended_by = p_admin_id
      WHERE id = p_institution_id;
  ELSE
    UPDATE institutions
      SET is_suspended = false, suspended_at = null, suspended_by = null
      WHERE id = p_institution_id;
  END IF;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name, CASE WHEN p_suspend THEN 'institution_suspend' ELSE 'institution_activate' END, 'institution', p_institution_id, null);
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_institution_status(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_set_institution_status(uuid, uuid, boolean) TO authenticated;

-- =========================================================
-- Replace admin_set_student_status(p_admin_id, ...) — add permission check
-- =========================================================

DROP FUNCTION IF EXISTS admin_set_student_status(uuid, uuid, boolean);

CREATE FUNCTION admin_set_student_status(p_admin_id uuid, p_student_id uuid, p_suspend boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'students.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar postulantes';
  END IF;

  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;

  IF p_suspend THEN
    UPDATE student_accounts
      SET is_suspended = true, suspended_at = now(), suspended_by = p_admin_id
      WHERE id = p_student_id;
  ELSE
    UPDATE student_accounts
      SET is_suspended = false, suspended_at = null, suspended_by = null
      WHERE id = p_student_id;
  END IF;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name, CASE WHEN p_suspend THEN 'student_suspend' ELSE 'student_activate' END, 'student', p_student_id, null);
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_student_status(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_set_student_status(uuid, uuid, boolean) TO authenticated;

-- =========================================================
-- New: admin_create_user (requires users.manage)
-- =========================================================

CREATE OR REPLACE FUNCTION admin_create_user(p_admin_id uuid, p_name text, p_username text, p_password text, p_role text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'users.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar usuarios';
  END IF;

  IF p_role NOT IN ('super_admin','operator','viewer') THEN
    RAISE EXCEPTION 'Rol invalido';
  END IF;

  IF p_password IS NULL OR length(p_password) < 4 THEN
    RAISE EXCEPTION 'La contrasena debe tener al menos 4 caracteres';
  END IF;

  IF EXISTS (SELECT 1 FROM admin_accounts WHERE lower(username) = lower(p_username)) THEN
    RAISE EXCEPTION 'El nombre de usuario ya existe';
  END IF;

  INSERT INTO admin_accounts (name, username, password, role, is_active)
  VALUES (p_name, p_username, crypt(p_password, gen_salt('bf')), p_role, true)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_create_user(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_create_user(uuid, text, text, text, text) TO authenticated;

-- =========================================================
-- New: admin_update_user (requires users.manage)
-- =========================================================

CREATE OR REPLACE FUNCTION admin_update_user(p_admin_id uuid, p_target_id uuid, p_name text, p_role text, p_is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'users.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar usuarios';
  END IF;

  IF p_role NOT IN ('super_admin','operator','viewer') THEN
    RAISE EXCEPTION 'Rol invalido';
  END IF;

  IF p_admin_id = p_target_id AND p_is_active = false THEN
    RAISE EXCEPTION 'No puedes desactivar tu propia cuenta';
  END IF;

  IF p_admin_id = p_target_id AND p_role <> 'super_admin' THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol';
  END IF;

  UPDATE admin_accounts
    SET name = p_name, role = p_role, is_active = p_is_active
    WHERE id = p_target_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_update_user(uuid, uuid, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_update_user(uuid, uuid, text, text, boolean) TO authenticated;

-- =========================================================
-- New: admin_reset_user_password (requires users.manage)
-- =========================================================

CREATE OR REPLACE FUNCTION admin_reset_user_password(p_admin_id uuid, p_target_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'users.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar usuarios';
  END IF;

  IF p_new_password IS NULL OR length(p_new_password) < 4 THEN
    RAISE EXCEPTION 'La contrasena debe tener al menos 4 caracteres';
  END IF;

  UPDATE admin_accounts
    SET password = crypt(p_new_password, gen_salt('bf'))
    WHERE id = p_target_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_reset_user_password(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_reset_user_password(uuid, uuid, text) TO authenticated;

-- =========================================================
-- New: admin_list_users (requires users.manage)
-- =========================================================

CREATE OR REPLACE FUNCTION admin_list_users(p_admin_id uuid)
RETURNS TABLE(id uuid, username text, name text, role text, is_active boolean, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'users.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar usuarios';
  END IF;

  RETURN QUERY
    SELECT a.id, a.username, a.name, a.role, a.is_active, a.created_at
    FROM admin_accounts a
    ORDER BY a.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_users(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_list_users(uuid) TO authenticated;
