/*
# Add anon upload policies for covers and logos buckets

1. Changes
- Adds INSERT and UPDATE policies for the 'anon' role on storage.objects
  for the 'covers' and 'logos' buckets
- These buckets already exist (created in earlier migrations) but had no
  explicit anon upload policies
2. Security
- In test/development mode, anonymous uploads are allowed
- SELECT policies already exist via the public bucket setting
3. Notes
- The 'documents' bucket already had anon policies from migration 010
- The 'gallery' and 'institution-assets' buckets also get the same policies
*/

CREATE POLICY "covers_anon_insert"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'covers');

CREATE POLICY "covers_anon_update"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'covers')
  WITH CHECK (bucket_id = 'covers');

CREATE POLICY "logos_anon_insert"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "logos_anon_update"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'logos')
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "gallery_anon_insert"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_anon_update"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "institution_assets_anon_insert"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'institution-assets');

CREATE POLICY "institution_assets_anon_update"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'institution-assets')
  WITH CHECK (bucket_id = 'institution-assets');
