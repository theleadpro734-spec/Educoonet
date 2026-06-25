-- Create users table to extend auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'institution')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update institutions table with more fields
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS programs_count INTEGER DEFAULT 0;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS institution_type TEXT DEFAULT 'Universidad';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Create programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  mode TEXT CHECK (mode IN ('Presencial', 'Virtual', 'Híbrido')),
  cost DECIMAL(12,2),
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunities (convocatorias) table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  available_spots INTEGER DEFAULT 1,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'activa' CHECK (status IN ('activa', 'cerrada', 'borrador')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, institution_id)
);

-- Update applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS identity_document TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS certificates_url TEXT;

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS policies for programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programs_select" ON programs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "programs_insert" ON programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "programs_update" ON programs FOR UPDATE TO authenticated USING (true);

-- RLS policies for opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities_select" ON opportunities FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "opportunities_insert" ON opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "opportunities_update" ON opportunities FOR UPDATE TO authenticated USING (true);

-- RLS policies for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Update applications RLS
CREATE POLICY "applications_user_select" ON applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM institutions WHERE id = institution_id));

-- Insert sample programs
INSERT INTO programs (institution_id, name, description, duration, mode, cost, level) VALUES
((SELECT id FROM institutions WHERE name = 'Harvard University'), 'MBA', 'Maestría en Administración de Empresas', '2 años', 'Presencial', 150000.00, 'Maestría'),
((SELECT id FROM institutions WHERE name = 'Harvard University'), 'Derecho', 'Doctorado en Derecho', '4 años', 'Presencial', 180000.00, 'Doctorado'),
((SELECT id FROM institutions WHERE name = 'Stanford University'), 'Ingeniería en Informática', 'Licenciatura en Ciencias de la Computación', '4 años', 'Presencial', 120000.00, 'Pregrado'),
((SELECT id FROM institutions WHERE name = 'Stanford University'), 'MBA', 'Maestría en Administración de Empresas', '2 años', 'Híbrido', 140000.00, 'Maestría'),
((SELECT id FROM institutions WHERE name = 'MIT'), 'Ingeniería Mecánica', 'Licenciatura en Ingeniería Mecánica', '4 años', 'Presencial', 115000.00, 'Pregrado'),
((SELECT id FROM institutions WHERE name = 'MIT'), 'Ciencia de Datos', 'Maestría en Ciencia de Datos', '2 años', 'Virtual', 95000.00, 'Maestría'),
((SELECT id FROM institutions WHERE name = 'University of Oxford'), 'Filosofía', 'Licenciatura en Filosofía', '3 años', 'Presencial', 90000.00, 'Pregrado'),
((SELECT id FROM institutions WHERE name = 'University of Oxford'), 'Medicina', 'Doctorado en Medicina', '6 años', 'Presencial', 200000.00, 'Pregrado'),
((SELECT id FROM institutions WHERE name = 'ETH Zurich'), 'Ingeniería Eléctrica', 'Licenciatura en Ingeniería Eléctrica', '3 años', 'Presencial', 40000.00, 'Pregrado'),
((SELECT id FROM institutions WHERE name = 'University of Toronto'), 'Psicología', 'Licenciatura en Psicología', '4 años', 'Presencial', 65000.00, 'Pregrado');

-- Insert sample opportunities
INSERT INTO opportunities (institution_id, program_id, title, description, available_spots, deadline, status) VALUES
((SELECT id FROM institutions WHERE name = 'Harvard University'), (SELECT id FROM programs WHERE name = 'MBA' AND institution_id = (SELECT id FROM institutions WHERE name = 'Harvard University')), 'Admisión MBA 2026', 'Convocatoria para el programa de MBA 2026', 50, '2026-03-15', 'activa'),
((SELECT id FROM institutions WHERE name = 'Stanford University'), (SELECT id FROM programs WHERE name = 'Ingeniería en Informática' AND institution_id = (SELECT id FROM institutions WHERE name = 'Stanford University')), 'Admisión Ingelnieía 2026', 'Cupos disponibles para Ingeniería en Informática', 100, '2026-04-01', 'activa'),
((SELECT id FROM institutions WHERE name = 'MIT'), (SELECT id FROM programs WHERE name = 'Ciencia de Datos' AND institution_id = (SELECT id FROM institutions WHERE name = 'MIT')), 'Maestría Ciencia de Datos', 'Programa de maestría en ciencia de datos', 30, '2026-02-28', 'activa'),
((SELECT id FROM institutions WHERE name = 'University of Oxford'), (SELECT id FROM programs WHERE name = 'Medicina' AND institution_id = (SELECT id FROM institutions WHERE name = 'University of Oxford')), 'Medicina 2026', 'Admisiones para medicina', 80, '2026-01-15', 'activa'),
((SELECT id FROM institutions WHERE name = 'ETH Zurich'), (SELECT id FROM programs WHERE name = 'Ingeniería Eléctrica' AND institution_id = (SELECT id FROM institutions WHERE name = 'ETH Zurich')), 'Ingeniería Eléctrica 2026', 'Cupos disponibles para ingeniería', 60, '2026-05-01', 'activa');

-- Update institutions with additional data
UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/207686/pexels-photo-207686.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.8,
  programs_count = 2,
  website = 'https://www.harvard.edu',
  phone = '+1 (617) 495-1000',
  email = 'admissions@harvard.edu',
  institution_type = 'Universidad Privada',
  slug = 'harvard-university'
WHERE name = 'Harvard University';

UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/50896/pexels-photo-50896.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.9,
  programs_count = 2,
  website = 'https://www.stanford.edu',
  phone = '+1 (650) 723-2300',
  email = 'admission@stanford.edu',
  institution_type = 'Universidad Privada',
  slug = 'stanford-university'
WHERE name = 'Stanford University';

UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/159539/pexels-photo-159539.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.7,
  programs_count = 2,
  website = 'https://www.mit.edu',
  phone = '+1 (617) 253-1000',
  email = 'admissions@mit.edu',
  institution_type = 'Universidad Privada',
  slug = 'mit'
WHERE name = 'MIT';

UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.6,
  programs_count = 2,
  website = 'https://www.ox.ac.uk',
  phone = '+44 1865 270000',
  email = 'admissions@ox.ac.uk',
  institution_type = 'Universidad Pública',
  slug = 'university-of-oxford'
WHERE name = 'University of Oxford';

UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.5,
  programs_count = 1,
  website = 'https://www.utoronto.ca',
  phone = '+1 (416) 978-2011',
  email = 'future.utoronto@utoronto.ca',
  institution_type = 'Universidad Pública',
  slug = 'university-of-toronto'
WHERE name = 'University of Toronto';

UPDATE institutions SET 
  logo_url = 'https://images.pexels.com/photos/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=100',
  rating = 4.8,
  programs_count = 1,
  website = 'https://ethz.ch',
  phone = '+41 44 632 11 11',
  email = 'admissions@ethz.ch',
  institution_type = 'Universidad Pública',
  slug = 'eth-zurich'
WHERE name = 'ETH Zurich';