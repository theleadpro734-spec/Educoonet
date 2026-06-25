/*
# Security Fixes: Clean up duplicate/legacy RLS policies

## Summary
Remove duplicate and legacy policies that serve the same purpose as newer policies.
Consolidate policies to have single, clear definitions for each operation.

## Changes
- Remove duplicate SELECT policies (authenticated_read_*, public_read_*)
- Keep only one policy per operation per table
- Ensure all policies are properly ownership-based or explicitly public for demo
*/

-- Clean up APPLICATIONS table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "institution_read_applications" ON applications;
-- Keep: applications_select (public read for demo)

-- Clean up FAVORITES table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "authenticated_read_favorites" ON favorites;
-- Keep: favorites_select (owner-based)

-- Clean up GALLERY_ITEMS table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "public_read_gallery" ON gallery_items;
-- Keep: gallery_items_select (public read for demo)

-- Clean up INSTITUTION_ACCOUNTS table - consolidate SELECT policies
DROP POLICY IF EXISTS "institution_accounts_login_verify" ON institution_accounts;
DROP POLICY IF EXISTS "institution_accounts_login" ON institution_accounts;
-- Re-create single SELECT policy for login
CREATE POLICY "institution_accounts_select" ON institution_accounts FOR SELECT
  TO anon, authenticated USING (true);

-- Clean up INSTITUTION_SETTINGS table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "authenticated_read_settings" ON institution_settings;
-- Keep: institution_settings_select (owner-based)

-- Clean up INSTITUTIONS table - consolidate SELECT policies
DROP POLICY IF EXISTS "anon_read_institutions_password" ON institutions;
DROP POLICY IF EXISTS "authenticated_read_institutions" ON institutions;
DROP POLICY IF EXISTS "public_read_institutions" ON institutions;
-- Keep: institutions_select (public read for demo)

-- Clean up OPPORTUNITIES table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "public_read_opportunities" ON opportunities;
-- Keep: opportunities_select (public read for demo)

-- Clean up PROFILES table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;
-- Keep: profiles_select (owner-based)

-- Clean up PROGRAMS table - remove duplicate SELECT policies
DROP POLICY IF EXISTS "public_read_programs" ON programs;
-- Keep: programs_select (public read for demo)

-- Clean up STUDENT_ACCOUNTS table - consolidate SELECT policies
DROP POLICY IF EXISTS "student_accounts_login_verify" ON student_accounts;
DROP POLICY IF EXISTS "student_accounts_login" ON student_accounts;
-- Re-create single SELECT policy for login
CREATE POLICY "student_accounts_select" ON student_accounts FOR SELECT
  TO anon, authenticated USING (true);
