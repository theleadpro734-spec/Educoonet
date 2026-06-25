-- =============================================
-- 004: Clean old data, set up test institution, fix RLS
-- =============================================

-- ── Clean all existing sample data ──────────────────────────────────────────
DELETE FROM gallery_items;
DELETE FROM applications;
DELETE FROM favorites;
DELETE FROM opportunities;
DELETE FROM programs;
DELETE FROM institution_settings;
DELETE FROM institutions;

-- ── Fix applications status enum to match Spanish types ────────────────────
-- Update any existing 'pending'/'approved'/'rejected' to Spanish equivalents
-- (no data left, but fix the constraint for future inserts)

-- ── Insert the single test institution ───────────────────────────────────────
INSERT INTO institutions (
  name, location, description, cover_image, gallery_images, address,
  logo_url, rating, programs_count, website, phone, email,
  latitude, longitude, institution_type, slug,
  social_facebook, social_instagram, social_linkedin,
  social_twitter, social_youtube, social_tiktok,
  mission, vision, is_published
) VALUES (
  'U.E Manuel Vicente Romero Garcia',
  'Jipijapa, Manabí, Ecuador',
  'Institución educativa de prueba para el desarrollo de EduConnet.',
  'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[]::TEXT[],
  'Jipijapa, Manabí, Ecuador',
  'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=200',
  4.8,
  0,
  'https://www.educonnet.com',
  '+593 99 999 9999',
  'contacto@uemanuelromero.edu.ec',
  -1.1040,
  -80.4280,
  'Unidad Educativa Pública',
  'ue-manuel-vicente-romero-garcia',
  'https://facebook.com/uemanuelromero',
  'https://instagram.com/uemanuelromero',
  'https://linkedin.com/school/uemanuelromero',
  null,
  null,
  null,
  'Formar ciudadanos íntegros con valores éticos, compromiso social y excelencia académica, contribuyendo al desarrollo de la comunidad jipijapense.',
  'Ser la institución educativa líder en la región costa del Ecuador, reconocida por la calidad de su enseñanza y la formación integral de sus estudiantes.',
  true
);

-- ── Insert sample programs for the test institution ──────────────────────────
INSERT INTO programs (institution_id, name, description, duration, mode, cost, level) VALUES
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'Bachillerato en Ciencias', 'Programa de bachillerato con énfasis en ciencias naturales y matemáticas.', '3 años', 'Presencial', 0, 'Bachillerato'),
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'Bachillerato Técnico', 'Programa técnico con especialización en contabilidad e informática.', '3 años', 'Presencial', 0, 'Bachillerato Técnico'),
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'Educación Básica Superior', 'Educación general básica de 8vo a 10mo año.', '3 años', 'Presencial', 0, 'Básica');

-- ── Insert gallery items for the test institution ───────────────────────────
INSERT INTO gallery_items (institution_id, url, caption, category, sort_order) VALUES
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=600', 'Entrada principal', 'campus', 0),
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'https://images.pexels.com/photos/1139806/pexels-photo-1139806.jpeg?auto=compress&cs=tinysrgb&w=600', 'Aulas', 'facilities', 1),
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'https://images.pexels.com/photos/159213/hall-congress-architecture-building-159213.jpeg?auto=compress&cs=tinysrgb&w=600', 'Edificio central', 'campus', 2),
((SELECT id FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia'), 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600', 'Área deportiva', 'sports', 3);

-- ── Insert institution settings ─────────────────────────────────────────────
INSERT INTO institution_settings (institution_id, email_notifications, application_alerts, platform_updates, language, theme)
SELECT id, true, true, false, 'es', 'light'
FROM institutions WHERE slug = 'ue-manuel-vicente-romero-garcia';

-- ── Fix RLS: Proper ownership-based policies ────────────────────────────────

-- Institutions: public can read published, owners can update their own
DROP POLICY IF EXISTS "select_institutions" ON institutions;
DROP POLICY IF EXISTS "institutions_update_all" ON institutions;
CREATE POLICY "institutions_select_published" ON institutions FOR SELECT
  TO authenticated, anon USING (is_published = true OR owner_id = auth.uid());
CREATE POLICY "institutions_update_own" ON institutions FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Programs: public read, institution owner write
DROP POLICY IF EXISTS "programs_select" ON programs;
DROP POLICY IF EXISTS "programs_insert" ON programs;
DROP POLICY IF EXISTS "programs_update" ON programs;
CREATE POLICY "programs_select" ON programs FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "programs_insert" ON programs FOR INSERT
  TO authenticated WITH CHECK (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "programs_update" ON programs FOR UPDATE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "programs_delete" ON programs FOR DELETE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- Gallery items: public read, institution owner write
DROP POLICY IF EXISTS "gallery_select" ON gallery_items;
DROP POLICY IF EXISTS "gallery_insert" ON gallery_items;
DROP POLICY IF EXISTS "gallery_update" ON gallery_items;
DROP POLICY IF EXISTS "gallery_delete" ON gallery_items;
CREATE POLICY "gallery_select" ON gallery_items FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "gallery_insert" ON gallery_items FOR INSERT
  TO authenticated WITH CHECK (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "gallery_update" ON gallery_items FOR UPDATE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "gallery_delete" ON gallery_items FOR DELETE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- Opportunities: public read active, institution owner write
DROP POLICY IF EXISTS "opportunities_select" ON opportunities;
DROP POLICY IF EXISTS "opportunities_insert" ON opportunities;
DROP POLICY IF EXISTS "opportunities_update" ON opportunities;
CREATE POLICY "opportunities_select" ON opportunities FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "opportunities_insert" ON opportunities FOR INSERT
  TO authenticated WITH CHECK (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "opportunities_update" ON opportunities FOR UPDATE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "opportunities_delete" ON opportunities FOR DELETE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- Settings: institution owner read/write
DROP POLICY IF EXISTS "settings_select" ON institution_settings;
DROP POLICY IF EXISTS "settings_insert" ON institution_settings;
DROP POLICY IF EXISTS "settings_update" ON institution_settings;
CREATE POLICY "settings_select" ON institution_settings FOR SELECT
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "settings_insert" ON institution_settings FOR INSERT
  TO authenticated WITH CHECK (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "settings_update" ON institution_settings FOR UPDATE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- Applications: students read own, institutions read own applicants
DROP POLICY IF EXISTS "select_applications" ON applications;
DROP POLICY IF EXISTS "insert_applications" ON applications;
DROP POLICY IF EXISTS "update_applications" ON applications;
DROP POLICY IF EXISTS "applications_user_select" ON applications;
CREATE POLICY "applications_select_own" ON applications FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "applications_insert" ON applications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "applications_update" ON applications FOR UPDATE
  TO authenticated USING (
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- Profiles: users read/write own
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);

-- ── Trigger: auto-update programs_count ───────────────────────────────────────
DROP TRIGGER IF EXISTS trg_update_programs_count ON programs;
CREATE TRIGGER trg_update_programs_count
  AFTER INSERT OR DELETE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_programs_count();

-- ── Enable realtime for key tables ───────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE institutions;
ALTER PUBLICATION supabase_realtime ADD TABLE programs;
ALTER PUBLICATION supabase_realtime ADD TABLE gallery_items;
