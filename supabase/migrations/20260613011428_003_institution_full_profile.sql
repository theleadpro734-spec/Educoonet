-- Add social media links and extended fields to institutions
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_youtube TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Institution settings table
CREATE TABLE IF NOT EXISTS institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  application_alerts BOOLEAN DEFAULT true,
  platform_updates BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery items table (separate from the array for better management)
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'campus',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for institution_settings
ALTER TABLE institution_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select" ON institution_settings FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "settings_insert" ON institution_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "settings_update" ON institution_settings FOR UPDATE TO authenticated USING (true);

-- RLS for gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_select" ON gallery_items FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "gallery_insert" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "gallery_update" ON gallery_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "gallery_delete" ON gallery_items FOR DELETE TO authenticated USING (true);

-- Allow institutions to update their own row (needed for the demo)
CREATE POLICY "institutions_update_all" ON institutions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Update programs_count trigger helper
CREATE OR REPLACE FUNCTION update_programs_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE institutions 
  SET programs_count = (SELECT COUNT(*) FROM programs WHERE institution_id = NEW.institution_id)
  WHERE id = NEW.institution_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Seed gallery for first institution
INSERT INTO gallery_items (institution_id, url, caption, category, sort_order)
SELECT 
  id,
  'https://images.pexels.com/photos/207686/pexels-photo-207686.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Campus principal',
  'campus',
  0
FROM institutions WHERE name = 'Harvard University'
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (institution_id, url, caption, category, sort_order)
SELECT 
  id,
  'https://images.pexels.com/photos/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Biblioteca',
  'facilities',
  1
FROM institutions WHERE name = 'Harvard University'
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (institution_id, url, caption, category, sort_order)
SELECT 
  id,
  'https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Edificio central',
  'campus',
  2
FROM institutions WHERE name = 'Harvard University'
ON CONFLICT DO NOTHING;
