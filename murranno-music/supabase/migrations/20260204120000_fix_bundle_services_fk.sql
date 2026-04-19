-- Add foreign key relationship for bundle_services -> promotion_services
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bundle_services_service_id_fkey'
) THEN
ALTER TABLE "public"."bundle_services"
ADD CONSTRAINT "bundle_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."promotion_services" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
END IF;
END $$;
-- Add foreign key relationship for bundle_services -> promotion_bundles (just in case)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bundle_services_bundle_id_fkey'
) THEN
ALTER TABLE "public"."bundle_services"
ADD CONSTRAINT "bundle_services_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."promotion_bundles" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
END IF;
END $$;