/*
# Grados, Grupos y Periodos Academicos

1. Overview
This migration adds structured management of academic grades/levels ("grados") and
academic periods ("periodos academicos") for each institution, and links them to the
existing quotas table. Previously quotas stored grade_or_group and academic_period as
free text; this migration keeps those text columns (for backward compatibility and
denormalized display) but adds foreign keys to new structured tables so that:
- grades and periods are managed as first-class entities (create, list, edit, archive)
- quotas reference a specific grade + period by id
- assignments inherit the grade + period through their quota
- filtering by grade/period never mixes data from different periods
- relationships stay consistent (FK constraints enforce integrity)

2. New Tables
- `academic_periods` (periodos academicos)
  - id (uuid PK, gen_random_uuid())
  - institution_id (uuid FK -> institutions.id ON DELETE CASCADE, NOT NULL)
  - name (text NOT NULL) — e.g. "2026-2027", "Semestre 1 2026"
  - start_date (date, nullable) — optional period start
  - end_date (date, nullable) — optional period end
  - is_active (boolean DEFAULT true) — soft-archive flag
  - created_by (uuid FK -> auth.users.id, DEFAULT auth.uid())
  - created_at / updated_at (timestamptz DEFAULT now())
  - UNIQUE (institution_id, name)

- `grades` (grados o niveles academicos)
  - id (uuid PK, gen_random_uuid())
  - institution_id (uuid FK -> institutions.id ON DELETE CASCADE, NOT NULL)
  - name (text NOT NULL) — e.g. "1ro Bachillerato", "Grupo A"
  - level (text, nullable) — optional classification: "Primaria", "Secundaria", etc.
  - sort_order (integer DEFAULT 0) — for ordered display
  - is_active (boolean DEFAULT true) — soft-archive flag
  - created_by (uuid FK -> auth.users.id, DEFAULT auth.uid())
  - created_at / updated_at (timestamptz DEFAULT now())
  - UNIQUE (institution_id, name)

3. Modified Tables
- `quotas` — adds two nullable FK columns:
  - `grade_id` (uuid FK -> grades.id ON DELETE SET NULL, nullable)
  - `period_id` (uuid FK -> academic_periods.id ON DELETE SET NULL, nullable)
  Nullable to preserve backward compatibility; the frontend will populate them going
  forward. The free-text grade_or_group / academic_period columns are kept as
  denormalized display values.

4. View update
- `quotas_with_available` is dropped and recreated to LEFT JOIN grades and
  academic_periods, exposing grade_name, grade_level, period_name, period_start_date,
  period_end_date alongside the existing columns. Must DROP first because the column
  list/order changes (CREATE OR REPLACE rejects column renames).

5. Security (RLS)
- academic_periods and grades: RLS enabled, owner-scoped CRUD for authenticated
  (institution.owner_id = auth.uid()). created_by defaults to auth.uid().
  No anon policies (institution-private management data).
- Grants: SELECT, INSERT, UPDATE, DELETE to authenticated only.

6. Important notes
- No data migration needed: quotas is currently empty, new columns are nullable.
- No test/seed data inserted.
- Idempotent: uses IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, drops policies before
  recreating, drops view before recreating.
*/

-- =========================================================
-- Table: academic_periods
-- =========================================================

CREATE TABLE IF NOT EXISTS academic_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academic_periods_inst_name_unique UNIQUE (institution_id, name)
);

CREATE INDEX IF NOT EXISTS academic_periods_institution_id_idx ON academic_periods(institution_id);

-- =========================================================
-- Table: grades
-- =========================================================

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT grades_inst_name_unique UNIQUE (institution_id, name)
);

CREATE INDEX IF NOT EXISTS grades_institution_id_idx ON grades(institution_id);

-- =========================================================
-- RLS: academic_periods (owner = institution.owner_id)
-- =========================================================

ALTER TABLE academic_periods ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON academic_periods TO authenticated;

DROP POLICY IF EXISTS "select_own_periods" ON academic_periods;
CREATE POLICY "select_own_periods" ON academic_periods FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = academic_periods.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_periods" ON academic_periods;
CREATE POLICY "insert_own_periods" ON academic_periods FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = academic_periods.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_periods" ON academic_periods;
CREATE POLICY "update_own_periods" ON academic_periods FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = academic_periods.institution_id AND institutions.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = academic_periods.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_periods" ON academic_periods;
CREATE POLICY "delete_own_periods" ON academic_periods FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = academic_periods.institution_id AND institutions.owner_id = auth.uid())
  );

-- =========================================================
-- RLS: grades (owner = institution.owner_id)
-- =========================================================

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON grades TO authenticated;

DROP POLICY IF EXISTS "select_own_grades" ON grades;
CREATE POLICY "select_own_grades" ON grades FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = grades.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_grades" ON grades;
CREATE POLICY "insert_own_grades" ON grades FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = grades.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_grades" ON grades;
CREATE POLICY "update_own_grades" ON grades FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = grades.institution_id AND institutions.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = grades.institution_id AND institutions.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_grades" ON grades;
CREATE POLICY "delete_own_grades" ON grades FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM institutions WHERE institutions.id = grades.institution_id AND institutions.owner_id = auth.uid())
  );

-- =========================================================
-- Add FK columns to quotas
-- =========================================================

ALTER TABLE quotas ADD COLUMN IF NOT EXISTS grade_id uuid REFERENCES grades(id) ON DELETE SET NULL;
ALTER TABLE quotas ADD COLUMN IF NOT EXISTS period_id uuid REFERENCES academic_periods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS quotas_grade_id_idx ON quotas(grade_id);
CREATE INDEX IF NOT EXISTS quotas_period_id_idx ON quotas(period_id);

-- =========================================================
-- Recreate view: quotas_with_available (with grade + period joins)
-- =========================================================

DROP VIEW IF EXISTS quotas_with_available;

CREATE VIEW quotas_with_available AS
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
  (q.total - q.assigned) AS available,
  q.notes,
  q.created_by,
  q.created_at,
  q.updated_at
FROM quotas q
LEFT JOIN grades g ON g.id = q.grade_id
LEFT JOIN academic_periods p ON p.id = q.period_id;

ALTER VIEW quotas_with_available SET (security_invoker = true);
GRANT SELECT ON quotas_with_available TO authenticated;

-- =========================================================
-- updated_at triggers
-- =========================================================

CREATE OR REPLACE FUNCTION touch_period_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS periods_touch_updated_at ON academic_periods;
CREATE TRIGGER periods_touch_updated_at
  BEFORE UPDATE ON academic_periods
  FOR EACH ROW
  EXECUTE FUNCTION touch_period_updated_at();

CREATE OR REPLACE FUNCTION touch_grade_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grades_touch_updated_at ON grades;
CREATE TRIGGER grades_touch_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION touch_grade_updated_at();
