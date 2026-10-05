/*
# Add contact_email column to applications
*/

ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_email text;
