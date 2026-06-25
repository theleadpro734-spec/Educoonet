/*
# Fix storage: allow anonymous file uploads to documents bucket

1. Problem: The documents_public_insert policy targets role 'public', but Supabase
   anonymous requests use the 'anon' role. The existing policy therefore does not
   match, and file uploads from the unauthenticated student form fail.

2. Fix: Add an explicit policy for the 'anon' role on storage.objects for
   INSERT into the 'documents' bucket, plus an UPDATE policy so files can be
   replaced if needed.
*/

CREATE POLICY "documents_anon_insert"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_anon_update"
  ON storage.objects
  FOR UPDATE
  TO anon
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');
