/*
# Update institution name to Liceo Romero Garcia

## Changes
1. Update the institution name from "U.E Manuel Vicente Rome" to "Liceo Romero Garcia"
2. Update the slug accordingly
3. Keep all other institution data intact
*/

UPDATE institutions
SET name = 'Liceo Romero Garcia',
    slug = 'liceo-romero-garcia',
    updated_at = now()
WHERE id = 'a4feecf4-0a56-4ca9-ab1b-ee3385e16cf3';
