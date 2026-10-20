-- Singleton settings row (update-platform-settings targets this id).
-- Plans, services and bundles come from the Supabase export (scripts/export-supabase.mjs)
-- or the admin "seed promotion services" button.
INSERT OR IGNORE INTO platform_settings (id) VALUES ('00000000-0000-0000-0000-000000000001');
