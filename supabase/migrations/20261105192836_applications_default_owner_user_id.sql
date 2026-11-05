/*
# Assign applications to the signed-in applicant automatically

1. Modified Tables
- `applications.user_id`: now defaults to the session's user id (`auth.uid()`), so every new application made from a signed-in or guest session is owned by that account.

2. Indexes
- Index on `applications(user_id)` so an applicant's list loads quickly.

3. Security
- No policy changes. Existing ownership policies (`auth.uid() = user_id`) now apply to new rows.
- Existing rows are not changed: rows created before this migration without an owner stay as they are.

4. Notes
- Only inserts that omit `user_id` are affected by the default; the app also sends it explicitly.
*/

ALTER TABLE applications ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications (user_id);
