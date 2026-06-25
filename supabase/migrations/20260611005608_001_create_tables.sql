-- Create institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  educational_level TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for institutions (read-only for public)
CREATE POLICY "select_institutions" ON institutions FOR SELECT
  TO authenticated, anon USING (true);

-- RLS policies for applications (read/write for authenticated)
CREATE POLICY "select_applications" ON applications FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_applications" ON applications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Insert sample institutions
INSERT INTO institutions (name, location, description, cover_image, gallery_images, address) VALUES
(
  'Harvard University',
  'Cambridge, Massachusetts, USA',
  'Harvard University is a private Ivy League research university. Founded in 1636, Harvard is the oldest institution of higher learning in the United States and one of the most prestigious universities in the world.',
  'https://images.pexels.com/photos/207686/pexels-photo-207686.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/207684/pexels-photo-207684.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  'Massachusetts Hall, Cambridge, MA 02138, USA'
),
(
  'Stanford University',
  'Stanford, California, USA',
  'Stanford University is a private research university known for its academic strength, wealth, and proximity to Silicon Valley. It ranks among the top universities in the world.',
  'https://images.pexels.com/photos/50896/pexels-photo-50896.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/159539/pexels-photo-159539.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  '450 Serra Mall, Stanford, CA 94305, USA'
),
(
  'University of Oxford',
  'Oxford, United Kingdom',
  'The University of Oxford is a collegiate research university in Oxford, England. It is the oldest university in the English-speaking world and one of the most prestigious.',
  'https://images.pexels.com/photo/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photo/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/159539/pexels-photo-159539.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/50896/pexels-photo-50896.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  'University Offices, Wellington Square, Oxford OX1 2JD, UK'
),
(
  'MIT',
  'Cambridge, Massachusetts, USA',
  'Massachusetts Institute of Technology is a private research university known for its strength in physical sciences, engineering, and computer science. MIT is a global leader in innovation.',
  'https://images.pexels.com/photo/159539/pexels-photo-159539.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photo/207686/pexels-photo-207686.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/207684/pexels-photo-207684.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/50896/pexels-photo-50896.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  '77 Massachusetts Ave, Cambridge, MA 02139, USA'
),
(
  'University of Toronto',
  'Toronto, Ontario, Canada',
  'The University of Toronto is a public research university and one of the worlds top universities. Known for its research excellence and diverse academic programs.',
  'https://images.pexels.com/photo/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photo/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/159539/pexels-photo-159539.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  '27 Kings College Circle, Toronto, ON M5S 1A1, Canada'
),
(
  'ETH Zurich',
  'Zurich, Switzerland',
  'ETH Zurich is a public research university known for its excellence in science, technology, engineering, and mathematics. It consistently ranks among the top universities in Europe.',
  'https://images.pexels.com/photo/207685/pexels-photo-207685.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photo/207686/pexels-photo-207686.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photo/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  'Rämistrasse 101, 8092 Zürich, Switzerland'
);

-- Insert sample applications for dashboard
INSERT INTO applications (institution_id, name, email, phone, educational_level, status) VALUES
(
  (SELECT id FROM institutions WHERE name = 'Harvard University'),
  'John Smith',
  'john.smith@email.com',
  '+1 (555) 123-4567',
  'Graduate',
  'pending'
),
(
  (SELECT id FROM institutions WHERE name = 'Stanford University'),
  'Emma Johnson',
  'emma.j@email.com',
  '+1 (555) 234-5678',
  'Undergraduate',
  'approved'
),
(
  (SELECT id FROM institutions WHERE name = 'MIT'),
  'Michael Chen',
  'mchen@email.com',
  '+1 (555) 345-6789',
  'Graduate',
  'pending'
),
(
  (SELECT id FROM institutions WHERE name = 'University of Oxford'),
  'Sarah Williams',
  's.williams@email.com',
  '+44 20 7946 0958',
  'Undergraduate',
  'pending'
),
(
  (SELECT id FROM institutions WHERE name = 'ETH Zurich'),
  'David Mueller',
  'd.mueller@email.com',
  '+41 44 123 45 67',
  'Graduate',
  'approved'
),
(
  (SELECT id FROM institutions WHERE name = 'University of Toronto'),
  'Lisa Anderson',
  'lisa.a@email.com',
  '+1 (416) 555-0123',
  'Undergraduate',
  'rejected'
),
(
  (SELECT id FROM institutions WHERE name = 'Harvard University'),
  'Robert Brown',
  'r.brown@email.com',
  '+1 (555) 456-7890',
  'Graduate',
  'pending'
),
(
  (SELECT id FROM institutions WHERE name = 'Stanford University'),
  'Jennifer Lee',
  'j.lee@email.com',
  '+1 (555) 567-8901',
  'Undergraduate',
  'approved'
);