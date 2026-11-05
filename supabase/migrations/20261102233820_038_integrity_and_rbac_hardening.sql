/*
# Integridad de cupos y endurecimiento de roles administrativos

1. Propósito
Cierra las escrituras directas que podían desincronizar los cupos y las asignaciones.
Las operaciones que cambian asignaciones pasan únicamente por funciones atómicas que
bloquean el cupo y actualizan el contador en la misma transacción.

2. Seguridad de cupos
- `quotas`: se eliminan escrituras anónimas y se restringen los campos que una
  institución puede insertar o actualizar; `assigned` solo cambia por RPC.
- `assignments`: se elimina INSERT/UPDATE/DELETE directo para clientes; solo se
  permite SELECT y las RPC protegidas realizan las mutaciones.
- `quotas_with_available`: solo lectura para usuarios institucionales autenticados.
- `grades` y `academic_periods`: se elimina acceso anónimo.
- Se valida que el grado y el periodo seleccionados pertenezcan a la misma
  institución del cupo.

3. Seguridad del equipo administrativo
- `admin_accounts` y `admin_permissions` quedan sin acceso directo desde el API.
  Las funciones SECURITY DEFINER son el único acceso.
- Las funciones del login y de sesión se pueden llamar sin una sesión Supabase,
  porque el equipo usa autenticación administrativa propia, pero verifican la cuenta
  en el servidor y rechazan cuentas inactivas.
- Las funciones administrativas con `p_admin_id` se pueden llamar desde ese flujo
  propio y mantienen las comprobaciones de rol; se eliminan los overloads sin
  `p_admin_id`, que no podían validar permisos.
- `admin_update_application_status` requiere ahora `applications.manage`, otorgado
  únicamente a `super_admin`.

4. Importante
- No se eliminan registros ni columnas.
- Las asignaciones concurrentes conservan el bloqueo de fila existente.
- Las cuentas administrativas existentes conservan su rol actual y siguen usando
  las funciones verificadas.
*/

-- Client access for quota data: institution-authenticated only.
REVOKE ALL ON quotas FROM anon;
REVOKE INSERT, UPDATE ON quotas FROM authenticated;
GRANT INSERT (institution_id, grade_or_group, academic_period, grade_id, period_id, total, notes) ON quotas TO authenticated;
GRANT UPDATE (notes, updated_at) ON quotas TO authenticated;

REVOKE ALL ON assignments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON assignments FROM authenticated;
GRANT SELECT ON assignments TO authenticated;

REVOKE ALL ON academic_periods FROM anon;
REVOKE ALL ON grades FROM anon;

REVOKE ALL ON quotas_with_available FROM anon;
REVOKE INSERT, UPDATE, DELETE ON quotas_with_available FROM authenticated;
GRANT SELECT ON quotas_with_available TO authenticated;

-- Prevent cross-institution grade/period references on quota writes.
CREATE OR REPLACE FUNCTION validate_quota_academic_references()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.grade_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM grades g
    WHERE g.id = NEW.grade_id AND g.institution_id = NEW.institution_id
  ) THEN
    RAISE EXCEPTION 'El grado no pertenece a la institucion del cupo';
  END IF;

  IF NEW.period_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM academic_periods p
    WHERE p.id = NEW.period_id AND p.institution_id = NEW.institution_id
  ) THEN
    RAISE EXCEPTION 'El periodo no pertenece a la institucion del cupo';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotas_validate_academic_references ON quotas;
CREATE TRIGGER quotas_validate_academic_references
  BEFORE INSERT OR UPDATE OF institution_id, grade_id, period_id ON quotas
  FOR EACH ROW
  EXECUTE FUNCTION validate_quota_academic_references();

-- Direct admin table access is never allowed; verified RPCs run as the owner.
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_accounts FROM anon, authenticated;
REVOKE ALL ON admin_permissions FROM anon, authenticated;

-- The custom team-admin login does not create a Supabase Auth session, so these
-- verified functions must remain callable by anon while keeping all table access closed.
GRANT EXECUTE ON FUNCTION verify_admin_login(text, text) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_session() TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_session(uuid) TO anon;
GRANT EXECUTE ON FUNCTION admin_has_permission(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_list_users(uuid) TO anon;
GRANT EXECUTE ON FUNCTION admin_create_user(uuid, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_user(uuid, uuid, text, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION admin_reset_user_password(uuid, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_set_institution_status(uuid, uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION admin_set_student_status(uuid, uuid, boolean) TO anon;

-- Remove legacy variants that accept no admin identity.
REVOKE EXECUTE ON FUNCTION admin_set_institution_status(uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION admin_set_student_status(uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION admin_update_application_status(uuid, text) FROM PUBLIC, anon, authenticated;

-- Application status changes are reserved for super administrators.
INSERT INTO admin_permissions (role, permission)
VALUES ('super_admin', 'applications.manage')
ON CONFLICT (role, permission) DO NOTHING;

DROP FUNCTION IF EXISTS admin_update_application_status(uuid, uuid, text);
CREATE FUNCTION admin_update_application_status(
  p_admin_id uuid,
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  IF NOT admin_has_permission(p_admin_id, 'applications.manage') THEN
    RAISE EXCEPTION 'No tienes permiso para gestionar postulaciones';
  END IF;

  IF p_new_status NOT IN ('pendiente', 'aceptada', 'rechazada') THEN
    RAISE EXCEPTION 'Estado invalido';
  END IF;

  SELECT name INTO v_admin_name FROM admin_accounts WHERE id = p_admin_id;

  UPDATE applications SET status = p_new_status WHERE id = p_application_id;

  INSERT INTO admin_activity_log (admin_id, admin_name, action, target_type, target_id, details)
  VALUES (p_admin_id, v_admin_name, 'application_status', 'application', p_application_id, p_new_status);
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_update_application_status(uuid, uuid, text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_application_status(uuid, uuid, text) TO anon;
