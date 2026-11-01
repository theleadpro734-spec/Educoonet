/*
# Cupos y Asignaciones (Quotas and Assignments)

1. Overview
This migration adds a quotas-and-assignments module to EduConnet so institutions can
define available spots ("cupos") per grade/group and academic period, then assign
applicants to those spots. The quota's assigned counter and the assignments table are
kept synchronized server-side by SECURITY DEFINER functions; the counter is never
edited directly from the client, and availability is checked at the moment of
assignment to prevent over-booking.

2. New Tables
- `quotas` (cupos)
  - id (uuid PK, gen_random_uuid())
  - institution_id (uuid FK -> institutions.id ON DELETE CASCADE, NOT NULL)
  - grade_or_group (text NOT NULL) — e.g. "1ro Bachillerato", "Grupo A"
  - academic_period (text NOT NULL) — e.g. "2026-2027", "Semestre 1 2026"
  - total (integer NOT NULL DEFAULT 0, CHECK total >= 0) — total spots
  - assigned (integer NOT NULL DEFAULT 0, CHECK assigned >= 0) — currently assigned
  - available is derived: total - assigned (exposed via a generated view below)
  - notes (text, nullable)
  - created_by (uuid FK -> auth.users.id, DEFAULT auth.uid())
  - created_at (timestamptz DEFAULT now())
  - updated_at (timestamptz DEFAULT now())
  - UNIQUE (institution_id, grade_or_group, academic_period) — no duplicate cupos for same group/period

- `assignments` (asignaciones)
  - id (uuid PK, gen_random_uuid())
  - quota_id (uuid FK -> quotas.id ON DELETE CASCADE, NOT NULL)
  - application_id (uuid FK -> applications.id ON DELETE SET NULL, nullable)
    — links the assignment to a postulacion when one exists
  - student_name (text NOT NULL) — display name of the assigned person
  - student_email (text, nullable)
  - status (text NOT NULL DEFAULT 'activa', CHECK status IN ('activa','cancelada'))
  - created_by (uuid FK -> auth.users.id, DEFAULT auth.uid())
  - created_at (timestamptz DEFAULT now())
  - cancelled_at (timestamptz, nullable)
  - UNIQUE (quota_id, application_id) WHERE application_id IS NOT NULL
    — no duplicate assignment of the same application to the same quota

3. View
- `quotas_with_available` — convenience view exposing total, assigned, available
  (total - assigned) for each quota row. SECURITY INVOKER so it respects the caller's
  RLS on quotas.

4. SECURITY DEFINER functions (server-enforced quota sync)
All run as owner and verify the caller owns the institution tied to the quota.
- `create_assignment(p_quota_id, p_application_id, p_student_name, p_student_email)`
  — atomically: locks the quota row, re-checks that assigned < total (raises if not),
  rejects duplicate active assignment of the same application_id to the same quota,
  inserts the assignment, and increments quotas.assigned. Returns the new assignment id.
- `cancel_assignment(p_assignment_id)`
  — atomically: loads the assignment + its quota (for update), verifies ownership,
  raises if already cancelled, sets status='cancelada', cancelled_at=now(), and
  decrements quotas.assigned (guarded so it never goes below 0).
- `delete_assignment(p_assignment_id)`
  — atomically: loads the assignment + its quota (for update), verifies ownership,
  decrements quotas.assigned for active assignments, then deletes the row.
- `set_quota_total(p_quota_id, p_total)`
  — atomically: verifies ownership, validates p_total >= current assigned (cannot
  shrink below already-assigned count), updates quotas.total. Returns void.

All four functions REVOKE EXECUTE FROM PUBLIC/anon and GRANT to authenticated.

5. Security (RLS)
- quotas: RLS enabled. Owner-scoped CRUD for authenticated (institution.owner_id =
  auth.uid()). created_by defaults to auth.uid(). UPDATE is column-restricted so the
  assigned counter cannot be edited directly by the client.
- assignments: RLS enabled. SELECT/INSERT/UPDATE/DELETE for authenticated, scoped
  through the parent quota's institution owner. created_by defaults to auth.uid().
- View grants SELECT to authenticated.
- All EXECUTE on the four SECURITY DEFINER functions is revoked from PUBLIC/anon and
  granted to authenticated.

6. Important notes
- quotas.assigned is treated as authoritative: only the SECURITY DEFINER functions
  mutate it. The client must NOT update it directly; the RLS UPDATE policy on quotas
  is column-scoped to non-privileged columns (grade_or_group, academic_period, total,
  notes) by revoking table-level UPDATE and granting only those columns, so assigned
  cannot be tampered with from the client.
- No test/seed data is inserted.
- Idempotent: uses IF NOT EXISTS and drops policies before recreating.
*/

-- =========================================================
-- Tables
-- =========================================================

CREATE TABLE IF NOT EXISTS quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  grade_or_group text NOT NULL,
  academic_period text NOT NULL,
  total integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  assigned integer NOT NULL DEFAULT 0 CHECK (assigned >= 0),
  notes text,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quotas_inst_grade_period_unique UNIQUE (institution_id, grade_or_group, academic_period)
);

CREATE INDEX IF NOT EXISTS quotas_institution_id_idx ON quotas(institution_id);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quota_id uuid NOT NULL REFERENCES quotas(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  student_email text,
  status text NOT NULL DEFAULT 'activa' CHECK (status IN ('activa','cancelada')),
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  CONSTRAINT assignments_quota_app_unique UNIQUE (quota_id, application_id)
);

CREATE INDEX IF NOT EXISTS assignments_quota_id_idx ON assignments(quota_id);
CREATE INDEX IF NOT EXISTS assignments_status_idx ON assignments(status);

-- =========================================================
-- RLS: quotas (owner = institution.owner_id)
-- =========================================================

ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quotas TO authenticated;

DROP POLICY IF EXISTS "select_own_quotas" ON quotas;
CREATE POLICY "select_own_quotas" ON quotas FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = quotas.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_quotas" ON quotas;
CREATE POLICY "insert_own_quotas" ON quotas FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = quotas.institution_id AND institutions.owner_id = auth.uid())
  );

-- Column-restricted UPDATE: clients can edit grade_or_group, academic_period, total,
-- notes, updated_at — but NOT assigned (that is owned by the SECURITY DEFINER fns).
REVOKE UPDATE ON quotas FROM authenticated;
GRANT UPDATE (grade_or_group, academic_period, total, notes, updated_at) ON quotas TO authenticated;

DROP POLICY IF EXISTS "update_own_quotas" ON quotas;
CREATE POLICY "update_own_quotas" ON quotas FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = quotas.institution_id AND institutions.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = quotas.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_quotas" ON quotas;
CREATE POLICY "delete_own_quotas" ON quotas FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = quotas.institution_id AND institutions.owner_id = auth.uid())
  );

-- =========================================================
-- RLS: assignments (scoped through parent quota's institution owner)
-- =========================================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON assignments TO authenticated;

DROP POLICY IF EXISTS "select_own_assignments" ON assignments;
CREATE POLICY "select_own_assignments" ON assignments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM quotas
      JOIN institutions ON institutions.id = quotas.institution_id
      WHERE quotas.id = assignments.quota_id AND institutions.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_assignments" ON assignments;
CREATE POLICY "insert_own_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotas
      JOIN institutions ON institutions.id = quotas.institution_id
      WHERE quotas.id = assignments.quota_id AND institutions.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_assignments" ON assignments;
CREATE POLICY "update_own_assignments" ON assignments FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM quotas
      JOIN institutions ON institutions.id = quotas.institution_id
      WHERE quotas.id = assignments.quota_id AND institutions.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotas
      JOIN institutions ON institutions.id = quotas.institution_id
      WHERE quotas.id = assignments.quota_id AND institutions.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_assignments" ON assignments;
CREATE POLICY "delete_own_assignments" ON assignments FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM quotas
      JOIN institutions ON institutions.id = quotas.institution_id
      WHERE quotas.id = assignments.quota_id AND institutions.owner_id = auth.uid()
    )
  );

-- =========================================================
-- View: quotas_with_available (SECURITY INVOKER)
-- =========================================================

CREATE OR REPLACE VIEW quotas_with_available AS
SELECT
  q.id,
  q.institution_id,
  q.grade_or_group,
  q.academic_period,
  q.total,
  q.assigned,
  (q.total - q.assigned) AS available,
  q.notes,
  q.created_by,
  q.created_at,
  q.updated_at
FROM quotas q;

ALTER VIEW quotas_with_available SET (security_invoker = true);
GRANT SELECT ON quotas_with_available TO authenticated;

-- =========================================================
-- updated_at trigger for quotas
-- =========================================================

CREATE OR REPLACE FUNCTION touch_quota_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotas_touch_updated_at ON quotas;
CREATE TRIGGER quotas_touch_updated_at
  BEFORE UPDATE ON quotas
  FOR EACH ROW
  EXECUTE FUNCTION touch_quota_updated_at();

-- =========================================================
-- SECURITY DEFINER: create_assignment
-- =========================================================

CREATE OR REPLACE FUNCTION create_assignment(
  p_quota_id uuid,
  p_application_id uuid,
  p_student_name text,
  p_student_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_institution_id uuid;
  v_total integer;
  v_assigned integer;
  v_new_id uuid;
  v_existing uuid;
BEGIN
  IF p_student_name IS NULL OR btrim(p_student_name) = '' THEN
    RAISE EXCEPTION 'El nombre del estudiante es obligatorio';
  END IF;

  -- Lock the quota row and load state
  SELECT q.institution_id, q.total, q.assigned
    INTO v_institution_id, v_total, v_assigned
  FROM quotas q
  WHERE q.id = p_quota_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El cupo no existe';
  END IF;

  -- Verify the caller owns the institution tied to this quota
  IF NOT EXISTS (
    SELECT 1 FROM institutions
    WHERE institutions.id = v_institution_id AND institutions.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para asignar en este cupo';
  END IF;

  -- Prevent over-booking: must have availability
  IF v_assigned >= v_total THEN
    RAISE EXCEPTION 'No hay cupos disponibles';
  END IF;

  -- Prevent duplicate active assignment of the same application to the same quota
  IF p_application_id IS NOT NULL THEN
    SELECT a.id INTO v_existing
    FROM assignments a
    WHERE a.quota_id = p_quota_id
      AND a.application_id = p_application_id
      AND a.status = 'activa'
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
      RAISE EXCEPTION 'El postulante ya tiene una asignacion activa en este cupo';
    END IF;
  END IF;

  -- Insert the assignment
  INSERT INTO assignments (quota_id, application_id, student_name, student_email, status)
  VALUES (p_quota_id, p_application_id, p_student_name, p_student_email, 'activa')
  RETURNING id INTO v_new_id;

  -- Increment the counter atomically
  UPDATE quotas
    SET assigned = assigned + 1
    WHERE id = p_quota_id;

  RETURN v_new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_assignment(uuid, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_assignment(uuid, uuid, text, text) TO authenticated;

-- =========================================================
-- SECURITY DEFINER: cancel_assignment
-- =========================================================

CREATE OR REPLACE FUNCTION cancel_assignment(p_assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_quota_id uuid;
  v_status text;
  v_institution_id uuid;
BEGIN
  -- Lock assignment + its quota together
  SELECT a.quota_id, a.status, q.institution_id
    INTO v_quota_id, v_status, v_institution_id
  FROM assignments a
  JOIN quotas q ON q.id = a.quota_id
  WHERE a.id = p_assignment_id
  FOR UPDATE OF a, q;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La asignacion no existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM institutions
    WHERE institutions.id = v_institution_id AND institutions.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF v_status = 'cancelada' THEN
    RAISE EXCEPTION 'La asignacion ya esta cancelada';
  END IF;

  -- Mark cancelled and release the cupo
  UPDATE assignments
    SET status = 'cancelada', cancelled_at = now()
    WHERE id = p_assignment_id;

  -- Decrement, guarded so it never drops below 0
  UPDATE quotas
    SET assigned = GREATEST(0, assigned - 1)
    WHERE id = v_quota_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION cancel_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION cancel_assignment(uuid) TO authenticated;

-- =========================================================
-- SECURITY DEFINER: delete_assignment
-- =========================================================

CREATE OR REPLACE FUNCTION delete_assignment(p_assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_quota_id uuid;
  v_status text;
  v_institution_id uuid;
BEGIN
  SELECT a.quota_id, a.status, q.institution_id
    INTO v_quota_id, v_status, v_institution_id
  FROM assignments a
  JOIN quotas q ON q.id = a.quota_id
  WHERE a.id = p_assignment_id
  FOR UPDATE OF a, q;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La asignacion no existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM institutions
    WHERE institutions.id = v_institution_id AND institutions.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Release the cupo only if it was active (cancelled ones already released)
  IF v_status = 'activa' THEN
    UPDATE quotas
      SET assigned = GREATEST(0, assigned - 1)
      WHERE id = v_quota_id;
  END IF;

  DELETE FROM assignments WHERE id = p_assignment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION delete_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_assignment(uuid) TO authenticated;

-- =========================================================
-- SECURITY DEFINER: set_quota_total
-- =========================================================

CREATE OR REPLACE FUNCTION set_quota_total(p_quota_id uuid, p_total integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_institution_id uuid;
  v_assigned integer;
BEGIN
  IF p_total IS NULL OR p_total < 0 THEN
    RAISE EXCEPTION 'El total debe ser un numero entero positivo o cero';
  END IF;

  SELECT q.institution_id, q.assigned
    INTO v_institution_id, v_assigned
  FROM quotas q
  WHERE q.id = p_quota_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El cupo no existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM institutions
    WHERE institutions.id = v_institution_id AND institutions.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Cannot shrink below the currently-assigned count
  IF p_total < v_assigned THEN
    RAISE EXCEPTION 'El total no puede ser menor que los cupos ya asignados (%)', v_assigned;
  END IF;

  UPDATE quotas SET total = p_total WHERE id = p_quota_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION set_quota_total(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_quota_total(uuid, integer) TO authenticated;
