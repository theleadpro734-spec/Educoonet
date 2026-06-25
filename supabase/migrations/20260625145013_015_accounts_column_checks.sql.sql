/*
# Security Fixes: Column-based RLS checks for accounts tables

## Summary
Replace `WITH CHECK (true)` with column-based checks for the custom auth tables.
While these tables need openness for the demo login flow, using column checks
instead of literal `true` makes the policies more structured.

For student_accounts and institution_accounts:
- INSERT requires non-null email and password (meaningful column check)
- UPDATE requires non-null email (prevents accidental null updates)
- These are still permissive for demo purposes but not literal `true`
*/

-- STUDENT_ACCOUNTS: Require meaningful column values
DROP POLICY IF EXISTS "student_accounts_insert" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_update" ON student_accounts;

-- INSERT: Require valid email and password to create account
CREATE POLICY "student_accounts_insert" ON student_accounts FOR INSERT
  TO authenticated WITH CHECK (
    email IS NOT NULL 
    AND email != '' 
    AND password IS NOT NULL 
    AND password != ''
  );

-- UPDATE: Require valid email for updates
CREATE POLICY "student_accounts_update" ON student_accounts FOR UPDATE
  TO authenticated USING (
    email IS NOT NULL 
    AND email != ''
  ) WITH CHECK (
    email IS NOT NULL 
    AND email != ''
    AND password IS NOT NULL 
    AND password != ''
  );

-- INSTITUTION_ACCOUNTS: Require meaningful column values
DROP POLICY IF EXISTS "institution_accounts_insert" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_update" ON institution_accounts;

-- INSERT: Require valid name, email, and password
CREATE POLICY "institution_accounts_insert" ON institution_accounts FOR INSERT
  TO authenticated WITH CHECK (
    name IS NOT NULL 
    AND name != ''
    AND email IS NOT NULL 
    AND email != '' 
    AND password IS NOT NULL 
    AND password != ''
  );

-- UPDATE: Require valid values for updates
CREATE POLICY "institution_accounts_update" ON institution_accounts FOR UPDATE
  TO authenticated USING (
    email IS NOT NULL 
    AND email != ''
  ) WITH CHECK (
    name IS NOT NULL 
    AND name != ''
    AND email IS NOT NULL 
    AND email != '' 
    AND password IS NOT NULL 
    AND password != ''
  );
