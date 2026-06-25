-- Modo prueba: permitir acceso público a aplicaciones e instituciones
-- para que los 2 botones de prueba funcionen sin login.

-- Applications: permitir lectura/escritura pública (modo pruebas)
DROP POLICY IF EXISTS "applications_select_own" ON applications;
DROP POLICY IF EXISTS "applications_insert" ON applications;
DROP POLICY IF EXISTS "applications_update" ON applications;

CREATE POLICY "applications_select_all" ON applications FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "applications_insert_all" ON applications FOR INSERT
  TO authenticated, anon WITH CHECK (true);
CREATE POLICY "applications_update_all" ON applications FOR UPDATE
  TO authenticated, anon USING (true) WITH CHECK (true);

-- Institutions: permitir escritura pública en modo pruebas
DROP POLICY IF EXISTS "institutions_select_published" ON institutions;
DROP POLICY IF EXISTS "institutions_update_own" ON institutions;

CREATE POLICY "institutions_select_all" ON institutions FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "institutions_update_all" ON institutions FOR UPDATE
  TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "institutions_insert_all" ON institutions FOR INSERT
  TO authenticated, anon WITH CHECK (true);
