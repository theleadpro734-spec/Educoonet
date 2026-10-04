/*
# Transfer institution ownership to test account
*/

UPDATE institutions
SET owner_id = 'd9a8dcea-c74e-4b3d-9aa4-1180b06d9d5c',
    email = 'liceo.romero.garcia@educonnet.com',
    updated_at = now()
WHERE id = 'a4feecf4-0a56-4ca9-ab1b-ee3385e16cf3';
