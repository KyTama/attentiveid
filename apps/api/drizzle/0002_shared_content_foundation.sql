ALTER TABLE "landing_section_translations" ADD COLUMN "session_label" text;--> statement-breakpoint
ALTER TABLE "landing_section_translations" ADD COLUMN "price" text;--> statement-breakpoint
ALTER TABLE "landing_section_translations" ADD COLUMN "price_unit" text;--> statement-breakpoint
INSERT INTO "landing_aggregates" ("singleton_key") VALUES (true) ON CONFLICT ("singleton_key") DO NOTHING;
